import React from 'react';
import {Easing, interpolate, spring, useVideoConfig} from 'remotion';
import {clamp} from '../components/Type';
import {colors, fonts} from '../theme';

// Fast-paced reality-check panels for Slide 4. Each draws in a 900×660 box
// driven by a local frame `t`. Beat constants are exported for sound sync.
export const PANEL = {w: 900, h: 660};
const card: React.CSSProperties = {
  borderRadius: 36,
  background: 'linear-gradient(180deg, #15151B 0%, #0F0F13 100%)',
  boxShadow: `0 0 0 2px ${colors.hairline}, 0 30px 80px rgba(0,0,0,0.55)`,
  fontFamily: fonts.sans,
  color: colors.text,
  position: 'relative',
  overflow: 'hidden',
};
const hash = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const Check: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M5 12.5 L10 17 L19 7" fill="none" stroke={color} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Cross: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M6 6 L18 18 M18 6 L6 18" fill="none" stroke={color} strokeWidth={3.2} strokeLinecap="round" />
  </svg>
);

// ===========================================================================
// 1 — AD SPEND: a campaign launches and the spend counter climbs
// ===========================================================================
export const ADS = {launch: 8, countStart: 12, countEnd: 56, spend: 4820};
export const AdDashboard: React.FC<{t: number}> = ({t}) => {
  const {fps} = useVideoConfig();
  const live = t >= ADS.launch;
  const press = t >= ADS.launch && t < ADS.launch + 6 ? 1 - 0.08 * Math.sin(((t - ADS.launch) / 6) * Math.PI) : 1;
  const p = interpolate(t, [ADS.countStart, ADS.countEnd], [0, 1], {...clamp, easing: Easing.bezier(0.3, 0, 0.3, 1)});
  const pillIn = spring({frame: t - ADS.launch, fps, config: {damping: 14}});
  // cumulative spend curve
  const N = 40;
  const pts = Array.from({length: N + 1}, (_, i) => {
    const x = i / N;
    const y = Math.pow(x, 1.25) + Math.sin(x * 14) * 0.02;
    return [40 + x * 740, 210 - y * 180] as const;
  });
  const shown = Math.max(1, Math.round(p * N));
  const path = pts.slice(0, shown + 1).map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
  const head = pts[shown];
  return (
    <div style={{...card, width: PANEL.w, height: PANEL.h, padding: '40px 44px'}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div>
          <div style={{fontSize: 22, color: colors.textMuted, fontWeight: 600, letterSpacing: 3}}>CAMPAIGN</div>
          <div style={{fontSize: 36, fontWeight: 700, marginTop: 6, letterSpacing: -0.5}}>New product launch</div>
        </div>
        {live ? (
          <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px', borderRadius: 30, background: 'rgba(127,214,164,0.12)', color: colors.good, fontSize: 24, fontWeight: 700, transform: `scale(${pillIn})`}}>
            <div style={{width: 14, height: 14, borderRadius: 7, background: colors.good, opacity: 0.5 + 0.5 * Math.cos(t / 4)}} />
            LIVE
          </div>
        ) : (
          <div style={{padding: '16px 34px', borderRadius: 30, background: colors.accent, fontSize: 26, fontWeight: 700, transform: `scale(${press})`, boxShadow: '0 8px 24px rgba(61,123,255,0.4)'}}>Launch</div>
        )}
      </div>
      <div style={{marginTop: 44, fontSize: 22, color: colors.textMuted, fontWeight: 600, letterSpacing: 3}}>SPEND</div>
      <div style={{fontSize: 132, fontWeight: 700, letterSpacing: -5, lineHeight: 1.05, fontVariantNumeric: 'tabular-nums', color: p > 0 ? colors.warn : colors.text}}>
        ${Math.round(ADS.spend * p).toLocaleString('en-US')}
      </div>
      <svg width={820} height={230} style={{position: 'absolute', left: 40, bottom: 34}}>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={40} x2={780} y1={30 + i * 60} y2={30 + i * 60} stroke="rgba(255,255,255,0.05)" strokeWidth={2} />
        ))}
        <path d={`${path} L${head[0]} 210 L40 210 Z`} fill="rgba(240,138,108,0.12)" />
        <path d={path} fill="none" stroke={colors.warn} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
        {p > 0 ? <circle cx={head[0]} cy={head[1]} r={9} fill={colors.warn} /> : null}
      </svg>
    </div>
  );
};

// ===========================================================================
// 2 — CREATIVE TESTING: cards deal in, most fail, winners advance, repeat
// ===========================================================================
export const CREATIVE = {deal: 2, dealGap: 2, verdict: 24, verdictGap: 3, repeat: 44};
const PASSES = [1, 4];
const HUES = ['#5B6CFF', '#E27D60', '#41B3A3', '#C38D9E', '#E8A87C', '#8D8DAA'];
const SHAPES = ['circle', 'rect', 'tri', 'rect', 'circle', 'tri'];
const CreativeCard: React.FC<{i: number; hue: string; shape: string; label: string}> = ({hue, shape, label}) => (
  <div style={{width: '100%', height: '100%', borderRadius: 24, background: '#16161C', border: '1px solid rgba(255,255,255,0.08)', padding: 14, display: 'flex', flexDirection: 'column', gap: 12}}>
    <div style={{flex: 1, borderRadius: 14, background: `linear-gradient(145deg, ${hue} 0%, #1A1A22 120%)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <svg width="90" height="90" viewBox="0 0 90 90">
        {shape === 'circle' ? <circle cx="45" cy="45" r="30" fill="rgba(255,255,255,0.85)" /> : null}
        {shape === 'rect' ? <rect x="18" y="22" width="54" height="46" rx="10" fill="rgba(255,255,255,0.85)" /> : null}
        {shape === 'tri' ? <path d="M45 15 L76 70 L14 70 Z" fill="rgba(255,255,255,0.85)" /> : null}
      </svg>
    </div>
    <div style={{height: 12, width: '80%', borderRadius: 6, background: 'rgba(255,255,255,0.18)'}} />
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <div style={{height: 12, width: '45%', borderRadius: 6, background: 'rgba(255,255,255,0.1)'}} />
      <div style={{fontSize: 18, fontWeight: 700, color: colors.textMuted, letterSpacing: 1}}>{label}</div>
    </div>
  </div>
);
export const CreativeTesting: React.FC<{t: number}> = ({t}) => {
  const {fps} = useVideoConfig();
  const CW = 260;
  const CH = 300;
  const G = 30;
  const x0 = (PANEL.w - (CW * 3 + G * 2)) / 2;
  return (
    <div style={{width: PANEL.w, height: PANEL.h, position: 'relative'}}>
      {HUES.map((hue, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const deal = spring({frame: t - (CREATIVE.deal + i * CREATIVE.dealGap), fps, config: {damping: 15, stiffness: 200}});
        const vAt = CREATIVE.verdict + i * CREATIVE.verdictGap;
        const v = spring({frame: t - vAt, fps, config: {damping: 13, stiffness: 220}});
        const pass = PASSES.includes(i);
        // failed cards flip over into fresh variants ("repeat")
        const flip = pass ? 0 : interpolate(t, [CREATIVE.repeat + col * 2, CREATIVE.repeat + col * 2 + 10], [0, 1], clamp);
        const fresh = flip > 0.5;
        const failDim = !pass && !fresh ? v : 0;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x0 + col * (CW + G),
              top: 15 + row * (CH + G),
              width: CW,
              height: CH,
              opacity: deal * (1 - 0.7 * failDim),
              filter: failDim > 0.01 ? `grayscale(${failDim})` : undefined,
              transform: `translateY(${(1 - deal) * 80 + failDim * 14}px) rotate(${(1 - deal) * (col - 1) * 8}deg) scale(${pass ? 1 + 0.06 * v : 1}) rotateY(${flip * 180}deg)`,
              transformStyle: 'preserve-3d',
              boxShadow: pass && v > 0.05 ? `0 0 0 3px ${colors.gold}, 0 0 50px rgba(230,194,122,${0.3 * v})` : 'none',
              borderRadius: 24,
            }}
          >
            <div style={{width: '100%', height: '100%', transform: fresh ? 'rotateY(180deg)' : undefined}}>
              <CreativeCard i={i} hue={fresh ? HUES[(i + 2) % 6] : hue} shape={fresh ? SHAPES[(i + 1) % 6] : SHAPES[i]} label={fresh ? `V2` : `AD ${String.fromCharCode(65 + i)}`} />
            </div>
            {/* verdict badge */}
            {t >= vAt && !fresh ? (
              <div
                style={{
                  position: 'absolute',
                  top: -18,
                  right: -18,
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  background: pass ? colors.good : colors.warn,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${v})`,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
                }}
              >
                {pass ? <Check size={38} color="#0B0B0E" /> : <Cross size={34} color="#0B0B0E" />}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

// ===========================================================================
// 3 — TRAFFIC ≠ SALES: visitors flow ad → product page → checkout, most leave
// ===========================================================================
export const FUNNEL = {spawnStart: 2, spawnEnd: 36, count: 28, speed: 34};
const STAGES = [
  {x: 150, label: 'AD'},
  {x: 450, label: 'PRODUCT'},
  {x: 750, label: 'CHECKOUT'},
];
const FY = 300;
// fate: 0 = leaves after the ad, 1 = leaves the product page, 2 = buys
const fate = (i: number) => {
  const h = hash(i);
  return h < 0.5 ? 0 : h < 0.84 ? 1 : 2;
};
export const funnelArrivals = Array.from({length: FUNNEL.count}, (_, i) => i)
  .filter((i) => fate(i) === 2)
  .map((i) => {
    const spawn = FUNNEL.spawnStart + (i * (FUNNEL.spawnEnd - FUNNEL.spawnStart)) / FUNNEL.count;
    return Math.round(spawn + (STAGES[2].x - 0) / FUNNEL.speed);
  });
const StageIcon: React.FC<{k: number; color: string}> = ({k, color}) => (
  <svg width="70" height="70" viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
    {k === 0 ? (
      <>
        <rect x="5" y="9" width="30" height="22" rx="4" />
        <path d="M17 15 L24 20 L17 25 Z" fill={color} />
      </>
    ) : k === 1 ? (
      <>
        <rect x="8" y="5" width="24" height="30" rx="4" />
        <rect x="12" y="9" width="16" height="11" rx="2" />
        <path d="M12 25 H28 M12 29 H22" />
      </>
    ) : (
      <>
        <path d="M5 8 H10 L14 26 H30 L34 13 H12" />
        <circle cx="16" cy="32" r="2" fill={color} />
        <circle cx="28" cy="32" r="2" fill={color} />
      </>
    )}
  </svg>
);
export const Funnel: React.FC<{t: number}> = ({t}) => {
  const {fps} = useVideoConfig();
  const bought = funnelArrivals.filter((f) => t >= f);
  const lastBuy = bought.length ? bought[bought.length - 1] : -100;
  const flash = interpolate(t - lastBuy, [0, 10], [1, 0], clamp);
  return (
    <div style={{width: PANEL.w, height: PANEL.h, position: 'relative', fontFamily: fonts.sans}}>
      <svg width={PANEL.w} height={PANEL.h} style={{position: 'absolute', inset: 0}}>
        <line x1={0} x2={PANEL.w} y1={FY} y2={FY} stroke="rgba(255,255,255,0.06)" strokeWidth={4} strokeDasharray="2 14" strokeLinecap="round" />
        {Array.from({length: FUNNEL.count}, (_, i) => {
          const spawn = FUNNEL.spawnStart + (i * (FUNNEL.spawnEnd - FUNNEL.spawnStart)) / FUNNEL.count;
          const age = t - spawn;
          if (age < 0) return null;
          const f = fate(i);
          const exitX = f === 2 ? STAGES[2].x : STAGES[f].x + 70;
          let x = age * FUNNEL.speed;
          let y = FY + (hash(i + 50) - 0.5) * 30;
          let o = 1;
          let c: string = colors.accent;
          if (x > exitX) {
            const over = (x - exitX) / FUNNEL.speed; // frames since leaving
            if (f === 2) return null; // absorbed into checkout
            x = exitX + over * 6;
            y += over * over * 2.2;
            o = Math.max(0, 1 - over / 14);
            c = colors.warn;
          }
          return <circle key={i} cx={x} cy={y} r={9} fill={c} opacity={o} />;
        })}
      </svg>
      {STAGES.map((s, k) => {
        const p = spring({frame: t - k * 3, fps, config: {damping: 15}});
        const isCheckout = k === 2;
        return (
          <div key={k} style={{position: 'absolute', left: s.x - 95, top: FY - 95, width: 190, textAlign: 'center', transform: `scale(${p})`}}>
            <div
              style={{
                width: 190,
                height: 190,
                borderRadius: 40,
                background: '#15151B',
                border: `2px solid ${isCheckout && flash > 0 ? `rgba(230,194,122,${0.4 + 0.6 * flash})` : 'rgba(255,255,255,0.08)'}`,
                boxShadow: isCheckout ? `0 0 ${60 * flash}px rgba(230,194,122,${0.4 * flash})` : '0 20px 50px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <StageIcon k={k} color={isCheckout ? colors.gold : colors.textMuted} />
            </div>
            <div style={{marginTop: 22, fontSize: 22, fontWeight: 600, letterSpacing: 4, color: colors.textMuted}}>{s.label}</div>
          </div>
        );
      })}
    </div>
  );
};

// ===========================================================================
// 4 — FULFILLMENT. RETURNS. MARGINS.: ship → deliver → return → margin shrinks
// ===========================================================================
export const SHIP = {go: 4, arrive: 34, ret: 42, back: 48, backEnd: 64, margin1: 22, margin2: 50};
const RX = [120, 450, 780];
const RY = 300;
const BoxGlyph: React.FC = () => (
  <svg width="96" height="96" viewBox="0 0 48 48">
    <path d="M24 4 L43 13 L43 35 L24 44 L5 35 L5 13 Z" fill="#C9A46A" />
    <path d="M24 4 L43 13 L24 22 L5 13 Z" fill="#E3C38C" />
    <path d="M24 22 L24 44 L5 35 L5 13 Z" fill="#A9864F" />
    <path d="M14 8.5 L33 17.5 L33 24" fill="none" stroke="#F6E2B8" strokeWidth={3} />
  </svg>
);
const StopIcon: React.FC<{k: number; color: string}> = ({k, color}) => (
  <svg width="64" height="64" viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
    {k === 0 ? <path d="M5 34 V15 L20 6 L35 15 V34 Z M13 34 V22 H27 V34" /> : null}
    {k === 1 ? (
      <>
        <path d="M3 10 H25 V28 H3 Z M25 16 H32 L37 22 V28 H25" />
        <circle cx="10" cy="30" r="3" fill="#15151B" />
        <circle cx="30" cy="30" r="3" fill="#15151B" />
      </>
    ) : null}
    {k === 2 ? <path d="M6 18 L20 6 L34 18 V34 H6 Z M16 34 V24 H24 V34" /> : null}
  </svg>
);
export const Shipping: React.FC<{t: number}> = ({t}) => {
  const {fps} = useVideoConfig();
  const go = interpolate(t, [SHIP.go, SHIP.arrive], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const back = interpolate(t, [SHIP.back, SHIP.backEnd], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const pos = RX[0] + (RX[2] - RX[0]) * go - (RX[2] - RX[0]) * 0.55 * back;
  const hop = Math.abs(Math.sin(t * 0.55)) * 10 * (go < 1 || (back > 0 && back < 1) ? 1 : 0);
  const delivered = spring({frame: t - SHIP.arrive, fps, config: {damping: 12}});
  const banner = spring({frame: t - SHIP.ret, fps, config: {damping: 14, stiffness: 170}});
  const m1 = spring({frame: t - SHIP.margin1, fps, config: {damping: 200}, durationInFrames: 12});
  const m2 = spring({frame: t - SHIP.margin2, fps, config: {damping: 200}, durationInFrames: 12});
  const margin = 1 - 0.38 * m1 - 0.34 * m2;
  return (
    <div style={{width: PANEL.w, height: PANEL.h, position: 'relative', fontFamily: fonts.sans}}>
      {/* return notification */}
      <div
        style={{
          position: 'absolute',
          top: 30,
          left: '50%',
          width: 520,
          marginLeft: -260,
          padding: '20px 26px',
          borderRadius: 28,
          background: 'rgba(32,32,38,0.97)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          opacity: banner,
          transform: `translateY(${(1 - banner) * -40}px)`,
          boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{width: 56, height: 56, borderRadius: 16, background: 'rgba(240,138,108,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={colors.warn} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 14 L4 9 L9 4" />
            <path d="M4 9 H15 A5 5 0 0 1 15 19 H11" />
          </svg>
        </div>
        <div>
          <div style={{fontSize: 26, fontWeight: 700, color: colors.text}}>Return requested</div>
          <div style={{fontSize: 20, color: colors.textMuted, marginTop: 2}}>Order is coming back</div>
        </div>
      </div>

      <svg width={PANEL.w} height={PANEL.h} style={{position: 'absolute', inset: 0}}>
        <line x1={RX[0]} x2={RX[2]} y1={RY + 70} y2={RY + 70} stroke="rgba(255,255,255,0.1)" strokeWidth={4} strokeDasharray="4 16" strokeLinecap="round" />
        <line x1={RX[0]} x2={RX[0] + (RX[2] - RX[0]) * go} y1={RY + 70} y2={RY + 70} stroke={colors.gold} strokeWidth={4} strokeLinecap="round" opacity={0.7} />
        {back > 0 ? (
          <line x1={RX[2]} x2={pos} y1={RY + 70} y2={RY + 70} stroke={colors.warn} strokeWidth={4} strokeDasharray="10 10" strokeLinecap="round" />
        ) : null}
      </svg>
      {RX.map((x, k) => (
        <div key={k} style={{position: 'absolute', left: x - 50, top: RY + 100, width: 100, display: 'flex', justifyContent: 'center'}}>
          <StopIcon k={k} color={k === 2 && delivered > 0.05 ? colors.gold : colors.textMuted} />
        </div>
      ))}
      <div style={{position: 'absolute', left: pos - 48, top: RY - 40 - hop}}>
        <BoxGlyph />
      </div>
      {t >= SHIP.arrive && t < SHIP.back ? (
        <div style={{position: 'absolute', left: RX[2] - 22, top: RY - 96, transform: `scale(${delivered})`}}>
          <div style={{width: 44, height: 44, borderRadius: 22, background: colors.good, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Check size={28} color="#0B0B0E" />
          </div>
        </div>
      ) : null}

      {/* margin bar */}
      <div style={{position: 'absolute', left: 120, right: 120, top: 560}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 600, letterSpacing: 4, color: colors.textMuted}}>
          <span>MARGIN</span>
        </div>
        <div style={{marginTop: 14, height: 18, borderRadius: 9, background: 'rgba(255,255,255,0.06)', overflow: 'hidden'}}>
          <div style={{width: `${margin * 100}%`, height: '100%', borderRadius: 9, background: `linear-gradient(90deg, ${colors.gold}, ${margin < 0.5 ? colors.warn : colors.gold})`}} />
        </div>
      </div>
    </div>
  );
};
