# CLIProxyAPI 管理前端

清新干爽的前端管理面板，采用现代化设计，提供直观的配置管理和监控功能。

## 特性

- 🎨 **现代化设计** - 采用深色主题，渐变色彩，流畅动画
- 📊 **实时监控** - 查看服务状态、请求统计、认证概况
- ⚙️ **配置管理** - 可视化编辑 API Keys、Provider 配置
- 🔐 **安全认证** - 支持管理密钥保护
- 📱 **响应式布局** - 完美适配桌面和移动设备
- 🚀 **前后端分离** - 独立部署，灵活扩展

## 快速开始

### 开发模式

1. 安装依赖：
```bash
cd web
npm install
```

2. 启动后端服务：
```bash
cd ..
make run
```

3. 启动前端开发服务器：
```bash
cd web
npm run dev
```

4. 访问 `http://127.0.0.1:5173`

前端会自动代理 `/v0/*` 请求到后端 `http://127.0.0.1:8317`。

### 生产部署

#### 方式一：嵌入到 Go 服务

构建并嵌入到后端：

```bash
cd web
npm run build:embed
```

设置环境变量指向构建产物：

```bash
export MANAGEMENT_STATIC_PATH=/path/to/TokensForFree/web/dist
```

启动服务后访问：`http://127.0.0.1:8317/management.html`

#### 方式二：独立部署

1. 配置后端地址：
```bash
cd web
cp .env.production.example .env.production
# 编辑 .env.production，设置 VITE_MANAGEMENT_BASE_URL
```

2. 构建前端：
```bash
npm run build
```

3. 部署 `dist/` 目录到任意静态服务器（Nginx、CDN 等）

## 功能模块

### 总览页面
- 服务状态概览
- 请求统计数据
- 配置摘要信息
- Provider 密度分布
- 最近认证状态

### 接入配置
- 客户端 API Keys 管理
- Gemini、Claude、Codex 等 Provider 配置
- OpenAI 兼容接口配置
- Vertex AI 兼容配置

### 认证文件
- OAuth 认证文件列表
- 认证状态巡检
- 字段详情查看

### Raw YAML
- 直接编辑 `config.yaml`
- 高级用户模式
- 实时保存和同步

## 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **原生 CSS** - 无依赖样式

## 开发指南

### 项目结构

```
web/
├── src/
│   ├── main.tsx      # 入口文件
│   ├── app.tsx       # 主应用组件
│   ├── api.ts        # API 请求封装
│   └── styles.css    # 全局样式
├── dist/             # 构建产物
├── index.html        # HTML 模板
├── package.json      # 依赖配置
└── vite.config.ts    # Vite 配置
```

### 添加新功能

1. 在 `api.ts` 中添加 API 方法
2. 在 `app.tsx` 中添加状态和处理函数
3. 在 `styles.css` 中添加样式
4. 更新 UI 组件

### 样式规范

- 使用 CSS 变量和渐变
- 保持一致的间距和圆角
- 添加 hover 和 focus 状态
- 支持深色主题

## API 接口

前端通过以下 API 与后端通信：

- `GET /v0/management/config` - 获取配置
- `GET /v0/management/usage` - 获取使用统计
- `GET /v0/management/auth-files` - 获取认证文件
- `GET /v0/management/config.yaml` - 获取原始配置
- `PUT /v0/management/config.yaml` - 更新配置
- `GET /v0/management/api-keys` - 获取 API Keys
- `PUT /v0/management/api-keys` - 更新 API Keys

所有请求需要在 Header 中携带：
```
Authorization: Bearer <management-key>
```

## 环境变量

### 开发环境 (`.env.development`)
```bash
# 开发时通过 Vite 代理，无需配置
```

### 生产环境 (`.env.production`)
```bash
# 后端 API 地址
VITE_MANAGEMENT_BASE_URL=http://127.0.0.1:8317
```

## 浏览器支持

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 后续规划

- [ ] 日志检索与 request id 定位
- [ ] OAuth 登录工作流可视化
- [ ] 模型映射图表展示
- [ ] 实时请求监控
- [ ] 性能指标仪表盘
- [ ] 多语言支持
- [ ] 暗色/亮色主题切换

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
