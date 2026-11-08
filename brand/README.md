# Golden Epoxy brand files

Copies of the final logos. The website keeps using the originals listed below, so editing a file here does not change the site.

| File | What it is | Size | Original | Used on |
|---|---|---|---|---|
| `wordmark.png` | "GOLDEN — EPOXY —" Roman capitals (Cinzel) in the crown's gold with its thin dark outline | 2838 × 745 | `public/goldenepoxy-wordmark-v5.png` | Site header |
| `crown-original.webp` | Original crown, no drips; the header animation starts on this | 1536 × 1024 | (this file) | Header animation start |
| `crown-drip-original.webp` | Original dripping crown; the header animation ends on this | 1254 × 1254 | (this file) | Header animation end |
| `crown-drip.png` | Dripping crown as the site shows it | 480 × 480 | `public/goldenepoxy-crown-v5-still.png` | Site header (last frame of the animation) |
| `crown-drip-large.png` | Dripping crown, large export (older dark-outlined style) | 2104 × 1804 | `logo-exports/goldenepoxy-crown-drip-logo.png` | Print, social, signs |
| `crown-no-drip-large.png` | Crown without drips, large export (older dark-outlined style) | 2104 × 1242 | `logo-exports/goldenepoxy-crown-logo.png` | Print, social, signs |
| `favicon.png` | Dripping crown, earlier version | 1024 × 1024 | `app/icon.png` | Browser tab |
| `crown-and-text-old-style.png` | Crown with "GOLDEN —EPOXY—" capitals (older style) | 1568 × 484 | `public/tools-logo.png` | Estimate and invoice PDFs |
| `crown-animation.gif` | Crown animation as the site plays it, on white, loops | 419 × 361 | built from `public/goldenepoxy-crown-v5-*.png` | Sharing, social |
| `crown-animation.mp4` | Crown drip animation, 1080p (older dark-outlined style) | | `crown_drip_1080.mp4` | Download / social |

The estimate/invoice logo uses the same capitals in the earlier, darker gold.

Rebuild the header animation after changing either original:

    python crown_drip.py --sheets-ref brand/crown-drip-original.webp public brand/crown-original.webp

Rebuild the wordmark (needs the free Cinzel font, `Cinzel[wght].ttf` from github.com/google/fonts/tree/main/ofl/cinzel; it takes its colours from the dripping crown):

    python wordmark.py path/to/Cinzel[wght].ttf brand/crown-drip-original.webp public/goldenepoxy-wordmark-v5.png
