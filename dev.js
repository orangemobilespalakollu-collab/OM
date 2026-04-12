import { spawn } from 'child_process';

const args = process.argv.slice(2);
const filteredArgs = [];

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--host') {
    filteredArgs.push('--hostname');
  } else if (arg === '--port') {
    filteredArgs.push('--port');
  } else {
    filteredArgs.push(arg);
  }
}

// Ensure it listens on 0.0.0.0 and port 3000 if not specified
if (!filteredArgs.includes('--hostname') && !filteredArgs.includes('-H')) {
  filteredArgs.push('--hostname', '0.0.0.0');
}
if (!filteredArgs.includes('--port') && !filteredArgs.includes('-p')) {
  filteredArgs.push('--port', '3000');
}

const next = spawn('npx', ['next', 'dev', ...filteredArgs], {
  stdio: 'inherit',
  shell: true
});

next.on('exit', (code) => {
  process.exit(code);
});
