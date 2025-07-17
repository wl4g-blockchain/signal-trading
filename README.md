# AI链上交易套利平台

基于AI的链上交易套利服务，支持拖拽式工作流编排和自动化交易执行。

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置Vercel PostgreSQL数据库

#### 方法一：使用Vercel CLI（推荐）
```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel
vercel login

# 创建新项目并部署
vercel

# 添加PostgreSQL数据库
vercel storage create postgres
```

#### 方法二：通过Vercel Dashboard
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 创建新项目或选择现有项目
3. 进入项目设置 → Storage
4. 点击 "Create Database" → 选择 "Postgres"
5. 创建数据库后，复制环境变量

### 3. 配置环境变量

将Vercel提供的数据库环境变量复制到 `.env.local` 文件中：

```bash
# Vercel Postgres Database
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NO_SSL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."

# JWT Secret
JWT_SECRET="your-jwt-secret-key-change-in-production"
```

### 4. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000 开始使用平台。

## 📊 功能特性

- **🔐 GitHub登录认证**：安全的用户认证系统
- **🎨 拖拽式工作流编排**：可视化设计交易策略
- **🤖 AI驱动的交易决策**：集成ChatGPT/DeepSeek API
- **📈 实时交易监控**：Dashboard显示实时数据
- **📊 详细报告分析**：交易成功率、收益分析
- **🔧 灵活的服务架构**：支持Mock/HTTP服务切换

## 🏗️ 技术架构

- **前端**：React + Vite + TypeScript + Tailwind CSS
- **后端**：Next.js API Routes
- **数据库**：Vercel PostgreSQL
- **认证**：JWT + GitHub OAuth
- **部署**：Vercel Platform

### CEX vs DEX 的 Trade Executor 设计核心差异分析

| 特性 | DEX | CEX |
| - | - | - |
| 认证方式 | Wallet 签名 | API Key/Secret |
| 资金管理 | Vault 合约 | 交易所账户 |
| 交易执行 | 智能合约调用 | REST API |
| Gas 费用 | 需要 Gas 策略 | 无 Gas 费用 |
| 安全模型 | 去中心化授权 | 集中式 API 权限 |

## 📁 项目结构

```
├── src/
│   ├── components/          # React组件
│   ├── services/           # API服务层
│   └── types/              # TypeScript类型定义
├── pages/api/              # Next.js API路由
├── lib/                    # 数据库连接和工具
└── public/                 # 静态资源
```

## 🔧 开发指南

### 数据库表结构

- `t_workflow`: 工作流配置存储
- `t_workflow_run`: 工作流运行记录

### API接口

- `GET /api/workflows` - 获取工作流列表
- `POST /api/workflows` - 创建新工作流
- `PUT /api/workflows/[id]` - 更新工作流
- `POST /api/workflows/[id]/run` - 执行工作流
- `GET /api/workflows/[id]/runs` - 获取运行记录

## 🚀 部署到Vercel

1. 推送代码到GitHub
2. 在Vercel中导入项目
3. 配置环境变量
4. 部署完成

## 📝 许可证

MIT License