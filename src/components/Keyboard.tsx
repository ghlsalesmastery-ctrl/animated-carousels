import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TypingTimeline} from '../lib/typing';
import {colors, fonts} from '../theme';
import {SCREEN} from './Device';

export const KEYBOARD_H = 510;
const PAD_X = 10;
const GAP = 12;
const KEY_H = 98;
const ROW_GAP = 24;
const KEY_W = (SCREEN.w - PAD_X * 2 - GAP * 9) / 10;
const PRESS_FRAMES = 4;

type KeyDef = {id: string; label?: string; x: number; y: number; w: number; alt?: boolean};

const buildLayout = (): KeyDef[] => {
  const keys: KeyDef[] = [];
  const rowY = (r: number) => 22 + r * (KEY_H + ROW_GAP);
  const letters = (row: string, r: number, offsetX: number) =>
    [...row].forEach((c, i) => keys.push({id: c, x: offsetX + i * (KEY_W + GAP), y: rowY(r), w: KEY_W}));
  letters('qwertyuiop', 0, PAD_X);
  letters('asdfghjkl', 1, PAD_X + (KEY_W + GAP) / 2);
  const wide = KEY_W * 1.35;
  keys.push({id: 'SHIFT', x: PAD_X, y: rowY(2), w: wide, alt: true});
  letters('zxcvbnm', 2, PAD_X + (KEY_W + GAP) * 1.5);
  keys.push({id: 'DELETE', x: SCREEN.w - PAD_X - wide, y: rowY(2), w: wide, alt: true});
  const side = KEY_W * 2.3;
  keys.push({id: 'NUM', label: '123', x: PAD_X, y: rowY(3), w: side, alt: true});
  const spaceX = PAD_X + side + GAP;
  const spaceW = SCREEN.w - PAD_X * 2 - side * 2 - KEY_W - GAP * 3;
  keys.push({id: ' ', label: 'space', x: spaceX, y: rowY(3), w: spaceW});
  keys.push({id: '.', x: spaceX + spaceW + GAP, y: rowY(3), w: KEY_W});
  keys.push({id: 'RETURN', label: 'return', x: SCREEN.w - PAD_X - side, y: rowY(3), w: side, alt: true});
  return keys;
};
const LAYOUT = buildLayout();

const ShiftIcon: React.FC<{active: boolean}> = ({active}) => (
  <svg width="40" height="40" viewBox="0 0 40 40">
    <path
      d="M20 6 L35 22 H26 V33 H14 V22 H5 Z"
      fill={active ? '#111' : 'none'}
      stroke={active ? '#111' : colors.text}
      strokeWidth={2.6}
      strokeLinejoin="round"
    />
  </svg>
);
const DeleteIcon: React.FC = () => (
  <svg width="50" height="36" viewBox="0 0 50 36">
    <path d="M15 3 H45 a3 3 0 0 1 3 3 V30 a3 3 0 0 1 -3 3 H15 L2 18 Z" fill="none" stroke={colors.text} strokeWidth={2.6} strokeLinejoin="round" />
    <path d="M23 11 L37 25 M37 11 L23 25" stroke={colors.text} strokeWidth={2.6} strokeLinecap="round" />
  </svg>
);

/**
 * On-screen keyboard driven by a typing timeline: keys light up and pop
 * in sync with each keystroke. `offset` slides it down (0 = shown).
 */
export const Keyboard: React.FC<{typing: TypingTimeline; offset?: number}> = ({typing, offset = 0}) => {
  const frame = useCurrentFrame();
  const text = typing.textAt(frame);
  const autoCaps = text.length === 0;
  const pressed = new Map<string, number>();
  let popKey: string | undefined; // only the most recent key shows its pop-up
  for (const e of typing.events) {
    if (e.frame > frame) break;
    const age = frame - e.frame;
    if (age < PRESS_FRAMES) {
      const isChar = e.key.length === 1;
      const id = isChar ? e.key.toLowerCase() : e.key;
      pressed.set(id, age);
      if (isChar && e.key !== e.key.toLowerCase()) pressed.set('SHIFT', age);
      popKey = id;
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: -offset,
        height: KEYBOARD_H,
        background: colors.keyboardBg,
        borderTop: `1px solid ${colors.hairline}`,
        fontFamily: fonts.sans,
      }}
    >
      {LAYOUT.map((k) => {
        const isPressed = pressed.has(k.id);
        const isShiftOn = k.id === 'SHIFT' && autoCaps;
        const bg = isShiftOn ? colors.text : isPressed ? (k.alt || k.id === ' ' ? '#4A4A55' : '#5A5A66') : k.alt ? colors.keyAlt : colors.key;
        const glyph =
          k.id === 'SHIFT' ? <ShiftIcon active={isShiftOn} /> :
          k.id === 'DELETE' ? <DeleteIcon /> :
          k.label ?? (autoCaps ? k.id.toUpperCase() : k.id);
        const small = !!k.label;
        const showPop = popKey === k.id && !k.alt && k.id !== ' ';
        return (
          <React.Fragment key={k.id}>
            <div
              style={{
                position: 'absolute',
                left: k.x,
                top: k.y,
                width: k.w,
                height: KEY_H,
                borderRadius: 14,
                background: bg,
                boxShadow: '0 2px 0 rgba(0,0,0,0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.text,
                fontSize: small ? 30 : 44,
                fontWeight: small ? 500 : 400,
                lineHeight: 1,
                paddingBottom: small ? 0 : 4,
              }}
            >
              {glyph}
            </div>
            {showPop ? (
              <div
                style={{
                  position: 'absolute',
                  left: k.x - 14,
                  top: k.y - 128,
                  width: k.w + 28,
                  height: 128 + KEY_H,
                  borderRadius: 22,
                  background: '#62626E',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                  display: 'flex',
                  justifyContent: 'center',
                  paddingTop: 22,
                  color: colors.text,
                  fontSize: 68,
                  fontWeight: 400,
                  zIndex: 5,
                }}
              >
                {autoCaps || k.id === '.' ? k.id.toUpperCase() : k.id}
              </div>
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Compose bar: text field + blinking caret + send button.
// ---------------------------------------------------------------------------
export const COMPOSE_FONT = 40;

export const Caret: React.FC<{lastKeyFrame: number; height?: number}> = ({lastKeyFrame, height = 50}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sinceKey = frame - lastKeyFrame;
  // solid while typing, smooth blink when idle (~1.05s cycle)
  const blink = sinceKey < 12 ? 1 : 0.5 + 0.5 * Math.cos(((sinceKey - 12) / fps) * 2 * Math.PI / 1.05);
  const o = sinceKey < 12 ? 1 : interpolate(blink, [0.35, 0.65], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <span
      style={{
        display: 'inline-block',
        width: 4,
        height,
        marginLeft: 3,
        marginBottom: -10,
        borderRadius: 2,
        background: colors.accent,
        opacity: o,
      }}
    />
  );
};

export const ComposeBar: React.FC<{
  text: string;
  lastKeyFrame: number;
  showCaret?: boolean;
  sendPressAt?: number;
  placeholder?: string;
}> = ({text, lastKeyFrame, showCaret = true, sendPressAt = Infinity, placeholder = 'Message'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const hasText = text.length > 0;
  const press =
    frame >= sendPressAt
      ? 1 - 0.16 * Math.sin(Math.min(1, (frame - sendPressAt) / 6) * Math.PI)
      : 1;
  const sendShown = spring({frame: frame - (hasText ? 0 : 1e6), fps, config: {damping: 14}});
  return (
    <div
      style={{
        position: 'relative',
        flexShrink: 0,
        padding: '16px 28px 18px',
        display: 'flex',
        alignItems: 'flex-end',
        gap: 18,
        fontFamily: fonts.sans,
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          flexShrink: 0,
          marginBottom: 6,
          borderRadius: 36,
          background: colors.surfaceHi,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="30" height="30" viewBox="0 0 30 30">
          <path d="M15 4 V26 M4 15 H26" stroke={colors.textMuted} strokeWidth={3.4} strokeLinecap="round" />
        </svg>
      </div>
      <div
        style={{
          flex: 1,
          minHeight: 84,
          borderRadius: 42,
          border: '2px solid rgba(255,255,255,0.10)',
          background: '#111115',
          padding: '14px 100px 16px 32px',
          position: 'relative',
          fontSize: COMPOSE_FONT,
          lineHeight: 1.3,
          letterSpacing: -0.3,
          color: colors.text,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div style={{width: '100%'}}>
          {hasText ? (
            <span style={{whiteSpace: 'pre-wrap'}}>{text}</span>
          ) : null}
          {showCaret ? <Caret lastKeyFrame={lastKeyFrame} /> : null}
          {!hasText ? (
            <span style={{color: colors.textDim, marginLeft: 4}}>{placeholder}</span>
          ) : null}
        </div>
        <div
          style={{
            position: 'absolute',
            right: 10,
            bottom: 8,
            width: 64,
            height: 64,
            borderRadius: 32,
            background: colors.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${sendShown * press})`,
            boxShadow: '0 6px 20px rgba(61,123,255,0.35)',
          }}
        >
          <svg width="30" height="34" viewBox="0 0 30 34">
            <path d="M15 31 V5 M4 15 L15 4 L26 15" fill="none" stroke="#fff" strokeWidth={4.2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};
