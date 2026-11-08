"""
Crown drip animation.

Rebuilds the "Dripping" After Effects recipe (Dripping.aep) in code and applies it
to the crown artwork taken from the first frame of the source clip:

  * one smear per drip: an anchor on the rim's bottom edge, a target straight below
    it, staggered start times, heavy ease-out (the CC Smear From/To keyframes)

The crown itself never moves or scales (it is a website logo), so the project's
scale-in and slow zoom drift are deliberately left out: only the drips animate.

Usage:
    python crown_drip.py                      render crown_drip_1080.mp4 (white background)
    python crown_drip.py --stills 0,2,4,6 DIR write PNG stills at those times into DIR
    python crown_drip.py --web DIR            write the transparent website logo into DIR:
                                              an animated WebP that plays once and holds its
                                              last frame, plus that last frame as a still
    python crown_drip.py --sheets public      export lossless browser sheets and manifest
    python crown_drip.py --sheets-ref IMAGE public [START]
                                              same sheets, grown from a finished dripping crown
                                              (transparent art, any size, put in the site
                                              framing): its drips slide out of the band and the
                                              last frame is that crown. START (transparent crown
                                              art without drips) is fitted over it and is the
                                              first frame; a melt front turns it into the
                                              dripping crown and releases the drips
    python crown_drip.py --logos DIR          write the animation's first and last frame into
                                              DIR as full-resolution transparent PNGs
"""
import io
import json
import math
import os
import subprocess
import sys
import time

from PIL import Image, ImageChops, ImageDraw, ImageFilter
import imageio_ffmpeg

SRC = r"C:\Users\xophs\Downloads\2098debe-84d8-40d1-8b2e-ddae2f495850.mp4"
HERE = os.path.dirname(os.path.abspath(__file__))
OUT_PATH = os.path.join(HERE, "crown_drip_1080.mp4")

N = 640                  # source artwork size; all geometry below is in these units
OUT = 1080               # output frame size
K = 27 / 8               # compose scale (640 -> 2160, i.e. 2x supersampled)
PAD = 0                  # extra white margin around the compose canvas
CS = int(N * K) + 2 * PAD
FPS = 30
DUR = 6.0

# region of the canvas the drips can touch (source units; RX0/RY0 chosen so *K is whole)
RX0, RY0, RX1, RY1 = 96, 328, 544, 600
RW, RH = int((RX1 - RX0) * K), int((RY1 - RY0) * K)

GOLD = (238, 180, 26)
EDGE = (182, 108, 0)
SHADOW = (150, 82, 0)
LIGHT = (255, 238, 146)
SPEC = (255, 252, 230)
OUTLINE = (34, 16, 2)
INK_LEVEL = 105         # brightest-channel level below which a pixel counts as outline

# Website logo. The artwork is framed exactly like the site's previous static logo
# (a 1024 square whose artwork spans x 103..920 with its top at y 97) so the header
# layout tuned around that file keeps working.
WEB = 400                # animated canvas (square, transparent): 2x the 200px it is shown at
WEB_STILL_SIZE = 512     # the resting still is cheap, so it gets more pixels
WEB_SPEED = 2.0          # the website logo plays the drip at twice the speed of the 6 s master
WEB_FPS = 30             # at 2x this is one frame per 1/15 s of the master: drip tips move under 2 px a frame
WEB_HOLD_MS = 2000       # how long the file itself holds its last frame
LOGO_LEFT, LOGO_TOP, LOGO_RIGHT, LOGO_CANVAS = 103, 97, 920, 1024
HOLE_MIN = 80            # enclosed gaps smaller than this (px) are highlights, not cut-outs
WEB_ANIM, WEB_STILL = "goldenepoxy-crown-drip.webp", "goldenepoxy-crown-static.webp"

# x, neck half-width, bulb radius, final length, start time (s)
DRIPS = [
    (153, 6.4, 9.6, 52, 2.10),
    (189, 7.6, 11.6, 128, 1.20),
    (229, 6.0, 9.2, 40, 2.90),
    (263, 7.0, 10.8, 78, 1.65),
    (303, 7.8, 11.8, 108, 0.90),
    (337, 5.8, 9.0, 34, 3.30),
    (377, 8.4, 12.6, 178, 1.05),
    (411, 6.2, 9.4, 48, 2.50),
    (451, 7.2, 11.0, 92, 1.40),
    (486, 6.4, 9.8, 60, 1.90),
]


def clamp(v, lo=0.0, hi=1.0):
    return lo if v < lo else hi if v > hi else v


def smoothstep(a, b, x):
    if a == b:
        return 0.0 if x < a else 1.0
    t = clamp((x - a) / (b - a))
    return t * t * (3 - 2 * t)


def lut(fn):
    return [int(round(clamp(fn(v), 0, 255))) for v in range(256)]


def solid(color):
    return Image.new("RGB", (RW, RH), color)


# ---------------------------------------------------------------- source artwork

def first_frame():
    source_image = os.path.join(HERE, "private", "crown-quality", "source.png")
    if os.path.isfile(source_image):
        return Image.open(source_image).convert("RGB")
    ff = imageio_ffmpeg.get_ffmpeg_exe()
    png = subprocess.run(
        [ff, "-v", "error", "-i", SRC, "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"],
        capture_output=True, check=True).stdout
    return Image.open(io.BytesIO(png)).convert("RGB")


def crown_mask(img):
    """Binary mask of the crown: the non-background blob containing the band centre."""
    px = img.load()
    m = Image.new("L", img.size, 0)
    mp = m.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b = px[x, y]
            mn, mx = min(r, g, b), max(r, g, b)
            if not (mn > 228 and mx - mn < 24):
                mp[x, y] = 255
    ImageDraw.floodfill(m, (320, 310), 128)
    return m.point(lambda v: 255 if v == 128 else 0)


def crown_alpha(clean, mask):
    """Soft matte for the crown at source size.

    Open, as in the site's static logo: everything outside, the triangle cut-outs, and the
    two stripes between the bands. Closed: bright highlights inside the gold that merely
    look like background.
    """
    px = clean.load()
    mp = mask.load()
    pale = lambda c: min(c) > 210 and max(c) - min(c) < 36
    dark = lambda c: max(c) < 130
    gap = [[(not mp[x, y]) or pale(px[x, y]) for x in range(N)] for y in range(N)]
    solid_mask = Image.new("L", (N, N), 0)
    sp = solid_mask.load()
    for y in range(N):
        for x in range(N):
            if not gap[y][x]:
                sp[x, y] = 255

    def between_lines(x, y):
        # a stripe pixel has an outline within a few rows both above and below it
        return (any(dark(px[x, y - d]) for d in range(1, 8)) and
                any(dark(px[x, y + d]) for d in range(1, 8)))

    seen = [[False] * N for _ in range(N)]
    for sy in range(N):
        for sx in range(N):
            if not gap[sy][sx] or seen[sy][sx]:
                continue
            region, stack, open_ = [], [(sx, sy)], False
            seen[sy][sx] = True
            while stack:
                x, y = stack.pop()
                region.append((x, y))
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if not (0 <= nx < N and 0 <= ny < N):
                        open_ = True
                    elif gap[ny][nx] and not seen[ny][nx]:
                        seen[ny][nx] = True
                        stack.append((nx, ny))
            if open_ or len(region) >= HOLE_MIN:
                continue
            if sum(1 for x, y in region if between_lines(x, y)) >= 0.7 * len(region):
                continue
            for x, y in region:
                sp[x, y] = 255
    # the one-pixel edge ring takes its coverage from how dark the pixel is (outline on white)
    r, g, b = clean.split()
    value = ImageChops.lighter(r, ImageChops.lighter(g, b))
    soft = value.point(lut(lambda v: (248 - v) / 180.0 * 255))
    inner = solid_mask.filter(ImageFilter.MinFilter(3))
    outer = solid_mask.filter(ImageFilter.MaxFilter(3))
    return ImageChops.darker(outer, ImageChops.lighter(inner, soft))


def parabola(pts):
    """Least-squares y = c0 + c1*u + c2*u^2 through (u, y) points, u measured from x = 320."""
    s = [sum(u ** k for u, _ in pts) for k in range(5)]
    t = [sum(v * u ** k for u, v in pts) for k in range(3)]
    a = [[s[0], s[1], s[2], t[0]], [s[1], s[2], s[3], t[1]], [s[2], s[3], s[4], t[2]]]
    for i in range(3):
        p = a[i][i]
        a[i] = [v / p for v in a[i]]
        for j in range(3):
            if j != i:
                f = a[j][i]
                a[j] = [vj - f * vi for vj, vi in zip(a[j], a[i])]
    c0, c1, c2 = a[0][3], a[1][3], a[2][3]
    return lambda x: c0 + c1 * (x - 320.0) + c2 * (x - 320.0) ** 2


def rim_outline(img, arc, xl, xr):
    """Path around the top and both ends of the lower rim, measured from the artwork.

    The source's line under the white stripe is broken and the rim's ends have no ink at
    all, so the whole outline gets redrawn along this path. Returns (points, cap_l, cap_r)
    in source units; cap_* map a y to the x of that end's edge.
    """
    px = img.load()
    white = lambda c: min(c) > 205
    dark = lambda c: max(c) < 130

    # seam: the first dark row below the white stripe, which itself sits under the main
    # band's thick outline (the lowest dark run of 3+ rows above the rim)
    raw = {}
    for x in range(xl + 2, xr - 2):
        y0 = int(arc(x))
        yb, run = None, 0
        for y in range(y0 - 12, y0 - 42, -1):
            if dark(px[x, y]):
                run += 1
            else:
                if run >= 3:
                    yb = y + run
                    break
                run = 0
        if yb is None:
            continue
        stripe = sum(1 for y in range(yb + 1, yb + 8) if white(px[x, y]))
        if stripe < 2:
            continue
        for y in range(yb + 2, yb + 10):
            if dark(px[x, y]):
                n = 1
                while dark(px[x, y + n]):
                    n += 1
                raw[x] = y + n / 2.0
                break
        else:
            raw[x] = None
    xs = sorted(raw)
    known = [x for x in xs if raw[x] is not None]
    filled = [raw[x] if raw[x] is not None else raw[min(known, key=lambda k: abs(k - x))] for x in xs]

    def window(vals, i, r):
        return [vals[int(clamp(j, 0, len(vals) - 1))] for j in range(i - r, i + r + 1)]

    med = [sorted(window(filled, i, 5))[5] for i in range(len(xs))]
    seam = [sum(window(med, i, 6)) / 13.0 for i in range(len(xs))]

    # end caps: straight lines through the rim's outermost gold pixel on each row
    def cap(side):
        pts = []
        xe = xl if side < 0 else xr
        for y in range(int(arc(xe)) - 13, int(arc(xe)) - 4):
            x = xe - 16 * side
            while not white(px[x, y]) and abs(x - xe) < 18:
                x += side
            pts.append((y + 0.5, x - side + 0.5 + 0.5 * side))
        n = len(pts)
        my, mx = sum(p[0] for p in pts) / n, sum(p[1] for p in pts) / n
        slope = sum((p[0] - my) * (p[1] - mx) for p in pts) / sum((p[0] - my) ** 2 for p in pts)
        return lambda y: mx + slope * (y - my)

    cap_l, cap_r = cap(-1), cap(1)
    def extend(i, j, cap_fn):
        # carry the seam's slope out from column i until it meets the cap line
        slope = (seam[j] - seam[i]) / float(xs[j] - xs[i])
        x, y = float(xs[i]), seam[i]
        for _ in range(8):
            x = cap_fn(y)
            y = seam[i] + slope * (x - xs[i])
        return x, y

    x_l, y_l = extend(4, 14, cap_l)
    x_r, y_r = extend(len(xs) - 5, len(xs) - 15, cap_r)
    yb_l, yb_r = arc(xl) + 1.0, arc(xr) + 1.0
    pts = [(cap_l(yb_l) - 0.3, yb_l), (x_l - 0.3, y_l)]
    pts += [(float(x), y) for x, y in zip(xs, seam)][4:-4]
    pts += [(x_r + 0.3, y_r), (cap_r(yb_r) + 0.3, yb_r)]
    rim_outline.debug = dict(raw_l=[(x, raw[x]) for x in xs[:8]], raw_r=[(x, raw[x]) for x in xs[-8:]])
    return pts, cap_l, cap_r


def fit_arc(mask):
    """Parabola through the bottom edge of the lower rim, plus the rim's left/right extent."""
    mp = mask.load()
    pts = []
    for x in range(140, 501):
        for y in range(N - 1, 300, -1):
            if mp[x, y]:
                pts.append((x - 320.0, float(y) + 0.5))
                break
    arc = parabola(pts)

    def low(x):
        for y in range(N - 1, 300, -1):
            if mp[x, y]:
                return y
        return 0

    xl = 320
    while xl > 60 and abs(low(xl - 1) + 0.5 - arc(xl - 1)) < 5:
        xl -= 1
    xr = 320
    while xr < 580 and abs(low(xr + 1) + 0.5 - arc(xr + 1)) < 5:
        xr += 1
    return arc, xl, xr


def build_crown(f0, mask):
    """Clean, upscaled, sharpened crown on pure white at compose resolution."""
    levels = lut(lambda v: v * 255 / 249)
    img = f0.point(levels * 3)
    keep = mask.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.GaussianBlur(1.1))
    clean = Image.composite(img, Image.new("RGB", f0.size, (255, 255, 255)), keep)
    big = clean.resize((int(N * K), int(N * K)), Image.LANCZOS)
    big = big.filter(ImageFilter.UnsharpMask(radius=K * 0.8, percent=60, threshold=3))
    # re-ink the outlines: they are the softest part of the upscale. Key on the brightest
    # channel so the dark-gold shading (still strongly red) is left alone.
    r, g, b = big.split()
    value = ImageChops.lighter(r, ImageChops.lighter(g, b))
    ink = value.point(lut(lambda v: (INK_LEVEL - v) * 6.0 + 128))
    big = Image.composite(Image.new("RGB", big.size, OUTLINE), big, ink.point(lut(lambda v: v * 0.92)))
    canvas = Image.new("RGB", (CS, CS), (255, 255, 255))
    canvas.paste(big, (PAD, PAD))
    return clean, canvas


# ---------------------------------------------------------------- static drip assets

def rx(x):
    return (x - RX0) * K


def ry(y):
    return (y - RY0) * K


class Scene:
    def __init__(self):
        f0 = first_frame()
        mask = crown_mask(f0)
        self.arc, xl, xr = fit_arc(mask)
        self.xl, self.xr = xl, xr
        self.xa, self.xb = xl + 1.5, xr - 1.5
        clean, self.canvas = build_crown(f0, mask)
        arc = self.arc

        # re-ink the lower rim's top edge and end caps (broken / missing in the source)
        path, self.cap_l, self.cap_r = rim_outline(clean, arc, xl, xr)
        stroke = Image.new("L", (CS, CS), 0)
        sd = ImageDraw.Draw(stroke)
        pts = [(PAD + x * K, PAD + y * K) for x, y in path]
        sd.line(pts, fill=255, width=int(round(2.7 * K)), joint="curve")
        # the caps get a second pass just inside the first: the source's rim ends are ragged,
        # and this puts the line's smooth inner edge past that instead of beside it
        for (xa_, ya_), (xb_, yb_), inward in ((pts[0], pts[1], 1), (pts[-2], pts[-1], -1)):
            sd.line([(xa_ + inward * 1.1 * K, ya_), (xb_ + inward * 1.1 * K, yb_)], fill=255, width=int(round(2.7 * K)))
        for x, y in (pts[0], pts[-1]):
            sd.ellipse([x - 1.35 * K, y - 1.35 * K, x + 1.35 * K, y + 1.35 * K], fill=255)
        stroke = stroke.filter(ImageFilter.GaussianBlur(0.3 * K))
        self.canvas.paste(Image.new("RGB", (CS, CS), OUTLINE), (0, 0), stroke)
        self.rim_path = path

        # One stable matte for every frame. Preserve the original ink and gold;
        # only the fractional edge pixels receive the outline colour. Broad closing
        # and colour replacement used to seal gaps and leave coloured edge flecks.
        side = int(N * K)
        local = (PAD, PAD, PAD + side, PAD + side)
        matte = crown_alpha(clean, mask).resize((side, side), Image.Resampling.LANCZOS)
        matte = matte.filter(ImageFilter.GaussianBlur(0.35 * K))
        matte = matte.point(lut(lambda v: (v - 128) * 1.8 + 128))
        matte = ImageChops.lighter(matte, stroke.crop(local))

        # Fit the two narrow band gaps to the reference's white centre lines.
        # Cleaning their interiors explicitly avoids deleting pale gold highlights.
        gaps = Image.new("L", (side, side), 0)
        gd = ImageDraw.Draw(gaps)
        for samples in (
            [(125,320), (150,310.5), (200,298.5), (250,292), (320,288.5),
             (390,292), (440,299.5), (490,311.5), (510,318)],
            [(125,364.5), (150,355), (200,344), (250,337.5), (320,334),
             (390,337.5), (440,344), (490,356), (510,363.5)],
        ):
            curve = parabola([(x - 320, y) for x, y in samples])
            pts = [(x * K, curve(x) * K) for x in range(125, 511)]
            gd.line(pts, fill=255, width=round(1.7 * K), joint="curve")
        gaps = gaps.filter(ImageFilter.GaussianBlur(0.2 * K))
        matte = ImageChops.subtract(matte, gaps)
        # Anti-aliased edge RGB is ink, never the white source background. Keep
        # the opaque interior untouched, including the white-gold specular detail.
        core = matte.point(lut(lambda v: (v - 235) * 255 / 20))
        rgb = Image.composite(self.canvas.crop(local), Image.new("RGB", (side, side), OUTLINE), core)
        self.crown_rgba = rgb.convert("RGBA")
        self.crown_rgba.putalpha(matte)

        # colour of the rim just above its bottom edge, per column: the drips carry it down
        cp = clean.load()
        cols = []
        for x in range(N):
            xs = int(clamp(x, self.xa + 5, self.xb - 5))
            y = arc(xs) - 6.5
            acc = [0, 0, 0]
            for dy in (-1, 0, 1):
                c = cp[xs, int(y + dy)]
                acc = [a + v for a, v in zip(acc, c)]
            cols.append(tuple(v / 3 for v in acc))
        strip = Image.new("RGB", (N, 1))
        sp = strip.load()
        for x in range(N):
            w = [cols[int(clamp(x + d, 0, N - 1))] for d in (-3, -2, -1, 0, 1, 2, 3)]
            sp[x, 0] = tuple(int(sum(c[i] for c in w) / len(w)) for i in range(3))
        strip = strip.crop((RX0, 0, RX1, 1)).resize((RW, 1), Image.BICUBIC)
        rim_field = strip.resize((RW, RH), Image.NEAREST)

        def below(offset, sigma):
            m = Image.new("L", (RW, RH), 0)
            pts = [(rx(x), ry(arc(x) + offset)) for x in range(RX0 - 4, RX1 + 5, 4)]
            ImageDraw.Draw(m).polygon(pts + [(RW + 9, RH + 9), (-9, RH + 9)], fill=255)
            return m.filter(ImageFilter.GaussianBlur(sigma))

        depth = below(9, 5 * K).point(lut(lambda v: v * 0.72))
        self.base = Image.composite(solid(GOLD), rim_field, depth)
        self.feather = below(-3.2, 1.0 * K)
        self.clear = below(4, 1.5 * K)

        self.lut_fill = lut(lambda v: (v - 128) * 10.6 + 128)
        self.lut_out = lut(lambda v: (v - 30.6) * 24.0 + 128)
        self.lut_edge = lut(lambda v: 0.68 * 255 * (1 - smoothstep(136, 226, v)))
        self.lut_core = lut(lambda v: 255 * smoothstep(150, 205, v))
        self.lut_sh = lut(lambda v: v * 0.55)
        self.lut_hl = lut(lambda v: v * 0.70)
        self.img_edge, self.img_shadow = solid(EDGE), solid(SHADOW)
        self.img_light, self.img_spec, self.img_outline = solid(LIGHT), solid(SPEC), solid(OUTLINE)

    # ------------------------------------------------------------ per-frame geometry

    def drip_len(self, t, lmax, t0, rb):
        u = clamp((t - t0) / (DUR - t0))
        run = lmax * (1 - (1 - u ** 1.3) ** 2.4)
        swell = 0.55 * rb * smoothstep(t0 - 0.8, t0 + 0.1, t)
        return run + swell

    def draw_shapes(self, t):
        arc = self.arc
        shape = Image.new("L", (RW, RH), 0)
        spec = Image.new("L", (RW, RH), 0)
        ds, dp = ImageDraw.Draw(shape), ImageDraw.Draw(spec)

        # the melting rim: a band whose bottom edge sags unevenly over time
        m0 = 6.0 * smoothstep(0.5, 2.6, t)
        top, bot = [], []
        xt0, xt1 = self.cap_l(arc(self.xl) - 13) + 0.6, self.cap_r(arc(self.xr) - 13) - 0.6
        xb0, xb1 = self.cap_l(arc(self.xl) + 1.5) + 0.6, self.cap_r(arc(self.xr) + 1.5) - 0.6
        steps = 200
        for i in range(steps + 1):
            f = i / steps
            x = xb0 + (xb1 - xb0) * f
            ends = smoothstep(xb0, xb0 + 12, x) * smoothstep(xb1, xb1 - 12, x)
            wob = 0.6 + 0.4 * math.sin(x * 0.071 + 1.3) * math.sin(x * 0.023 + 0.4)
            bot.append((rx(x), ry(arc(x) + 1.5 + m0 * wob * ends)))
            xt = xt0 + (xt1 - xt0) * f
            top.append((rx(xt), ry(arc(xt) - 13)))
        ds.polygon(top + bot[::-1], fill=255)

        for x0, hn, rb, lmax, t0 in DRIPS:
            length = self.drip_len(t, lmax, t0, rb)
            if length <= 0.05:
                continue
            ya = arc(x0) + 1.5
            rv = rb * 1.12
            cb = length - rv                       # depth of the bulb centre below the rim
            ds.ellipse([rx(x0 - rb), ry(ya + cb - rv), rx(x0 + rb), ry(ya + cb + rv)], fill=255)
            if cb > 0:
                hne = hn * (1 - 0.20 * smoothstep(30, 140, length))
                hr = hne * (1 + 2.3 * smoothstep(0, 2.2 * rb, length))
                dr = 2.7 * rb
                left, right = [], []
                steps = 28
                for i in range(steps + 1):
                    d = -10 + (cb + 10) * i / steps
                    flare = hr if d <= 0 else hne + (hr - hne) * max(0.0, 1 - d / dr) ** 2.6
                    taper = hne + (0.9 * rb - hne) * smoothstep(cb - 1.6 * rb, cb - 0.2 * rb, d)
                    hw = max(flare, taper)
                    left.append((rx(x0 - hw), ry(ya + d)))
                    right.append((rx(x0 + hw), ry(ya + d)))
                ds.polygon(left + right[::-1], fill=255)

                # cartoon gloss: a hot spot on the bulb and a streak down the neck
                a = int(255 * smoothstep(1.5 * rv, 2.6 * rv, length))
                bx, by = x0 - 0.30 * rb, ya + cb - 0.15 * rv
                dp.ellipse([rx(bx - 0.26 * rb), ry(by - 0.36 * rv), rx(bx + 0.26 * rb), ry(by + 0.36 * rv)], fill=a)
                s0, s1 = dr * 0.9, cb - 1.9 * rb
                if s1 - s0 > 6:
                    sx, sw = x0 - 0.34 * hne, 0.24 * hne
                    sa = int(150 * smoothstep(6, 26, s1 - s0))
                    dp.rounded_rectangle([rx(sx - sw), ry(ya + s0), rx(sx + sw), ry(ya + s1)],
                                         radius=sw * K, fill=sa)
        return shape, spec

    # ------------------------------------------------------------ per-frame render

    def drip_layer(self, t):
        shape, spec = self.draw_shapes(t)
        blur = ImageFilter.GaussianBlur
        fill_a = shape.filter(blur(2.0 * K)).point(self.lut_fill)     # gooey merge, then re-harden
        out_a = fill_a.filter(blur(7.75)).point(self.lut_out)         # outline = fill grown ~2.7 units
        height = fill_a.filter(blur(3.2 * K))                         # soft height map for shading
        shifted = ImageChops.offset(height, 4, 4)

        fill = Image.composite(self.img_edge, self.base, height.point(self.lut_edge))
        fill = Image.composite(self.img_shadow, fill, ImageChops.subtract(shifted, height, 0.3).point(self.lut_sh))
        fill = Image.composite(self.img_light, fill, ImageChops.subtract(height, shifted, 0.3).point(self.lut_hl))
        gloss = ImageChops.multiply(spec.filter(blur(0.9 * K)), height.point(self.lut_core))
        gloss = ImageChops.multiply(gloss, self.clear)
        fill = Image.composite(self.img_spec, fill, gloss)

        layer = Image.composite(fill, self.img_outline, fill_a)
        alpha = ImageChops.multiply(ImageChops.lighter(out_a, fill_a), self.feather)
        return layer, alpha

    def frame(self, t):
        canvas = self.canvas.copy()
        layer, alpha = self.drip_layer(t)
        canvas.paste(layer, (PAD + int(RX0 * K), PAD + int(RY0 * K)), alpha)

        return canvas.resize((OUT, OUT), Image.LANCZOS)


class WebLogo:
    """Transparent frames of the scene, framed like the site's previous static logo."""

    def __init__(self, scene, size=WEB):
        self.scene, self.size = scene, size
        side = int(N * K)
        self.drip_at = (int(RX0 * K), int(RY0 * K))
        x0, y0, x1, y1 = self.compose(DUR, Image.new("RGBA", (side, side)), (0, 0)).getbbox()
        unit = size / float(LOGO_CANVAS)
        self.ratio = (LOGO_RIGHT - LOGO_LEFT) * unit / (x1 - x0)       # compose px -> output px
        self.origin = (int(round(LOGO_LEFT * unit / self.ratio - x0)),
                       int(round(LOGO_TOP * unit / self.ratio - y0)))
        self.span = size / self.ratio
        cs = int(math.ceil(self.span)) + 1
        self.base = Image.new("RGBA", (cs, cs), (0, 0, 0, 0))
        bottom = (self.origin[1] + y1) * self.ratio
        if bottom > size or self.origin[0] < 0 or self.origin[1] < 0:
            raise SystemExit("artwork does not fit the logo canvas")
        print("web logo: %d px canvas, artwork %d..%d x %d..%d" % (
            size, round((self.origin[0] + x0) * self.ratio), round((self.origin[0] + x1) * self.ratio),
            round((self.origin[1] + y0) * self.ratio), round(bottom)))

    def compose(self, t, canvas, origin):
        layer, alpha = self.scene.drip_layer(t)
        layer = layer.convert("RGBA")
        layer.putalpha(alpha)
        canvas.paste(self.scene.crown_rgba, origin)
        canvas.alpha_composite(layer, (origin[0] + self.drip_at[0], origin[1] + self.drip_at[1]))
        return canvas

    def frame(self, t):
        canvas = self.compose(t, self.base.copy(), self.origin)
        return canvas.resize((self.size, self.size), Image.LANCZOS, box=(0, 0, self.span, self.span))


# Reference-logo motion (master seconds; the site plays them at about 0.3x, see CrownLogo.tsx)
RELEASE = 0.3              # the longest drip starts running out from under the plain rim
MELT = (1.3, 2.1)          # with the drips falling, the plain rim thins up into the drip band
BULB = 0.6                 # drip progress by which the bulb has grown to full size (it starts as a tip)
STAGGER = 0.6              # the shortest drip leaves this much after the longest (no twinned start)
DROP_ZETA = 0.75           # drop spring: clean register, about 3 % overshoot, one visible settle
DROP_OMEGA = 2.2           # rad/s for the longest drip; shorter drips are quicker (omega ~ 1/sqrt(length))


def clean_art(path):
    """Transparent crown art trimmed to its edges. Lossy WebP alpha tops out near 253 and
    leaves faint specks, so alpha is stretched to drop both."""
    art = Image.open(path).convert("RGBA")
    art.putalpha(art.getchannel("A").point(lut(lambda v: (v - 8) * 255 / 242.0)))
    return art.crop(art.getchannel("A").getbbox())


def framed(art):
    """Art scaled into the site logo's framing: spans LOGO_LEFT..LOGO_RIGHT, top at LOGO_TOP."""
    s = (LOGO_RIGHT - LOGO_LEFT) / float(art.width)
    canvas = Image.new("RGBA", (LOGO_CANVAS, LOGO_CANVAS))
    canvas.alpha_composite(art.resize((round(art.width * s), round(art.height * s)), Image.LANCZOS),
                           (LOGO_LEFT, LOGO_TOP))
    return canvas


def fit_start(art, ref):
    """Start art placed over the reference crown: same width, then the height stretch and
    nudge whose crown above the drips overlaps the reference's best (searched at half size)."""
    x0, y0, x1, _ = ref.getchannel("A").getbbox()
    s = (x1 - x0) / float(art.width)
    hw, hh = ref.width // 2, int(0.23 * ref.height)
    solid_ = lambda m: m.point(lambda v: 255 if v > 128 else 0)
    want = solid_(ref.getchannel("A").resize((hw, ref.height // 2), Image.BILINEAR).crop((0, 0, hw, hh)))
    best = None
    for ky in range(-6, 7):
        m = solid_(art.getchannel("A").resize((round(art.width * s / 2), round(art.height * s * (1 + ky / 100.0) / 2)),
                                              Image.BILINEAR))
        for dx in range(-3, 4):
            for dy in range(-3, 4):
                c = Image.new("L", (hw, ref.height // 2))
                c.paste(m, (x0 // 2 + dx, y0 // 2 + dy))
                c = c.crop((0, 0, hw, hh))
                both = sum(ImageChops.darker(c, want).histogram()[255:])
                either = sum(ImageChops.lighter(c, want).histogram()[255:])
                score = both / float(max(1, either))
                if best is None or score > best[0]:
                    best = (score, ky, dx, dy)
    score, ky, dx, dy = best
    print("start crown fit: overlap %.3f, height %+d%%, nudge %d,%d px" % (score, ky, 2 * dx, 2 * dy))
    canvas = Image.new("RGBA", ref.size)
    canvas.alpha_composite(art.resize((round(art.width * s), round(art.height * s * (1 + ky / 100.0))), Image.LANCZOS),
                           (x0 + 2 * dx, y0 + 2 * dy))
    return canvas


class RefLogo:
    """Frames grown from a finished reference logo instead of the traced source.

    The crown and its main band are the reference's in every frame. With a start crown, the
    first frame swaps only the reference's drip band for the start art's plain rim (rim_swap).
    Each drip grows neck first, its bulb starting as a small tip, on a damped spring: long
    drips leave first and land last. They run out from under the plain rim, and only once
    they are falling does the rim thin up into the drip band over MELT,
    so its scalloped edge never shows without drips under it. The last frame is the
    reference itself.

    Nothing is cross-faded, so the two crowns never show double edges.
    """

    def __init__(self, path, size, start=None):
        self.size = size
        ref = framed(clean_art(path))
        w, h = ref.size
        ap = ref.getchannel("A").load()

        def low(x):
            for y in range(h - 1, -1, -1):
                if ap[x, y] > 8:
                    return y
            return -1

        # the band's bottom edge: exact on the columns that end on it (gaps between drips),
        # interpolated straight across each drip's root;
        # shortcut: the 0.48..0.55 window fits the site-framed 1024 logo, re-check it for other art
        lows = [low(x) for x in range(w)]
        gaps = [x for x in range(w) if 0.48 * h < lows[x] < 0.55 * h]
        cut = [h] * w
        for a, b in zip(gaps, gaps[1:]):
            for x in range(a, b + 1):
                cut[x] = lows[a] + (lows[b] - lows[a]) * (x - a) / float(b - a)

        # drips: connected opaque pixels under the band edge, taller than the edge's own wobble
        seen = [[False] * w for _ in range(h)]
        holes = Image.new("L", (w, h), 0)
        hp = holes.load()
        self.drips = []
        for sx in range(w):
            for sy in range(h):
                if seen[sy][sx] or ap[sx, sy] <= 8 or sy <= cut[sx]:
                    continue
                seen[sy][sx] = True
                stack, region = [(sx, sy)], []
                while stack:
                    x, y = stack.pop()
                    region.append((x, y))
                    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                        if 0 <= nx < w and 0 <= ny < h and not seen[ny][nx] and ap[nx, ny] > 8 and ny > cut[nx]:
                            seen[ny][nx] = True
                            stack.append((nx, ny))
                x0, x1 = min(p[0] for p in region), max(p[0] for p in region) + 1
                y0, y1 = min(p[1] for p in region), max(p[1] for p in region) + 1
                if y1 - y0 < 20:
                    continue
                mask = Image.new("L", (x1 - x0, y1 - y0), 0)
                mp = mask.load()
                for x, y in region:
                    mp[x - x0, y - y0] = 255
                    hp[x, y] = 255
                piece = ref.crop((x0, y0, x1, y1))
                piece.putalpha(ImageChops.multiply(piece.getchannel("A"), mask))
                # neck / bulb split: up from the bulb's widest row to where it narrows to 3/4
                pa = piece.getchannel("A").load()
                widths = [sum(1 for x in range(x1 - x0) if pa[x, y] > 128) for y in range(y1 - y0)]
                widest = max(range((y1 - y0) // 2, y1 - y0), key=lambda y: widths[y])
                b0 = widest
                while b0 > 0 and widths[b0 - 1] > 0.75 * widths[widest]:
                    b0 -= 1
                self.drips.append(dict(img=piece, at=(x0, y0), length=y1 - y0, b0=b0,
                                       neck=widths[max(0, b0 - 1)] / float(max(1, widths[widest]))))
        if len(self.drips) < 5:
            raise SystemExit("found %d drips: the band edge fit missed" % len(self.drips))

        longest = max(d["length"] for d in self.drips)
        shortest = min(d["length"] for d in self.drips)
        for d in self.drips:
            d["omega"] = DROP_OMEGA * math.sqrt(longest / float(d["length"]))
        self.rim = self.start = None
        if start:
            self.start = self.rim_swap(ref, fit_start(clean_art(start), ref), cut)
            # rows above the swapped rim (less the resize kernel's reach) never change
            self.fixed_rows = int((min(self.stripe) - 8) * size / float(h))
        for d in self.drips:
            # longest first, the shortest STAGGER later (no twinned start)
            d["tr"] = RELEASE + STAGGER * (longest - d["length"]) / float(max(1, longest - shortest))
            settle = DROP_ZETA * d["omega"] * (DUR - d["tr"])
            assert settle > 6.3, "drip at x=%d cannot settle by the last frame" % d["at"][0]
        self.static = ref.copy()
        self.static.putalpha(ImageChops.subtract(ref.getchannel("A"), holes))

        # self-check: the finished frame is the reference, the first one the start crown
        # compared as seen (over grey): fully transparent pixels may carry any colour
        seen_ = lambda im: Image.alpha_composite(Image.new("RGBA", im.size, (128, 128, 128, 255)), im)
        drift = lambda a, b: max(hi for _, hi in ImageChops.difference(seen_(a), seen_(b)).getextrema())
        assert drift(self.frame(DUR), ref.resize((size, size), Image.LANCZOS)) <= 2, "last frame drifted"
        if self.start:
            assert drift(self.frame(0), self.start.resize((size, size), Image.LANCZOS)) <= 2, "first frame drifted"
        print("reference logo: %d drips, lengths %d..%d px" % (len(self.drips), shortest, longest))

    def rim_swap(self, ref, art, cut):
        """The reference with its drip band replaced by the start art's plain rim.

        Both crowns have a see-through stripe between the main band and the lower rim. The
        seam runs along the middle of the reference's stripe, so it never shows, and the
        rim is shifted to sit as far under the band as it does in its own art."""
        w, h = ref.size
        ra, aa = ref.getchannel("A").load(), art.getchannel("A").load()

        def stripe(a, bottom):
            found = {}
            for x in range(w):
                if bottom[x] >= h:
                    continue
                y = int(bottom[x]) - 3
                while y > 0 and a[x, y] > 64:        # up through the rim
                    y -= 1
                top = y
                while y > 0 and a[x, y] <= 64:       # up through the stripe
                    y -= 1
                if 2 <= top - y <= 14:
                    found[x] = (top + y) / 2.0
            return found

        art_low = [next((y for y in range(h - 1, -1, -1) if aa[x, y] > 8), h) if cut[x] < h else h
                   for x in range(w)]
        ours, theirs = stripe(ra, cut), stripe(aa, art_low)
        both = sorted(ours[x] - theirs[x] for x in ours if x in theirs)
        assert len(both) > 100, "no stripe under the band in both crowns"
        dy = int(round(both[len(both) // 2]))
        xs = sorted(ours)
        raw = [ours[min(xs, key=lambda k: abs(k - x))] for x in range(w)]
        line = [sorted(raw[max(0, x - 6):x + 7])[len(raw[max(0, x - 6):x + 7]) // 2] for x in range(w)]
        self.stripe = [line[x] for x in xs]
        lower = Image.new("L", (w, h), 0)
        x0, x1 = xs[0] - 6, xs[-1] + 6                 # the rim's rounded ends reach a little past
        ImageDraw.Draw(lower).polygon([(x, line[x]) for x in range(x0, x1 + 1)] + [(x1, h), (x0, h)], fill=255)
        rim = Image.new("RGBA", (w, h))
        rim.alpha_composite(art, (0, dy))
        rim.putalpha(ImageChops.multiply(rim.getchannel("A"), lower))
        frame = ref.copy()
        frame.putalpha(ImageChops.subtract(ref.getchannel("A"), lower))
        frame.alpha_composite(rim)
        # the rim melts by thinning up to the stripe; the drip band shows only where it has
        # gone, so its bottom starts below whichever of the two reaches lower
        rp, bp = rim.getchannel("A").load(), ref.getchannel("A").load()
        self.rim, self.rim_x = rim, (x0, x1)
        self.rim_top = line
        self.rim_bottom = [max(next((y for y in range(h - 1, int(line[x]), -1) if rp[x, y] > 8), int(line[x])),
                               next((y for y in range(min(h - 1, int(cut[x]) + 2), int(line[x]), -1)
                                     if bp[x, y] > 8), int(line[x]))) + 3
                           for x in range(w)]
        print("start rim: swapped under the band for x %d..%d, shifted %+d px" % (x0, x1, dy))
        return frame

    def rim_cover(self, u):
        """L mask of the plain rim's area, thinned up toward the stripe by u (0: whole, 1: gone)."""
        x0, x1 = self.rim_x
        # top: the exact seam rim_swap cut along; the 1024 -> 480 resize anti-aliases the edge
        top = [(x, self.rim_top[x]) for x in range(x0, x1 + 1)]
        edge = [(x, self.rim_top[x] + (self.rim_bottom[x] - self.rim_top[x]) * (1 - u)) for x in range(x0, x1 + 1)]
        cover = Image.new("L", self.rim.size, 0)
        ImageDraw.Draw(cover).polygon(top + edge[::-1], fill=255)
        return cover

    def drip_progress(self, d, t):
        """0 before release, then a damped spring to 1 (about 3 % overshoot)."""
        tau = t - d["tr"]
        if tau <= 0:
            return 0.0
        wz = DROP_ZETA * d["omega"]
        wd = d["omega"] * math.sqrt(1 - DROP_ZETA ** 2)
        x = 1 - math.exp(-wz * tau) * (math.cos(wd * tau) + wz / wd * math.sin(wd * tau))
        return 1.0 if abs(x - 1) * d["length"] < 0.25 else x

    def drip_length(self, d, t):
        return d["length"] * self.drip_progress(d, t)

    def frame(self, t):
        canvas = self.static.copy()
        melting = self.rim is not None and t < MELT[1]
        if melting:
            # the drip band shows only where the plain rim has already thinned away
            cover = self.rim_cover(smoothstep(MELT[0], MELT[1], t))
            canvas.putalpha(ImageChops.subtract(canvas.getchannel("A"), cover))
        self.draw_drips(canvas, t)
        if melting:
            # drips run out from under the plain rim
            rim = self.rim.copy()
            rim.putalpha(ImageChops.multiply(rim.getchannel("A"), cover))
            canvas.alpha_composite(rim)
        return canvas.resize((self.size, self.size), Image.LANCZOS)

    def draw_drips(self, canvas, t):
        for d in self.drips:
            x = self.drip_progress(d, t)
            if x <= 0:
                continue
            img, b0 = d["img"], d["b0"]
            # the neck pours from the band (joint first) and stretches on overshoot
            n = int(round(b0 * x))
            if n > 0:
                neck = img.crop((0, 0, img.width, min(n, b0)))
                if n > b0:
                    neck = neck.resize((img.width, n), Image.LANCZOS)
                canvas.alpha_composite(neck, d["at"])
            # the bulb rides the neck's end: a neck-wide tip at first, full size by BULB
            s = smoothstep(0.0, BULB, x)
            bulb = img.crop((0, b0, img.width, img.height))
            if s < 1:
                bw = max(1, int(round(bulb.width * (d["neck"] + (1 - d["neck"]) * s))))
                bh = int(round(bulb.height * s))
                if bh < 1:
                    continue
                bulb = bulb.resize((bw, bh), Image.LANCZOS)
            canvas.alpha_composite(bulb, (d["at"][0] + (img.width - bulb.width) // 2, d["at"][1] + n))


def write_web(scene, outdir):
    logo = WebLogo(scene)
    total = int(round(DUR / WEB_SPEED * WEB_FPS))
    start = time.time()
    frames = [logo.frame(i / WEB_FPS * WEB_SPEED) for i in range(total)]
    frames.append(logo.frame(DUR))                       # the resting frame, fully dripped
    ms = [int(round((i + 1) * 1000.0 / WEB_FPS)) - int(round(i * 1000.0 / WEB_FPS)) for i in range(total)]
    ms.append(WEB_HOLD_MS)
    anim, still = os.path.join(outdir, WEB_ANIM), os.path.join(outdir, WEB_STILL)
    print("rendered %d frames in %.0fs, encoding..." % (len(frames), time.time() - start), flush=True)
    # loop=1: play once and stop on the last frame
    frames[0].save(anim, save_all=True, append_images=frames[1:], duration=ms, loop=1,
                   quality=80, alpha_quality=70, method=6, minimize_size=True)
    WebLogo(scene, WEB_STILL_SIZE).frame(DUR).save(still, quality=90, method=6)
    for path in (anim, still):
        print("wrote %s  %.0f KB" % (path, os.path.getsize(path) / 1024.0))


def write_sheets(make_logo, outdir):
    """Lossless 480px / 30fps browser assets, four bounded 1920 x 2880px PNG sheets."""
    os.makedirs(outdir, exist_ok=True)
    size, columns, per_sheet = 480, 4, 24
    logo = make_logo(size)
    total = int(DUR / WEB_SPEED * WEB_FPS) + 1
    urls, ends = [], []
    first = last = None
    upper = None
    start = time.time()
    for offset in range(0, total, per_sheet):
        count = min(per_sheet, total - offset)
        sheet = Image.new("RGBA", (columns * size, math.ceil(count / columns) * size))
        for local_index in range(count):
            index = offset + local_index
            frame = logo.frame(index / WEB_FPS * WEB_SPEED)
            # A fixed upper-crown crop must be byte-identical throughout playback.
            fixed = frame.crop((0, 0, size, getattr(logo, "fixed_rows", 220))).tobytes()
            if upper is None:
                upper = fixed
            assert fixed == upper, "Stationary crown moved between frames"
            if index == 0:
                first = frame.copy()
            last = frame
            sheet.paste(frame, ((local_index % columns) * size, (local_index // columns) * size))
            ends.append(round((index + 1) * 1000 / WEB_FPS))
        name = "goldenepoxy-crown-v5-%d.png" % len(urls)
        sheet.save(os.path.join(outdir, name), optimize=True)
        urls.append("/" + name)
        print("wrote", name, flush=True)
    first.save(os.path.join(outdir, "goldenepoxy-crown-v5-start.png"), optimize=True)
    last.save(os.path.join(outdir, "goldenepoxy-crown-v5-still.png"), optimize=True)
    manifest = dict(size=size, columns=columns, perSheet=per_sheet, sheets=urls, frameEnds=ends,
                    start="/goldenepoxy-crown-v5-start.png", still="/goldenepoxy-crown-v5-still.png")
    with open(os.path.join(HERE, "components", "crown-frames.json"), "w") as f:
        json.dump(manifest, f, indent=2)
        f.write("\n")
    print("Exported %d frames in %.1fs; stationary crown verified" % (total, time.time() - start))


def write_logos(scene, outdir, margin=0.04):
    """First and last frame at full compose resolution, transparent, trimmed to the artwork."""
    logo = WebLogo(scene)
    side = int(N * K)
    for name, t in (("goldenepoxy-crown-logo.png", 0.0), ("goldenepoxy-crown-drip-logo.png", DUR)):
        art = logo.compose(t, Image.new("RGBA", (side, side)), (0, 0))
        x0, y0, x1, y1 = art.getbbox()
        pad = int(round((x1 - x0) * margin))
        out = Image.new("RGBA", (x1 - x0 + 2 * pad, y1 - y0 + 2 * pad), OUTLINE + (0,))
        out.paste(art.crop((x0, y0, x1, y1)), (pad, pad))
        path = os.path.join(outdir, name)
        out.save(path, optimize=True)
        print("wrote %s  %dx%d  %.0f KB" % (path, out.width, out.height, os.path.getsize(path) / 1024.0))


def main():
    if len(sys.argv) >= 4 and sys.argv[1] == "--sheets-ref":
        start = sys.argv[4] if len(sys.argv) >= 5 else None
        write_sheets(lambda size: RefLogo(sys.argv[2], size, start), os.path.abspath(sys.argv[3]))
        return

    scene = Scene()
    print("arc fitted; rim spans x = %.1f .. %.1f" % (scene.xa, scene.xb))

    if len(sys.argv) >= 3 and sys.argv[1] == "--sheets":
        write_sheets(lambda size: WebLogo(scene, size), os.path.abspath(sys.argv[2]))
        return

    if len(sys.argv) >= 3 and sys.argv[1] == "--logos":
        write_logos(scene, os.path.abspath(sys.argv[2]))
        return

    if len(sys.argv) >= 3 and sys.argv[1] == "--web":
        write_web(scene, os.path.abspath(sys.argv[2]))
        return

    if len(sys.argv) >= 4 and sys.argv[1] == "--stills":
        bs = chr(92)
        outdir = bs * 2 + "?" + bs + os.path.abspath(sys.argv[3])
        for ts in sys.argv[2].split(","):
            name = "s%s.png" % ts.replace(".", "_")
            scene.frame(float(ts)).save(outdir + bs + name)
            print("wrote", name)
        return

    ff = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [ff, "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "%dx%d" % (OUT, OUT),
           "-r", str(FPS), "-i", "-", "-an",
           "-vf", "scale=out_color_matrix=bt709:out_range=tv,setparams=colorspace=bt709:color_primaries=bt709:color_trc=bt709",
           "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-pix_fmt", "yuv420p",
           "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
           "-movflags", "+faststart", OUT_PATH]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    total = int(round(DUR * FPS))
    start = time.time()
    for i in range(total):
        proc.stdin.write(scene.frame(i / FPS).tobytes())
        if i % 30 == 0:
            print("frame %d/%d  (%.0fs)" % (i, total, time.time() - start), flush=True)
    proc.stdin.close()
    proc.wait()
    print("done ->", OUT_PATH, "in %.0fs" % (time.time() - start))


if __name__ == "__main__":
    main()
