#!/bin/bash

# Casdoor 快速启动脚本
# 适用于 Linux / macOS / WSL

set -e

echo "🚀 Casdoor 快速启动脚本"
echo "============================"
echo ""

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker Desktop"
    echo "   下载地址: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

echo "✅ Docker 已安装"

# 检查 Docker Compose
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose 未安装"
    exit 1
fi

echo "✅ Docker Compose 已安装"
echo ""

# 启动 Casdoor
echo "📦 启动 Casdoor 服务..."
docker compose -f docker-compose.casdoor.yml up -d

echo ""
echo "⏳ 等待服务启动..."
sleep 5

# 检查服务状态
if docker compose ps | grep -q "casdoor.*Up"; then
    echo ""
    echo "✅ Casdoor 启动成功！"
    echo ""
    echo "📋 登录信息:"
    echo "   URL: http://localhost:8000"
    echo "   用户名: admin"
    echo "   密码: 123"
    echo ""
    echo "⚠️  请立即修改默认密码！"
    echo ""
    echo "📖 配置指南: docs/guides/casdoor-setup-guide.md"
else
    echo ""
    echo "❌ Casdoor 启动失败"
    echo "   查看日志: docker compose logs casdoor"
    exit 1
fi
