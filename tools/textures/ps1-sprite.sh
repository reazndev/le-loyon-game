#!/usr/bin/env bash
# Turn a generated cutout on a flat background into a PS1-style sprite with 1-bit alpha.
# Usage: ps1-sprite.sh <in> <out.png> [width=128] [colors=32] [background=white] [mode=flood|global]
# flood clears the background connected to the corners; global clears every pixel close to the
# background color, which suits see-through shapes like fences.
set -euo pipefail
in=$1 out=$2 width=${3:-128} colors=${4:-32} bg=${5:-white} mode=${6:-flood}
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT

magick "$in" -resize "$((width*2))x" "$tmp/base.png"
if [ "$mode" = flood ]; then
  magick "$tmp/base.png" -alpha set -fuzz 12% -fill none \
    -draw "color 0,0 floodfill" -draw "color %[fx:w-1],0 floodfill" \
    -draw "color 0,%[fx:h-1] floodfill" -draw "color %[fx:w-1],%[fx:h-1] floodfill" "$tmp/cut.png"
else
  magick "$tmp/base.png" -alpha set -fuzz 18% -transparent "$bg" "$tmp/cut.png"
fi
# PS1 sprites had on/off transparency, so threshold the alpha after shrinking.
magick "$tmp/cut.png" -modulate 92,80,100 -filter box -resize "${width}x" \
  -channel A -threshold 50% +channel -colors "$colors" "$out"
