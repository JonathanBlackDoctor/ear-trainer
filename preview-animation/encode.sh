#!/usr/bin/env bash
# Encodes the rendered frames into the deliverables:
#   out/preview.webm  (VP9, seamless loop, primary)
#   out/preview.gif   (palette-optimized fallback)
#   out/poster.png    (static first frame)
# Source frames are 2000×1250 (2×); outputs are downscaled to 1000×625.
set -euo pipefail
cd "$(dirname "$0")"

FPS="${1:-30}"
FFMPEG="$(python3 -c 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())')"
mkdir -p out
SCALE="scale=1000:625:flags=lanczos"

echo "→ poster.png"
"$FFMPEG" -y -loglevel error -i frames/frame_0000.png -vf "$SCALE" out/poster.png

echo "→ preview.webm (VP9)"
"$FFMPEG" -y -loglevel error -framerate "$FPS" -i frames/frame_%04d.png \
  -vf "$SCALE" -c:v libvpx-vp9 -pix_fmt yuv420p \
  -b:v 0 -crf 24 -row-mt 1 -an out/preview.webm

echo "→ preview.gif (20fps, palette)"
PAL="$(mktemp -u).png"
"$FFMPEG" -y -loglevel error -framerate "$FPS" -i frames/frame_%04d.png \
  -vf "fps=20,$SCALE,palettegen=max_colors=200:stats_mode=full" "$PAL"
"$FFMPEG" -y -loglevel error -framerate "$FPS" -i frames/frame_%04d.png -i "$PAL" \
  -lavfi "fps=20,$SCALE [x];[x][1:v]paletteuse=dither=sierra2_4a" \
  -loop 0 out/preview.gif
rm -f "$PAL"

echo "✓ outputs:"
ls -la out
