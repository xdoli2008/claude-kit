# ⚡ claude-kit

个人 Claude Code / Codex 配置套件。只收录亲测好用或经过个人改造的内容。

## 快速开始

```bash
npm install
npm run sync    # 重建 registry.json
npm run dev     # 启动 Web 搜索界面
npm run update  # 检查第三方更新
```

---

## 目录结构

```
skills/          Skill 本体，按功能分类
commands/        自定义 slash commands
hooks/           自动触发脚本
settings/        Settings 配置片段
rules/           CLAUDE.md / rules 行为规则
mcp/             MCP 配置
output-styles/   输出风格模板
experience/      使用经验（community / personal）
web/             本地 Web 搜索界面
scripts/         工具脚本
```

---

## Skills 分类索引

### 🔐 Security

| 名称 | 说明 | 触发词 |
|------|------|--------|
| red-team | 红队渗透测试完整执行链 | 渗透、红队、exploit、C2 |
| blue-team | 蓝队防御响应 | 蓝队、告警、IOC、应急 |
| pentest | 渗透测试方法论与工具链 | pentest、渗透测试 |
| code-audit | 代码安全审计 | 代码审计、OWASP |
| vuln-research | 漏洞研究与 PoC 开发 | CVE、PoC、漏洞研究 |
| threat-intel | 威胁情报与 OSINT | 威胁情报、OSINT |

### 🤖 AI / MLOps

| 名称 | 说明 | 触发词 |
|------|------|--------|
| rag-system | RAG 系统设计与优化 | RAG、检索增强、embedding |
| agent-dev | AI Agent 开发 | Agent、工具调用 |
| prompt-and-eval | Prompt 工程与 LLM 评估 | Prompt、提示词、eval |
| llm-security | LLM 安全防御 | LLM安全、越狱、prompt injection |

### 🏗 Architecture

| 名称 | 说明 | 触发词 |
|------|------|--------|
| api-design | API 设计规范 | API设计、RESTful、GraphQL |
| cloud-native | 云原生架构 | 云原生、K8s、微服务 |
| message-queue | 消息队列设计 | Kafka、MQ、消息中间件 |
| caching | 缓存架构设计 | 缓存、Redis |

### 💻 Development

| 名称 | 说明 | 触发词 |
|------|------|--------|
| python | Python 开发规范 | python、FastAPI |
| typescript | TypeScript 最佳实践 | TypeScript、TS |
| go | Go 语言开发规范 | Go、goroutine |
| rust | Rust 开发规范 | Rust、所有权 |

### 🔧 DevOps

| 名称 | 说明 | 触发词 |
|------|------|--------|
| git-workflow | Git 工作流规范 | git、commit规范、PR |
| testing | 测试策略 | TDD、单元测试、coverage |
| database | 数据库设计与优化 | SQL、索引优化 |
| observability | 可观测性 | OpenTelemetry、监控 |

### 🎨 Frontend

| 名称 | 说明 | 触发词 |
|------|------|--------|
| frontend-design | 前端设计系统 | UI、组件库、glassmorphism |

### ⚙️ Productivity

| 名称 | 说明 | 触发词 |
|------|------|--------|
| ccg | CCG 质量门禁套件 | ccg、质量门禁、verify |
| multi-agent | 多 Agent 协同编排 | TeamCreate、并行、swarm |

---

## 输出风格

| 名称 | 说明 |
|------|------|
| abyss-cultivator | 邪修红尘仙风格（已固定，不自动更新） |

---

## 脚本说明

| 脚本 | 说明 |
|------|------|
| `scripts/sync-registry.js` | 扫描所有 `.meta.json`，重建 `registry.json` |
| `scripts/update.js` | 检查 github/marketplace 来源是否有新版本 |

---

## 新增条目

1. 在对应分类目录下创建子目录
2. 放入内容文件（SKILL.md 等）
3. 创建 `.meta.json`（参考现有格式）
4. 运行 `npm run sync` 重建索引
