import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const node = process.execPath;
const children = [
  spawn(node, ['backend/server.js'], { cwd: root, stdio: 'inherit' }),
  spawn(node, ['node_modules/vite/bin/vite.js', 'frontend', '--config', 'frontend/vite.config.ts', '--host', '0.0.0.0'], {
    cwd: root,
    stdio: 'inherit',
  }),
];

const stop = () => {
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM');
  }
};

process.on('SIGINT', stop);
process.on('SIGTERM', stop);

for (const child of children) {
  child.on('exit', (code) => {
    if (code && code !== 0) process.exitCode = code;
    stop();
  });
}
