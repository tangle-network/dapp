const { spawn } = require('child_process');
let builderProcess = spawn('yarn', ['build:dapp:production::unwrapped']);
builderProcess.stdout.on('data', (data) => {
  process.stdout.write(data);
});
builderProcess.stderr.on('data', (data) => {
  process.stderr.write(data);
});
