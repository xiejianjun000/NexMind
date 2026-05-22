# NexMind 快速启动脚本

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  NexMind 本地部署脚本" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 检查Node.js
Write-Host "[1/4] 检查Node.js环境..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "  ✓ Node.js版本: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js未安装"
    }
} catch {
    Write-Host "  ✗ 错误: Node.js未安装或不在PATH中" -ForegroundColor Red
    Write-Host ""
    Write-Host "请先安装Node.js:" -ForegroundColor Yellow
    Write-Host "  下载地址: https://nodejs.org/" -ForegroundColor Cyan
    Write-Host "  推荐版本: Node.js 18+ LTS" -ForegroundColor Cyan
    exit 1
}

# 检查npm
Write-Host "[2/4] 检查npm环境..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "  ✓ npm版本: $npmVersion" -ForegroundColor Green
    } else {
        throw "npm未安装"
    }
} catch {
    Write-Host "  ✗ 错误: npm未安装" -ForegroundColor Red
    exit 1
}

# 安装依赖
Write-Host "[3/4] 安装项目依赖..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "  ℹ node_modules已存在，跳过安装" -ForegroundColor Blue
} else {
    Write-Host "  正在安装依赖，这可能需要几分钟..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ✗ 依赖安装失败" -ForegroundColor Red
        exit 1
    }
    Write-Host "  ✓ 依赖安装完成" -ForegroundColor Green
}

# 启动开发服务器
Write-Host "[4/4] 启动开发服务器..." -ForegroundColor Yellow
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  启动成功！" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "请在浏览器中访问:" -ForegroundColor White
Write-Host "  http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Yellow
Write-Host ""

# 启动Vite开发服务器
npm run dev
