# =============================================================================
# Scripter - 并行开发环境设置脚本 (PowerShell)
# =============================================================================
# 用途：快速创建多个 Git Worktree 用于并行开发
# =============================================================================

param(
    [Parameter(Mandatory=$false, HelpMessage="Worktree 数量")]
    [int]$Count = 3,

    [Parameter(Mandatory=$false, HelpMessage="基础分支")]
    [string]$BaseBranch = "main",

    [Parameter(Mandatory=$false, HelpMessage="Worktree 目录前缀")]
    [string]$Prefix = "scripter-task",

    [Parameter(Mandatory=$false, HelpMessage="Worktree 父目录")]
    [string]$ParentDir = "..",

    [Parameter(Mandatory=$true, HelpMessage="任务名称")]
    [string]$TaskName,

    [Parameter(Mandatory=$false, HelpMessage="显示帮助信息")]
    [switch]$Help
)

# 显示帮助
if ($Help) {
    Write-Host @"
并行开发环境设置脚本 - 快速创建 Git Worktree

用法: .\scripts\parallel-dev-setup.ps1 -TaskName <名称> [选项]

参数:
    -TaskName <字符串>    (必需) 任务名称
    -Count <数字>         Worktree 数量 (默认: 3)
    -BaseBranch <字符串>  基础分支 (默认: main)
    -Prefix <字符串>      Worktree 目录前缀 (默认: scripter-task)
    -ParentDir <字符串>   Worktree 父目录 (默认: ..)
    -Help                  显示此帮助信息

示例:
    # 创建 3 个 Worktree
    .\scripts\parallel-dev-setup.ps1 -TaskName auth-system

    # 创建 5 个 Worktree
    .\scripts\parallel-dev-setup.ps1 -TaskName big-refactor -Count 5

    # 指定基础分支
    .\scripts\parallel-dev-setup.ps1 -TaskName feature-xyz -BaseBranch develop
"@
    exit 0
}

# 检查是否在 Git 仓库中
$gitRoot = git rev-parse --show-toplevel 2>$null
if (-not $gitRoot) {
    Write-Error "当前目录不是 Git 仓库"
    exit 1
}

# 检查基础分支是否存在
$branchExists = git show-ref --verify --quiet "refs/heads/$BaseBranch" 2>$null
if (-not $branchExists) {
    Write-Error "基础分支 '$BaseBranch' 不存在"
    exit 1
}

Write-Host "开始创建并行开发环境..." -ForegroundColor Cyan
Write-Host "任务名称: $TaskName" -ForegroundColor White
Write-Host "Worktree 数量: $Count" -ForegroundColor White
Write-Host "基础分支: $BaseBranch" -ForegroundColor White
Write-Host ""

# 创建 Worktree
for ($i = 1; $i -le $Count; $i++) {
    $branchName = "feature/${TaskName}-task-${i}"
    $worktreePath = Join-Path $ParentDir "${Prefix}-${i}"

    Write-Host "创建 Worktree ${i}/${Count}..." -ForegroundColor Cyan
    Write-Host "  分支: $branchName" -ForegroundColor Gray
    Write-Host "  路径: $worktreePath" -ForegroundColor Gray

    # 检查路径是否已存在
    if (Test-Path $worktreePath) {
        Write-Warning "Worktree 路径已存在: $worktreePath"
        $confirm = Read-Host "是否删除并重新创建? (y/N)"
        if ($confirm -eq 'y' -or $confirm -eq 'Y') {
            git worktree remove $worktreePath 2>$null
            Remove-Item -Recurse -Force $worktreePath 2>$null
        } else {
            Write-Warning "跳过此 Worktree"
            continue
        }
    }

    # 创建新分支并 Worktree
    git worktree add -b $branchName $worktreePath $BaseBranch

    # 复制 .claude 配置
    if (Test-Path ".claude") {
        Write-Host "  复制 .claude 配置..." -ForegroundColor Gray
        Copy-Item -Recurse ".claude" (Join-Path $worktreePath ".claude")
    }

    # 创建任务说明文件
    $taskContent = @"
# 任务 ${i}: ${TaskName}

## 分支
`${branchName}`

## 工作目录
`${worktreePath}`

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
- Worktree 创建时间: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
- 基础分支: ${BaseBranch}
"@

    $taskContent | Out-File -FilePath (Join-Path $worktreePath "TASK.md") -Encoding UTF8

    Write-Host "Worktree ${i} 创建完成" -ForegroundColor Green
    Write-Host ""
}

# 显示摘要
Write-Host "所有 Worktree 创建完成！" -ForegroundColor Green
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "并行开发环境摘要" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "任务名称: $TaskName" -ForegroundColor White
Write-Host "Worktree 数量: $Count" -ForegroundColor White
Write-Host ""
Write-Host "已创建的 Worktree:" -ForegroundColor White
for ($i = 1; $i -le $Count; $i++) {
    $worktreePath = Join-Path $ParentDir "${Prefix}-${i}"
    $branchName = "feature/${TaskName}-task-${i}"
    Write-Host "  ${i}. ${worktreePath} (分支: ${branchName})" -ForegroundColor White
}
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "下一步操作:" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 在不同的终端中打开各 Worktree:" -ForegroundColor Yellow
for ($i = 1; $i -le $Count; $i++) {
    $worktreePath = Join-Path $ParentDir "${Prefix}-${i}"
    Write-Host "   cd ${worktreePath}; claude-code" -ForegroundColor White
}
Write-Host ""
Write-Host "2. 使用并行 Agent 启动任务:" -ForegroundColor Yellow
Write-Host '   Task({ subagent_type: "general-purpose", prompt: "..." })' -ForegroundColor White
Write-Host ""
Write-Host "3. 完成后合并分支:" -ForegroundColor Yellow
Write-Host "   git checkout $BaseBranch" -ForegroundColor White
Write-Host "   git merge feature/${TaskName}-task-1" -ForegroundColor White
Write-Host "   git merge feature/${TaskName}-task-2" -ForegroundColor White
Write-Host "   ..." -ForegroundColor White
Write-Host ""
Write-Host "4. 清理 Worktree:" -ForegroundColor Yellow
Write-Host "   .\scripts\parallel-dev-cleanup.ps1 -Prefix ${Prefix}" -ForegroundColor White
Write-Host ""
