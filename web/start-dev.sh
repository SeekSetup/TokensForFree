#!/bin/bash

# CLIProxyAPI 前端开发启动脚本

echo "🚀 启动 CLIProxyAPI 管理前端..."
echo ""

# 检查 node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，正在安装依赖..."
    npm install
    echo ""
fi

# 检查后端是否运行
if ! curl -s http://127.0.0.1:8317 > /dev/null 2>&1; then
    echo "⚠️  警告: 后端服务未运行在 http://127.0.0.1:8317"
    echo "   请先在项目根目录运行: make run"
    echo ""
fi

echo "✨ 启动前端开发服务器..."
echo "   前端地址: http://127.0.0.1:5173"
echo "   后端代理: http://127.0.0.1:8317"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

npm run dev
