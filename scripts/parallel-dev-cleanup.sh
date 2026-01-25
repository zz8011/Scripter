#!/bin/bash
# =============================================================================
# Scripter - 并行开发环境清理脚本
# =============================================================================
# 用途：清理并行开发环境中的 Git Worktree
# =============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
用法: $0 [选项]

并行开发环境清理脚本 - 清理 Git Worktree 和相关分支

选项:
    -h, --help              显示此帮助信息
    -a, --all               清理所有 Worktree (危险！)
    -p, --prefix PREFIX     指定 Worktree 前缀 (默认: scripter-task)
    -d, --directory DIR     Worktree 父目录 (默认: ..)
    -k, --keep-branches      保留分支，只删除 Worktree
    --dry-run               模拟运行，显示将要删除的内容

示例:
    # 清理所有名为 scripter-task-* 的 Worktree
    $0 --all

    # 清理特定前缀的 Worktree
    $0 -p feature-auth

    # 模拟运行，查看将要删除什么
    $0 --all --dry-run
EOF
}

# 默认参数
CLEAN_ALL=false
WORKTREE_PREFIX="scripter-task"
WORKTREE_PARENT_DIR=".."
KEEP_BRANCHES=false
DRY_RUN=false

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -a|--all)
            CLEAN_ALL=true
            shift
            ;;
        -p|--prefix)
            WORKTREE_PREFIX="$2"
            shift 2
            ;;
        -d|--directory)
            WORKTREE_PARENT_DIR="$2"
            shift 2
            ;;
        -k|--keep-branches)
            KEEP_BRANCHES=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        *)
            print_error "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
done

# 列出所有 Worktree
print_info "当前 Git Worktree 列表:"
git worktree list
echo ""

# 查找匹配的 Worktree
MATCHED_WORKTREES=()
while IFS= read -r line; do
    WORKTREE_PATH=$(echo "$line" | awk '{print $1}')
    if echo "$WORKTREE_PATH" | grep -q "${WORKTREE_PARENT_DIR}/${WORKTREE_PREFIX}"; then
        MATCHED_WORKTREES+=("$WORKTREE_PATH")
    fi
done < <(git worktree list)

if [ ${#MATCHED_WORKTREES[@]} -eq 0 ]; then
    print_warning "没有找到匹配的 Worktree (前缀: ${WORKTREE_PREFIX})"
    exit 0
fi

# 显示将要删除的 Worktree
print_info "将要清理的 Worktree:"
for i in "${!MATCHED_WORKTREES[@]}"; do
    WORKTREE_PATH="${MATCHED_WORKTREES[$i]}"
    BRANCH_NAME=$(git worktree list | grep "$WORKTREE_PATH" | awk '{print $2}' | sed 's/\[.*\]//g')
    echo "  $((i+1)). $WORKTREE_PATH (分支: $BRANCH_NAME)"
done
echo ""

if [ "$DRY_RUN" = true ]; then
    print_info "模拟运行模式，不会实际删除"
    exit 0
fi

# 确认删除
if [ "$CLEAN_ALL" = false ]; then
    read -p "确定要删除这些 Worktree 吗? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "取消操作"
        exit 0
    fi
fi

# 删除 Worktree
for WORKTREE_PATH in "${MATCHED_WORKTREES[@]}"; do
    print_info "删除 Worktree: $WORKTREE_PATH"

    # 获取分支名
    BRANCH_NAME=$(git worktree list | grep "$WORKTREE_PATH" | awk '{print $2}' | sed 's/\[.*\]//g')

    # 删除 Worktree
    git worktree remove "$WORKTREE_PATH"

    # 如果不保留分支，也删除分支
    if [ "$KEEP_BRANCHES" = false ]; then
        print_info "  删除分支: $BRANCH_NAME"
        git branch -D "$BRANCH_NAME"
    fi

    print_success "已删除: $WORKTREE_PATH"
done

print_success "清理完成！"
