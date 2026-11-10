"""Header wordmark: "GOLDEN" over "— EPOXY —" in Roman capitals, coloured with the crown's own gold and outline.

usage: python wordmark.py CINZEL.ttf CROWN.webp OUT.png

CINZEL.ttf is the Cinzel variable font (SIL Open Font License, github.com/google/fonts/tree/main/ofl/cinzel).
CROWN is brand/source/crown-drip-original.webp: its gold and outline colours are copied so the two marks match.
Proportions follow the earlier wordmark (public/legacy-images/logo-text.png, since removed; see git history).
"""
import sys
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

CAP = 420           # cap height of GOLDEN, px
WEIGHT = 560        # Cinzel weight axis, 400..900
TRACK = 0.05         # extra space between GOLDEN's letters / GOLDEN cap height
EPOXY_CAP = 0.49     # EPOXY cap height / GOLDEN cap height
EPOXY_TRACK = 0.32   # extra space between EPOXY's letters / EPOXY cap height (wide tracking)
ROW_GAP = 0.20       # gap between the rows / GOLDEN cap height
RULE_GAP = 0.10      # gap between a rule and EPOXY / GOLDEN cap height
RULE_THICK = 0.045   # rule thickness at its fullest / GOLDEN cap height
OUTLINE = 0.025      # outline width / GOLDEN cap height (the crown's line is about as thin)


def font_at(path, cap):
    probe = ImageFont.truetype(path, 1000)
    probe.set_variation_by_axes([WEIGHT])
    top, bottom = probe.getbbox("H", anchor="ls")[1::2]
    f = ImageFont.truetype(path, round(1000 * cap / (bottom - top)))
    f.set_variation_by_axes([WEIGHT])
    return f


def ink_width(font, text, track):
    """Ink width of text set letter by letter with extra tracking (no kerning table without raqm)."""
    x, left, right = 0.0, None, None
    for i, ch in enumerate(text):
        l, _, r, _ = font.getbbox(ch, anchor="ls")
        left = x + l if left is None else left
        right = x + r
        x += font.getlength(ch) + track
    return right - left, left


def set_line(draw, font, text, track, cx, baseline):
    w, left = ink_width(font, text, track)
    x = cx - w / 2 - left
    for ch in text:
        draw.text((x, baseline), ch, font=font, fill=255, anchor="ls")
        x += font.getlength(ch) + track
    return cx - w / 2, cx + w / 2


def rule(draw, x_outer, x_inner, y, thick):
    """Hairline that swells toward the lettering and ends in points."""
    n, top, bottom = 48, [], []
    for i in range(n + 1):
        u = i / n                       # 0 at the outer tip, 1 at the inner tip
        h = thick / 2 * min(1.0, (u / 0.8) ** 1.5, (1 - u) / 0.2 if u > 0.8 else 1.0)
        x = x_outer + (x_inner - x_outer) * u
        top.append((x, y - h))
        bottom.append((x, y + h))
    draw.polygon(top + bottom[::-1], fill=255)


def crown_palette(path):
    """Crown's gold as (luminance CDF, colour per luminance level), and its outline colour."""
    im = Image.open(path).convert("RGBA")
    lum = im.convert("RGB").convert("L")
    solid = im.getchannel("A").point(lambda v: 255 if v > 200 else 0)
    gold = ImageChops.multiply(solid, lum.point(lambda v: 255 if 90 < v < 250 else 0))
    dark = ImageChops.multiply(solid, lum.point(lambda v: 255 if v < 50 else 0))
    hist = lum.histogram(mask=gold)
    total, run, cdf = float(sum(hist)), 0, []
    for h in hist:
        run += h
        cdf.append(run / total)
    sums = {}
    for (r, g, b, a), l, m in zip(im.get_flattened_data(), lum.get_flattened_data(), gold.get_flattened_data()):
        if m:
            s = sums.setdefault(l, [0, 0, 0, 0])
            s[0] += r; s[1] += g; s[2] += b; s[3] += 1
    levels = sorted(sums)
    colour = []
    for v in range(256):
        s = sums[min(levels, key=lambda k: abs(k - v))]
        colour.append(tuple(round(c / s[3]) for c in s[:3]))
    d = [0, 0, 0, 0]
    for (r, g, b, a), m in zip(im.get_flattened_data(), dark.get_flattened_data()):
        if m:
            d[0] += r; d[1] += g; d[2] += b; d[3] += 1
    assert total > 10000 and d[3] > 1000, "crown image has too few gold or outline pixels"
    return cdf, colour, tuple(round(c / d[3]) for c in d[:3])


def main(font_path, crown_path, out_path):
    big, small = font_at(font_path, CAP), font_at(font_path, CAP * EPOXY_CAP)
    track_big, track_small = CAP * TRACK, CAP * EPOXY_CAP * EPOXY_TRACK

    pad = round(CAP * (OUTLINE + 0.06))
    width = round(ink_width(big, "GOLDEN", track_big)[0]) + 2 * pad
    base1 = pad + CAP
    base2 = round(base1 + CAP * ROW_GAP + CAP * EPOXY_CAP)
    height = base2 + pad + round(CAP * 0.04)
    cx = width / 2

    mask = Image.new("L", (width, height), 0)
    draw = ImageDraw.Draw(mask)
    set_line(draw, big, "GOLDEN", track_big, cx, base1)
    left, right = set_line(draw, small, "EPOXY", track_small, cx, base2)
    y_rule = base2 - CAP * EPOXY_CAP / 2
    rule(draw, pad, left - CAP * RULE_GAP, y_rule, CAP * RULE_THICK)
    rule(draw, width - pad, right + CAP * RULE_GAP, y_rule, CAP * RULE_THICK)

    # tone: a polished band down each row, plus a soft bevel lit from the upper left
    band = Image.new("L", (1, height), 0)
    for top, cap in ((base1 - CAP, CAP), (base2 - CAP * EPOXY_CAP, CAP * EPOXY_CAP)):
        for y in range(max(0, round(top - cap * 0.1)), min(height, round(top + cap * 1.1))):
            u = (y - top) / cap
            band.putpixel((0, y), round(255 * (0.55 + 0.4 * max(0.0, 1 - abs(u - 0.35) / 0.65) ** 1.5)))
    tone = band.resize((width, height))
    relief = mask.filter(ImageFilter.GaussianBlur(CAP * 0.035))
    d = max(1, round(CAP * 0.012))
    shade = ImageChops.subtract(ImageChops.offset(relief, -d, -d), ImageChops.offset(relief, d, d), scale=2.2, offset=128)
    tone = ImageChops.add(tone, shade, offset=-128)

    # same spread of light and dark as the crown, then the crown's colour at each level
    cdf_crown, colour, outline_rgb = crown_palette(crown_path)
    hist = tone.histogram(mask=mask.point(lambda v: 255 if v > 128 else 0))
    total, run, cdf = float(sum(hist)), 0, []
    for h in hist:
        run += h
        cdf.append(run / total)
    match, j = [], 0
    for v in range(256):
        while j < 255 and cdf_crown[j] < cdf[v]:
            j += 1
        match.append(j)
    tone = tone.point(match)
    gold = Image.merge("RGB", [tone.point([colour[v][i] for v in range(256)]) for i in range(3)])

    o = CAP * OUTLINE
    ring = mask.filter(ImageFilter.GaussianBlur(o * 0.55)).point(lambda v: max(0, min(255, (v - 6) * 10)))
    out = Image.new("RGBA", (width, height), outline_rgb + (0,))
    out.putalpha(ring)
    out.alpha_composite(Image.merge("RGBA", (*gold.split(), mask)))

    bbox = out.getchannel("A").getbbox()
    assert bbox[0] > 0 and bbox[1] > 0 and bbox[2] < width and bbox[3] < height, "wordmark clipped at the edge"
    out = out.crop(bbox)
    out.save(out_path, optimize=True)
    print("wrote %s %dx%d (aspect %.3f); outline colour %s" % (out_path, out.width, out.height, out.width / out.height, outline_rgb))


if __name__ == "__main__":
    main(*sys.argv[1:4])
