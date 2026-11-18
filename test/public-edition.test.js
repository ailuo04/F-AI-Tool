'use strict';

const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const pkg = require('../package.json');

test('public installer and update artifacts have independent identities', () => {
  const { build } = pkg;
  assert.equal(build.appId, 'com.ailuo.gptplus.public');
  assert.equal(pkg.productName, 'F-AI Tool');
  assert.equal(build.executableName, 'F-AI-Tool');
  assert.equal(build.nsis.shortcutName, 'F-AI Tool');
  assert.equal(build.nsis.oneClick, true, 'must not enter the assisted installer UAC path');
  assert.equal(build.nsis.perMachine, false);
  assert.equal(build.nsis.allowToChangeInstallationDirectory, false);
  assert.equal(build.publish.repo, 'F-AI-Tool');
  assert.equal(build.publish.updaterCacheDirName, 'gptplus-public-updater');
  const edition = require('../src/edition.js');
  assert.equal(edition.APP_ID, build.appId);
  assert.equal(edition.UPDATER_CACHE_DIR, build.publish.updaterCacheDirName);
  assert.equal(edition.RELEASE_REPO, build.publish.repo);
  const { releaseArtifacts } = require('../tools/verify-signature.cjs');
  assert.deepEqual(releaseArtifacts().map((file) => path.basename(file)), [
    `F-AI-Tool-${pkg.version}-setup.exe`, 'F-AI-Tool.exe',
  ]);
});

test('the desktop window and sidebar display the public name', () => {
  const html = fs.readFileSync(path.join(__dirname, '../src/renderer/index.html'), 'utf8');
  assert.match(html, /<title>F-AI Tool<\/title>/);
  assert.match(html, /<strong>F-AI Tool<\/strong>/);
});

test('public config ignores legacy overrides and detects private profiles', (t) => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'gptplus-public-test-'));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));
  const legacy = path.join(home, 'legacy-custom');
  fs.mkdirSync(legacy);
  fs.writeFileSync(path.join(legacy, 'config.json'), 'unchanged');
  const loadProfile = (env) => {
    const result = spawnSync(process.execPath, ['-e', `
      const paths = require('./src/core/paths.js');
      process.stdout.write(JSON.stringify({ app: paths.APP_DIR, hasPrivateProfile: paths.hasPrivateProfile() }));
    `], {
      cwd: path.join(__dirname, '..'), encoding: 'utf8',
      env: { ...process.env, HOME: home, USERPROFILE: home, GPTPLUS_PUBLIC_HOME: '', GPTPLUS_HOME: '', ...env },
    });
    assert.equal(result.status, 0, result.stderr);
    return JSON.parse(result.stdout);
  };
  const publicDir = path.join(home, '.gptplus-public');
  assert.deepEqual(loadProfile({ GPTPLUS_HOME: legacy }), { app: publicDir, hasPrivateProfile: true });
  assert.deepEqual(loadProfile({}), { app: publicDir, hasPrivateProfile: false });
  fs.mkdirSync(path.join(home, '.gptplus'));
  assert.deepEqual(loadProfile({}), { app: publicDir, hasPrivateProfile: true });
  assert.equal(fs.readFileSync(path.join(legacy, 'config.json'), 'utf8'), 'unchanged');
  assert.equal(fs.existsSync(publicDir), false);
});
