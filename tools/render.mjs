// Render slides to renders/slide-XX.mp4
//   npm run render            → all slides
//   npm run render -- Slide2  → one slide
// Output: renders/carousel-<issue>-slide-XX.mp4
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, renameSync} from 'node:fs';

const ISSUE = '001';
const all = ['Slide1', 'Slide2', 'Slide3', 'Slide4', 'Slide5'];
const requested = process.argv.slice(2);
const ids = requested.length ? requested : all;

// Use a preinstalled Chromium if one exists (cloud container); otherwise Remotion downloads its own.
const localShell = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const browserArgs = existsSync(localShell) ? [`--browser-executable=${localShell}`] : [];

const available = execFileSync('npx', ['remotion', 'compositions', 'src/index.ts', '--quiet', ...browserArgs], {encoding: 'utf8'})
  .split(/\s+/)
  .filter(Boolean);

mkdirSync('renders', {recursive: true});
for (const id of ids) {
  if (!available.includes(id)) {
    console.log(`skip ${id} (not built yet)`);
    continue;
  }
  const n = id.replace('Slide', '').padStart(2, '0');
  const out = `renders/carousel-${ISSUE}-slide-${n}.mp4`;
  console.log(`\n▶ ${id} → ${out}`);
  const raw = `out/${id}-raw.mp4`;
  execFileSync('npx', ['remotion', 'render', 'src/index.ts', id, raw, ...browserArgs], {stdio: 'inherit'});
  // Loudness-normalise the sound design for phones (-16 LUFS, -1.5 dBTP); video stream is copied untouched.
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', raw, '-c:v', 'copy', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', `${out}.tmp.mp4`]);
  renameSync(`${out}.tmp.mp4`, out);
  console.log(`✓ ${out}`);
}
