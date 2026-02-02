#!/bin/bash
# Scripter 部署脚本
# 用法: ./scripts/deploy.sh

set -e

echo "🚀 开始部署 Scripter..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker 未运行，请先启动 Docker${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker 运行正常${NC}"

# 构建并启动服务
echo -e "${YELLOW}📦 构建并启动服务...${NC}"
docker-compose down --remove-orphans 2>/dev/null || true
docker-compose build --no-cache
docker-compose up -d

# 等待服务就绪
echo -e "${YELLOW}⏳ 等待服务就绪...${NC}"
sleep 10

# 检查 PostgreSQL
echo "🔍 检查 PostgreSQL..."
until docker-compose exec -T postgres pg_isready -U scripter_user -d scripter > /dev/null 2>&1; do
    echo "  等待 PostgreSQL..."
    sleep 2
done
echo -e "${GREEN}✓ PostgreSQL 就绪${NC}"

# 检查 Casdoor
echo "🔍 检查 Casdoor..."
until curl -s http://localhost:8000 > /dev/null 2>&1; do
    echo "  等待 Casdoor..."
    sleep 2
done
echo -e "${GREEN}✓ Casdoor 就绪${NC}"

# 运行数据库迁移
echo -e "${YELLOW}🗄️ 运行数据库迁移...${NC}"
docker-compose exec -T backend npx drizzle-kit push:pg || echo "迁移可能已完成"

# 检查后端服务
echo "🔍 检查后端服务..."
until curl -s http://localhost:3000/api/health > /dev/null 2>&1; do
    echo "  等待后端服务..."
    sleep 2
done
echo -e "${GREEN}✓ 后端服务就绪${NC}"

# 显示服务状态
echo ""
echo -e "${GREEN}🎉 部署完成！${NC}"
echo ""
echo "服务地址:"
echo "  - 应用: http://localhost:3000"
echo "  - Casdoor: http://localhost:8000"
echo "  - PostgreSQL: localhost:5432"
echo ""
echo "查看日志:"
echo "  docker-compose logs -f"
echo ""
echo "停止服务:"
echo "  docker-compose down"
