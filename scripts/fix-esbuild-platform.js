const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const platform = process.platform;
const arch = process.arch;

const needed = platform === 'darwin' && arch === 'arm64' ? 'darwin-arm64'
  : platform === 'darwin' && arch === 'x64' ? 'darwin-x64'
  : platform === 'win32' && arch === 'x64' ? 'win32-x64'
  : platform === 'win32' && arch === 'arm64' ? 'win32-arm64'
  : platform === 'linux' && arch === 'x64' ? 'linux-x64'
  : platform === 'linux' && arch === 'arm64' ? 'linux-arm64'
  : null;

if (!needed) {
  process.exit(0);
}

const root = path.join(__dirname, '..');

function cleanEsbuildDir(esbuildDir) {
  if (!fs.existsSync(esbuildDir)) return false;
  let removed = false;
  for (const name of fs.readdirSync(esbuildDir)) {
    if (name.startsWith('.') || name === needed) continue;
    const full = path.join(esbuildDir, name);
    if (fs.statSync(full).isDirectory()) {
      fs.rmSync(full, { recursive: true });
      removed = true;
    }
  }
  return removed;
}

// Root node_modules/@esbuild
const rootEsbuild = path.join(root, 'node_modules', '@esbuild');
cleanEsbuildDir(rootEsbuild);

// Nested node_modules (e.g. dependency's node_modules/@esbuild)
const nm = path.join(root, 'node_modules');
if (fs.existsSync(nm)) {
  for (const pkg of fs.readdirSync(nm)) {
    const nested = path.join(nm, pkg, 'node_modules', '@esbuild');
    cleanEsbuildDir(nested);
  }
}

const targetPkg = path.join(rootEsbuild, needed);
if (!fs.existsSync(targetPkg)) {
  try {
    execSync(`npm install @esbuild/${needed}@0.25.4 --no-save --legacy-peer-deps`, {
      stdio: 'inherit',
      cwd: root,
    });
  } catch (_) {}
}
