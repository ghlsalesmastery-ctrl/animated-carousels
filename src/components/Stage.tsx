import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {colors, fonts, series} from '../theme';

// ---------------------------------------------------------------------------
// Backdrop: deep gradient, soft top glow, vignette and a fine film grain.
// ---------------------------------------------------------------------------
export const Backdrop: React.FC<{glow?: string}> = ({glow = colors.bgGlow}) => (
  <AbsoluteFill style={{background: colors.bg}}>
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 70% at 50% 18%, ${glow} 0%, ${colors.bg} 62%)`,
      }}
    />
    <AbsoluteFill
      style={{
        background: 'radial-gradient(90% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)',
      }}
    />
  </AbsoluteFill>
);

export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.06}) => (
  <AbsoluteFill style={{opacity, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
    <svg width="100%" height="100%">
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  </AbsoluteFill>
);

// ---------------------------------------------------------------------------
// Series masthead shown at the top of every slide.
// ---------------------------------------------------------------------------
export const Masthead: React.FC<{index: number; total: number; title: string; delay?: number}> = ({
  index,
  total,
  title,
  delay = 0,
}) => {
  const f = useCurrentFrame() - delay;
  const o = interpolate(f, [0, 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const y = interpolate(f, [0, 24], [10, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <div
      style={{
        position: 'absolute',
        top: 54,
        left: 64,
        right: 64,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        opacity: o,
        transform: `translateY(${y}px)`,
        fontFamily: fonts.sans,
        color: colors.textMuted,
      }}
    >
      <div style={{fontSize: 22, fontWeight: 600, letterSpacing: 5}}>
        {series.name}
        <span style={{color: colors.textDim, marginLeft: 16, letterSpacing: 2}}>Nº {series.issue}</span>
      </div>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 14}}>
        <span style={{fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 32, color: colors.text, letterSpacing: 0}}>
          {title}
        </span>
        <span style={{fontSize: 22, fontWeight: 500, letterSpacing: 2, color: colors.textDim}}>
          {pad(index)}/{pad(total)}
        </span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Sound effect placed at a frame. Files live in public/sfx (see tools/make_sfx.py)
// ---------------------------------------------------------------------------
export const Sfx: React.FC<{name: string; at: number; volume?: number; frames?: number}> = ({
  name,
  at,
  volume = 1,
  frames = 45,
}) => (
  <Sequence from={Math.round(at)} durationInFrames={frames} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);

export const FadeFromBlack: React.FC<{frames?: number}> = ({frames = 14}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, frames], [1, 0], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: '#000', opacity: o, pointerEvents: 'none'}} />;
};
