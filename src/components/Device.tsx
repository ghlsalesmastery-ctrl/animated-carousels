import React from 'react';
import {colors, fonts, HEIGHT, series} from '../theme';

// Phone geometry (canvas pixels). The device runs off the bottom of the frame,
// which keeps the type large while still reading as "a phone in your hand".
export const DEVICE = {x: 40, y: 150, w: 1000, bezel: 14, radius: 92};
export const SCREEN = {
  w: DEVICE.w - DEVICE.bezel * 2,
  h: HEIGHT - DEVICE.y - DEVICE.bezel, // visible screen height
  radius: DEVICE.radius - DEVICE.bezel,
};
export const STATUS_H = 74;
export const HEADER_H = 132;
export const CHAT_TOP = STATUS_H + HEADER_H;

const StatusBar: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: STATUS_H,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 64px 0 78px',
      fontFamily: fonts.sans,
      color: colors.text,
    }}
  >
    <span style={{fontSize: 30, fontWeight: 600, letterSpacing: -0.3}}>9:41</span>
    {/* island */}
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: 18,
        width: 236,
        height: 66,
        marginLeft: -118,
        borderRadius: 40,
        background: '#000',
      }}
    />
    <svg width="150" height="30" viewBox="0 0 150 30">
      {/* signal */}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={i * 11} y={20 - i * 5} width={7} height={8 + i * 5} rx={2} fill={colors.text} />
      ))}
      {/* wifi */}
      <g transform="translate(62,3)" fill="none" stroke={colors.text} strokeWidth={3.4} strokeLinecap="round">
        <path d="M2 9 Q14 -1 26 9" />
        <path d="M7 14.5 Q14 8.5 21 14.5" />
        <circle cx="14" cy="21" r="2.6" fill={colors.text} stroke="none" />
      </g>
      {/* battery */}
      <rect x="100" y="5" width="42" height="21" rx="6" fill="none" stroke={colors.textMuted} strokeWidth={2} />
      <rect x="103.5" y="8.5" width="30" height="14" rx="3" fill={colors.text} />
      <rect x="144" y="12" width="3" height="7" rx="1.5" fill={colors.textMuted} />
    </svg>
  </div>
);

export const ChatHeader: React.FC<{name?: string; note?: string}> = ({
  name = series.contactName,
  note = series.contactNote,
}) => (
  <div
    style={{
      position: 'absolute',
      top: STATUS_H,
      left: 0,
      right: 0,
      height: HEADER_H,
      display: 'flex',
      alignItems: 'center',
      gap: 22,
      padding: '0 40px',
      borderBottom: `1px solid ${colors.hairline}`,
      fontFamily: fonts.sans,
    }}
  >
    <svg width="22" height="38" viewBox="0 0 22 38">
      <path d="M18 3 L4 19 L18 35" fill="none" stroke={colors.accent} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div
      style={{
        width: 80,
        height: 80,
        borderRadius: 40,
        background: 'linear-gradient(145deg, #3A3B46 0%, #1B1C22 100%)',
        border: `1px solid rgba(255,255,255,0.08)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: fonts.serif,
        fontStyle: 'italic',
        fontSize: 48,
        color: colors.text,
        lineHeight: 1,
        paddingBottom: 4,
      }}
    >
      ?
    </div>
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <span style={{fontSize: 34, fontWeight: 600, color: colors.text, letterSpacing: -0.4}}>{name}</span>
      <span style={{fontSize: 22, fontWeight: 500, color: colors.textMuted, letterSpacing: 0.2}}>{note}</span>
    </div>
  </div>
);

// Phone body + screen. Children are positioned in screen coordinates.
export const Device: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div
    style={{
      position: 'absolute',
      left: DEVICE.x,
      top: DEVICE.y,
      width: DEVICE.w,
      height: HEIGHT, // runs past the bottom edge
      borderRadius: DEVICE.radius,
      background: `linear-gradient(160deg, #24242B 0%, ${colors.device} 40%, #0A0A0D 100%)`,
      boxShadow: `0 0 0 2px ${colors.deviceEdge}, 0 60px 120px rgba(0,0,0,0.7), 0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)`,
      ...style,
    }}
  >
    <div
      style={{
        position: 'absolute',
        left: DEVICE.bezel,
        top: DEVICE.bezel,
        width: SCREEN.w,
        height: SCREEN.h,
        borderRadius: `${SCREEN.radius}px ${SCREEN.radius}px 0 0`,
        background: colors.screen,
        overflow: 'hidden',
      }}
    >
      <StatusBar />
      {children}
      {/* faint glass reflection */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(125deg, rgba(255,255,255,0.035) 0%, transparent 35%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  </div>
);
