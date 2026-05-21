---
name: video-assets
description: Re-encode Zero docs videos, generate poster images, version filenames for immutable caching, and update MDX references.
---

# Zero Docs Video Assets

Use this skill when adding, replacing, or optimizing videos in `zero-docs`, especially files under `public/video/**` referenced by `<Video />` in MDX or the landing page.

## Goal

Produce browser-friendly, cache-safe video assets with matching poster images and correct docs references.

## Inputs

Infer from the user request:

- Source video paths, usually under `public/video/**`.
- Whether the videos are silent docs animations or narrated release/marketing videos.
- Whether existing assets need a new cache-buster suffix like `-v2`.
- Whether MDX or landing page references should be updated.

If audio preservation is unclear, ask one short question. Default to preserving audio for release-note or narrated videos, and stripping audio for silent docs animations.

## Naming

- Use versioned filenames so immutable caching is safe: `name-v1.mp4`, `name-v1.webp`.
- If replacing an existing versioned asset, increment the suffix: `-v2`, `-v3`, etc.
- Put posters next to videos, e.g. `public/video/tutorial/demo-v1.webp`.
- Update all references to the versioned asset names before deleting old files.

## Inspect First

Before encoding, inspect sizes and metadata:

```sh
du -h public/video/path/to/video.mp4
ffprobe -v error -show_entries format=filename,duration,size,bit_rate:stream=index,codec_type,codec_name,width,height,avg_frame_rate,bit_rate -of json public/video/path/to/video.mp4
```

Search for current references:

```sh
rg '/video/.+\.(mp4|webp|png|jpg|jpeg)' contents components app next.config.mjs
```

## Silent Docs Animation Encode

Use this for inline docs videos that do not need audio:

```sh
ffmpeg -i input.mp4 \
  -map 0:v:0 -an -sn -dn \
  -vf 'fps=30,scale=-2:min(1440\,ih):flags=lanczos' \
  -c:v libx264 -preset slow -crf 28 \
  -pix_fmt yuv420p \
  -g 60 \
  -movflags +faststart \
  -map_metadata -1 \
  output-v1.mp4
```

## Narrated Release Video Encode

Use this for release-note videos or anything with intentional audio:

```sh
ffmpeg -i input.mp4 \
  -map 0:v:0 -map '0:a?' -sn -dn \
  -vf 'fps=30,scale=-2:min(1080\,ih):flags=lanczos' \
  -c:v libx264 -preset slow -crf 28 \
  -pix_fmt yuv420p \
  -g 60 \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  -map_metadata -1 \
  output-v1.mp4
```

## Small Video Remux

Use this for already-small videos that only need versioning/cache busting or a front-loaded moov atom:

```sh
ffmpeg -i input.mp4 \
  -map 0:v:0 -map '0:a?' -sn -dn \
  -c copy \
  -movflags +faststart \
  -map_metadata -1 \
  output-v1.mp4
```

## Poster Generation

Generate posters from the optimized output, not the original source. Default to `0.05s` so the poster matches the first visible frame:

```sh
ffmpeg -ss 0.05 -i output-v1.mp4 \
  -frames:v 1 \
  -vf 'scale=-2:min(1080\,ih):flags=lanczos' \
  -c:v libwebp -quality 82 \
  output-v1.webp
```

If the local ffmpeg build lacks `libwebp`, generate a temporary PNG and convert with `cwebp`:

```sh
ffmpeg -ss 0.05 -i output-v1.mp4 \
  -frames:v 1 \
  -vf 'scale=-2:min(1080\,ih):flags=lanczos' \
  /tmp/output-v1.png

cwebp -q 82 /tmp/output-v1.png -o output-v1.webp
```

## Docs Updates

Update MDX to include both `src` and `poster`:

```mdx
<Video
  src="/video/path/name-v1.mp4"
  alt="Descriptive video text"
  poster="/video/path/name-v1.webp"
  animation
/>
```

Omit `animation` for normal videos that should use native playback controls.

For landing page videos, preserve existing behavior and pass `variant="landing"` if using `components/ui/Video.tsx`.

## Cleanup

After references are updated and verified:

1. Remove unreferenced unversioned source videos from `public/video/**`.
2. Remove replaced poster files.
3. Keep originals only when explicitly requested as source/archive assets.
