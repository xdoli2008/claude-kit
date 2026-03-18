const SOURCE_LABELS = {
  self: '✏️ 自建',
  github: '🐙 GitHub',
  marketplace: '🔌 官方',
  community: '👥 社区',
  zip: '📦 zip',
};

const REPO_COLORS = [
  { bg: '#1a2f1a', border: '#2ea043', text: '#3fb950' },
  { bg: '#1a1f2f', border: '#388bfd', text: '#58a6ff' },
  { bg: '#2f1a2f', border: '#8957e5', text: '#bc8cff' },
  { bg: '#2f1f1a', border: '#d29922', text: '#e3b341' },
  { bg: '#2f1a1a', border: '#da3633', text: '#f85149' },
  { bg: '#1a2a2f', border: '#1f6feb', text: '#79c0ff' },
  { bg: '#2a1f2f', border: '#bf4b8a', text: '#f778ba' },
  { bg: '#1f2a1a', border: '#347d39', text: '#56d364' },
];

let allItems = [];
let repoColorMap = {};
let activeRepoFilter = null;
let viewMode = 'grid';

function buildRepoColorMap(items) {
  const repos = [...new Set(
    items.filter(i => i.source === 'github' && i.repo).map(i => i.repo)
  )];
  repoColorMap = {};
  repos.forEach((repo, idx) => {
    repoColorMap[repo] = REPO_COLORS[idx % REPO_COLORS.length];
  });
}

function getRepoShortName(repoUrl) {
  if (!repoUrl) return '';
  return repoUrl.replace('https://github.com/', '');
}

async function loadRegistry() {
  const res = await fetch('/registry.json');
  const data = await res.json();
  allItems = data.items || [];
  buildRepoColorMap(allItems);
  render();
}

function matchItem(item, query, type, category, source) {
  if (type && item.type !== type) return false;
  if (category && item.category !== category) return false;
  if (source && item.source !== source) return false;
  if (activeRepoFilter && item.repo !== activeRepoFilter) return false;
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

  const repoFilterEl = document.getElementById('active-repo-filter');
  if (activeRepoFilter) {
    const color = repoColorMap[activeRepoFilter] || {};
    repoFilterEl.style.display = 'inline-flex';
    repoFilterEl.style.background = color.bg || '#1a2f1a';
    repoFilterEl.style.borderColor = color.border || '#2ea043';
    repoFilterEl.style.color = color.text || '#3fb950';
    repoFilterEl.querySelector('.repo-filter-name').textContent = getRepoShortName(activeRepoFilter);
  } else {
    repoFilterEl.style.display = 'none';
  }

  const grid = document.getElementById('grid');
  const empty = document.getElementById('empty');

  if (filtered.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  if (viewMode === 'repo') {
    grid.classList.add('repo-view-active');
    renderRepoView(filtered, grid);
  } else {
    grid.classList.remove('repo-view-active');
    grid.innerHTML = filtered.map((item, idx) => cardHTML(item, idx)).join('');
    bindCardEvents(filtered);
  }
}

function renderRepoView(filtered, grid) {
  const groups = {};
  filtered.forEach((item, idx) => {
    const key = (item.source === 'github' && item.repo) ? item.repo : '__local__';
    if (!groups[key]) groups[key] = [];
    groups[key].push({ item, idx });
  });

  const html = Object.entries(groups).map(([repo, entries]) => {
    const isGithub = repo !== '__local__';
    const color = isGithub ? (repoColorMap[repo] || {}) : {};
    const shortName = isGithub ? getRepoShortName(repo) : '本地条目';
    const borderColor = color.border || 'var(--border)';
    const textColor = color.text || 'var(--muted)';
    const bgColor = color.bg || 'var(--surface)';
    const repoLink = isGithub
      ? `<a href="${repo}" target="_blank" class="repo-group-link" style="color:${textColor}">↗ GitHub</a>`
      : '';
    const cards = entries.map(({ item, idx }) => cardHTML(item, idx)).join('');
    return `
<div class="repo-group" style="border-color:${borderColor}">
  <div class="repo-group-header" style="background:${bgColor};border-bottom-color:${borderColor}">
    <span class="repo-group-icon">🐙</span>
    <span class="repo-group-name" style="color:${textColor}">${shortName}</span>
    <span class="repo-group-count" style="color:${textColor}">${entries.length} 个条目</span>
    ${repoLink}
    <button class="repo-group-toggle">▾</button>
  </div>
  <div class="repo-group-body">
    <div class="grid repo-inner-grid">${cards}</div>
  </div>
</div>`;
  }).join('');

  grid.innerHTML = `<div class="repo-view">${html}</div>`;
  bindCardEvents(filtered);

  grid.querySelectorAll('.repo-group-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const body = btn.closest('.repo-group').querySelector('.repo-group-body');
      const collapsed = body.classList.toggle('collapsed');
      btn.textContent = collapsed ? '▸' : '▾';
    });
  });
}

function bindCardEvents(filtered) {
  const grid = document.getElementById('grid');

  grid.querySelectorAll('.copy-btn[data-usage]').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.usage).then(() => {
        btn.textContent = '已复制';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = '复制指令';
          btn.classList.remove('copied');
        }, 1500);
      });
    });
  });

  grid.querySelectorAll('.detail-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx);
      openModal(filtered[idx]);
    });
  });

  grid.querySelectorAll('.repo-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const repo = tag.dataset.repo;
      if (activeRepoFilter === repo) {
        activeRepoFilter = null;
      } else {
        activeRepoFilter = repo;
      }
      render();
    });
  });
}

function cardHTML(item, idx) {
  const typeClass = `badge-type-${item.type || 'skill'}`;
  const triggers = (item.triggers || [])
    .map(t => `<span class="trigger-tag">${t}</span>`)
    .join('');
  const customized = item.customized
    ? `<span class="customized-badge">已改造</span>`
    : '';
  const version = item.version ? `<span class="source-label">v${item.version}</span>` : '';
  const sourceLabel = SOURCE_LABELS[item.source] || item.source || '';

  const hasGithub = item.source === 'github' && item.file_path;
  const actionBtn = item.usage
    ? `<button class="copy-btn" data-usage="${item.usage}">复制指令</button>`
    : `<button class="copy-btn" data-usage="${item.path || ''}">复制路径</button>`;
  const detailBtn = hasGithub
    ? `<button class="detail-btn" data-idx="${idx}">查看详情</button>`
    : '';

  let repoTag = '';
  if (item.source === 'github' && item.repo && repoColorMap[item.repo]) {
    const color = repoColorMap[item.repo];
    const shortName = getRepoShortName(item.repo);
    repoTag = `<button class="repo-tag" data-repo="${item.repo}" style="background:${color.bg};border-color:${color.border};color:${color.text}" title="点击筛选此仓库">🐙 ${shortName}</button>`;
  }

  return `
<div class="card${item.source === 'github' && item.repo ? ' card-has-repo' : ''}" ${item.repo ? `style="border-left:3px solid ${(repoColorMap[item.repo]||{}).border||'var(--border)'}"` : ''}>
  <div class="card-header">
    <span class="card-name">${item.name || ''}</span>
    <span class="badge ${typeClass}">${item.type || ''}</span>
  </div>
  <div class="card-desc">${item.description_zh || ''}</div>
  ${triggers ? `<div class="triggers">${triggers}</div>` : ''}
  ${repoTag ? `<div class="repo-tag-row">${repoTag}</div>` : ''}
  <div class="card-footer">
    <div class="meta-info">
      <span class="source-label">${sourceLabel}</span>
      ${version}
      ${customized}
    </div>
    <div class="card-btns">
      ${detailBtn}
      ${actionBtn}
    </div>
  </div>
</div>`;
}

function openModal(item) {
  const overlay = document.getElementById('modal-overlay');
  const modalName = document.getElementById('modal-name');
  const modalBody = document.getElementById('modal-body');
  const modalCopyBtn = document.getElementById('modal-copy-btn');
  const modalGithubLink = document.getElementById('modal-github-link');

  modalName.textContent = item.name;
  modalBody.innerHTML = '<div class="spinner"></div>';

  if (item.usage) {
    modalCopyBtn.style.display = '';
    modalCopyBtn.dataset.usage = item.usage;
    modalCopyBtn.textContent = '复制指令';
    modalCopyBtn.onclick = () => {
      navigator.clipboard.writeText(item.usage).then(() => {
        modalCopyBtn.textContent = '已复制';
        setTimeout(() => { modalCopyBtn.textContent = '复制指令'; }, 1500);
      });
    };
  } else {
    modalCopyBtn.style.display = 'none';
  }

  if (item.repo && item.file_path) {
    const repoPath = item.repo.replace('https://github.com/', '');
    const githubUrl = `${item.repo}/blob/main/${item.file_path}`;
    const rawUrl = `https://raw.githubusercontent.com/${repoPath}/main/${item.file_path}`;
    modalGithubLink.href = githubUrl;
    modalGithubLink.style.display = '';
    fetchMarkdown(rawUrl, modalBody, githubUrl);
  } else {
    modalGithubLink.style.display = 'none';
    modalBody.innerHTML = '<p class="modal-error">无可用内容</p>';
  }

  overlay.classList.remove('hidden');
}

async function fetchMarkdown(rawUrl, container, fallbackUrl) {
  try {
    const res = await fetch(rawUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    container.innerHTML = `<div class="markdown-body">${marked.parse(text)}</div>`;
  } catch (e) {
    container.innerHTML = `
      <div class="modal-error">
        <p>内容加载失败，请检查网络连接。</p>
        <a href="${fallbackUrl}" target="_blank" class="github-link">在 GitHub 查看原文 ↗</a>
      </div>`;
  }
}

document.getElementById('modal-close').addEventListener('click', () => {
  document.getElementById('modal-overlay').classList.add('hidden');
});

document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal-overlay')) {
    document.getElementById('modal-overlay').classList.add('hidden');
  }
});

document.getElementById('search').addEventListener('input', render);
document.getElementById('filter-type').addEventListener('change', render);
document.getElementById('filter-category').addEventListener('change', render);
document.getElementById('filter-source').addEventListener('change', render);

document.getElementById('view-toggle').addEventListener('click', () => {
  viewMode = viewMode === 'grid' ? 'repo' : 'grid';
  document.getElementById('view-toggle').textContent = viewMode === 'repo' ? '📋 卡片视图' : '🐙 仓库视图';
  render();
});

document.getElementById('active-repo-filter').querySelector('.repo-filter-clear').addEventListener('click', () => {
  activeRepoFilter = null;
  render();
});

loadRegistry();
