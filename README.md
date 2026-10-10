# The Internet Answers — animated carousels

Programmatic Instagram video carousels (1080×1350, 30 fps, H.264 + AAC) built with
[Remotion](https://www.remotion.dev) (React → video) and FFmpeg.

## Quick start
```bash
npm install
npm run studio            # live preview / scrub timeline in the browser
npm run render            # render all slides  → renders/slide-XX.mp4
npm run render -- Slide1  # render one slide
npm run sfx               # regenerate sound effects (python3 + numpy)
```

## Layout
| Path | What it is |
|---|---|
| `src/theme.ts` | Visual system: colours, fonts, series name, canvas size |
| `src/lib/typing.ts` | Human typing engine (variable speed, hesitation, backspacing) — drives text, caret, keyboard and key sounds |
| `src/components/` | Reusable pieces: `Device` (phone), `Chat` (bubbles, typing dots), `Keyboard` (keyboard + compose bar), `Stage` (backdrop, masthead, grain, `Sfx`) |
| `src/slides/SlideN.tsx` | One file per slide; each is its own composition / MP4 |
| `tools/make_sfx.py` | Synthesises every sound effect from scratch (original, royalty-free) |
| `tools/render.mjs` | Renders slides, then loudness-normalises audio to −16 LUFS for phones |
| `public/fonts` | Inter + Instrument Serif (SIL Open Font License) |
| `renders/` | Finished MP4s |

## Making a new carousel
Copy a slide file, edit the typing script / messages, register it in `src/Root.tsx`, render.

## Editorial note
Conversations are original dramatizations. Ideas are inspired by separate viral posts;
no real people, screenshots, engagement metrics or earnings guarantees are depicted.
