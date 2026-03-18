const SOURCE_LABELS = {
  self: '✏️ 自建',
  github: '🐙 GitHub',
  marketplace: '🔌 官方',
  community: '👥 社区',
  zip: '📦 zip',
};

let allItems = [];

async function loadRegistry() {
  const res = await fetch('/registry.json');
  const data = await res.json();
  allItems = data.items || [];
  render();
}

function matchItem(item, query, type, category, source) {
  if (type && item.type !== type) return false;
  if (category && item.category !== category) return false;
  if (source && item.source !== source) return false;
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    (item.name || '').toLowerCase().includes(q) ||
    (item.description_zh || '').toLowerCase().includes(q) ||
    (item.category || '').toLowerCase().includes(q) ||
    (item.triggers || []).some(t => t.toLowerCase().includes(q))
  );
}

function render() {
  const query = document.getElementById('search').value.trim();
  const type = document.getElementById('filter-type').value;
  const category = document.getElementById('filter-category').value;
  const source = document.getElementById('filter-source').value;

  const filtered = allItems.filter(i => matchItem(i, query, type, category, source));

  document.getElementById('stats').textContent =
    `共 ${allItems.length} 条目，当前显示 ${filtered.length} 条`;

  const grid = document.getElementById('grid');
  const empty = document.getElementById('empty');

  if (filtered.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  grid.innerHTML = filtered.map(item => cardHTML(item)).join('');

  grid.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const path = btn.dataset.path;
      navigator.clipboard.writeText(path).then(() => {
        btn.textContent = '已复制';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = '复制路径';
          btn.classList.remove('copied');
        }, 1500);
      });
    });
  });
}

function cardHTML(item) {
  const typeClass = `badge-type-${item.type || 'skill'}`;
  const triggers = (item.triggers || [])
    .map(t => `<span class="trigger-tag">${t}</span>`)
    .join('');
  const customized = item.customized
    ? `<span class="customized-badge">已改造</span>`
    : '';
  const version = item.version ? `<span class="source-label">v${item.version}</span>` : '';
  const sourceLabel = SOURCE_LABELS[item.source] || item.source || '';

  return `
<div class="card">
  <div class="card-header">
    <span class="card-name">${item.name || ''}</span>
    <span class="badge ${typeClass}">${item.type || ''}</span>
  </div>
  <div class="card-desc">${item.description_zh || ''}</div>
  ${triggers ? `<div class="triggers">${triggers}</div>` : ''}
  <div class="card-footer">
    <div class="meta-info">
      <span class="source-label">${sourceLabel}</span>
      ${version}
      ${customized}
    </div>
    <button class="copy-btn" data-path="${item.path || ''}">复制路径</button>
  </div>
</div>`;
}

document.getElementById('search').addEventListener('input', render);
document.getElementById('filter-type').addEventListener('change', render);
document.getElementById('filter-category').addEventListener('change', render);
document.getElementById('filter-source').addEventListener('change', render);

loadRegistry();
