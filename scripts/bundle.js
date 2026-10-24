/**
 * Zero-dependency ES6 Module Bundler.
 * Packages foundation modules into standalone app.js.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const moduleFiles = [
  'src/core/EventBus.js',
  'src/core/DeviceDetector.js',
  'src/core/StorageManager.js',
  'src/hardware/AudioHaptics.js',
  'src/hardware/WakeLockService.js',
  'src/hardware/ShareService.js',
  'src/hardware/BadgeService.js',
  'src/hardware/CameraService.js',
  'src/ui/BottomSheet.js',
  'src/ui/SegmentedControl.js',
  'src/ui/InsetGroup.js',
  'src/ui/Toast.js',
  'src/ui/LegalNoticeSheet.js',
  'src/main.js',
];

let bundledContent = `/**
 * iOS PWA Foundation - Bundled Runtime
 * 100% Zero Runtime Dependencies • Procedural Audio & WebKit Bridges
 * Generated: ${new Date().toISOString()}
 */
(() => {
  'use strict';
`;

for (const relPath of moduleFiles) {
  const fullPath = path.join(rootDir, relPath);
  let content = fs.readFileSync(fullPath, 'utf8');

  // Strip import statements
  content = content.replace(/^import\s+.*?;?\s*$/gm, '');

  // Strip export keywords
  content = content.replace(/^export\s+(class|const|function|let|var)\s+/gm, '$1 ');
  content = content.replace(/^export\s*\{[^}]*\};?\s*$/gm, '');

  bundledContent += `\n  // --- ${relPath} ---\n` + content + '\n';
}

bundledContent += `\n})();\n`;

const outputPath = path.join(rootDir, 'app.js');
fs.writeFileSync(outputPath, bundledContent, 'utf8');
console.log(`Successfully bundled ${moduleFiles.length} foundation modules into app.js`);
