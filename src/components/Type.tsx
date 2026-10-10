import React from 'react';
import {colors, fonts} from '../theme';

// Shared editorial type helpers (used from Slide 3 onward).
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const Label: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div
    style={{
      fontFamily: fonts.sans,
      fontSize: 22,
      fontWeight: 600,
      letterSpacing: 5,
      color: colors.textMuted,
      textTransform: 'uppercase',
      ...style,
    }}
  >
    {children}
  </div>
);

// "\n" in a string marks a deliberate line break inside a bubble.
export const lines = (t: string) => <span style={{whiteSpace: 'pre-line'}}>{t}</span>;
