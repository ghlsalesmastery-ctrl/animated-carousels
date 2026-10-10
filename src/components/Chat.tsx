import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts} from '../theme';

export const BUBBLE_FONT = 42;

// ---------------------------------------------------------------------------
// Message bubble. `at` = frame it arrives. Outgoing bubbles "fly up" from the
// compose field; incoming ones grow out of their corner.
// ---------------------------------------------------------------------------
export const Bubble: React.FC<{
  children: React.ReactNode;
  side: 'out' | 'in';
  at: number;
  flyFrom?: number; // px below final position (outgoing send animation)
  maxWidth?: number;
  style?: React.CSSProperties;
}> = ({children, side, at, flyFrom = 160, maxWidth = 740, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - at, fps, config: {damping: 17, stiffness: 170, mass: 0.8}});
  if (frame < at) return null;
  const out = side === 'out';
  const fill = out
    ? `linear-gradient(180deg, #4C88FF 0%, ${colors.accent} 45%, ${colors.accentDeep} 100%)`
    : colors.surface;
  const transform = out
    ? `translateY(${(1 - p) * flyFrom}px) scale(${0.94 + 0.06 * p})`
    : `scale(${0.6 + 0.4 * p})`;
  return (
    <div
      style={{
        alignSelf: out ? 'flex-end' : 'flex-start',
        maxWidth,
        padding: '24px 34px 26px',
        borderRadius: 46,
        [out ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']: 14,
        background: fill,
        color: colors.text,
        fontFamily: fonts.sans,
        fontSize: BUBBLE_FONT,
        lineHeight: 1.28,
        fontWeight: 450,
        letterSpacing: -0.3,
        transform,
        transformOrigin: out ? '100% 100%' : '0% 100%',
        opacity: interpolate(p, [0, 0.25], [0, 1], {extrapolateRight: 'clamp'}),
        boxShadow: out ? '0 14px 40px rgba(40,90,230,0.28)' : '0 10px 30px rgba(0,0,0,0.35)',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Receipt: React.FC<{at: number; label?: string}> = ({at, label = 'Delivered'}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - at, [0, 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        alignSelf: 'flex-end',
        marginTop: -6,
        marginRight: 12,
        fontFamily: fonts.sans,
        fontSize: 22,
        fontWeight: 500,
        color: colors.textMuted,
        opacity: o,
      }}
    >
      {label}
    </div>
  );
};

export const Timestamp: React.FC<{label: string}> = ({label}) => (
  <div
    style={{
      alignSelf: 'center',
      fontFamily: fonts.sans,
      fontSize: 22,
      fontWeight: 500,
      color: colors.textDim,
      letterSpacing: 0.3,
      marginBottom: 6,
    }}
  >
    {label}
  </div>
);

// ---------------------------------------------------------------------------
// Three-dot typing indicator.
// ---------------------------------------------------------------------------
export const TypingIndicator: React.FC<{at: number; until?: number}> = ({at, until = Infinity}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) return null;
  const pIn = spring({frame: frame - at, fps, config: {damping: 14, stiffness: 180}});
  const pOut = frame >= until ? spring({frame: frame - until, fps, config: {damping: 20, stiffness: 220}}) : 0;
  const p = pIn * (1 - pOut);
  const t = (frame - at) / fps;
  return (
    <div
      style={{
        alignSelf: 'flex-start',
        display: 'flex',
        gap: 12,
        padding: '30px 34px',
        borderRadius: 46,
        borderBottomLeftRadius: 14,
        background: colors.surface,
        transform: `scale(${0.5 + 0.5 * p})`,
        transformOrigin: '0% 100%',
        opacity: p,
        boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
      }}
    >
      {[0, 1, 2].map((i) => {
        const wave = Math.max(0, Math.sin((t * 2 * Math.PI) / 1.25 - i * 0.9));
        return (
          <div
            key={i}
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              background: colors.textMuted,
              opacity: 0.45 + 0.55 * wave,
              transform: `translateY(${-7 * wave}px)`,
            }}
          />
        );
      })}
    </div>
  );
};
