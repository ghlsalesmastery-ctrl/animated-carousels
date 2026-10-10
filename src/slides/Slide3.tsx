import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Bubble, Receipt, Timestamp, TypingIndicator} from '../components/Chat';
import {ChatHeader, CHAT_TOP, Device, SCREEN} from '../components/Device';
import {ComposeBar} from '../components/Keyboard';
import {Backdrop, FadeFromBlack, Grain, Masthead, Sfx} from '../components/Stage';
import {clamp, Label, lines} from '../components/Type';
import {colors, ensureFonts, fonts} from '../theme';
import {QUESTION} from './Slide1';
import {
  BOX,
  CALL,
  CallIcon,
  DropIcon,
  LEAK,
  LeakScene,
  MAP,
  MapScene,
  mapTyping,
  MissedCallScene,
  PinIcon,
} from './Slide3Scenes';

ensureFonts();

// ---------------------------------------------------------------------------
// SLIDE 3 — THE PROBLEM SOLVERS
// Dramatized reply (inspired by a viral post) → three problems become
// business opportunities → one insight → back to the conversation.
// ---------------------------------------------------------------------------
const REPLY = 'Stop looking for business ideas.\nLook for problems people pay\nto make go away.';

const B = {reply: 16, expand: 64, stage: 76};
const SCENE_LEN = 92;
const S = {
  quote: 0,
  scenes: [10, 10 + SCENE_LEN, 10 + SCENE_LEN * 2],
  insight: 10 + SCENE_LEN * 3, // 286
  back: 10 + SCENE_LEN * 3 + 74, // 360: return to the conversation
};
const DOTS = B.stage + S.back + 16;
export const SLIDE3_DURATION = DOTS + 52;

const SCENES = [
  {problem: 'A leaking pipe', business: 'Emergency Plumbing', reveal: LEAK.reveal, Comp: LeakScene},
  {problem: 'A missed call', business: 'Business Automation', reveal: CALL.reveal, Comp: MissedCallScene},
  {problem: 'Invisible online', business: 'Local Marketing', reveal: MAP.reveal, Comp: MapScene},
];

// ---------------------------------------------------------------------------
// One problem → business vignette, with slide-in / slide-out transitions.
// ---------------------------------------------------------------------------
const SceneSlot: React.FC<{index: number; s: number}> = ({index, s}) => {
  const {fps} = useVideoConfig();
  const sc = SCENES[index];
  const t = s - S.scenes[index];
  if (t < -6 || t > SCENE_LEN + 2) return null;
  const enter = interpolate(t, [-6, 10], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const exit = interpolate(t, [SCENE_LEN - 12, SCENE_LEN + 2], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const x = (1 - enter) * 90 - exit * 90;
  const o = enter * (1 - exit);
  const r = spring({frame: t - sc.reveal, fps, config: {damping: 200}, durationInFrames: 16});
  const Comp = sc.Comp;
  const num = `0${index + 1}`;
  return (
    <AbsoluteFill style={{opacity: o, transform: `translateX(${x}px)`}}>
      <div style={{position: 'absolute', top: 330, left: (1080 - BOX.w) / 2}}>
        <Comp t={t} />
      </div>
      {/* caption: problem → business */}
      <div style={{position: 'absolute', top: 920, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{position: 'absolute', left: 0, right: 0, opacity: interpolate(r, [0, 0.45], [1, 0], clamp), transform: `translateY(${-24 * r}px)`}}>
          <Label style={{color: colors.warn}}>{num} · The problem</Label>
          <div style={{fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 64, color: colors.text, marginTop: 14}}>{sc.problem}</div>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, opacity: interpolate(r, [0.3, 1], [0, 1], clamp), transform: `translateY(${(1 - r) * 30}px)`}}>
          <Label style={{color: colors.gold}}>{num} · The business</Label>
          <div
            style={{
              fontFamily: fonts.sans,
              fontWeight: 700,
              fontSize: 80,
              letterSpacing: -2.5,
              color: colors.text,
              marginTop: 12,
              textShadow: `0 0 50px rgba(230,194,122,${0.22 * r})`,
            }}
          >
            {sc.business}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// The insight: three icons converge into a line, the statement rises around it.
// ---------------------------------------------------------------------------
const INS = {icons: 2, converge: 16, line: 22, l1: 24, l2: 36};
const Insight: React.FC<{s: number}> = ({s}) => {
  const {fps} = useVideoConfig();
  const u = s - S.insight;
  if (u < 0) return null;
  const conv = interpolate(u, [INS.converge, INS.line], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const line = spring({frame: u - INS.line, fps, config: {damping: 200}, durationInFrames: 18});
  const l1 = spring({frame: u - INS.l1, fps, config: {damping: 200}, durationInFrames: 20});
  const l2 = spring({frame: u - INS.l2, fps, config: {damping: 200}, durationInFrames: 20});
  const out = interpolate(s, [S.back - 4, S.back + 10], [0, 1], clamp);
  const Y = 690;
  const icons = [DropIcon, CallIcon, PinIcon];
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      {icons.map((Icon, i) => {
        const p = spring({frame: u - INS.icons - i * 4, fps, config: {damping: 13, stiffness: 180}});
        const x = (i - 1) * 190 * (1 - conv);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 540 - 46 + x,
              top: Y - 46,
              width: 92,
              height: 92,
              borderRadius: 46,
              background: colors.surface,
              border: `1px solid rgba(230,194,122,0.35)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${p * (1 - conv * 0.9)})`,
              opacity: 1 - interpolate(conv, [0.7, 1], [0, 1], clamp),
            }}
          >
            <Icon color={colors.gold} />
          </div>
        );
      })}
      {/* the line */}
      <div
        style={{
          position: 'absolute',
          top: Y - 1.5,
          left: 540 - 300 * line,
          width: 600 * line,
          height: 3,
          borderRadius: 2,
          background: `linear-gradient(90deg, transparent, ${colors.gold}, transparent)`,
          opacity: conv,
        }}
      />
      {/* line 1 rises above, line 2 drops below */}
      <div style={{position: 'absolute', top: Y - 150, left: 0, right: 0, height: 130, overflow: 'hidden', textAlign: 'center'}}>
        <div
          style={{
            fontFamily: fonts.serif,
            fontStyle: 'italic',
            fontSize: 104,
            lineHeight: '130px',
            color: colors.text,
            transform: `translateY(${(1 - l1) * 130}px)`,
          }}
        >
          Find the problem.
        </div>
      </div>
      <div style={{position: 'absolute', top: Y + 22, left: 0, right: 0, height: 130, overflow: 'hidden', textAlign: 'center'}}>
        <div
          style={{
            fontFamily: fonts.sans,
            fontWeight: 700,
            fontSize: 92,
            letterSpacing: -3.5,
            lineHeight: '120px',
            color: colors.gold,
            textShadow: '0 0 60px rgba(230,194,122,0.3)',
            transform: `translateY(${(1 - l2) * -130}px)`,
          }}
        >
          Build the solution.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
const Conversation: React.FC<{frame: number}> = ({frame}) => (
  <Device>
    <ChatHeader />
    <div style={{position: 'absolute', top: CHAT_TOP, left: 0, width: SCREEN.w, height: SCREEN.h - CHAT_TOP, display: 'flex', flexDirection: 'column'}}>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 18, padding: '0 32px 18px', overflow: 'hidden'}}>
        <Timestamp label="Today 9:41 PM" />
        <Bubble side="out" at={-200}>
          {QUESTION}
        </Bubble>
        <Receipt at={-200} label="Read 9:42 PM" />
        {frame < B.reply ? (
          <TypingIndicator at={-60} />
        ) : (
          <Bubble side="in" at={B.reply} maxWidth={820}>
            {lines(REPLY)}
          </Bubble>
        )}
        {frame >= DOTS ? <TypingIndicator at={DOTS} /> : null}
      </div>
      <ComposeBar text="" lastKeyFrame={-100} showCaret={false} />
      <div style={{height: 40, flexShrink: 0}} />
    </div>
  </Device>
);

const KEY_SOUNDS = ['key_1', 'key_2', 'key_3', 'key_4', 'key_5', 'key_6'];
const Sounds: React.FC = () => {
  const st = (f: number) => B.stage + f;
  const [s1, s2, s3] = S.scenes;
  return (
    <>
      <Sfx name="receive" at={B.reply} volume={0.6} frames={30} />
      <Sfx name="whoosh_soft" at={B.expand - 6} volume={0.35} frames={22} />
      {/* scene 1: leak */}
      <Sfx name="tick" at={st(s1 + LEAK.crack)} volume={0.4} frames={4} />
      {LEAK.drips.map((d, i) => (
        <Sfx key={`d${i}`} name={`drip_${(i % 3) + 1}`} at={st(s1 + d + LEAK.fallFrames)} volume={0.45 + i * 0.03} frames={5} />
      ))}
      <Sfx name="clamp" at={st(s1 + LEAK.fix)} volume={0.6} frames={10} />
      <Sfx name="soft_hit" at={st(s1 + LEAK.reveal)} volume={0.4} frames={30} />
      {/* scene 2: call */}
      <Sfx name="whoosh_soft" at={st(s2 - 8)} volume={0.22} frames={22} />
      {CALL.rings.map((r, i) => (
        <Sfx key={`r${i}`} name="ringtone" at={st(s2 + r)} volume={0.5} frames={27} />
      ))}
      <Sfx name="missed" at={st(s2 + CALL.missed)} volume={0.55} frames={24} />
      <Sfx name="send" at={st(s2 + CALL.auto)} volume={0.5} frames={12} />
      <Sfx name="soft_hit" at={st(s2 + CALL.reveal)} volume={0.4} frames={30} />
      {/* scene 3: map */}
      <Sfx name="whoosh_soft" at={st(s3 - 8)} volume={0.22} frames={22} />
      {mapTyping.events.map((e, i) => (
        <Sfx key={`k${i}`} at={st(s3 + e.frame)} frames={6} name={e.key === ' ' ? 'key_space' : KEY_SOUNDS[i % 6]} volume={0.38} />
      ))}
      <Sfx name="whoosh_soft" at={st(s3 + MAP.sweep - 4)} volume={0.2} frames={20} />
      <Sfx name="bubble_pop" at={st(s3 + MAP.found)} volume={0.5} frames={8} />
      <Sfx name="soft_hit" at={st(s3 + MAP.reveal)} volume={0.4} frames={30} />
      {/* insight */}
      {[0, 1, 2].map((i) => (
        <Sfx key={`i${i}`} name="tick" at={st(S.insight + INS.icons + i * 4)} volume={0.3} frames={4} />
      ))}
      <Sfx name="whoosh_soft" at={st(S.insight + INS.converge - 4)} volume={0.25} frames={20} />
      <Sfx name="soft_hit" at={st(S.insight + INS.l2)} volume={0.7} frames={36} />
      <Sfx name="shimmer" at={st(S.insight + INS.l2)} volume={0.45} frames={48} />
      {/* back to chat */}
      <Sfx name="whoosh_down" at={st(S.back - 2)} volume={0.25} frames={18} />
      <Sfx name="bubble_pop" at={DOTS} volume={0.45} frames={8} />
    </>
  );
};

// ---------------------------------------------------------------------------
export const Slide3: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = frame - B.stage;

  // phone: dive in to the reply, later pull back out to the conversation
  const dive = interpolate(frame, [B.expand, B.stage + 10], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const ret = spring({frame: s - S.back, fps, config: {damping: 200}, durationInFrames: 26});
  const settle = spring({frame, fps, config: {damping: 200}, durationInFrames: 30});
  const phoneVisible = frame < B.stage + 12 || s >= S.back;
  const phoneT = s >= S.back ? 1 - ret : dive;

  const stageIn = interpolate(s, [0, 14], [0, 1], clamp);
  const stageOut = interpolate(s, [S.back - 4, S.back + 12], [0, 1], clamp);
  const quoteOut = interpolate(s, [S.insight - 8, S.insight + 6], [0, 1], clamp);

  return (
    <AbsoluteFill style={{background: colors.bg}}>
      <Backdrop />
      {phoneVisible ? (
        <AbsoluteFill
          style={{
            transform: `scale(${1.04 - 0.04 * settle + 0.9 * phoneT})`,
            transformOrigin: '430px 1040px',
            opacity: 1 - phoneT,
            filter: `blur(${phoneT * 14}px)`,
          }}
        >
          <Conversation frame={frame} />
        </AbsoluteFill>
      ) : null}

      <AbsoluteFill style={{opacity: stageIn * (1 - stageOut), transform: `scale(${1 - 0.06 * stageOut})`}}>
        <div
          style={{
            position: 'absolute',
            top: 140,
            left: 90,
            right: 90,
            textAlign: 'center',
            fontFamily: fonts.serif,
            fontStyle: 'italic',
            fontSize: 44,
            lineHeight: 1.2,
            color: colors.text,
            opacity: interpolate(s, [S.quote, S.quote + 16], [0, 1], clamp) * (1 - quoteOut),
            transform: `translateY(${interpolate(s, [0, 20], [16, 0], {...clamp, easing: Easing.out(Easing.cubic)})}px)`,
          }}
        >
          “Stop looking for business ideas.
          <br />
          Look for problems people pay to make go away.”
        </div>
        {[0, 1, 2].map((i) => (
          <SceneSlot key={i} index={i} s={s} />
        ))}
        <Insight s={s} />
      </AbsoluteFill>

      <Masthead index={3} total={5} title="The Problem Solvers" />
      <Grain />
      <FadeFromBlack frames={10} />
      <Sounds />
    </AbsoluteFill>
  );
};
