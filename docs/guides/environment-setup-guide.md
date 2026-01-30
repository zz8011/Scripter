# 剧灵 (Scripter) 环境配置指南

> **更新日期**: 2026-01-26
> **适用版本**: v0.1.0 (合并后)
> **目标读者**: 开发者

---

## 📋 概述

本文档指导您完成剧灵项目开发环境的配置，包括数据库、认证服务和AI服务的设置。

### 前置要求

- Node.js v20+
- PostgreSQL 14+ (或云数据库)
- Docker (可选，用于 Casdoor)
- 智谱 AI 账号

---

## 🔧 配置步骤

### 1. 数据库配置

项目支持两种数据库配置方式：

#### 选项 A: 本地 PostgreSQL

```bash
# 1. 安装 PostgreSQL
# Windows: https://www.postgresql.org/download/windows/
# macOS: brew install postgresql@14
# Linux: sudo apt-get install postgresql

# 2. 创建数据库
psql -U postgres
CREATE DATABASE scripter;
\q

# 3. 验证连接
psql -U postgres -d scripter -c "SELECT version();"
```

**DATABASE_URL 格式**:
```
postgresql://postgres:postgres@localhost:5432/scripter
```

#### 选项 B: 云数据库 (Neon)

```bash
# 1. 访问 https://neon.tech/
# 2. 创建免费账户
# 3. 创建新项目 "scripter"
# 4. 复制连接字符串
```

**DATABASE_URL 格式**:
```
postgresql://user:password@ep-xxx.aws.neon.tech/scripter?sslmode=require
```

#### 选项 C: Docker Compose

```bash
# 1. 启动数据库
docker-compose up -d db

# 2. 查看日志
docker-compose logs -f db
```

---

### 2. 初始化数据库

配置完 DATABASE_URL 后，运行数据库迁移：

```bash
# 生成迁移文件
npm run db:generate

# 推送 schema 到数据库
npm run db:push

# 验证表结构
psql $DATABASE_URL -c "\dt"
```

**预期输出**:
```
          List of relations
 Schema |     Name      | Type  |    Owner
--------+---------------+-------+--------------
 public | users         | table | postgres
 public | projects      | table | postgres
 public | characters    | table | postgres
 public | scenes        | table | postgres
 public | storyboards   | table | postgres
 public | worldviews    | table | postgres
```

---

### 3. Casdoor 认证配置

Casdoor 是一个独立的认证服务，需要单独部署。

#### 选项 A: Docker (推荐)

```bash
# 1. 启动 Casdoor
docker-compose -f docker-compose.casdoor.yml up -d

# 2. 访问 http://localhost:8000
# 默认账号: admin / admin123
```

#### 选项 B: 本地开发

```bash
# 1. 克隆 Casdoor
git clone https://github.com/casdoor/casdoor.git
cd casdoor

# 2. 配置 app.conf
# 修改 dataSourceName 为你的 PostgreSQL 连接

# 3. 运行
go run main.go
```

#### 获取 OAuth 配置

```bash
# 1. 登录 Casdoor (admin/admin123)
# 2. 进入 "应用" → "添加应用"
# 3. 填写配置：
#    - 名称: Scripter
#    - 组织: Admin
#    - 回调 URL: http://localhost:3000/api/auth/callback
# 4. 保存后复制：
#    - Client ID
#    - Client Secret
```

**更新 .env.local**:
```bash
CASDOOR_ENDPOINT=http://localhost:8000
CASDOOR_CLIENT_ID=<从Casdoor复制的ID>
CASDOOR_CLIENT_SECRET=<从Casdoor复制的Secret>
CASDOOR_CALLBACK_URL=http://localhost:3000/api/auth/callback
```

---

### 4. 智谱 AI 配置

智谱 AI 提供剧本创作所需的 AI 能力。

#### 获取 API 密钥

```bash
# 1. 访问 https://open.bigmodel.cn/
# 2. 注册/登录账号
# 3. 进入 "用户中心" → "API密钥"
# 4. 创建新密钥
# 5. 复制 API Key
```

**更新 .env.local**:
```bash
ZHIPU_API_KEY=<你的智谱API密钥>
```

#### 测试 API 连接

```bash
# 运行测试脚本
npm run test:ai

# 预期输出: "✅ 智谱 AI 连接成功"
```

---

## ✅ 验证配置

完成所有配置后，运行验证脚本：

```bash
# 1. 启动项目
npm run dev

# 2. 检查健康状态
curl http://localhost:3000/api/health

# 预期输出:
{
  "status": "healthy",
  "timestamp": "2026-01-26T...",
  "services": {
    "database": "connected",
    "ai": "connected",
    "auth": "connected"
  }
}
```

---

## 🚀 快速启动 (使用 Docker)

如果您想快速启动所有服务：

```bash
# 1. 复制环境变量模板
cp .env.docker.example .env

# 2. 编辑 .env，填入真实值
#    - ZHIPU_API_KEY
#    - CASDOOR_CLIENT_ID/SECRET

# 3. 启动所有服务
docker-compose up -d

# 4. 初始化数据库
docker-compose exec app npm run db:push

# 5. 访问应用
open http://localhost:3000
```

---

## 🐛 常见问题

### 问题 1: 数据库连接失败

**错误**: `connection refused`

**解决方案**:
```bash
# 检查 PostgreSQL 是否运行
# Windows
Get-Service postgresql*

# macOS/Linux
brew services list | grep postgres
# 或
sudo systemctl status postgresql
```

### 问题 2: Casdoor 回调失败

**错误**: `redirect_uri_mismatch`

**解决方案**:
1. 确保 Casdoor 应用的回调 URL 与 .env.local 中一致
2. 检查 URL 协议 (http vs https)
3. 检查端口号

### 问题 3: AI API 限流

**错误**: `429 Too Many Requests`

**解决方案**:
- 检查智谱 API 配额
- 考虑升级到付费计划
- 实现请求队列

### 问题 4: TypeScript 错误

**错误**: `Cannot find module '@/db'`

**解决方案**:
```bash
# 确保已合并前后端
# 检查路径别名
grep "@/" tsconfig.json

# 应该看到:
# "@/*": ["./*"]
```

---

## 📚 相关文档

- [PRD v2.5](../prd/prd-v2.5.md) - 产品需求文档
- [技术栈](../tech/tech-stack.md) - 技术选型说明
- [数据模型](../tech/data-model.md) - 数据库结构
- [测试报告](../reports/tasks/2026-01-26-prd-module-test-report.md) - 模块测试结果

---

## 🆘 获取帮助

如有问题，请：
1. 查看本文档的"常见问题"章节
2. 检查 GitHub Issues
3. 联系开发团队

---

**最后更新**: 2026-01-26
**维护者**: Scripter Team
