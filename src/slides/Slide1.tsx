import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Bubble, Receipt, Timestamp, TypingIndicator} from '../components/Chat';
import {ChatHeader, CHAT_TOP, Device, SCREEN} from '../components/Device';
import {ComposeBar, Keyboard, KEYBOARD_H} from '../components/Keyboard';
import {Backdrop, FadeFromBlack, Grain, Masthead, Sfx} from '../components/Stage';
import {buildTyping} from '../lib/typing';
import {colors, ensureFonts, FPS} from '../theme';

ensureFonts();

// ---------------------------------------------------------------------------
// SLIDE 1 — THE QUESTION
// Edit the script below to change what gets typed, deleted and when.
// ---------------------------------------------------------------------------
export const QUESTION = 'Name a business that will always make money regardless of how bad the economy gets';

const typing = buildTyping(
  [
    {type: 'What business makes money...', speed: 0.07},
    {pause: 0.85},
    {erase: 'makes money...'.length},
    {pause: 0.45},
    {type: 'survives a recession...', speed: 0.068},
    {pause: 0.95},
    {eraseAll: true},
    {pause: 0.65},
    {
      type: QUESTION,
      speed: 0.058,
      thinkAfter: {'Name a business': 0.28, 'make money': 0.38, 'regardless of': 0.22},
    },
  ],
  {fps: FPS, startFrame: 34, seed: 11},
);

// Beats (frames)
const T = {
  typingStart: typing.events[0].frame,
  send: typing.endFrame + 24, // brief hesitation, then send
};
const B = {
  ...T,
  kbDown: T.send + 12,
  delivered: T.send + 20,
  dots: T.send + 40,
};
export const SLIDE1_DURATION = B.dots + 90;

const KEY_SOUNDS = ['key_1', 'key_2', 'key_3', 'key_4', 'key_5', 'key_6'];

const Sounds: React.FC = () => (
  <>
    <Sfx name="intro_swell" at={0} volume={0.55} frames={75} />
    {typing.events.map((e, i) => (
      <Sfx
        key={i}
        at={e.frame}
        frames={6}
        name={e.key === 'DELETE' ? 'key_delete' : e.key === ' ' ? 'key_space' : KEY_SOUNDS[(i * 7 + e.text.length) % 6]}
        volume={e.key === 'DELETE' ? 0.5 : 0.42 + ((i * 13) % 5) * 0.03}
      />
    ))}
    <Sfx name="send" at={B.send} volume={0.7} frames={15} />
    <Sfx name="whoosh_down" at={B.kbDown} volume={0.18} frames={20} />
    <Sfx name="bubble_pop" at={B.dots} volume={0.5} frames={8} />
  </>
);

export const Slide1: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sent = frame >= B.send;
  const text = sent ? '' : typing.textAt(frame);
  const lastKey = typing.lastEventBefore(frame)?.frame ?? -100;

  // Device entrance
  const enter = spring({frame, fps, config: {damping: 200}, durationInFrames: 40});
  // Camera: slow push toward the compose field while typing, release on send
  const push = interpolate(frame, [T.typingStart, B.send], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });
  const release = spring({frame: frame - B.send, fps, config: {damping: 200}, durationInFrames: 35});
  // ...then a slow drift in on the sent question while the reply is "typing"
  const settle = interpolate(frame, [B.send + 20, SLIDE1_DURATION], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });
  const zoom = 1 + 0.045 * push * (1 - release) + (1 - enter) * 0.05 + 0.04 * settle;
  const camY = (1 - enter) * 60;

  // Keyboard dismisses after send
  const kb = spring({frame: frame - B.kbDown, fps, config: {damping: 200}, durationInFrames: 22});
  const kbOffset = kb * KEYBOARD_H;

  return (
    <AbsoluteFill style={{background: colors.bg}}>
      <Backdrop />
      <Masthead index={1} total={5} title="The Question" delay={6} />
      <AbsoluteFill
        style={{
          transform: `translateY(${camY}px) scale(${zoom})`,
          transformOrigin: '50% 78%',
        }}
      >
        <Device>
          <ChatHeader />
          {/* chat column + compose bar + keyboard spacer */}
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
              {sent ? (
                <>
                  <Bubble side="out" at={B.send} flyFrom={150}>
                    {QUESTION}
                  </Bubble>
                  <Receipt at={B.delivered} />
                  <TypingIndicator at={B.dots} />
                </>
              ) : null}
            </div>
            <ComposeBar text={text} lastKeyFrame={sent ? B.send : lastKey} sendPressAt={B.send - 2} showCaret={frame < B.kbDown} />
            <div style={{height: Math.max(40, KEYBOARD_H - kbOffset), flexShrink: 0}} />
          </div>
          <Keyboard typing={typing} offset={kbOffset} />
        </Device>
      </AbsoluteFill>

      <Grain />
      <FadeFromBlack />
      <Sounds />
    </AbsoluteFill>
  );
};
