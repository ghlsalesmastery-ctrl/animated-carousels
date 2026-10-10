import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Bubble, Receipt, Timestamp, TypingIndicator} from '../components/Chat';
import {ChatHeader, CHAT_TOP, Device, SCREEN} from '../components/Device';
import {ComposeBar} from '../components/Keyboard';
import {Backdrop, FadeFromBlack, Grain, Masthead, Sfx} from '../components/Stage';
import {colors, ensureFonts, fonts, WIDTH} from '../theme';
import {QUESTION} from './Slide1';

ensureFonts();

// ---------------------------------------------------------------------------
// SLIDE 2 — THE FIRST REPLY
// A dramatized reply (inspired by a viral post) expands into a revenue
// breakdown. Figures are HYPOTHETICAL GROSS REVENUE, not earnings or profit.
// ---------------------------------------------------------------------------
export const REPLY = "Don't trade.\nTeach people how to trade.";
const REALITY = "Revenue isn't profit.\nAnd no business is risk-free.";
// "\n" marks a deliberate line break inside a bubble
const lines = (t: string) => <span style={{whiteSpace: 'pre-line'}}>{t}</span>;
const SUBSCRIBERS = 3000;
const PRICE = 25;
const MONTHLY = SUBSCRIBERS * PRICE; // 75,000
const ANNUAL = MONTHLY * 12; // 900,000

// Beats (frames). Stage times are relative to B.stage.
const B = {reply: 16, expand: 58, stage: 70};
const S = {
  quote: 0,
  subsStart: 8,
  subsEnd: 54,
  price: 50,
  monthStart: 72,
  monthEnd: 108,
  toAnnual: 138,
  barsStart: 156,
  barGap: 4,
  footnote: 218,
  reality: 240,
  dots: 280,
};
const annualLand = S.barsStart + S.barGap * 11 + 4;
export const SLIDE2_DURATION = B.stage + S.dots + 62;

// ---------------------------------------------------------------------------
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
const countUp = (s: number, a: number, b: number) =>
  interpolate(s, [a, b], [0, 1], {...clamp, easing: Easing.bezier(0.25, 0.1, 0.25, 1)});

// tick sounds that follow a count's easing (dense while fast, sparse as it settles)
const tickFrames = (a: number, b: number, n: number) => {
  const out: number[] = [];
  let k = 1;
  for (let f = a; f <= b && k <= n; f++) {
    while (k <= n && countUp(f, a, b) >= k / n) {
      if (!out.length || f > out[out.length - 1]) out.push(f);
      k++;
    }
  }
  return out;
};

// ---------------------------------------------------------------------------
// Dot field: one dot = one subscriber. Fills radially from the centre.
// ---------------------------------------------------------------------------
const COLS = 75;
const ROWS = 40;
const GAP = 11.4;
const GRID_W = (COLS - 1) * GAP;
const ORDER: number[] = (() => {
  const idx = Array.from({length: COLS * ROWS}, (_, i) => i);
  const score = (i: number) => {
    const x = (i % COLS) - (COLS - 1) / 2;
    const y = (Math.floor(i / COLS) - (ROWS - 1) / 2) * 1.6;
    const jitter = ((Math.sin(i * 12.9898) * 43758.5453) % 1) * 9;
    return Math.hypot(x, y) + Math.abs(jitter);
  };
  const rank = new Array<number>(idx.length);
  idx.sort((a, b) => score(a) - score(b)).forEach((dot, r) => (rank[dot] = r));
  return rank;
})();

const DotField: React.FC<{lit: number; gold: number; opacity: number; y: number}> = ({lit, gold, opacity, y}) => (
  <svg
    width={GRID_W + 20}
    height={(ROWS - 1) * GAP + 20}
    style={{position: 'absolute', left: (WIDTH - GRID_W - 20) / 2, top: 470 + y, opacity}}
  >
    {ORDER.map((rank, i) => {
      const isGold = rank < gold;
      const isLit = rank < lit;
      const fresh = isLit && !isGold && lit - rank < 90;
      return (
        <circle
          key={i}
          cx={10 + (i % COLS) * GAP}
          cy={10 + Math.floor(i / COLS) * GAP}
          r={isLit ? 3.6 : 2.4}
          fill={isGold ? colors.gold : isLit ? (fresh ? '#9DBBFF' : colors.accent) : '#1F1F26'}
        />
      );
    })}
  </svg>
);

// ---------------------------------------------------------------------------
const Label: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
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

const bigNum: React.CSSProperties = {
  fontFamily: fonts.sans,
  fontWeight: 700,
  fontVariantNumeric: 'tabular-nums',
  letterSpacing: -4,
  lineHeight: 1,
  color: colors.text,
};

const MONTHS = 'JFMAMJJASOND'.split('');

// ---------------------------------------------------------------------------
const Stage: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = frame - B.stage;
  const sp = (at: number, damping = 18, stiffness = 150) =>
    spring({frame: s - at, fps, config: {damping, stiffness}});

  const stageIn = interpolate(s, [0, 14], [0, 1], clamp);
  // phase 3: equation & dots leave, monthly figure rises to the top
  const toAnnual = spring({frame: s - S.toAnnual, fps, config: {damping: 200}, durationInFrames: 26});
  // phase 4: everything steps back for the reality check
  const back = spring({frame: s - S.reality, fps, config: {damping: 200}, durationInFrames: 24});

  // counts
  const subs = SUBSCRIBERS * countUp(s, S.subsStart, S.subsEnd);
  const monthly = MONTHLY * countUp(s, S.monthStart, S.monthEnd);
  const priceIn = sp(S.price, 13, 180);
  const monthIn = sp(S.monthStart - 6, 16, 140);
  const monthLand = sp(S.monthEnd, 9, 200); // little bounce on landing
  const barsShown = interpolate(s, [S.barsStart, S.barsStart + S.barGap * 11], [0, 12], clamp);
  const annualSteps = Math.min(12, Math.floor(barsShown + 1e-6) + (s >= S.barsStart ? 1 : 0));
  const annualTween = interpolate(s - (S.barsStart + (annualSteps - 1) * S.barGap), [0, 3], [0, 1], clamp);
  const annual = s < S.barsStart ? 0 : MONTHLY * (annualSteps - 1 + annualTween);
  const annualIn = sp(S.barsStart - 6, 16, 140);
  const annualLandP = sp(annualLand, 9, 200);

  const eqOut = 1 - toAnnual;

  return (
    <AbsoluteFill style={{opacity: stageIn, transform: `translateY(${-120 * back}px)`}}>
      {/* the reply, kept as the source line */}
      <div
        style={{
          position: 'absolute',
          top: 150,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: fonts.serif,
          fontStyle: 'italic',
          fontSize: 50,
          color: colors.text,
          opacity: interpolate(s, [S.quote, S.quote + 16], [0, 1], clamp) * (1 - back),
          transform: `translateY(${interpolate(s, [0, 20], [16, 0], {...clamp, easing: Easing.out(Easing.cubic)})}px)`,
        }}
      >
        “{REPLY.replace('\n', ' ')}”
      </div>

      <AbsoluteFill style={{opacity: 1 - 0.45 * back}}>
        {/* equation row: 3,000 × $25 */}
        <div
          style={{
            position: 'absolute',
            top: 270,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: 44,
            opacity: eqOut,
            transform: `translateY(${-40 * toAnnual}px)`,
          }}
        >
          <div style={{textAlign: 'center', width: 380}}>
            <div style={{...bigNum, fontSize: 124}}>{fmt(subs)}</div>
            <Label style={{marginTop: 16}}>Subscribers</Label>
          </div>
          <div
            style={{
              ...bigNum,
              fontSize: 84,
              fontWeight: 300,
              color: colors.textMuted,
              marginTop: 22,
              opacity: priceIn,
              transform: `rotate(${(1 - priceIn) * -90}deg)`,
            }}
          >
            ×
          </div>
          <div style={{textAlign: 'center', width: 260, opacity: priceIn, transform: `scale(${0.7 + 0.3 * priceIn})`}}>
            <div style={{...bigNum, fontSize: 124}}>${PRICE}</div>
            <Label style={{marginTop: 16}}>Per month</Label>
          </div>
        </div>

        <DotField
          lit={(subs / SUBSCRIBERS) * COLS * ROWS}
          gold={(monthly / MONTHLY) * COLS * ROWS}
          opacity={interpolate(s, [S.subsStart - 6, S.subsStart + 6], [0, 1], clamp) * eqOut}
          y={-40 * toAnnual}
        />

        {/* monthly result — lands big, then rises to become the header of the annual view */}
        <div
          style={{
            position: 'absolute',
            top: 960,
            left: 0,
            right: 0,
            textAlign: 'center',
            opacity: monthIn,
            transform: `translateY(${(1 - monthIn) * 30 - 690 * toAnnual}px) scale(${(1 + 0.04 * Math.sin(Math.PI * Math.min(1, monthLand))) * (1 - 0.36 * toAnnual)})`,
            transformOrigin: '50% 0%',
          }}
        >
          <div
            style={{
              ...bigNum,
              fontSize: 168,
              color: interpolate(toAnnual, [0, 1], [1, 0]) > 0.5 ? colors.gold : colors.text,
              textShadow: `0 0 80px rgba(230,194,122,${0.28 * (1 - toAnnual)})`,
            }}
          >
            ${fmt(monthly)}
          </div>
          <Label style={{marginTop: 18, color: colors.textMuted, fontSize: 26, letterSpacing: 8}}>/ Month</Label>
        </div>

        {/* annual view: 12 months stack into one year */}
        <div style={{position: 'absolute', top: 0, left: 0, right: 0, opacity: toAnnual}}>
          <Label style={{position: 'absolute', top: 498, width: '100%', textAlign: 'center', color: colors.textDim}}>
            × 12 months
          </Label>
          <div
            style={{
              position: 'absolute',
              top: 560,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              gap: 18,
            }}
          >
            {MONTHS.map((m, i) => {
              const p = spring({frame: s - (S.barsStart + i * S.barGap), fps, config: {damping: 14, stiffness: 200}});
              return (
                <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
                  <div style={{width: 52, height: 170, display: 'flex', alignItems: 'flex-end'}}>
                    <div
                      style={{
                        width: '100%',
                        height: 170 * p,
                        borderRadius: 10,
                        background: `linear-gradient(180deg, ${colors.gold} 0%, rgba(230,194,122,0.25) 100%)`,
                        boxShadow: p > 0.1 ? '0 0 24px rgba(230,194,122,0.18)' : 'none',
                      }}
                    />
                  </div>
                  <div style={{fontFamily: fonts.sans, fontSize: 20, fontWeight: 600, color: p > 0.2 ? colors.textMuted : colors.textDim}}>
                    {m}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              position: 'absolute',
              top: 820,
              left: 0,
              right: 0,
              textAlign: 'center',
              opacity: annualIn,
              transform: `scale(${1 + 0.05 * Math.sin(Math.PI * Math.min(1, annualLandP))})`,
            }}
          >
            <div
              style={{
                ...bigNum,
                fontSize: 188,
                letterSpacing: -6,
                color: colors.gold,
                textShadow: `0 0 ${60 + 50 * annualLandP}px rgba(230,194,122,${0.18 + 0.14 * annualLandP})`,
              }}
            >
              ${fmt(annual)}
            </div>
            <Label style={{marginTop: 18, fontSize: 26, letterSpacing: 8, opacity: interpolate(s, [annualLand - 4, annualLand + 8], [0.25, 1], clamp)}}>
              / Year
            </Label>
          </div>

          <div
            style={{
              position: 'absolute',
              top: 1080,
              left: 90,
              right: 90,
              textAlign: 'center',
              fontFamily: fonts.sans,
              fontSize: 26,
              fontWeight: 500,
              lineHeight: 1.4,
              color: colors.textDim,
              opacity: interpolate(s, [S.footnote, S.footnote + 14], [0, 1], clamp),
            }}
          >
            Hypothetical gross revenue, assuming 3,000 subscribers pay every month.
          </div>
        </div>
      </AbsoluteFill>

      {/* reality check, back in the conversation */}
      <div
        style={{
          position: 'absolute',
          left: 70,
          right: 70,
          bottom: 0,
          height: 1350,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          gap: 18,
          paddingBottom: 60,
          transform: `translateY(${120 * back}px)`, // cancels the stage lift: bubbles stay put
        }}
      >
        <Bubble side="in" at={B.stage + S.reality}>
          {lines(REALITY)}
        </Bubble>
        <TypingIndicator at={B.stage + S.dots} />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
const Sounds: React.FC = () => {
  const st = (f: number) => B.stage + f;
  return (
    <>
      <Sfx name="receive" at={B.reply} volume={0.6} frames={30} />
      <Sfx name="whoosh_soft" at={B.expand - 6} volume={0.35} frames={22} />
      {tickFrames(S.subsStart, S.subsEnd, 18).map((f, i) => (
        <Sfx key={`s${i}`} name="count_tick" at={st(f)} volume={0.32} frames={3} />
      ))}
      <Sfx name="bubble_pop" at={st(S.price)} volume={0.45} frames={6} />
      {tickFrames(S.monthStart, S.monthEnd, 16).map((f, i) => (
        <Sfx key={`m${i}`} name="count_tick" at={st(f)} volume={0.32 + i * 0.012} frames={3} />
      ))}
      <Sfx name="soft_hit" at={st(S.monthEnd)} volume={0.55} frames={36} />
      <Sfx name="whoosh_soft" at={st(S.toAnnual - 4)} volume={0.25} frames={22} />
      {MONTHS.map((_, i) => (
        <Sfx key={`b${i}`} name="tick" at={st(S.barsStart + i * S.barGap)} volume={0.28 + i * 0.02} frames={4} />
      ))}
      <Sfx name="soft_hit" at={st(annualLand)} volume={0.7} frames={36} />
      <Sfx name="shimmer" at={st(annualLand)} volume={0.5} frames={48} />
      <Sfx name="receive" at={st(S.reality)} volume={0.55} frames={30} />
      <Sfx name="bubble_pop" at={st(S.dots)} volume={0.45} frames={8} />
    </>
  );
};

// ---------------------------------------------------------------------------
export const Slide2: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // phone: picks up where Slide 1 ended, then the camera dives into the reply
  const dive = interpolate(frame, [B.expand, B.stage + 10], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const drift = interpolate(frame, [0, B.expand], [0, 1], clamp);
  const settle = spring({frame, fps, config: {damping: 200}, durationInFrames: 30});

  return (
    <AbsoluteFill style={{background: colors.bg}}>
      <Backdrop />
      {frame < B.stage + 12 ? (
        <AbsoluteFill
          style={{
            transform: `scale(${1.04 - 0.04 * settle + 0.02 * drift + 0.9 * dive})`,
            transformOrigin: '380px 1090px',
            opacity: 1 - dive,
            filter: `blur(${dive * 14}px)`,
          }}
        >
          <Device>
            <ChatHeader />
            <div
              style={{
                position: 'absolute',
                top: CHAT_TOP,
                left: 0,
                width: SCREEN.w,
                height: SCREEN.h - CHAT_TOP,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  gap: 18,
                  padding: '0 32px 18px',
                  overflow: 'hidden',
                }}
              >
                <Timestamp label="Today 9:41 PM" />
                <Bubble side="out" at={-200}>
                  {QUESTION}
                </Bubble>
                <Receipt at={-200} label="Read 9:42 PM" />
                {frame < B.reply ? (
                  <TypingIndicator at={-60} />
                ) : (
                  <Bubble side="in" at={B.reply}>
                    {lines(REPLY)}
                  </Bubble>
                )}
              </div>
              <ComposeBar text="" lastKeyFrame={-100} showCaret={false} />
              <div style={{height: 40, flexShrink: 0}} />
            </div>
          </Device>
        </AbsoluteFill>
      ) : null}

      <Stage />
      <Masthead index={2} total={5} title="The First Reply" />
      <Grain />
      <FadeFromBlack frames={10} />
      <Sounds />
    </AbsoluteFill>
  );
};
