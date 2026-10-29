#!/usr/bin/env bash
# Turn a generated image into a PS1-style texture.
# Usage: ps1-texture.sh <in> <out.png> [size=128] [colors=32] [tile=yes|no]
# A PS1 texture page held 4- or 8-bit indexed images, so we shrink, cut the palette, and dither.
set -euo pipefail
in=$1 out=$2 size=${3:-128} colors=${4:-32} tile=${5:-yes}
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT

if [ "$tile" = yes ]; then
  # Tiling textures are square: crop from the center, then work at 2x the target size.
  magick "$in" -gravity center -crop "%[fx:min(w,h)]x%[fx:min(w,h)]+0+0" +repage \
    -resize "$((size*2))x$((size*2))!" "$tmp/base.png"
  geometry="${size}x${size}!"
else
  # Single objects such as doors keep their aspect ratio; size is the width.
  magick "$in" -resize "$((size*2))x" "$tmp/base.png"
  geometry="${size}x"
fi

if [ "$tile" = yes ]; then
  # Make it seamless in two passes. Each pass blends the image with a copy rolled by half
  # its size along one axis, taking the rolled copy near the edges (where it wraps cleanly)
  # and the original near the middle (where the rolled copy has its seam).
  s=$((size*2)); h=$((s/2))
  magick -size "${s}x${s}" xc: -fx "1-abs(i/w*2-1)" -level 15%,55% "$tmp/mask_x.png"
  magick "$tmp/mask_x.png" -rotate 90 "$tmp/mask_y.png"
  magick "$tmp/base.png" -roll "+${h}+0" "$tmp/rolled.png"
  magick "$tmp/rolled.png" "$tmp/base.png" "$tmp/mask_x.png" -composite "$tmp/base.png"
  magick "$tmp/base.png" -roll "+0+${h}" "$tmp/rolled.png"
  magick "$tmp/rolled.png" "$tmp/base.png" "$tmp/mask_y.png" -composite "$tmp/base.png"
fi

# Slightly muted and darker, the way PS1 textures read through vertex lighting.
magick "$tmp/base.png" -modulate 92,80,100 -filter box -resize "$geometry" \
  -ordered-dither o4x4,32 -colors "$colors" +dither -define png:color-type=3 "$out" 2>/dev/null \
  || magick "$tmp/base.png" -modulate 92,80,100 -filter box -resize "$geometry" -colors "$colors" "$out"
