const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const tempDistDir = path.join(require('os').tmpdir(), 'musicdna_gh_dist_' + Date.now());

console.log('============================================');
console.log('  MUSIC DNA ANALYZER - DEPLOY GH-PAGES      ');
console.log('============================================');

// 1. Build dist
console.log('\n[1/5] Building distribution assets...');
execSync('npm.cmd run build', { cwd: rootDir, stdio: 'inherit' });

// Ensure 404.html and .nojekyll exist
fs.copyFileSync(path.join(distDir, 'index.html'), path.join(distDir, '404.html'));
fs.writeFileSync(path.join(distDir, '.nojekyll'), '');

// 2. Backup dist
console.log('\n[2/5] Backing up dist to temporary directory:', tempDistDir);
fs.cpSync(distDir, tempDistDir, { recursive: true });

// 3. Switch to or create gh-pages branch
console.log('\n[3/5] Switching to branch gh-pages...');
try {
  execSync('git checkout gh-pages', { cwd: rootDir, stdio: 'inherit' });
} catch {
  console.log('[Deploy] Creating branch gh-pages...');
  execSync('git checkout -b gh-pages', { cwd: rootDir, stdio: 'inherit' });
}

// 4. Copy files from backup to root
console.log('\n[4/5] Copying web distribution assets into gh-pages...');
fs.cpSync(tempDistDir, rootDir, { recursive: true });

// 5. Staging only distribution files
console.log('\n[5/5] Staging distribution files...');
const filesToStage = ['index.html', '404.html', '.nojekyll', 'assets'];

for (const file of filesToStage) {
  if (fs.existsSync(path.join(rootDir, file))) {
    execSync(`git add "${file}"`, { cwd: rootDir, stdio: 'inherit' });
  }
}

try {
  execSync('git commit -m "deploy: update GitHub Pages build for final release v1.0.2 Pro"', {
    cwd: rootDir,
    stdio: 'inherit',
  });
  console.log('[Deploy] Successfully committed gh-pages assets.');
} catch (err) {
  console.log('[Deploy] No new changes to commit on gh-pages.');
}

// Push to origin if remote is configured
try {
  const remotes = execSync('git remote', { cwd: rootDir, encoding: 'utf-8' });
  if (remotes.includes('origin')) {
    console.log('[Deploy] Pushing to origin gh-pages...');
    execSync('git push -u origin gh-pages', { cwd: rootDir, stdio: 'inherit' });
    console.log('\n============================================');
    console.log('[Deploy] GitHub Pages PUSH SUCCESSFUL!');
    console.log('============================================\n');
  } else {
    console.log('[Deploy] Remote origin not set yet. Skipped remote push.');
  }
} catch (err) {
  console.warn('[Deploy] Remote push skipped or failed:', err.message);
} finally {
  console.log('[Deploy] Switching back to main...');
  execSync('git checkout main', { cwd: rootDir, stdio: 'inherit' });
  if (fs.existsSync(tempDistDir)) {
    fs.rmSync(tempDistDir, { recursive: true, force: true });
  }
}
