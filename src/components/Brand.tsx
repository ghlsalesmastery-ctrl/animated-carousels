import React from 'react';
import {Easing, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts} from '../theme';
import {Sfx} from './Stage';

// ---------------------------------------------------------------------------
// BUILD BETTER MOUSETRAPS — brand signature (reusable across carousels)
//
// The reveal: three "typing indicator" dots bounce, glide into place and
// become the holes of a geometric cheese wedge whose outline draws around
// them, then fills. The conversation literally becomes the mark.
//
// Usage:  <BrandSignature start={240} />   +   <BrandSounds start={240} />
// `start` is the frame the reveal begins. All timings below are relative.
// ---------------------------------------------------------------------------
export const BRAND = {
  name: 'BUILD BETTER MOUSETRAPS',
  handle: '@buildbettermousetraps',
  tagline: ['Better questions.', 'Better ideas.', 'Better businesses.'],
};

export const BRAND_T = {
  dots: 0, // dots pop in and bounce
  glide: 18, // dots glide to hole positions
  draw: 20, // outline draws
  snap: 42, // outline closes (soft mechanical snap)
  fill: 42, // wedge fills, dots become holes
  name: 54,
  handle: 66,
  tagline: 76,
  taglineGap: 9,
  done: 104,
};

// Geometry (viewBox 200×160): constant-height wedge seen from the front-left.
const T = [16, 92]; // tip, top
const B1 = [148, 30]; // back-left, top
const B2 = [188, 58]; // back-right, top
const H = 58; // wedge height
const TOP_FACE = `M${T[0]} ${T[1]} L${B1[0]} ${B1[1]} L${B2[0]} ${B2[1]} Z`;
const FRONT_FACE = `M${T[0]} ${T[1]} L${B2[0]} ${B2[1]} L${B2[0]} ${B2[1] + H} L${T[0]} ${T[1] + H} Z`;
const OUTLINE = `M${T[0]} ${T[1] + H} L${T[0]} ${T[1]} L${B1[0]} ${B1[1]} L${B2[0]} ${B2[1]} L${B2[0]} ${B2[1] + H} Z M${T[0]} ${T[1]} L${B2[0]} ${B2[1]}`;
// Holes sit on the front face (y follows its sloped top edge)
const topEdgeY = (x: number) => T[1] + ((x - T[0]) * (B2[1] - T[1])) / (B2[0] - T[0]);
const HOLES = [
  {x: 62, r: 10},
  {x: 112, r: 14},
  {x: 160, r: 8},
].map((h, i) => ({...h, y: topEdgeY(h.x) + [32, 27, 30][i]}));

export const CheeseMark: React.FC<{start: number; width?: number}> = ({start, width = 184}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const b = frame - start;
  if (b < 0) return <div style={{width, height: width * 0.8}} />;

  const glide = interpolate(b, [BRAND_T.glide, BRAND_T.glide + 16], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const draw = interpolate(b, [BRAND_T.draw, BRAND_T.snap], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });
  const fill = spring({frame: b - BRAND_T.fill, fps, config: {damping: 200}, durationInFrames: 16});
  const snap = b >= BRAND_T.snap ? Math.sin(Math.min(1, (b - BRAND_T.snap) / 8) * Math.PI) : 0;

  return (
    <svg width={width} height={width * 0.8} viewBox="0 0 200 160" style={{overflow: 'visible', transform: `scale(${1 + 0.035 * snap})`}}>
      <defs>
        <linearGradient id="bbm-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E9C881" />
          <stop offset="1" stopColor="#B48C4A" />
        </linearGradient>
        <linearGradient id="bbm-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F6E2B3" />
          <stop offset="1" stopColor="#E3C27E" />
        </linearGradient>
        <radialGradient id="bbm-glow">
          <stop offset="0" stopColor={colors.gold} stopOpacity="0.35" />
          <stop offset="1" stopColor={colors.gold} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="100" rx="130" ry="90" fill="url(#bbm-glow)" opacity={fill * 0.8} />
      <path d={FRONT_FACE} fill="url(#bbm-front)" opacity={fill} />
      <path d={TOP_FACE} fill="url(#bbm-top)" opacity={fill} />
      <path
        d={OUTLINE}
        fill="none"
        stroke={colors.gold}
        strokeWidth={3}
        strokeLinejoin="round"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - draw}
        opacity={1 - 0.6 * fill}
      />
      {HOLES.map((h, i) => {
        const pop = spring({frame: b - BRAND_T.dots - i * 3, fps, config: {damping: 12, stiffness: 200}});
        // typing-indicator start: in a row, bouncing
        const rowX = 100 + (i - 1) * 30;
        const bounce = Math.max(0, Math.sin((b / fps) * 2 * Math.PI / 0.9 - i * 0.9)) * 8 * (1 - glide);
        const x = rowX + (h.x - rowX) * glide;
        const y = 92 - bounce + (h.y - 92) * glide;
        const r = (7 + (h.r - 7) * glide) * pop;
        const holeColor = interpolateColors(fill, [0, 1], [colors.gold, '#0B0B0E']);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={r} fill={holeColor} />
            {fill > 0.05 ? (
              <path
                d={`M${x - r} ${y} A${r} ${r} 0 0 1 ${x + r} ${y}`}
                fill="none"
                stroke="#8A6A34"
                strokeWidth={2}
                opacity={fill * 0.8}
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
};

export const BrandSignature: React.FC<{start: number; dim?: number}> = ({start, dim = 0}) => {
  const frame = useCurrentFrame();
  const b = frame - start;
  const ease = (a: number, d = 16) =>
    interpolate(b, [a, a + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const name = ease(BRAND_T.name, 22);
  const handle = ease(BRAND_T.handle);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 1 - dim, fontFamily: fonts.sans}}>
      <CheeseMark start={start} />
      <div
        style={{
          marginTop: 22,
          fontSize: 32,
          fontWeight: 600,
          color: colors.text,
          letterSpacing: 4 + 10 * (1 - name), // tracks in
          opacity: name,
          transform: `translateY(${(1 - name) * 10}px)`,
          whiteSpace: 'nowrap',
        }}
      >
        {BRAND.name}
      </div>
      <div style={{marginTop: 10, fontSize: 24, fontWeight: 500, color: colors.gold, letterSpacing: 1, opacity: handle}}>{BRAND.handle}</div>
      <div style={{marginTop: 22, display: 'flex', gap: 12, fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 32, color: colors.textMuted}}>
        {BRAND.tagline.map((line, i) => {
          const p = ease(BRAND_T.tagline + i * BRAND_T.taglineGap, 14);
          return (
            <span key={i} style={{opacity: p, transform: `translateY(${(1 - p) * 8}px)`, display: 'inline-block'}}>
              {line}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// Understated reveal sounds, synced to the mark.
export const BrandSounds: React.FC<{start: number}> = ({start}) => (
  <>
    {[0, 1, 2].map((i) => (
      <Sfx key={i} name="bubble_pop" at={start + BRAND_T.dots + i * 3} volume={0.22} frames={8} />
    ))}
    <Sfx name="whoosh_soft" at={start + BRAND_T.draw - 2} volume={0.16} frames={22} />
    <Sfx name="clamp" at={start + BRAND_T.snap} volume={0.32} frames={10} />
    <Sfx name="shimmer" at={start + BRAND_T.fill} volume={0.32} frames={48} />
    <Sfx name="soft_hit" at={start + BRAND_T.fill} volume={0.3} frames={36} />
  </>
);
