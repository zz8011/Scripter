# 多阶段构建 Dockerfile - Next.js Standalone 优化
FROM node:20-alpine AS builder

WORKDIR /app

# 安装依赖
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm@8 && pnpm install --frozen-lockfile=false

# 复制源码
COPY . .

# 设置构建时环境变量（不设置 DATABASE_URL 以避免打包）
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 构建
RUN pnpm build

# 运行阶段 - 仅复制必要文件
FROM node:20-alpine AS runner

WORKDIR /app

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 复制 standalone 输出和 node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# 复制完整的 node_modules（pnpm 需要 .pnpm store）
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# 创建数据目录
RUN mkdir -p /app/data

# 设置运行时环境变量（DATABASE_URL 将由 docker-compose 注入）
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
