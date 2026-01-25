#!/bin/bash
# =============================================================================
# Scripter - 并行开发环境设置脚本
# =============================================================================
# 用途：快速创建多个 Git Worktree 用于并行开发
# =============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示帮助信息
show_help() {
    cat << EOF
用法: $0 [选项] <任务名称>

并行开发环境设置脚本 - 快速创建 Git Worktree

选项:
    -h, --help          显示此帮助信息
    -n, --count NUM     创建的 Worktree 数量 (默认: 3)
    -b, --base BRANCH   基础分支 (默认: main)
    -p, --prefix PREFIX Worktree 目录前缀 (默认: scripter-task)
    -d, --directory DIR Worktree 父目录 (默认: ..)

示例:
    # 创建 3 个 Worktree 用于功能开发
    $0 auth-system

    # 创建 5 个 Worktree，自定义前缀
    $0 -n 5 -p feature big-refactor

    # 指定基础分支和父目录
    $0 -b develop -d ~/workspaces feature-xyz
EOF
}

# 默认参数
WORKTREE_COUNT=3
BASE_BRANCH="main"
WORKTREE_PREFIX="scripter-task"
WORKTREE_PARENT_DIR=".."

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -n|--count)
            WORKTREE_COUNT="$2"
            shift 2
            ;;
        -b|--base)
            BASE_BRANCH="$2"
            shift 2
            ;;
        -p|--prefix)
            WORKTREE_PREFIX="$2"
            shift 2
            ;;
        -d|--directory)
            WORKTREE_PARENT_DIR="$2"
            shift 2
            ;;
        -*)
            print_error "未知选项: $1"
            show_help
            exit 1
            ;;
        *)
            TASK_NAME="$1"
            shift
            ;;
    esac
done

# 检查是否提供了任务名称
if [ -z "$TASK_NAME" ]; then
    print_error "请提供任务名称"
    show_help
    exit 1
fi

# 检查是否在 Git 仓库中
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "当前目录不是 Git 仓库"
    exit 1
fi

# 检查基础分支是否存在
if ! git show-ref --verify --quiet "refs/heads/$BASE_BRANCH"; then
    print_error "基础分支 '$BASE_BRANCH' 不存在"
    exit 1
fi

print_info "开始创建并行开发环境..."
print_info "任务名称: $TASK_NAME"
print_info "Worktree 数量: $WORKTREE_COUNT"
print_info "基础分支: $BASE_BRANCH"
echo ""

# 创建 Worktree
for i in $(seq 1 $WORKTREE_COUNT); do
    BRANCH_NAME="feature/${TASK_NAME}-task-${i}"
    WORKTREE_PATH="${WORKTREE_PARENT_DIR}/${WORKTREE_PREFIX}-${i}"

    print_info "创建 Worktree ${i}/${WORKTREE_COUNT}..."
    print_info "  分支: $BRANCH_NAME"
    print_info "  路径: $WORKTREE_PATH"

    # 检查 Worktree 路径是否已存在
    if [ -d "$WORKTREE_PATH" ]; then
        print_warning "Worktree 路径已存在: $WORKTREE_PATH"
        read -p "是否删除并重新创建? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git worktree remove "$WORKTREE_PATH" 2>/dev/null || rm -rf "$WORKTREE_PATH"
        else
            print_warning "跳过此 Worktree"
            continue
        fi
    fi

    # 创建新分支并 Worktree
    git worktree add -b "$BRANCH_NAME" "$WORKTREE_PATH" "$BASE_BRANCH"

    # 复制 .claude 配置到新 Worktree
    if [ -d ".claude" ]; then
        print_info "  复制 .claude 配置..."
        cp -r .claude "$WORKTREE_PATH/"
    fi

    # 创建任务说明文件
    cat > "$WORKTREE_PATH/TASK.md" << EOF
# 任务 ${i}: ${TASK_NAME}

## 分支
\`${BRANCH_NAME}\`

## 工作目录
\`$(cd "$WORKTREE_PATH" && pwd)\`

## 任务描述
待填充：请在此描述具体的任务内容

## 接口依赖
待填充：请在此描述此任务依赖的接口

## 完成标准
- [ ] 代码实现完成
- [ ] 测试通过
- [ ] 代码审查通过
- [ ] 文档更新完成

## 备注
- Worktree 创建时间: $(date)
- 基础分支: ${BASE_BRANCH}
EOF

    print_success "Worktree ${i} 创建完成"
    echo ""
done

# 显示摘要
print_success "所有 Worktree 创建完成！"
echo ""
echo "================================================================"
echo "并行开发环境摘要"
echo "================================================================"
echo "任务名称: $TASK_NAME"
echo "Worktree 数量: $WORKTREE_COUNT"
echo ""
echo "已创建的 Worktree:"
for i in $(seq 1 $WORKTREE_COUNT); do
    BRANCH_NAME="feature/${TASK_NAME}-task-${i}"
    WORKTREE_PATH="${WORKTREE_PARENT_DIR}/${WORKTREE_PREFIX}-${i}"
    echo "  ${i}. $WORKTREE_PATH (分支: $BRANCH_NAME)"
done
echo ""
echo "================================================================"
echo "下一步操作:"
echo "================================================================"
echo ""
echo "1. 在不同的终端中打开各 Worktree:"
for i in $(seq 1 $WORKTREE_COUNT); do
    WORKTREE_PATH="${WORKTREE_PARENT_DIR}/${WORKTREE_PREFIX}-${i}"
    echo "   cd ${WORKTREE_PATH} && claude-code"
done
echo ""
echo "2. 使用并行 Agent 启动任务:"
echo "   Task({ subagent_type: 'general-purpose', prompt: '...' })"
echo ""
echo "3. 完成后合并分支:"
echo "   git checkout $BASE_BRANCH"
echo "   git merge feature/${TASK_NAME}-task-1"
echo "   git merge feature/${TASK_NAME}-task-2"
echo "   ..."
echo ""
echo "4. 清理 Worktree:"
echo "   git worktree remove ${WORKTREE_PARENT_DIR}/${WORKTREE_PREFIX}-1"
echo "   ..."
echo ""
