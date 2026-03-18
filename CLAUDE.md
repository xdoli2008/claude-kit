# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run sync    # 扫描所有 .meta.json，重建 registry.json（新增/删除条目后必须运行）
npm run update  # 检查 github 来源条目是否有新版本（pinned: true 的跳过）
npm run dev     # 启动本地 Web 搜索界面，访问 http://localhost:17317
npm run build   # 构建 Web 界面
```

## Architecture

这是一个个人 Claude Code / Codex 配置套件（claude-kit），核心是一个 **registry 驱动的 skill 管理系统**。

### 数据流

```
.meta.json（各条目元数据）
    ↓ npm run sync（scripts/sync-registry.js）
registry.json（统一索引，自动生成，勿手动编辑）
    ↓ fetch('/registry.json')
web/app.js（前端搜索界面，Vite 托管）
```

### 目录职责

| 目录 | 说明 |
|------|------|
| `skills/` | Skill 本体，按 `security/ai/architecture/development/devops/frontend/productivity` 分类 |
| `output-styles/` | 输出风格模板（如 abyss-cultivator） |
| `commands/` | 自定义 slash commands |
| `hooks/` | 自动触发脚本 |
| `settings/` | Settings 配置片段 |
| `rules/` | CLAUDE.md / rules 行为规则 |
| `mcp/` | MCP 配置 |
| `web/` | 本地搜索界面（Vite，root 为 `web/`，`publicDir` 指向项目根目录以访问 registry.json） |
| `scripts/` | sync-registry.js、update.js |

### 新增条目流程

1. 在对应分类目录下创建子目录（如 `skills/security/new-skill/`）
2. 放入内容文件（`SKILL.md` 等）
3. 创建 `.meta.json`，参考现有格式，必填字段：`name`、`type`、`category`、`source`、`version`、`author`、`description_zh`、`triggers`、`last_updated`、`pinned`、`customized`
4. 运行 `npm run sync` 重建 registry.json

### .meta.json 关键字段

- `pinned: true` — `npm run update` 跳过此条目，不检查更新
- `customized: true` — Web 界面显示"已改造"徽章
- `source` — `self`（手动维护）| `github`（自动检查更新，需填 `repo`）| `marketplace` | `community`
- `path` — 由 sync-registry.js 自动注入，无需手动填写

### update.js 逻辑

仅对 `source: "github"` 且有 `repo` 字段的条目调用 GitHub Releases API 检查最新版本，`pinned: true` 的条目直接跳过。
