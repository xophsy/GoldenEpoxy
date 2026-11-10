"""Turn a crown-drip video on a white background into the header logo's sprite sheets.

usage: python crown_video.py VIDEO START_ART FINISH_ART
  VIDEO       the drip animation on white (e.g. the trimmed Seedance clip, 24 fps)
  START_ART   transparent gold crown without drips (brand/source/gold-crown-start.webp)
  FINISH_ART  transparent gold crown with drips, same canvas (brand/source/gold-crown-finish.webp)

Writes public/goldenepoxy-crown-v6-*.png (480 px frames, 4 x 6 per sheet), the start and still images, and
components/crown-frames.json for components/CrownLogo.tsx. Needs numpy, Pillow and ffmpeg on PATH.

Transparency: the crown above the bottom strip takes its shape from START_ART (so the window holes stay holes and
its pale highlights stay solid); the drips are keyed out of the white by their blue channel (gold has little blue),
with highlights enclosed inside a drip filled back in. Frames are placed so the crown sits exactly where the earlier
v5 crown sat (rim at 54 % of the frame height: SiteHeader relies on it).
"""
import json, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
SIZE, COLUMNS, PER_SHEET = 480, 4, 24
CROWN_BOX = (49, 46, 429)            # v5 crown in its 480 frame: left, top, right (the rim then lands at y 259 = 54 %)

def art_alpha(path):
    return np.asarray(Image.open(path).convert("RGBA")).astype(np.float32)[..., 3] / 255.0

def video_frames(path):
    probe = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate",
                            "-of", "csv=p=0", path], capture_output=True, text=True, check=True).stdout.strip().split(",")
    w, h = int(probe[0]), int(probe[1]); num, den = map(int, probe[2].split("/"))
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
    frames = np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3)
    return frames, num / den

def fit(art_a, frame_rgb, cut_row):
    """scale and shift that put the art on the video frame (best overlap of the gold shapes above art row cut_row)"""
    H, W = frame_rgb.shape[:2]
    gold = (255 - frame_rgb[..., 2].astype(int)) > 60
    best = None
    for sc in np.linspace(W / art_a.shape[1] * 0.98, W / art_a.shape[1] * 1.03, 21):
        w, h = round(art_a.shape[1] * sc), round(art_a.shape[0] * sc)
        am = np.asarray(Image.fromarray((art_a * 255).astype(np.uint8)).resize((w, h), Image.LANCZOS)) > 128
        for dx in range(-4, 5):
            for dy in range(-4, 5):
                c = np.zeros_like(gold)
                ys, xs = slice(max(0, dy), min(H, dy + h)), slice(max(0, dx), min(W, dx + w))
                c[ys, xs] = am[ys.start - dy:ys.stop - dy, xs.start - dx:xs.stop - dx]
                r = round(cut_row * sc + dy)
                iou = (c[:r] & gold[:r]).sum() / (c[:r] | gold[:r]).sum()
                if best is None or iou > best[0]: best = (iou, sc, dx, dy)
    return best

def place(art_a, sc, dx, dy, shape):
    """the art's alpha on the video's pixel grid"""
    H, W = shape
    w, h = round(art_a.shape[1] * sc), round(art_a.shape[0] * sc)
    a = np.asarray(Image.fromarray((art_a * 255).astype(np.uint8)).resize((w, h), Image.LANCZOS)).astype(np.float32) / 255
    out = np.zeros((H, W), np.float32)
    ys, xs = slice(max(0, dy), min(H, dy + h)), slice(max(0, dx), min(W, dx + w))
    out[ys, xs] = a[ys.start - dy:ys.stop - dy, xs.start - dx:xs.stop - dx]
    return out

def key(rgb, crown_a, strip_bottom):
    """RGBA (straight alpha) of one white-background frame"""
    H, W = rgb.shape[:2]
    c = rgb.astype(np.float32)
    a = np.clip((255 - c[..., 2] - 6) / (215 - 6), 0, 1)                  # blue channel key: white 0, gold 1
    rows = np.arange(H)[:, None]
    drip_zone = rows > strip_bottom[None, :] - 2          # starts just inside the strip: no seam where drips attach
    # crown: its shape from the art (solid inside, holes stay holes), soft edges from the key
    inner = np.asarray(Image.fromarray((crown_a * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3))) / 255.0
    a = np.where(drip_zone, a, np.minimum(np.maximum(a, inner), np.maximum(crown_a, a * (crown_a > 0.02))))
    # drips: everything inside a drip's outline is solid (pale highlights included); only its outer edge stays soft
    solid = Image.fromarray(((a > 0.15) * 255).astype(np.uint8)).copy()    # copy: a numpy-backed image ignores the fill
    ImageDraw.floodfill(solid, (0, 0), 128); ImageDraw.floodfill(solid, (W - 1, H - 1), 128)
    assert np.asarray(solid)[0, 0] == 128, "background fill did not run"
    body = Image.fromarray((np.asarray(solid) != 128).astype(np.uint8) * 255)
    inside = np.asarray(body.filter(ImageFilter.MinFilter(5))) > 0                # 2 px in from the outline
    a = np.where(inside & drip_zone, 1.0, a)
    col = np.where(a[..., None] > 1e-3, 255 - (255 - c) / np.maximum(a[..., None], 1e-3), 0)   # un-mix from white
    return np.dstack([np.clip(col, 0, 255), a * 255]).astype(np.uint8)

def to_frame(rgba, sc_v, ox, oy):
    """place a video-resolution RGBA on the 480 frame (scale sc_v, offset ox, oy), premultiplied so edges stay clean"""
    im = Image.fromarray(rgba, "RGBA").convert("RGBa")
    inv = (1 / sc_v, 0, -ox / sc_v, 0, 1 / sc_v, -oy / sc_v)
    return im.transform((SIZE, SIZE), Image.AFFINE, inv, resample=Image.BICUBIC).convert("RGBA")

def main(video, start_art, finish_art):
    frames, fps = video_frames(video)
    sa, fa = art_alpha(start_art), art_alpha(finish_art)
    assert sa.shape == fa.shape, "start and finish art must share one canvas"
    # where the start art sits in the video: the clip may begin mid-drip, so fit the crown above the drips only
    ys, xs = np.nonzero(sa > 0.5)
    iou, sc, dx, dy = fit(sa, frames[0], int(ys.max() * 0.62))
    assert iou > 0.9, "the video's crown does not line up with the start art (overlap %.2f)" % iou
    crown_a = place(sa, sc, dx, dy, frames.shape[1:3])
    H, W = frames.shape[1:3]
    strip_bottom = np.array([np.nonzero(crown_a[:, x] > 0.5)[0].max() if (crown_a[:, x] > 0.5).any() else H for x in range(W)])
    # art -> 480 frame: the art's crown box onto the v5 crown box
    left, top, right = CROWN_BOX
    k = (right - left) / (xs.max() - xs.min()); ax0, ay0 = left - xs.min() * k, top - ys.min() * k
    sc_v, ox, oy = k / sc, ax0 - dx * k / sc, ay0 - dy * k / sc        # video -> 480 frame
    out = [to_frame(key(f, crown_a, strip_bottom), sc_v, ox, oy) for f in frames]
    # sheets, start, still, json
    pub = os.path.join(HERE, "public"); names = []
    for s in range(0, len(out), PER_SHEET):
        chunk = out[s:s + PER_SHEET]; rows_n = (len(chunk) + COLUMNS - 1) // COLUMNS
        sheet = Image.new("RGBA", (COLUMNS * SIZE, rows_n * SIZE), (0, 0, 0, 0))
        for i, im in enumerate(chunk): sheet.paste(im, ((i % COLUMNS) * SIZE, (i // COLUMNS) * SIZE))
        name = "goldenepoxy-crown-v6-%d.png" % (s // PER_SHEET); sheet.save(os.path.join(pub, name), optimize=True); names.append("/" + name)
    out[0].save(os.path.join(pub, "goldenepoxy-crown-v6-start.png"), optimize=True)
    fin = Image.open(finish_art).convert("RGBA")
    still = fin.resize((round(fin.width * k), round(fin.height * k)), Image.LANCZOS)
    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0)); canvas.alpha_composite(still, (round(ax0), round(ay0)))
    canvas.save(os.path.join(pub, "goldenepoxy-crown-v6-still.png"), optimize=True)
    data = dict(size=SIZE, columns=COLUMNS, perSheet=PER_SHEET, sheets=names,
                frameEnds=[round((i + 1) * 1000 / fps) for i in range(len(out))],
                start="/goldenepoxy-crown-v6-start.png", still="/goldenepoxy-crown-v6-still.png")
    json.dump(data, open(os.path.join(HERE, "components", "crown-frames.json"), "w"), indent=2)
    # self-check: the last frame lands on the finished art, and the rim still sits at 54 % of the frame
    last = np.asarray(out[-1])[..., 3] > 128; ref = np.asarray(canvas)[..., 3] > 128
    overlap = (last & ref).sum() / (last | ref).sum()
    rim = np.nonzero(np.asarray(out[0])[:, :, 3].max(axis=1) > 128)[0]
    print("%d frames at %.0f fps in %d sheets; video fit %.3f; last frame vs finished art overlap %.3f" % (len(out), fps, len(names), iou, overlap))
    assert overlap > 0.85, "the last frame does not match the finished crown"
    assert len(data["frameEnds"]) == len(out) and data["frameEnds"][-1] > 0

if __name__ == "__main__":
    main(*sys.argv[1:4])
