const { spawn } = require('child_process');
const path = require('path');

const mainScript = path.join(__dirname, '..', 'dist', 'main.js');

function startServer() {
  console.log('[ServerRunner] Starting NestJS production server (node dist/main)...');
  const child = spawn('node', [mainScript], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: process.env,
  });

  child.on('exit', (code, signal) => {
    console.error(`[ServerRunner] Server exited with code: ${code}, signal: ${signal}. Auto-restarting in 1s...`);
    setTimeout(startServer, 1000);
  });

  child.on('error', (err) => {
    console.error('[ServerRunner] Process error:', err.message);
  });
}

startServer();
