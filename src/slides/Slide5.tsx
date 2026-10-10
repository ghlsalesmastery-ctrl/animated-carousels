import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BrandSignature, BrandSounds, BRAND_T} from '../components/Brand';
import {Bubble, Receipt, Timestamp, TypingIndicator} from '../components/Chat';
import {ChatHeader, CHAT_TOP, Device, SCREEN} from '../components/Device';
import {ComposeBar} from '../components/Keyboard';
import {Backdrop, FadeFromBlack, Grain, Masthead, Sfx} from '../components/Stage';
import {clamp} from '../components/Type';
import {buildTyping} from '../lib/typing';
import {colors, ensureFonts, FPS} from '../theme';
import {QUESTION} from './Slide1';

ensureFonts();

// ---------------------------------------------------------------------------
// SLIDE 5 — THE FINAL QUESTION
// The conversation closes on a question to the viewer, the brand signs off,
// and the composer starts a new question — looping back to Slide 1.
// ---------------------------------------------------------------------------
const FINAL_Q = 'What would it be?';

const B = {
  m1: 12,
  dots1: 50,
  m2: 76,
  dots2: 120,
  m3: 140,
  shift: 222, // chat glides up to make room for the signature
  brand: 236,
};
const WORD_GAP = 5;
const caretOn = B.brand + BRAND_T.done - 6;
// The next question begins (echoes "What business..." from Slide 1)
const nextTyping = buildTyping([{type: 'What', speed: 0.11}], {fps: FPS, startFrame: caretOn + 22, seed: 3});
// tail chosen so the very last frame lands on a visible caret blink
export const SLIDE5_DURATION = nextTyping.endFrame + 45;

// Words of the final question rise in one by one inside the bubble.
const WordReveal: React.FC<{text: string; at: number}> = ({text, at}) => {
  const frame = useCurrentFrame();
  return (
    <span>
      {text.split(' ').map((w, i) => {
        const p = interpolate(frame, [at + i * WORD_GAP, at + i * WORD_GAP + 8], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
        return (
          <span key={i} style={{display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 14}px)`, marginRight: '0.26em'}}>
            {w}
          </span>
        );
      })}
    </span>
  );
};

const Conversation: React.FC = () => {
  const frame = useCurrentFrame();
  const typed = nextTyping.textAt(frame);
  return (
    <Device>
      <ChatHeader />
      <div style={{position: 'absolute', top: CHAT_TOP, left: 0, width: SCREEN.w, height: SCREEN.h - CHAT_TOP, display: 'flex', flexDirection: 'column'}}>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 18, padding: '0 32px 18px', overflow: 'hidden'}}>
          {/* earlier conversation, which scrolls up as new messages arrive */}
          <Timestamp label="Today 9:41 PM" />
          <Bubble side="out" at={-200}>
            {QUESTION}
          </Bubble>
          <Receipt at={-200} label="Read 9:42 PM" />
          <Bubble side="in" at={-200}>Learn Facebook ads.</Bubble>
          <Bubble side="in" at={-200}>That's a business too.</Bubble>
          {/* the close */}
          <Bubble side="in" at={B.m1}>Different businesses. Different risks.</Bubble>
          {frame >= B.dots1 && frame < B.m2 ? <TypingIndicator at={B.dots1} /> : null}
          <Bubble side="in" at={B.m2}>
            But if you had to start <span style={{fontWeight: 700, color: colors.gold}}>ONE</span> business tomorrow...
          </Bubble>
          {frame >= B.dots2 && frame < B.m3 ? <TypingIndicator at={B.dots2} /> : null}
          <Bubble side="in" at={B.m3} style={{fontSize: 54, fontWeight: 600, letterSpacing: -0.8, padding: '26px 40px 30px'}}>
            <WordReveal text={FINAL_Q} at={B.m3 + 3} />
          </Bubble>
        </div>
        <ComposeBar text={typed} lastKeyFrame={nextTyping.lastEventBefore(frame)?.frame ?? caretOn} showCaret={frame >= caretOn} />
        <div style={{height: 40, flexShrink: 0}} />
      </div>
    </Device>
  );
};

const KEY_SOUNDS = ['key_1', 'key_2', 'key_3', 'key_4', 'key_5', 'key_6'];
const Sounds: React.FC = () => (
  <>
    <Sfx name="receive" at={B.m1} volume={0.55} frames={30} />
    <Sfx name="bubble_pop" at={B.dots1} volume={0.32} frames={8} />
    <Sfx name="receive" at={B.m2} volume={0.55} frames={30} />
    <Sfx name="bubble_pop" at={B.dots2} volume={0.32} frames={8} />
    <Sfx name="receive" at={B.m3} volume={0.6} frames={30} />
    {FINAL_Q.split(' ').map((_, i) => (
      <Sfx key={i} name="tick" at={B.m3 + 3 + i * WORD_GAP} volume={0.22} frames={4} />
    ))}
    <Sfx name="whoosh_soft" at={B.shift - 2} volume={0.2} frames={22} />
    <BrandSounds start={B.brand} />
    {nextTyping.events.map((e, i) => (
      <Sfx key={`k${i}`} name={KEY_SOUNDS[(i * 5) % 6]} at={e.frame} volume={0.42} frames={6} />
    ))}
  </>
);

// ---------------------------------------------------------------------------
const SHIFT = 400;
export const Slide5: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const settle = spring({frame, fps, config: {damping: 200}, durationInFrames: 30});
  // linger: slow push while the question sits with the viewer
  const linger = interpolate(frame, [B.m3, B.shift], [0, 1], {...clamp, easing: Easing.inOut(Easing.sin)});
  const sh = spring({frame: frame - B.shift, fps, config: {damping: 200}, durationInFrames: 34});
  const zoom = 1.04 - 0.04 * settle + 0.03 * linger * (1 - sh);
  const y = -SHIFT * sh;
  // once shifted, fade the phone's top (under the masthead) and its cut-off bottom edge into the background
  const edge = 1318 - SHIFT * sh; // just below the composer
  // signature dims slightly when the composer takes focus again
  const dim = interpolate(frame, [caretOn, caretOn + 20], [0, 0.25], clamp);

  return (
    <AbsoluteFill style={{background: colors.bg}}>
      <Backdrop />
      <AbsoluteFill style={{transform: `translateY(${y}px) scale(${zoom})`, transformOrigin: '50% 90%'}}>
        <Conversation />
      </AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 300,
          opacity: sh,
          background: `linear-gradient(180deg, ${colors.bg} 0%, ${colors.bg} 34%, rgba(6,6,8,0) 100%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: edge,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: sh,
          background: `linear-gradient(180deg, rgba(6,6,8,0) 0px, ${colors.bg} 34px)`,
        }}
      />
      <div style={{position: 'absolute', top: 1350 - SHIFT + 6, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <BrandSignature start={B.brand} dim={dim} />
      </div>
      <Masthead index={5} total={5} title="The Final Question" />
      <Grain />
      <FadeFromBlack frames={10} />
      <Sounds />
    </AbsoluteFill>
  );
};
