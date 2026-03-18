#!/usr/bin/env node
/**
 * update.js
 * 检查 github / marketplace 来源条目是否有新版本
 * pinned: true 的条目跳过
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const REGISTRY = join(ROOT, 'registry.json');

const registry = JSON.parse(readFileSync(REGISTRY, 'utf-8'));

async function checkGithub(item) {
  if (!item.repo) return null;
  // 解析 owner/repo
  const match = item.repo.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  const [, owner, repo] = match;
  const url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'claude-kit-updater' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.tag_name || null;
  } catch {
    return null;
  }
}

const updates = [];

for (const item of registry.items) {
  if (item.pinned) {
    console.log(`⏭  跳过 ${item.name}（已固定）`);
    continue;
  }
  if (item.source === 'github') {
    const latest = await checkGithub(item);
    if (latest && latest !== item.version) {
      updates.push({ name: item.name, path: item.path, current: item.version, latest });
      console.log(`🔄 ${item.name}: ${item.version} → ${latest}`);
    } else {
      console.log(`✅ ${item.name}: 已是最新 (${item.version})`);
    }
  } else if (item.source === 'marketplace') {
    console.log(`⚠️  ${item.name}: marketplace 来源，暂不支持自动检查`);
  } else {
    console.log(`⏭  跳过 ${item.name}（来源: ${item.source}，手动维护）`);
  }
}

if (updates.length > 0) {
  console.log('\n📋 需要更新的条目：');
  for (const u of updates) {
    console.log(`  ${u.name} (${u.path}): ${u.current} → ${u.latest}`);
  }
  console.log('\n运行对应目录的更新脚本或手动下载新版本。');
} else {
  console.log('\n✅ 所有条目均为最新。');
}
