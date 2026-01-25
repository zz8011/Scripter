# =============================================================================
# Scripter - 并行开发环境清理脚本 (PowerShell)
# =============================================================================
# 用途：清理并行开发环境中的 Git Worktree
# =============================================================================

param(
    [Parameter(Mandatory=$false, HelpMessage="清理所有 Worktree")]
    [switch]$All,

    [Parameter(Mandatory=$false, HelpMessage="Worktree 前缀")]
    [string]$Prefix = "scripter-task",

    [Parameter(Mandatory=$false, HelpMessage="Worktree 父目录")]
    [string]$ParentDir = "..",

    [Parameter(Mandatory=$false, HelpMessage="保留分支，只删除 Worktree")]
    [switch]$KeepBranches,

    [Parameter(Mandatory=$false, HelpMessage="模拟运行")]
    [switch]$DryRun,

    [Parameter(Mandatory=$false, HelpMessage="显示帮助信息")]
    [switch]$Help
)

# 显示帮助
if ($Help) {
    Write-Host @"
并行开发环境清理脚本 - 清理 Git Worktree 和相关分支

用法: .\scripts\parallel-dev-cleanup.ps1 [选项]

参数:
    -All                  清理所有匹配的 Worktree
    -Prefix <字符串>      Worktree 前缀 (默认: scripter-task)
    -ParentDir <字符串>   Worktree 父目录 (默认: ..)
    -KeepBranches         保留分支，只删除 Worktree
    -DryRun               模拟运行，显示将要删除的内容
    -Help                  显示此帮助信息

示例:
    # 清理所有 Worktree
    .\scripts\parallel-dev-cleanup.ps1 -All

    # 清理特定前缀的 Worktree
    .\scripts\parallel-dev-cleanup.ps1 -All -Prefix feature-auth

    # 模拟运行
    .\scripts\parallel-dev-cleanup.ps1 -All -DryRun

    # 保留分支
    .\scripts\parallel-dev-cleanup.ps1 -All -KeepBranches
"@
    exit 0
}

# 列出所有 Worktree
Write-Host "当前 Git Worktree 列表:" -ForegroundColor Cyan
git worktree list
Write-Host ""

# 查找匹配的 Worktree
$worktreeList = git worktree list
$matchedWorktrees = @()

foreach ($line in $worktreeList) {
    if ($line -match "^(.+?)\s+") {
        $worktreePath = $matches[1]
        $fullPath = (Resolve-Path $worktreePath -ErrorAction SilentlyContinue).Path
        if ($fullPath -and $fullPath -like "*${ParentDir}\${Prefix}*") {
            $matchedWorktrees += $worktreePath
        }
    }
}

if ($matchedWorktrees.Count -eq 0) {
    Write-Warning "没有找到匹配的 Worktree (前缀: ${Prefix})"
    exit 0
}

# 显示将要删除的 Worktree
Write-Host "将要清理的 Worktree:" -ForegroundColor Yellow
for ($i = 0; $i -lt $matchedWorktrees.Count; $i++) {
    $worktreePath = $matchedWorktrees[$i]
    $line = $worktreeList | Where-Object { $_ -like "$worktreePath*" }
    $branchInfo = ($line -split "\s+")[1] -replace "[\[\]]", ""
    Write-Host "  $($i+1). $worktreePath (分支: $branchInfo)" -ForegroundColor White
}
Write-Host ""

if ($DryRun) {
    Write-Host "模拟运行模式，不会实际删除" -ForegroundColor Yellow
    exit 0
}

# 确认删除
if (-not $All) {
    $confirm = Read-Host "确定要删除这些 Worktree 吗? (y/N)"
    if ($confirm -ne 'y' -and $confirm -ne 'Y') {
        Write-Host "取消操作" -ForegroundColor Yellow
        exit 0
    }
}

# 删除 Worktree
foreach ($worktreePath in $matchedWorktrees) {
    Write-Host "删除 Worktree: $worktreePath" -ForegroundColor Cyan

    # 获取分支名
    $line = $worktreeList | Where-Object { $_ -like "$worktreePath*" }
    $branchName = ($line -split "\s+")[1] -replace "[\[\]]", ""

    # 删除 Worktree
    git worktree remove $worktreePath

    # 如果不保留分支，也删除分支
    if (-not $KeepBranches) {
        Write-Host "  删除分支: $branchName" -ForegroundColor Gray
        git branch -D $branchName 2>$null
    }

    Write-Host "已删除: $worktreePath" -ForegroundColor Green
}

Write-Host "清理完成！" -ForegroundColor Green
