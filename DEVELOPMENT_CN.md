# 二次开发说明

## 1. 项目目录

- `cmd/server/`：程序主入口，命令行参数解析、配置加载、登录流程和服务启动都从这里进入。
- `internal/api/`：HTTP API 服务、路由、管理端接口。
- `internal/auth/`：各供应商 OAuth 或设备码登录实现。
- `internal/config/`：`config.yaml` 结构定义、校验和加载逻辑。
- `internal/runtime/`：请求执行、重试、配额与运行时控制。
- `internal/translator/`：不同协议之间的请求/响应转换。
- `internal/watcher/`：监听 `config.yaml` 和 `auths/` 的热更新。
- `internal/store/`：本地文件、Git、Postgres、对象存储几种配置和凭证存储后端。
- `internal/tui/`：终端管理 UI。
- `sdk/`：把代理服务作为库嵌入其他 Go 项目的能力。
- `examples/`：最小示例。
- `test/`：集成测试。
- `web/`：新的管理前端工程，基于 React + Vite。
- `auths/`：本地认证文件目录，开发时默认使用这个目录。

## 2. 本地开发默认配置

仓库根目录已经补好以下文件：

- `config.yaml`：本地开发配置，默认监听 `127.0.0.1:8317`
- `.env`：本地环境变量，默认开启管理端密码 `dev-management-key`
- `Makefile`：常用开发命令入口

默认测试 API Key：

```text
dev-api-key
```

默认管理端密码：

```text
dev-management-key
```

## 3. 启动方式

### 直接运行

```bash
make run
```

或：

```bash
go run ./cmd/server
```

### 常用命令

```bash
make test
make build
make fmt
make web-dev
make web-build
make web-build-embed
```

前端开发细节见 [web/README_CN.md](web/README_CN.md)。

## 4. 开发入口建议

- 新增供应商支持：优先看 `internal/auth/`、`internal/runtime/`、`internal/translator/`
- 改管理端接口：看 `internal/api/handlers/management/`
- 改模型路由与重试：看 `internal/runtime/`、`internal/registry/`
- 改配置结构：先改 `internal/config/`，再检查 `config.example.yaml` 和 watcher
- 改登录落盘或远程存储：看 `sdk/auth/` 和 `internal/store/`

## 5. 当前环境注意点

- 该项目 `go.mod` 指定 `go 1.26.0`
- 首次执行 `go run` / `go test` 时，Go 可能会自动下载 `1.26.0` toolchain
- 默认使用本地文件存储，不依赖 Postgres、Git 或对象存储
- 当前默认推荐前后端分离开发与部署
- 如果要接管内置管理页，可执行 `make web-build-embed`，并设置 `MANAGEMENT_STATIC_PATH=./web/dist`
