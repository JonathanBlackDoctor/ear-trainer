/* Renders scene.html deterministically into PNG frames (2× = 2000×1250).
   Usage: node render.mjs [fps] [seconds]                                 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, writeFileSync, rmSync } from 'fs';

const __dir = dirname(fileURLToPath(import.meta.url));
const FPS = Number(process.argv[2] || 30);
const SECS = Number(process.argv[3] || 5);
const FRAMES = Math.round(FPS * SECS);
const outDir = join(__dir, 'frames');
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ args: ['--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: 1000, height: 660 }, deviceScaleFactor: 1 });
await page.goto('file://' + join(__dir, 'scene.html') + '?static=1');
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => typeof window.renderFrame === 'function');

for (let i = 0; i < FRAMES; i++) {
  const phase = i / FRAMES;                       // [0,1) → seamless
  const dataURL = await page.evaluate((p) => {
    window.renderFrame(p);
    return document.getElementById('c').toDataURL('image/png');
  }, phase);
  const b64 = dataURL.split(',')[1];
  const name = `frame_${String(i).padStart(4, '0')}.png`;
  writeFileSync(join(outDir, name), Buffer.from(b64, 'base64'));
  if (i % 30 === 0) process.stdout.write(`  frame ${i}/${FRAMES}\r`);
}
await browser.close();
console.log(`\n✓ wrote ${FRAMES} frames @ ${FPS}fps to ${outDir}`);
