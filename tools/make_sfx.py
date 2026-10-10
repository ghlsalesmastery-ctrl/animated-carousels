#!/usr/bin/env python3
"""Synthesize every sound effect used in the carousels.

All sounds are generated procedurally from noise + oscillators, so they are
original and 100% royalty-free. Re-run with `npm run sfx` after tweaking.
Output: public/sfx/*.wav (48 kHz, 16-bit mono).
"""
import math
import os
import wave

import numpy as np

SR = 48000
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "sfx")
rng = np.random.default_rng(7)


def t_axis(dur):
    return np.arange(int(SR * dur)) / SR


def biquad(x, kind, f0, q=0.707):
    """RBJ biquad filter (lowpass / highpass / bandpass)."""
    w0 = 2 * math.pi * f0 / SR
    alpha = math.sin(w0) / (2 * q)
    cw = math.cos(w0)
    if kind == "lp":
        b = [(1 - cw) / 2, 1 - cw, (1 - cw) / 2]
    elif kind == "hp":
        b = [(1 + cw) / 2, -(1 + cw), (1 + cw) / 2]
    else:  # bandpass, constant peak gain
        b = [alpha, 0, -alpha]
    a = [1 + alpha, -2 * cw, 1 - alpha]
    b = [v / a[0] for v in b]
    a1, a2 = a[1] / a[0], a[2] / a[0]
    y = np.zeros_like(x)
    x1 = x2 = y1 = y2 = 0.0
    for i, xi in enumerate(x):
        yi = b[0] * xi + b[1] * x1 + b[2] * x2 - a1 * y1 - a2 * y2
        x2, x1, y2, y1 = x1, xi, y1, yi
        y[i] = yi
    return y


def env_exp(n, tau):
    return np.exp(-np.arange(n) / SR / tau)


def fade(x, fin=0.002, fout=0.01):
    n = len(x)
    a, b = int(fin * SR), int(fout * SR)
    if a:
        x[:a] *= np.linspace(0, 1, a)
    if b:
        x[-b:] *= np.linspace(1, 0, b)
    return x


def norm(x, peak):
    m = np.max(np.abs(x)) or 1
    return x / m * peak


def save(name, x, peak=0.8):
    x = norm(fade(x.astype(np.float64)), peak)
    data = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(os.path.join(OUT, name + ".wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


def key_click(center, body_hz, dur=0.07, tau=0.012, body=0.35):
    n = int(SR * dur)
    noise = rng.standard_normal(n)
    click = biquad(noise, "bp", center, q=1.6) * env_exp(n, tau)
    tick = biquad(noise, "hp", 5500) * env_exp(n, 0.0025) * 0.6
    t = np.arange(n) / SR
    thump = np.sin(2 * math.pi * body_hz * t) * env_exp(n, 0.009) * body
    return click + tick + thump


def tone(freq, dur, tau, harmonics=((1, 1.0),)):
    t = t_axis(dur)
    x = sum(a * np.sin(2 * math.pi * freq * h * t) * env_exp(len(t), tau / h ** 0.5)
            for h, a in harmonics)
    return x


def whoosh(dur, f_start, f_end, peak_at=0.6, q=0.9):
    n = int(SR * dur)
    noise = rng.standard_normal(n)
    # sweep by processing in short blocks with changing bandpass center
    out = np.zeros(n)
    block = 1024
    for i in range(0, n, block):
        p = i / n
        fc = f_start * (f_end / f_start) ** p
        seg = noise[max(0, i - 2048): i + block]
        filt = biquad(seg, "bp", fc, q=q)
        out[i: i + block] = filt[-len(noise[i: i + block]):]
    t = np.linspace(0, 1, n)
    env = np.where(t < peak_at, (t / peak_at) ** 2, ((1 - t) / (1 - peak_at)) ** 1.6)
    return out * env


def main():
    os.makedirs(OUT, exist_ok=True)

    # --- Keyboard: 6 slightly different soft glass-tap clicks ---------------
    for i in range(6):
        x = key_click(center=2600 + rng.uniform(-500, 500),
                      body_hz=180 + rng.uniform(-30, 30),
                      tau=0.010 + rng.uniform(-0.002, 0.003))
        save(f"key_{i + 1}", x, peak=0.55 + rng.uniform(-0.05, 0.05))

    # Space bar: deeper, a bit longer
    save("key_space", key_click(1500, 120, dur=0.09, tau=0.016, body=0.6), 0.6)
    # Backspace: lower, damped, with a tiny double transient
    bs = key_click(1900, 140, tau=0.011, body=0.5)
    bs2 = np.concatenate([np.zeros(int(0.006 * SR)), bs[: -int(0.006 * SR)]]) * 0.35
    save("key_delete", bs + bs2, 0.6)

    # --- Message send: soft rising "swoop" + airy whoosh ---------------------
    t = t_axis(0.32)
    f = 380 + (1250 - 380) * (t / t[-1]) ** 1.5
    phase = 2 * math.pi * np.cumsum(f) / SR
    env = np.sin(np.pi * np.clip(t / 0.32, 0, 1)) ** 1.5
    swoop = np.sin(phase) * env * 0.5
    air = whoosh(0.32, 900, 4200, peak_at=0.55) * 0.5
    save("send", swoop + norm(air, 0.35), 0.7)

    # --- Incoming message: gentle two-note chime ------------------------------
    bell = ((1, 1.0), (2, 0.25), (3.01, 0.08))
    a = tone(1046.5, 0.9, 0.22, bell)  # C6
    b = tone(1568.0, 0.9, 0.28, bell)  # G6
    off = int(0.085 * SR)
    chime = np.zeros(len(a) + off)
    chime[: len(a)] += a * 0.8
    chime[off:] += b
    save("receive", chime, 0.55)

    # --- Typing indicator appear: tiny soft bubble pop ------------------------
    t = t_axis(0.12)
    f = 700 + 600 * (t / t[-1])
    pop = np.sin(2 * math.pi * np.cumsum(f) / SR) * env_exp(len(t), 0.03)
    save("bubble_pop", pop, 0.4)

    # --- Soft UI tick (counters, small elements) -----------------------------
    save("tick", key_click(4200, 400, dur=0.04, tau=0.004, body=0.15), 0.4)

    # --- Transitions ----------------------------------------------------------
    save("whoosh_soft", whoosh(0.7, 300, 2400, peak_at=0.55), 0.5)
    save("whoosh_down", whoosh(0.55, 2200, 260, peak_at=0.35), 0.45)

    # Cinematic intro swell: sub sine + filtered noise bloom
    dur = 2.4
    t = t_axis(dur)
    sub = np.sin(2 * math.pi * 55 * t) * 0.6 + np.sin(2 * math.pi * 82.4 * t) * 0.3
    bloom = biquad(rng.standard_normal(len(t)), "lp", 700) * 0.5
    env = np.minimum(t / 0.9, 1) ** 2 * np.exp(-np.maximum(t - 0.9, 0) / 0.6)
    save("intro_swell", (sub + bloom) * env, 0.5)

    # Soft low "hit" for reveals
    t = t_axis(1.2)
    hit = np.sin(2 * math.pi * (70 * np.exp(-t * 3) + 45) * t) * env_exp(len(t), 0.25)
    hit += biquad(rng.standard_normal(len(t)), "lp", 1200) * env_exp(len(t), 0.05) * 0.4
    save("soft_hit", hit, 0.55)

    # --- Added for Slide 2 (appended last so earlier sounds stay identical) ---
    # Shimmer: soft glassy bell cluster for a big number landing
    dur = 1.6
    sh = np.zeros(int(SR * dur))
    for k, fr in enumerate([1318.5, 1975.5, 2637.0, 3951.1]):
        off = int(k * 0.035 * SR)
        x = tone(fr, dur, 0.45 - k * 0.07, ((1, 1.0), (2.76, 0.12)))
        sh[off:] += x[: len(sh) - off] * (0.9 - k * 0.15)
    sh += whoosh(dur, 3000, 9000, peak_at=0.08, q=0.7) * 0.15
    save("shimmer", sh, 0.45)

    # Counter tick: crisp, tiny, slightly brighter than "tick"
    save("count_tick", key_click(5200, 900, dur=0.03, tau=0.003, body=0.2), 0.35)

    print("wrote", len(os.listdir(OUT)), "files to", os.path.abspath(OUT))


if __name__ == "__main__":
    main()
