import React from 'react';
import {Easing, interpolate, spring, useVideoConfig} from 'remotion';
import {buildTyping} from '../lib/typing';
import {clamp} from '../components/Type';
import {colors, fonts, FPS} from '../theme';

// Illustrated vignettes for Slide 3. Each draws in an 800×540 box and is driven
// by a local frame `t` (0 = scene start). Timing constants are exported so the
// slide can place sounds exactly on the visual beats.

export const BOX = {w: 800, h: 540};
const WATER = '#78AEFF';

// ===========================================================================
// SCENE 1 — THE LEAK
// ===========================================================================
export const LEAK = {
  crack: 5,
  fix: 44,
  reveal: 48,
  // drips spawn faster and faster until the fix
  drips: [10, 17, 23, 28, 32, 36, 40],
  fallFrames: 11,
};
const FLOOR_Y = 470;
const CRACK = {x: 300, y: 178};

export const LeakScene: React.FC<{t: number}> = ({t}) => {
  const {fps} = useVideoConfig();
  const fixP = spring({frame: t - LEAK.fix, fps, config: {damping: 12, stiffness: 220}});
  const fixed = t >= LEAK.fix;
  const crackP = interpolate(t, [LEAK.crack, LEAK.crack + 4], [0, 1], clamp) * (1 - fixP);
  const shake = t >= LEAK.crack && t < LEAK.crack + 8 ? Math.sin(t * 3.1) * 3 * (1 - (t - LEAK.crack) / 8) : 0;
  const landed = LEAK.drips.filter((d) => t >= d + LEAK.fallFrames).length;
  const puddleRx = interpolate(landed, [0, LEAK.drips.length], [0, 170]) * (1 - interpolate(t, [LEAK.fix + 6, LEAK.fix + 30], [0, 1], clamp));
  const glow = interpolate(t - LEAK.fix, [0, 6, 30], [0, 1, 0.35], clamp);

  return (
    <svg width={BOX.w} height={BOX.h} viewBox={`0 0 ${BOX.w} ${BOX.h}`} style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id="pipe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4A4A55" />
          <stop offset="0.45" stopColor="#2E2E36" />
          <stop offset="1" stopColor="#1C1C22" />
        </linearGradient>
        <radialGradient id="fixglow">
          <stop offset="0" stopColor={colors.gold} stopOpacity="0.55" />
          <stop offset="1" stopColor={colors.gold} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* floor line */}
      <line x1={60} x2={740} y1={FLOOR_Y + 8} y2={FLOOR_Y + 8} stroke="rgba(255,255,255,0.06)" strokeWidth={2} />
      {/* puddle */}
      <ellipse cx={CRACK.x} cy={FLOOR_Y + 8} rx={puddleRx} ry={puddleRx * 0.12} fill={WATER} opacity={0.22} />

      <g transform={`translate(${shake},0)`}>
        {/* pipe run: horizontal into an elbow going down */}
        <path d="M0 150 H560 Q640 150 640 230 V470" fill="none" stroke="url(#pipe)" strokeWidth={46} />
        <path d="M0 136 H560 Q654 136 654 230 V470" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={6} />
        {/* couplings */}
        {[120, 300, 480].map((x) => (
          <rect key={x} x={x - 22} y={118} width={44} height={64} rx={8} fill="#3B3B45" stroke="#55555F" strokeWidth={2} />
        ))}
        <rect x={608} y={380} width={64} height={44} rx={8} fill="#3B3B45" stroke="#55555F" strokeWidth={2} />

        {/* crack */}
        <path
          d="M286 180 L294 172 L300 181 L307 171 L314 180"
          fill="none"
          stroke={colors.warn}
          strokeWidth={3.5}
          strokeLinejoin="round"
          opacity={crackP}
        />
        <circle cx={CRACK.x} cy={CRACK.y} r={26} fill={colors.warn} opacity={0.18 * crackP} />

        {/* repair clamp snaps on */}
        {fixed ? (
          <g transform={`translate(${CRACK.x} 150) scale(${1.5 - 0.5 * fixP})`} opacity={Math.min(1, fixP * 1.5)}>
            <circle r={90} fill="url(#fixglow)" opacity={glow} />
            <rect x={-38} y={-42} width={76} height={84} rx={12} fill="#2A2618" stroke={colors.gold} strokeWidth={4} />
            <line x1={-38} x2={38} y1={-14} y2={-14} stroke={colors.gold} strokeWidth={2} opacity={0.6} />
            <line x1={-38} x2={38} y1={14} y2={14} stroke={colors.gold} strokeWidth={2} opacity={0.6} />
            <circle cx={-26} cy={-42} r={6} fill={colors.gold} />
            <circle cx={26} cy={-42} r={6} fill={colors.gold} />
          </g>
        ) : null}
      </g>

      {/* drips + splashes */}
      {LEAK.drips.map((d, i) => {
        const age = t - d;
        if (age < 0) return null;
        const fallT = Math.min(age, LEAK.fallFrames) / LEAK.fallFrames;
        const y = CRACK.y + 8 + (FLOOR_Y - CRACK.y - 8) * fallT * fallT;
        const x = CRACK.x + (i % 3 - 1) * 4;
        const splashAge = age - LEAK.fallFrames;
        return (
          <g key={i}>
            {splashAge < 0 ? (
              <path
                d={`M${x} ${y - 16} C${x + 9} ${y - 3} ${x + 9} ${y + 6} ${x} ${y + 6} C${x - 9} ${y + 6} ${x - 9} ${y - 3} ${x} ${y - 16} Z`}
                fill={WATER}
                transform={`scale(1 ${1 + fallT * 0.4})`}
                style={{transformOrigin: `${x}px ${y}px`}}
              />
            ) : splashAge < 14 ? (
              <ellipse
                cx={x}
                cy={FLOOR_Y + 8}
                rx={8 + splashAge * 5}
                ry={(8 + splashAge * 5) * 0.16}
                fill="none"
                stroke={WATER}
                strokeWidth={2.5}
                opacity={1 - splashAge / 14}
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
};

// ===========================================================================
// SCENE 2 — THE MISSED CALL
// ===========================================================================
export const CALL = {rings: [2, 18], end: 34, missed: 36, auto: 46, reveal: 54};

const PersonGlyph: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx="20" cy="15" r="7" fill={color} />
    <path d="M7 35 C8 26 14 23 20 23 C26 23 32 26 33 35 Z" fill={color} />
  </svg>
);
const PhoneGlyph: React.FC<{size: number; color: string; rotate?: number}> = ({size, color, rotate = 0}) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{transform: `rotate(${rotate}deg)`}}>
    <path
      d="M12 6 L17 6 L19 14 L15 17 C17 22 19 24 24 26 L27 22 L35 24 L35 29 C35 32 33 34 30 34 C18 33 7 22 6 10 C6 8 8 6 12 6 Z"
      fill={color}
    />
  </svg>
);

export const MissedCallScene: React.FC<{t: number}> = ({t}) => {
  const {fps} = useVideoConfig();
  const ringing = t < CALL.end;
  const buzz = ringing && (t - CALL.rings[0]) % 18 < 10 && t >= CALL.rings[0] ? Math.sin(t * 2.7) * 5 : 0;
  const callOut = spring({frame: t - CALL.end, fps, config: {damping: 200}, durationInFrames: 10});
  const banner = spring({frame: t - CALL.missed, fps, config: {damping: 15, stiffness: 160}});
  const auto = spring({frame: t - CALL.auto, fps, config: {damping: 15, stiffness: 160}});
  const revealGlow = interpolate(t, [CALL.reveal, CALL.reveal + 10], [0, 1], clamp);

  const W = 330;
  const H = 540;
  return (
    <div style={{width: BOX.w, height: BOX.h, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          width: W,
          height: H,
          borderRadius: 56,
          padding: 10,
          background: 'linear-gradient(160deg,#2A2A32,#121216)',
          boxShadow: `0 0 0 2px ${colors.deviceEdge}, 0 30px 70px rgba(0,0,0,0.6), 0 0 ${60 * revealGlow}px rgba(230,194,122,${0.25 * revealGlow})`,
          transform: `translateX(${buzz}px) rotate(${buzz * 0.25}deg)`,
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 46,
            background: '#0A0A0D',
            overflow: 'hidden',
            position: 'relative',
            fontFamily: fonts.sans,
            color: colors.text,
          }}
        >
          <div style={{position: 'absolute', top: 12, left: '50%', width: 96, height: 28, marginLeft: -48, borderRadius: 16, background: '#000'}} />

          {/* incoming call */}
          <div style={{position: 'absolute', inset: 0, opacity: 1 - callOut, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 70}}>
            <div style={{fontSize: 20, color: colors.textMuted, fontWeight: 500}}>Incoming call</div>
            <div style={{position: 'relative', marginTop: 34, width: 120, height: 120}}>
              {[0, 1].map((k) => {
                const ph = ((t + k * 12) % 24) / 24;
                return (
                  <div
                    key={k}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 60,
                      border: `2px solid ${colors.good}`,
                      transform: `scale(${1 + ph * 0.7})`,
                      opacity: ringing ? (1 - ph) * 0.6 : 0,
                    }}
                  />
                );
              })}
              <div style={{position: 'absolute', inset: 0, borderRadius: 60, background: colors.surfaceHi, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <PersonGlyph size={74} color={colors.textMuted} />
              </div>
            </div>
            <div style={{fontSize: 32, fontWeight: 600, marginTop: 26, letterSpacing: -0.4}}>New customer</div>
            <div style={{fontSize: 20, color: colors.textMuted, marginTop: 6}}>mobile</div>
            <div style={{position: 'absolute', bottom: 54, left: 0, right: 0, display: 'flex', justifyContent: 'space-around'}}>
              <div style={{width: 76, height: 76, borderRadius: 38, background: '#E5534B', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <PhoneGlyph size={40} color="#fff" rotate={135} />
              </div>
              <div style={{width: 76, height: 76, borderRadius: 38, background: '#34C759', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <PhoneGlyph size={40} color="#fff" />
              </div>
            </div>
          </div>

          {/* lock screen after the call */}
          <div style={{position: 'absolute', inset: 0, opacity: callOut, padding: '70px 16px 0'}}>
            <div style={{textAlign: 'center', fontSize: 84, fontWeight: 600, letterSpacing: -3, color: 'rgba(255,255,255,0.9)'}}>9:42</div>
            <div
              style={{
                marginTop: 34,
                borderRadius: 26,
                background: 'rgba(40,40,48,0.95)',
                padding: '16px 18px',
                display: 'flex',
                gap: 14,
                alignItems: 'center',
                opacity: banner,
                transform: `translateY(${(1 - banner) * -30}px) scale(${0.92 + 0.08 * banner})`,
              }}
            >
              <div style={{width: 48, height: 48, borderRadius: 14, background: '#E5534B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                <PhoneGlyph size={28} color="#fff" rotate={135} />
              </div>
              <div>
                <div style={{fontSize: 22, fontWeight: 700}}>Missed call</div>
                <div style={{fontSize: 19, color: colors.textMuted, marginTop: 2}}>New customer</div>
              </div>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: 22, opacity: auto, transform: `translateY(${(1 - auto) * 40}px)`}}>
              <div
                style={{
                  maxWidth: 250,
                  padding: '14px 18px',
                  borderRadius: 24,
                  borderBottomRightRadius: 8,
                  background: `linear-gradient(180deg,#4C88FF,${colors.accentDeep})`,
                  fontSize: 21,
                  lineHeight: 1.3,
                }}
              >
                Sorry we missed your call! How can we help?
              </div>
              <div style={{fontSize: 16, fontWeight: 600, letterSpacing: 1.5, color: colors.gold, marginTop: 10, textTransform: 'uppercase'}}>
                Auto-reply · instant
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===========================================================================
// SCENE 3 — THE INVISIBLE BUSINESS
// ===========================================================================
export const MAP = {typeStart: 4, sweep: 30, found: 34, reveal: 48};
export const MAP_QUERY = 'plumber near me';
// Typing is built in absolute scene frames; the slide offsets sounds by scene start.
export const mapTyping = buildTyping([{type: MAP_QUERY, speed: 0.055}], {fps: FPS, startFrame: MAP.typeStart, seed: 5});

const PIN = {x: 520, y: 330};
const OTHER_PINS = [
  [170, 250], [300, 410], [640, 200], [700, 420], [420, 190], [240, 470], [600, 480], [110, 380],
];

const Pin: React.FC<{x: number; y: number; scale: number; color: string; opacity: number}> = ({x, y, scale, color, opacity}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
    <ellipse cx={0} cy={2} rx={9} ry={3} fill="rgba(0,0,0,0.5)" />
    <path d="M0 0 C-4 -9 -16 -16 -16 -30 A16 16 0 0 1 16 -30 C16 -16 4 -9 0 0 Z" fill={color} />
    <circle cx={0} cy={-30} r={6} fill="#0B0B0E" />
  </g>
);

export const MapScene: React.FC<{t: number}> = ({t}) => {
  const {fps} = useVideoConfig();
  const query = mapTyping.textAt(t);
  const found = spring({frame: t - MAP.found, fps, config: {damping: 11, stiffness: 150}});
  const sweep = interpolate(t, [MAP.sweep, MAP.sweep + 18], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const zoom = 1 + 0.12 * spring({frame: t - MAP.found, fps, config: {damping: 200}, durationInFrames: 40});
  const card = spring({frame: t - (MAP.found + 8), fps, config: {damping: 15, stiffness: 160}});
  const dimOthers = 1 - 0.55 * found;
  const caretOn = t < MAP.sweep && Math.floor(t / 8) % 2 === 0;

  return (
    <div
      style={{
        width: BOX.w,
        height: BOX.h,
        borderRadius: 40,
        overflow: 'hidden',
        position: 'relative',
        background: '#0E0F13',
        boxShadow: `0 0 0 2px ${colors.hairline}, 0 30px 70px rgba(0,0,0,0.55)`,
      }}
    >
      <svg width={BOX.w} height={BOX.h} viewBox={`0 0 ${BOX.w} ${BOX.h}`} style={{transform: `scale(${zoom})`, transformOrigin: `${PIN.x}px ${PIN.y}px`}}>
        {/* park + water */}
        <path d="M40 60 L230 40 L260 170 L80 200 Z" fill="#11191A" />
        <path d="M560 560 C600 470 700 450 820 470 L820 560 Z" fill="#0F1620" />
        {/* streets */}
        <g stroke="#1C1D24" strokeLinecap="round" fill="none">
          <path d="M-20 300 C200 280 420 320 820 260" strokeWidth={22} />
          <path d="M380 -20 C360 200 420 380 400 560" strokeWidth={22} />
          <path d="M-20 120 L820 150" strokeWidth={10} />
          <path d="M-20 440 L820 400" strokeWidth={10} />
          <path d="M170 -20 L240 560" strokeWidth={10} />
          <path d="M600 -20 L660 560" strokeWidth={10} />
          <path d="M480 160 L760 330" strokeWidth={6} />
          <path d="M60 220 L330 520" strokeWidth={6} />
        </g>
        {/* search sweep */}
        <circle cx={PIN.x} cy={PIN.y} r={40 + sweep * 520} fill="none" stroke={colors.gold} strokeWidth={3} opacity={(1 - sweep) * 0.7} />
        {OTHER_PINS.map(([x, y], i) => (
          <Pin key={i} x={x} y={y} scale={0.9} color="#4A4B57" opacity={dimOthers} />
        ))}
        {/* visibility rings */}
        {[0, 1, 2].map((k) => {
          const ph = (((t - MAP.found) + k * 10) % 30) / 30;
          return t >= MAP.found ? (
            <circle key={k} cx={PIN.x} cy={PIN.y - 4} r={20 + ph * 110} fill="none" stroke={colors.gold} strokeWidth={2} opacity={(1 - ph) * 0.5 * found} />
          ) : null;
        })}
        <Pin
          x={PIN.x}
          y={PIN.y}
          scale={0.7 + 0.9 * found}
          color={found > 0.05 ? colors.gold : '#3A3B45'}
          opacity={0.55 + 0.45 * Math.min(1, found)}
        />
      </svg>

      {/* business card pops over the pin */}
      <div
        style={{
          position: 'absolute',
          left: PIN.x - 150,
          top: PIN.y - 236,
          width: 300,
          padding: '14px 18px',
          borderRadius: 20,
          background: 'rgba(28,28,33,0.96)',
          border: `1px solid rgba(230,194,122,0.35)`,
          fontFamily: fonts.sans,
          opacity: card,
          transform: `translateY(${(1 - card) * 16}px) scale(${0.9 + 0.1 * card})`,
          boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{fontSize: 24, fontWeight: 700, color: colors.text}}>Your business</div>
        <div style={{fontSize: 18, color: colors.good, marginTop: 4, fontWeight: 500}}>
          Open now <span style={{color: colors.textMuted}}>· Emergency repairs</span>
        </div>
      </div>

      {/* search bar */}
      <div
        style={{
          position: 'absolute',
          top: 22,
          left: 22,
          right: 22,
          height: 70,
          borderRadius: 35,
          background: 'rgba(30,30,36,0.96)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '0 26px',
          fontFamily: fonts.sans,
          fontSize: 28,
          color: colors.text,
          boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
        }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28">
          <circle cx="12" cy="12" r="8.5" fill="none" stroke={colors.textMuted} strokeWidth={3} />
          <path d="M18.5 18.5 L25 25" stroke={colors.textMuted} strokeWidth={3} strokeLinecap="round" />
        </svg>
        <span>
          {query || <span style={{color: colors.textDim}}>Search the map</span>}
          <span style={{display: 'inline-block', width: 3, height: 32, marginLeft: 2, marginBottom: -6, background: colors.accent, opacity: caretOn ? 1 : 0}} />
        </span>
      </div>
    </div>
  );
};

// Small glyphs for the insight recap
export const DropIcon: React.FC<{color: string}> = ({color}) => (
  <svg width="56" height="56" viewBox="0 0 40 40">
    <path d="M20 4 C26 13 31 19 31 25 A11 11 0 0 1 9 25 C9 19 14 13 20 4 Z" fill={color} />
  </svg>
);
export const CallIcon: React.FC<{color: string}> = ({color}) => <PhoneGlyph size={56} color={color} />;
export const PinIcon: React.FC<{color: string}> = ({color}) => (
  <svg width="56" height="56" viewBox="-20 -42 40 46">
    <path d="M0 0 C-4 -9 -16 -16 -16 -30 A16 16 0 0 1 16 -30 C16 -16 4 -9 0 0 Z" fill={color} />
    <circle cx={0} cy={-30} r={6} fill="#0B0B0E" />
  </svg>
);
