# Golden Epoxy brand files

The final logos, their animation, the files they were made from, and copies of what the website shows.
The website uses its own files in `public/`, so editing a file here does not change the site.

## logo/ — the black crown (final)

| File | What it is | Size |
|---|---|---|
| `crown-finish.svg` / `.png` | **Final logo:** the dripping crown | SVG 1688 × 1480; PNG 4096 × 3591, transparent |
| `crown-start.svg` / `.png` | The plain crown it starts from, on the same canvas (lines up exactly with the finish) | SVG 1688 × 1480; PNG 4096 × 3591, transparent |
| `crown-plain.svg` / `.png` | The plain crown cropped close, for use on its own | SVG 1688 × 984; PNG 2400 × 1399, transparent |

## animation/ — start to finish

| File | What it is | Size |
|---|---|---|
| `crown-drip-animation.mp4` | The drips pour from the band, settle, and drain back; 6 s seamless loop, 60 fps, on white | 1080 × 1080 |
| `crown-drip-animation.webm` | Same loop with a transparent background (VP9 alpha), for the website | 1080 × 1080 |
| `crown-drip-animation.gif` | Same loop, 30 fps, on white | 540 × 540 |
| `crown-gold-drip-animation.mp4` | **Gold crown:** the drips pour from the bottom strip. Each one gathers into a bead, stretches into a neck, falls faster and faster, then recoils with its tip wobbling and settles. 6 s seamless loop, 60 fps, on white | 1340 × 1174 |
| `crown-gold-drip-animation.webm` | Same gold loop with a transparent background (VP9 alpha), for the website | 1340 × 1174 |
| `crown-gold-drip-animation.gif` | Same gold loop, 30 fps, on white | 670 × 588 |

## source/ — open and edit these

| File | What it is |
|---|---|
| `crown-finish.vectorcraft` | The final dripping crown in VectorCraft: crown, band and bottom strip (mirrored, live) and the drips as traced curves |
| `crown-start.vectorcraft` | The plain crown in VectorCraft; the finish file began as a copy of it |
| `gold-crown-start.webp` | Gold crown without drips, transparent (1340 × 1174); the gold drip animation starts on it |
| `gold-crown-drip-clip.mp4` | The drip clip the header animation is built from: Higgsfield Seedance 2.5 (480p, start and end frames below), first 2.25 s cut; 692 × 606, 24 fps, 3.8 s |
| `gold-crown-finish.webp` | Gold dripping crown on the same canvas (1340 × 1174); the gold drip animation ends on it |
| `crown-original.webp` | Original gold crown art, no drips (1536 × 1024); the gold header animation starts on it |
| `crown-drip-original.webp` | Original gold dripping crown art (1254 × 1254); the gold header animation ends on it, and the wordmark takes its colours from it |

## website/ — copies of what the site shows

| File | What it is | Size | The site's file |
|---|---|---|---|
| `wordmark.png` | "GOLDEN — EPOXY —" in the crown's gold (Cinzel) | 2838 × 745 | `public/goldenepoxy-wordmark-v5.png` |
| `crown-gold-still.png` | Gold dripping crown, the header animation's final still | 480 × 480 | `public/goldenepoxy-crown-v6-still.png` |
| `crown-gold-animation.gif` | The earlier (v5) gold header animation, on white; the site now plays the v6 drip clip | 419 × 361 | built from `public/goldenepoxy-crown-v5-*.png` |
| `favicon.png` | Browser-tab icon | 1024 × 1024 | `app/icon.png` |
| `pdf-logo.png` | Crown with "GOLDEN —EPOXY—" capitals, older style | 1568 × 484 | `public/tools-logo.png` (estimate and invoice PDFs) |

## Rebuilding

The header logo animation (v6) is a drip clip on white turned into transparent sprite sheets. Rebuild it from the clip (needs numpy, Pillow and ffmpeg):

    python crown_video.py brand/source/gold-crown-drip-clip.mp4 brand/source/gold-crown-start.webp brand/source/gold-crown-finish.webp

The earlier v5 header animation came from:

    python crown_drip.py --sheets-ref brand/source/crown-drip-original.webp public brand/source/crown-original.webp

Rebuild the wordmark. This needs the free Cinzel font, `Cinzel[wght].ttf`, from github.com/google/fonts/tree/main/ofl/cinzel:

    python wordmark.py path/to/Cinzel[wght].ttf brand/source/crown-drip-original.webp public/goldenepoxy-wordmark-v5.png

To update the black logo files, edit `source/crown-finish.vectorcraft` or `source/crown-start.vectorcraft` in VectorCraft and export them again with File › Export as SVG and PNG.
