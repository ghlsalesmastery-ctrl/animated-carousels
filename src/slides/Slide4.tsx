import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Bubble, Receipt, Timestamp, TypingIndicator} from '../components/Chat';
import {ChatHeader, CHAT_TOP, Device, SCREEN} from '../components/Device';
import {ComposeBar} from '../components/Keyboard';
import {Backdrop, FadeFromBlack, Grain, Masthead, Sfx} from '../components/Stage';
import {clamp} from '../components/Type';
import {colors, ensureFonts, fonts} from '../theme';
import {QUESTION} from './Slide1';
import {
  AdDashboard,
  ADS,
  CREATIVE,
  CreativeTesting,
  Funnel,
  FUNNEL,
  funnelArrivals,
  PANEL,
  SHIP,
  Shipping,
} from './Slide4Scenes';

ensureFonts();

// ---------------------------------------------------------------------------
// SLIDE 4 — THE ECOMMERCE DEBATE
// Fictionalized messages (inspired by separate viral posts): a sarcastic
// "ecommerce is easy" take → a fast reality-check sequence → hard stop →
// "Learn Facebook ads." / "That's a business too."
// ---------------------------------------------------------------------------

// Chat beats (frames)
const C = {
  m1: 14,
  dots1: 40,
  m2: 58,
  m3: 68,
  m4: 78,
  strikes: [102, 108, 114],
  whip: 124,
  seq: 130,
};
const PANELS = [
  {len: 64, Comp: AdDashboard, words: [{text: 'AD SPEND', at: 4}]},
  {len: 64, Comp: CreativeTesting, words: [{text: 'TEST.', at: 4}, {text: 'LEARN.', at: CREATIVE.verdict}, {text: 'REPEAT.', at: CREATIVE.repeat}]},
  {len: 64, Comp: Funnel, words: [{text: 'TRAFFIC', at: 4}, {text: '≠ SALES', at: 30}]},
  {len: 72, Comp: Shipping, words: [{text: 'FULFILLMENT.', at: 4}, {text: 'RETURNS.', at: SHIP.ret}, {text: 'MARGINS.', at: SHIP.margin2 + 2}]},
];
const PANEL_START = PANELS.reduce<number[]>((acc, p, i) => [...acc, i === 0 ? 0 : acc[i - 1] + PANELS[i - 1].len], []);
const SEQ_LEN = PANEL_START[3] + PANELS[3].len; // 264
const FREEZE = C.seq + SEQ_LEN - 10; // motion starts slowing here...
const CUT = C.seq + SEQ_LEN + 10; // ...and hard-cuts back to the chat here
const P = {dots2: CUT + 4, m5: CUT + 18, dots3: CUT + 36, m6: CUT + 62};
export const SLIDE4_DURATION = P.m6 + 72;

// Slow to a halt: maps real frames to sequence frames with a time-ramp freeze.
const seqFrame = (f: number) => (f < FREEZE ? f : FREEZE + Math.min(f - FREEZE, 14) * 0.3);

// ---------------------------------------------------------------------------
const Strike: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 5], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <span
      style={{
        position: 'absolute',
        left: -6,
        top: '54%',
        height: 5,
        width: `calc(${p * 100}% + ${12 * p}px)`,
        borderRadius: 3,
        background: colors.warn,
        boxShadow: '0 0 12px rgba(240,138,108,0.5)',
      }}
    />
  );
};
const Struck: React.FC<{text: string; at: number}> = ({text, at}) => (
  <span style={{position: 'relative', display: 'inline-block'}}>
    {text}
    <Strike at={at} />
  </span>
);

const Conversation: React.FC = () => {
  const frame = useCurrentFrame();
  const gold = interpolate(frame, [P.m6 + 6, P.m6 + 20], [0, 1], clamp);
  return (
    <Device>
      <ChatHeader />
      <div style={{position: 'absolute', top: CHAT_TOP, left: 0, width: SCREEN.w, height: SCREEN.h - CHAT_TOP, display: 'flex', flexDirection: 'column'}}>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 18, padding: '0 32px 18px', overflow: 'hidden'}}>
          <Timestamp label="Today 9:41 PM" />
          <Bubble side="out" at={-200}>
            {QUESTION}
          </Bubble>
          <Receipt at={-200} label="Read 9:42 PM" />
          {frame < C.m1 ? <TypingIndicator at={-60} /> : null}
          <Bubble side="in" at={C.m1}>Ecommerce must be such an easy business model...</Bubble>
          {frame >= C.dots1 && frame < C.m2 ? <TypingIndicator at={C.dots1} /> : null}
          <Bubble side="in" at={C.m2}>
            <Struck text="No clients." at={C.strikes[0]} />
          </Bubble>
          <Bubble side="in" at={C.m3}>
            <Struck text="No calls." at={C.strikes[1]} />
          </Bubble>
          <Bubble side="in" at={C.m4}>
            <Struck text="No skilled labor." at={C.strikes[2]} />
          </Bubble>
          {frame >= P.dots2 && frame < P.m5 ? <TypingIndicator at={P.dots2} /> : null}
          <Bubble side="in" at={P.m5}>Learn Facebook ads.</Bubble>
          {frame >= P.dots3 && frame < P.m6 ? <TypingIndicator at={P.dots3} /> : null}
          <Bubble
            side="in"
            at={P.m6}
            style={{
              boxShadow: `0 0 0 ${2.5 * gold}px ${colors.gold}, 0 0 ${50 * gold}px rgba(230,194,122,${0.35 * gold})`,
              fontWeight: 600,
            }}
          >
            That's a business too.
          </Bubble>
        </div>
        <ComposeBar text="" lastKeyFrame={-100} showCaret={false} />
        <div style={{height: 40, flexShrink: 0}} />
      </div>
    </Device>
  );
};

// ---------------------------------------------------------------------------
// Kinetic label: each line slams in.
// ---------------------------------------------------------------------------
const Slam: React.FC<{t: number; at: number; text: string; color?: string}> = ({t, at, text, color = colors.text}) => {
  const {fps} = useVideoConfig();
  const p = spring({frame: t - at, fps, config: {damping: 14, stiffness: 260, mass: 0.7}});
  if (t < at) return <div style={{height: 100}} />;
  const neq = text.startsWith('≠');
  return (
    <div
      style={{
        height: 100,
        fontFamily: fonts.sans,
        fontWeight: 800,
        fontSize: 100,
        lineHeight: '100px',
        letterSpacing: -3,
        color,
        transform: `scale(${1.35 - 0.35 * p}) translateX(${(1 - p) * -30}px)`,
        transformOrigin: '0% 50%',
        opacity: Math.min(1, p * 2),
        filter: p < 0.9 ? `blur(${(1 - p) * 8}px)` : undefined,
      }}
    >
      {neq ? (
        <>
          <span style={{color: colors.warn}}>≠</span>
          {text.slice(1)}
        </>
      ) : (
        text
      )}
    </div>
  );
};

const Sequence4: React.FC<{sf: number}> = ({sf}) => {
  const s = sf - C.seq;
  const desat = interpolate(s, [SEQ_LEN - 10, SEQ_LEN + 2], [0, 1], clamp);
  // kick pulse on the beat
  const beat = s >= 0 ? (s % 15) / 15 : 1;
  const pulse = s < SEQ_LEN - 10 ? Math.max(0, 1 - beat * 4) : 0;
  return (
    <AbsoluteFill style={{filter: desat > 0 ? `saturate(${1 - 0.8 * desat}) brightness(${1 - 0.25 * desat})` : undefined, transform: `scale(${1 + 0.008 * pulse})`}}>
      {PANELS.map((pnl, i) => {
        const t = s - PANEL_START[i];
        if (t < -6 || t > pnl.len + 3) return null;
        const last = i === PANELS.length - 1;
        const enter = interpolate(t, [-6, 3], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
        const exit = last ? 0 : interpolate(t, [pnl.len - 3, pnl.len + 3], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
        const x = (1 - enter) * 320 - exit * 320;
        const blur = (1 - enter) * 22 + exit * 22;
        const Comp = pnl.Comp;
        return (
          <AbsoluteFill key={i} style={{transform: `translateX(${x}px)`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined, opacity: Math.min(enter, 1 - exit) * 0.9 + 0.1}}>
            <div style={{position: 'absolute', top: 186, left: (1080 - PANEL.w) / 2}}>
              <Comp t={t} />
            </div>
            <div style={{position: 'absolute', top: 878, left: 92, fontFamily: fonts.sans, fontSize: 22, fontWeight: 600, letterSpacing: 5, color: colors.textDim}}>
              0{i + 1} / 04
            </div>
            <div style={{position: 'absolute', top: 920, left: 90, right: 60}}>
              {pnl.words.map((w, k) => (
                <Slam key={k} t={t} at={w.at} text={w.text} color={last && k === 2 ? colors.gold : colors.text} />
              ))}
            </div>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
const Sounds: React.FC = () => {
  const sq = (i: number, f: number) => C.seq + PANEL_START[i] + f;
  const kicks = Array.from({length: Math.floor((SEQ_LEN - 10) / 15)}, (_, k) => C.seq + k * 15);
  return (
    <>
      {/* the sarcastic take */}
      <Sfx name="receive" at={C.m1} volume={0.6} frames={30} />
      <Sfx name="bubble_pop" at={C.dots1} volume={0.35} frames={8} />
      {[C.m2, C.m3, C.m4].map((f, i) => (
        <Sfx key={`n${i}`} name="notify_short" at={f} volume={0.5 + i * 0.05} frames={12} />
      ))}
      {C.strikes.map((f, i) => (
        <Sfx key={`x${i}`} name="tick" at={f} volume={0.55} frames={4} />
      ))}
      <Sfx name="whip" at={C.whip} volume={0.6} frames={10} />
      {/* energy bed */}
      {kicks.map((f, i) => (
        <Sfx key={`k${i}`} name="kick" at={f} volume={0.32} frames={9} />
      ))}
      {/* panel transitions + slams */}
      {PANELS.map((p, i) => (
        <React.Fragment key={`p${i}`}>
          {i > 0 ? <Sfx name="whip" at={sq(i, -5)} volume={0.5} frames={10} /> : null}
          {p.words.map((w, k) => (
            <Sfx key={k} name="slam" at={sq(i, w.at)} volume={0.55} frames={14} />
          ))}
        </React.Fragment>
      ))}
      {/* 1 ad spend */}
      <Sfx name="tick" at={sq(0, ADS.launch)} volume={0.5} frames={4} />
      {Array.from({length: 14}, (_, k) => (
        <Sfx key={`c${k}`} name="count_tick" at={sq(0, ADS.countStart + k * 3)} volume={0.28} frames={3} />
      ))}
      {/* 2 creative testing */}
      {Array.from({length: 6}, (_, k) => (
        <React.Fragment key={`v${k}`}>
          <Sfx name="tick" at={sq(1, CREATIVE.deal + k * CREATIVE.dealGap)} volume={0.3} frames={4} />
          <Sfx name={[1, 4].includes(k) ? 'pass' : 'fail'} at={sq(1, CREATIVE.verdict + k * CREATIVE.verdictGap)} volume={0.45} frames={8} />
        </React.Fragment>
      ))}
      {[0, 1, 2].map((k) => (
        <Sfx key={`f${k}`} name="tick" at={sq(1, CREATIVE.repeat + k * 2 + 5)} volume={0.35} frames={4} />
      ))}
      {/* 3 funnel */}
      {Array.from({length: Math.ceil(FUNNEL.count / 3)}, (_, k) => (
        <Sfx key={`sp${k}`} name="count_tick" at={sq(2, FUNNEL.spawnStart + k * 3.6)} volume={0.18} frames={3} />
      ))}
      {funnelArrivals.map((f, k) => (
        <Sfx key={`a${k}`} name="pass" at={sq(2, f)} volume={0.4} frames={8} />
      ))}
      {/* 4 shipping */}
      <Sfx name="whoosh_soft" at={sq(3, SHIP.go)} volume={0.25} frames={20} />
      <Sfx name="pass" at={sq(3, SHIP.arrive)} volume={0.45} frames={8} />
      <Sfx name="notify_short" at={sq(3, SHIP.ret)} volume={0.45} frames={12} />
      <Sfx name="fail" at={sq(3, SHIP.margin1)} volume={0.35} frames={6} />
      <Sfx name="fail" at={sq(3, SHIP.margin2)} volume={0.4} frames={6} />
      {/* everything stops */}
      <Sfx name="tape_stop" at={FREEZE - 2} volume={0.6} frames={16} />
      {/* punchline */}
      <Sfx name="bubble_pop" at={P.dots2} volume={0.3} frames={8} />
      <Sfx name="receive" at={P.m5} volume={0.6} frames={30} />
      <Sfx name="bubble_pop" at={P.dots3} volume={0.3} frames={8} />
      <Sfx name="receive" at={P.m6} volume={0.6} frames={30} />
      <Sfx name="soft_hit" at={P.m6 + 6} volume={0.5} frames={36} />
      <Sfx name="shimmer" at={P.m6 + 6} volume={0.3} frames={48} />
    </>
  );
};

// ---------------------------------------------------------------------------
export const Slide4: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const inSeq = frame >= C.whip && frame < CUT;

  const settle = spring({frame, fps, config: {damping: 200}, durationInFrames: 30});
  // lean in during the rapid-fire messages
  const lean = interpolate(frame, [C.m2 - 6, C.m4 + 10], [0, 1], {...clamp, easing: Easing.inOut(Easing.sin)});
  const whip = frame >= CUT ? 0 : interpolate(frame, [C.whip, C.seq + 2], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  // punchline: slow push toward the last line
  const push = interpolate(frame, [P.m6, SLIDE4_DURATION], [0, 1], {...clamp, easing: Easing.out(Easing.sin)});
  const afterCut = frame >= CUT;
  const zoom = afterCut ? 1 + 0.035 * push : 1.04 - 0.04 * settle + 0.03 * lean + 0.5 * whip;

  return (
    <AbsoluteFill style={{background: colors.bg}}>
      <Backdrop />
      {!inSeq || frame < C.seq + 2 ? (
        <AbsoluteFill
          style={{
            transform: `translateX(${-260 * whip}px) scale(${zoom})`,
            transformOrigin: '50% 88%',
            filter: whip > 0 ? `blur(${whip * 20}px)` : undefined,
            opacity: 1 - whip * 0.8,
          }}
        >
          <Conversation />
        </AbsoluteFill>
      ) : null}
      {frame >= C.seq - 6 && frame < CUT ? <Sequence4 sf={seqFrame(frame)} /> : null}
      <Masthead index={4} total={5} title="The Ecommerce Debate" />
      <Grain />
      <FadeFromBlack frames={10} />
      <Sounds />
    </AbsoluteFill>
  );
};
