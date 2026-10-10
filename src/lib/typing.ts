// Deterministic "human" typing engine.
// Turns a script of type / pause / delete steps into per-keystroke events with
// natural variable timing. The same events drive the visible text, the cursor,
// the on-screen keyboard and the click sounds, so everything stays in sync.

export type TypingStep =
  | {type: string; speed?: number; thinkAfter?: Record<string, number>}
  | {pause: number}
  | {erase: number; speed?: number}
  | {eraseAll: true; speed?: number};

export type KeyEvent = {
  frame: number;
  key: string; // the character typed, or 'DELETE'
  text: string; // full text after this keystroke
};

export type TypingTimeline = {
  events: KeyEvent[];
  endFrame: number;
  textAt: (frame: number) => string;
  lastEventBefore: (frame: number) => KeyEvent | undefined;
};

// Small seeded PRNG so renders are identical every time.
const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const buildTyping = (
  steps: TypingStep[],
  {fps, startFrame = 0, seed = 1}: {fps: number; startFrame?: number; seed?: number},
): TypingTimeline => {
  const rand = mulberry32(seed);
  const events: KeyEvent[] = [];
  let t = startFrame / fps; // seconds
  let text = '';
  let lastFrame = -1;

  const push = (key: string) => {
    // never put two keystrokes on the same frame (keeps sounds & key pops clean)
    let frame = Math.round(t * fps);
    if (frame <= lastFrame) frame = lastFrame + 1;
    lastFrame = frame;
    t = Math.max(t, frame / fps);
    events.push({frame, key, text});
  };

  for (const step of steps) {
    if ('pause' in step) {
      t += step.pause;
    } else if ('type' in step) {
      const base = step.speed ?? 0.068;
      const chars = [...step.type];
      chars.forEach((ch, i) => {
        const prev = chars[i - 1];
        let d = base * (0.65 + rand() * 0.75);
        if (prev === ' ') d += base * (0.25 + rand() * 0.6); // start of a word
        if (ch === ' ') d *= 0.8;
        if (ch === '.' && prev === '.') d = base * 0.75; // rhythmic "..."
        if (ch !== ch.toLowerCase()) d += 0.09; // reaching for shift
        if (i === 0) d = 0;
        t += d;
        text += ch;
        push(ch);
        const typedSoFar = step.type.slice(0, i + 1);
        for (const [phrase, hold] of Object.entries(step.thinkAfter ?? {})) {
          if (typedSoFar.endsWith(phrase)) t += hold;
        }
      });
    } else {
      const count = 'eraseAll' in step ? text.length : step.erase;
      const base = step.speed ?? 0.075;
      for (let i = 0; i < count; i++) {
        // holding delete: starts deliberate, then accelerates
        const accel = 'eraseAll' in step ? Math.max(0.38, 1 - i * 0.045) : Math.max(0.6, 1 - i * 0.03);
        t += i === 0 ? 0 : base * accel * (0.9 + rand() * 0.2);
        text = text.slice(0, -1);
        push('DELETE');
      }
    }
  }

  const endFrame = Math.round(t * fps);
  const lastEventBefore = (frame: number) => {
    let found: KeyEvent | undefined;
    for (const e of events) {
      if (e.frame <= frame) found = e;
      else break;
    }
    return found;
  };
  return {
    events,
    endFrame,
    lastEventBefore,
    textAt: (frame: number) => lastEventBefore(frame)?.text ?? '',
  };
};
