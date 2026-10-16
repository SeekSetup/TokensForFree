# 快速开始 - 前端管理面板

## 🎯 一分钟启动

### 1. 启动后端
```bash
# 在项目根目录
make run
```

### 2. 启动前端
```bash
# 在 web 目录
cd web
./start-dev.sh
```

### 3. 访问面板
打开浏览器访问：**http://127.0.0.1:5173**

输入管理密钥：`dev-management-key`（默认）

## 📸 功能预览

### 总览页面
- ✅ 实时服务状态
- ✅ 请求统计数据
- ✅ 配置摘要信息
- ✅ Provider 分布图

### 接入配置
- ✅ API Keys 管理
- ✅ Provider 配置查看
- ✅ 一键保存更新

### 认证文件
- ✅ OAuth 文件列表
- ✅ 认证状态巡检
- ✅ 详细信息展示

### Raw YAML
- ✅ 直接编辑配置
- ✅ 实时保存同步
- ✅ 语法高亮显示

## 🎨 设计特点

- **现代化深色主题** - 渐变背景，柔和色彩
- **流畅动画效果** - hover、focus、transition
- **响应式布局** - 完美适配各种屏幕
- **直观的交互** - 清晰的视觉反馈

## 🔧 开发模式

前端修改会自动热重载，无需手动刷新浏览器。

API 请求会自动代理到后端 `http://127.0.0.1:8317`。

## 📦 生产部署

### 嵌入到后端
```bash
cd web
npm run build:embed

# 设置环境变量
export MANAGEMENT_STATIC_PATH=/path/to/web/dist

# 启动服务
make run

# 访问 http://127.0.0.1:8317/management.html
```

### 独立部署
```bash
cd web
cp .env.production.example .env.production
# 编辑 .env.production 设置后端地址
npm run build

# 部署 dist/ 到静态服务器
```

## 🐛 常见问题

### 前端无法连接后端
确认后端正在运行：
```bash
curl http://127.0.0.1:8317
```

### 管理密钥错误
检查 `config.yaml` 中的配置：
```yaml
remote-management:
  secret-key: "dev-management-key"
```

### 端口被占用
修改 `web/vite.config.ts` 中的端口配置。

## 📚 更多文档

- [完整开发文档](./README_CN.md)
- [项目开发指南](../DEVELOPMENT_CN.md)
- [API 接口文档](./README_CN.md#api-接口)

## 💡 提示

- 使用 Chrome/Edge 开发者工具查看网络请求
- 按 F12 打开控制台查看日志
- 修改样式后立即生效，无需重启

祝你开发愉快！🚀
