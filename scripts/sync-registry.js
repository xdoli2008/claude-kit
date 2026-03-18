#!/usr/bin/env node
/**
 * sync-registry.js
 * 递归扫描所有 .meta.json，合并生成 registry.json
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function findMetaFiles(dir, results = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      findMetaFiles(full, results);
    } else if (entry === '.meta.json') {
      results.push(full);
    }
  }
  return results;
}

const metaFiles = findMetaFiles(ROOT).filter(f => !f.includes('node_modules'));

const items = metaFiles.map(f => {
  const meta = JSON.parse(readFileSync(f, 'utf-8'));
  meta.path = relative(ROOT, dirname(f)).replace(/\\/g, '/');
  return meta;
});

const registry = {
  version: '1.0.0',
  generated_at: new Date().toISOString(),
  items,
};

writeFileSync(join(ROOT, 'registry.json'), JSON.stringify(registry, null, 2), 'utf-8');
console.log(`✅ registry.json 已生成，共 ${items.length} 条目`);
