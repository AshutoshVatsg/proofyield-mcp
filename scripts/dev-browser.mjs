import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createServer } from 'node:net';

const npmCliPath = process.env.npm_execpath;
if (!npmCliPath) {
  process.stderr.write('Unable to locate the npm CLI. Start this workflow with npm run dev.\n');
  process.exit(1);
}

function npmProcess(args, options = {}) {
  return spawn(process.execPath, [npmCliPath, ...args], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: false,
    ...options,
  });
}

function requireAvailablePort(port) {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.unref();
    probe.once('error', (error) => {
      if (error?.code === 'EADDRINUSE') {
        reject(new Error(
          `Port ${port} is already in use. Stop the existing ProofYield development process, `
          + `or find it with: Get-NetTCPConnection -State Listen -LocalPort ${port}`,
        ));
        return;
      }
      reject(error);
    });
    probe.listen({ port }, () => probe.close(resolve));
  });
}

try {
  await Promise.all([requireAvailablePort(3000), requireAvailablePort(3001)]);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
}

if (!existsSync('dist/index.js')) {
  process.stderr.write('The development bundle is missing. Run npm run build once, then retry npm run dev.\n');
  process.exit(1);
}

const widgetExportExists = existsSync('src/widgets/out/proofyield-dashboard/index.html')
  || existsSync('src/widgets/out/proofyield-dashboard.html');
if (!widgetExportExists) {
  process.stdout.write('Regenerating the missing standalone widget export...\n');
  const widgetBuild = spawnSync(
    process.execPath,
    [npmCliPath, '--prefix', 'src/widgets', 'run', 'build'],
    { cwd: process.cwd(), stdio: 'inherit', shell: false },
  );
  if (widgetBuild.status !== 0) process.exit(widgetBuild.status ?? 1);
}

const widgetDev = npmProcess(['--prefix', 'src/widgets', 'run', 'dev']);
const browserMcp = spawn(process.execPath, ['dist/index.js'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: false,
  env: {
    ...process.env,
    MCP_TRANSPORT_TYPE: 'http',
    PORT: '3000',
    HOST: 'localhost',
    ENABLE_CORS: 'true',
  },
});

let stopping = false;
let desiredExitCode = 0;

function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  desiredExitCode = exitCode;
  if (widgetDev.exitCode === null) widgetDev.kill('SIGTERM');
  if (browserMcp.exitCode === null) browserMcp.kill('SIGTERM');
  setTimeout(() => process.exit(desiredExitCode), 1_000).unref();
}

widgetDev.on('exit', (code) => {
  if (!stopping) {
    process.stderr.write(`Widget development process stopped unexpectedly (${code ?? 'unknown'}).\n`);
    stop(code ?? 1);
  }
});
browserMcp.on('exit', (code) => {
  if (!stopping) {
    process.stderr.write(`Browser MCP process stopped unexpectedly (${code ?? 'unknown'}).\n`);
    stop(code ?? 1);
  }
});

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));

async function reportBrowserMcpReady() {
  for (let attempt = 0; attempt < 40 && !stopping; attempt++) {
    try {
      const [mcpResponse, widgetResponse] = await Promise.all([
        fetch('http://localhost:3000/mcp/health'),
        fetch('http://localhost:3001/proofyield-dashboard'),
      ]);
      if (mcpResponse.ok && widgetResponse.ok && browserMcp.exitCode === null && widgetDev.exitCode === null) {
        process.stdout.write('\nProofYield browser mode ready:\n');
        process.stdout.write('  Dashboard:   http://localhost:3001/proofyield-dashboard\n');
        process.stdout.write('  Browser MCP: http://localhost:3000/mcp\n\n');
        return;
      }
    } catch {
      // The HTTP-only process is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  if (!stopping) {
    process.stderr.write('ProofYield browser mode did not become ready on ports 3000 and 3001.\n');
    stop(1);
  }
}

void reportBrowserMcpReady();
