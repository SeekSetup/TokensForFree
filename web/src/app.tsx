import { FormEvent, useEffect, useMemo, useState } from "react";
import { APIError, getJSON, getText, putJSON, putText, type ConfigResponse, type UsageResponse } from "./api";

type SectionId = "overview" | "providers" | "auth" | "raw";

type ProviderSnapshot = {
  apiKeys: string[];
  gemini: unknown[];
  claude: unknown[];
  codex: unknown[];
  openaiCompat: unknown[];
  vertex: unknown[];
};

type DashboardState = {
  config: ConfigResponse | null;
  usage: UsageResponse | null;
  authFiles: unknown[];
  providers: ProviderSnapshot;
  rawConfig: string;
};

const sections: Array<{ id: SectionId; label: string; blurb: string; icon: string }> = [
  { id: "overview", label: "Overview", blurb: "Service status & stats", icon: "m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" },
  { id: "providers", label: "Providers", blurb: "Configure AI providers", icon: "M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" },
  { id: "auth", label: "Auth Files", blurb: "Inspect credentials", icon: "M4 7V4a2 2 0 0 1 2-2h8.5M20 8v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7M14 2v4a2 2 0 0 0 2 2h4" },
  { id: "raw", label: "Config", blurb: "Edit raw YAML", icon: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" }
];

const emptyState: DashboardState = {
  config: null,
  usage: null,
  authFiles: [],
  providers: {
    apiKeys: [],
    gemini: [],
    claude: [],
    codex: [],
    openaiCompat: [],
    vertex: []
  },
  rawConfig: ""
};

const managementKeyStorageKey = "cliproxy.management.key";

export default function App() {
  const [section, setSection] = useState<SectionId>("overview");
  const [managementKey, setManagementKey] = useState(() => localStorage.getItem(managementKeyStorageKey) ?? "");
  const [draftKey, setDraftKey] = useState(managementKey);
  const [apiKeysDraft, setAPIKeysDraft] = useState("");
  const [rawConfigDraft, setRawConfigDraft] = useState("");
  const [state, setState] = useState<DashboardState>(emptyState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("Enter management key to load control panel.");
  const [error, setError] = useState<string>("");
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    localStorage.setItem(managementKeyStorageKey, managementKey);
  }, [managementKey]);

  useEffect(() => {
    if (!managementKey.trim()) {
      return;
    }
    void reloadDashboard(managementKey);
  }, [managementKey]);

  const providerCards = useMemo(
    () => [
      { title: "API Keys", value: state.providers.apiKeys.length, tone: "amber" },
      { title: "Gemini", value: state.providers.gemini.length, tone: "cyan" },
      { title: "Claude", value: state.providers.claude.length, tone: "emerald" },
      { title: "Codex", value: state.providers.codex.length, tone: "salmon" },
      { title: "OpenAI Compat", value: state.providers.openaiCompat.length, tone: "violet" },
      { title: "Vertex Compat", value: state.providers.vertex.length, tone: "slate" }
    ],
    [state.providers]
  );

  async function reloadDashboard(key: string) {
    setLoading(true);
    setError("");
    setMessage("Loading management data...");

    try {
      const [config, usage, authFilesPayload, rawConfig, apiKeysPayload, geminiPayload, claudePayload, codexPayload, openaiPayload, vertexPayload] =
        await Promise.all([
          getJSON<ConfigResponse>("/v0/management/config", key),
          getJSON<UsageResponse>("/v0/management/usage", key),
          getJSON<Record<string, unknown>>("/v0/management/auth-files", key),
          getText("/v0/management/config.yaml", key),
          getJSON<{ "api-keys"?: string[] }>("/v0/management/api-keys", key),
          getJSON<{ "gemini-api-key"?: unknown[] }>("/v0/management/gemini-api-key", key),
          getJSON<{ "claude-api-key"?: unknown[] }>("/v0/management/claude-api-key", key),
          getJSON<{ "codex-api-key"?: unknown[] }>("/v0/management/codex-api-key", key),
          getJSON<{ "openai-compatibility"?: unknown[] }>("/v0/management/openai-compatibility", key),
          getJSON<{ "vertex-api-key"?: unknown[] }>("/v0/management/vertex-api-key", key)
        ]);

      const authFiles = normalizeArrayPayload(authFilesPayload);
      const apiKeys = apiKeysPayload["api-keys"] ?? [];
      setState({
        config,
        usage,
        authFiles,
        rawConfig,
        providers: {
          apiKeys,
          gemini: geminiPayload["gemini-api-key"] ?? [],
          claude: claudePayload["claude-api-key"] ?? [],
          codex: codexPayload["codex-api-key"] ?? [],
          openaiCompat: openaiPayload["openai-compatibility"] ?? [],
          vertex: vertexPayload["vertex-api-key"] ?? []
        }
      });
      setAPIKeysDraft(apiKeys.join("\n"));
      setRawConfigDraft(rawConfig);
      setLastSync(new Date());
      setMessage("Management data synced.");
    } catch (err) {
      const nextError = formatError(err);
      setError(nextError);
      setMessage("Failed to load data. Check management key and service status.");
    } finally {
      setLoading(false);
    }
  }

  async function handleKeySubmit(event: FormEvent) {
    event.preventDefault();
    setManagementKey(draftKey.trim());
  }

  async function handleSaveAPIKeys() {
    if (!managementKey.trim()) {
      setError("Please enter management key first.");
      return;
    }

    const apiKeys = apiKeysDraft
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean);

    setLoading(true);
    setError("");
    setMessage("Saving API Keys...");
    try {
      await putJSON("/v0/management/api-keys", managementKey, apiKeys);
      await reloadDashboard(managementKey);
      setMessage("API Keys saved.");
    } catch (err) {
      setError(formatError(err));
      setMessage("Failed to save.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveRawConfig() {
    if (!managementKey.trim()) {
      setError("Please enter management key first.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("Writing config.yaml...");
    try {
      await putText("/v0/management/config.yaml", managementKey, rawConfigDraft, "application/yaml");
      await reloadDashboard(managementKey);
      setMessage("config.yaml updated.");
    } catch (err) {
      setError(formatError(err));
      setMessage("Failed to write config.");
    } finally {
      setLoading(false);
    }
  }

  const configSummary = summarizeConfig(state.config);
  const authFileCount = state.authFiles.length;
  const requestCount = readUsageTotal(state.usage);

  return (
    <div className="shell">
      <aside className="nav">
        <div className="nav-group">
          {sections.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={section === entry.id ? "nav-item active" : "nav-item"}
              onClick={() => setSection(entry.id)}
            >
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="nav-icon"
              >
                <path d={entry.icon} />
              </svg>
              <div className="nav-text">
                <span>{entry.label}</span>
                <small>{entry.blurb}</small>
              </div>
            </button>
          ))}
        </div>

        <form className="access-card" onSubmit={(event) => void handleKeySubmit(event)}>
          <label htmlFor="management-key">Management Key</label>
          <div className="input-group">
            <input
              id="management-key"
              type="password"
              value={draftKey}
              onChange={(event) => setDraftKey(event.target.value)}
              placeholder="Enter key..."
              className="field input"
            />
            <button type="submit" className="btn primary">Connect</button>
          </div>
        </form>

        <div className="nav-footer">
          <ThemeToggle />
        </div>
      </aside>

      <header className="topbar">
        <div className="topbar-left">
          <div className="brand">
            <h1>OPENCLAW</h1>
            <p className="brand-copy">GATEWAY DASHBOARD</p>
          </div>
        </div>
        <div className="topbar-right">
          <div className="status-group">
            <div className="pill">
              <span className="dot ok"></span>
              <span className="label">版本 2026.3.11</span>
            </div>
            <div className="pill">
              <span className="dot ok"></span>
              <span className="label">健康状况 正常</span>
            </div>
            {lastSync ? (
              <div className="pill">
                <span className="statusDot ok"></span>
                <span>Connected</span>
              </div>
            ) : (
              <div className="pill danger">
                <span className="statusDot"></span>
                <span>Disconnected</span>
              </div>
            )}
          </div>
          <div className="topbar-actions">
            <button className="icon-btn" title="Notifications">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </button>
            <button className="icon-btn" title="Settings">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>
            <button className="icon-btn" title="Refresh">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
            </button>
          </div>
        </div>
      </header>

      <main className="content">
        <header className="hero">
          <div>
            <p className="eyebrow">Overview</p>
            <h2>服务概览</h2>
            <p aria-live="polite">{message}</p>
            {lastSync && <p className="muted" style={{ marginTop: "6px", fontSize: "12px" }}>Last sync: {lastSync.toLocaleString("zh-CN")}</p>}
          </div>
          <div className="hero-actions">
            <button type="button" className="ghost-button" disabled={loading || !managementKey.trim()} onClick={() => void reloadDashboard(managementKey)}>
              {loading ? "Syncing..." : "Refresh"}
            </button>
          </div>
        </header>

        {error ? (
          <div className="callout danger" style={{ marginBottom: "20px" }} role="alert">
            <strong>Error:</strong> {error}
          </div>
        ) : null}

        {loading && !lastSync ? (
          <>
            <section className="metrics-grid" aria-hidden="true">
              <div className="metric-card skeleton stagger-1" style={{ height: "92px", border: "none" }}></div>
              <div className="metric-card skeleton stagger-2" style={{ height: "92px", border: "none" }}></div>
              <div className="metric-card skeleton stagger-3" style={{ height: "92px", border: "none" }}></div>
              <div className="metric-card skeleton stagger-4" style={{ height: "92px", border: "none" }}></div>
            </section>
            <section className="panel-grid" aria-hidden="true">
              <article className="panel tall skeleton stagger-5" style={{ height: "300px", border: "none" }}></article>
              <article className="panel skeleton stagger-6" style={{ height: "300px", border: "none" }}></article>
            </section>
          </>
        ) : null}

        {section === "overview" && (!loading || lastSync) ? (
          <div className="overview-layout">
            <div className="overview-main">
              <article className="panel access-config">
                <div className="panel-header">
                  <h3>网关访问</h3>
                  <span>仅授权连接的位置及其身份验证方式。</span>
                </div>
                <div className="field-grid">
                  <div className="field-item">
                    <label>WebSocket URL</label>
                    <input type="text" value="ws://127.0.0.1:18789" readOnly className="input" />
                  </div>
                  <div className="field-item">
                    <label>网关令牌</label>
                    <input type="text" value="OPENCLAW_GATEWAY_TOKEN" readOnly className="input" />
                  </div>
                  <div className="field-item">
                    <label>密码 (不存储)</label>
                    <input type="password" value="system or shared password" readOnly className="input" />
                  </div>
                  <div className="field-item">
                    <label>默认会话密码</label>
                    <input type="text" value="agent:main:main" readOnly className="input" />
                  </div>
                  <div className="field-item">
                    <label>语言</label>
                    <input type="text" value="简体中文 (简体中文)" readOnly className="input" />
                  </div>
                </div>
                <div className="panel-footer">
                  <button className="btn primary">连接</button>
                  <button className="btn ghost">刷新</button>
                  <small className="muted">点击连接以应用连接更改。</small>
                </div>
              </article>

              <div className="snapshot-grid">
                <article className="panel snapshot-card">
                  <div className="panel-header">
                    <h3>实例</h3>
                  </div>
                  <div className="snapshot-value">
                    <strong>2</strong>
                    <p>过去 5 分钟内的在线信号。</p>
                  </div>
                </article>
                <article className="panel snapshot-card">
                  <div className="panel-header">
                    <h3>会话</h3>
                  </div>
                  <div className="snapshot-value">
                    <strong>6</strong>
                    <p>网关跟踪的最近会话密钥。</p>
                  </div>
                </article>
                <article className="panel snapshot-card">
                  <div className="panel-header">
                    <h3>定时任务</h3>
                  </div>
                  <div className="snapshot-value">
                    <strong>已启用</strong>
                    <p>下次唤醒 n/a</p>
                  </div>
                </article>
              </div>

              <article className="panel remarks-panel">
                <div className="panel-header">
                  <h3>备注</h3>
                  <span>远程控制设置的快速提醒。</span>
                </div>
                <div className="remarks-grid">
                  <div className="remark-item">
                    <strong>Tailscale serve</strong>
                    <p>启用 serve 模式以通过 tailnet 身份验证将网关保持在互联地址。</p>
                  </div>
                  <div className="remark-item">
                    <strong>会话清理</strong>
                    <p>使用 /new 或 sessions.patch 重置上下文。</p>
                  </div>
                  <div className="remark-item">
                    <strong>定时任务提醒</strong>
                    <p>为重复运行使用限制短时会话。</p>
                  </div>
                </div>
              </article>
            </div>

            <aside className="overview-sidebar">
              <article className="panel snapshot-summary">
                <div className="panel-header">
                  <h3>快照</h3>
                  <span>最新的网关摘要信息。</span>
                </div>
                <div className="status-cards">
                  <div className="status-mini-card">
                    <small>状态</small>
                    <strong className="ok">正常</strong>
                  </div>
                  <div className="status-mini-card">
                    <small>运行时间</small>
                    <strong>19h</strong>
                  </div>
                  <div className="status-mini-card">
                    <small>数据用量</small>
                    <strong>不适用</strong>
                  </div>
                  <div className="status-mini-card">
                    <small>最新网关版本</small>
                    <strong>just now</strong>
                  </div>
                </div>
                <div className="snapshot-footer">
                  <p>使用频道理接 WhatsApp、Telegram、Discord、Signal 或 iMessage。</p>
                </div>
              </article>
            </aside>
          </div>
        ) : null}
        {section === "providers" && (!loading || lastSync) ? (
          <section className="panel-grid">
            <article className="panel tall">
              <div className="panel-header">
                <h3>API Keys</h3>
                <span>One key per line</span>
              </div>
              <textarea
                className="editor"
                value={apiKeysDraft}
                onChange={(event) => setAPIKeysDraft(event.target.value)}
                spellCheck={false}
              />
              <div className="actions">
                <button type="button" className="btn primary" onClick={() => void handleSaveAPIKeys()} disabled={loading}>
                  Save Keys
                </button>
              </div>
            </article>

            <article className="panel">
              <div className="panel-header">
                <h3>Provider Stats</h3>
                <span>Active providers</span>
              </div>
              <div className="stack-list">
                {providerCards.map((card) => (
                  <div key={card.title} className={`stack-row tone-${card.tone}`}>
                    <span>{card.title}</span>
                    <strong>{card.value}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel">
              <div className="panel-header">
                <h3>Provider Data</h3>
                <span>Raw provider snapshot</span>
              </div>
              <div className="json-stack">
                <pre>{JSON.stringify(state.providers, null, 2)}</pre>
              </div>
            </article>
          </section>
        ) : null}

        {section === "auth" && (!loading || lastSync) ? (
          <section className="panel-grid">
            <article className="panel tall">
              <div className="panel-header">
                <h3>Authentication Files</h3>
                <span>OAuth credentials and status</span>
              </div>
              <div className="auth-grid">
                {state.authFiles.map((entry, index) => (
                  <article key={index} className="auth-card">
                    <div className="auth-card-header">
                      <span>Auth #{index + 1}</span>
                    </div>
                    <pre>{JSON.stringify(entry, null, 2)}</pre>
                  </article>
                ))}
                {!state.authFiles.length ? (
                  <div className="config-empty">
                    <div className="config-empty__icon">📁</div>
                    <div className="config-empty__text">No auth files found</div>
                  </div>
                ) : null}
              </div>
            </article>
          </section>
        ) : null}

        {section === "raw" && (!loading || lastSync) ? (
          <section className="panel-grid">
            <article className="panel tall">
              <div className="panel-header">
                <h3>config.yaml</h3>
                <span>Direct configuration editing</span>
              </div>
              <textarea
                className="editor yaml"
                value={rawConfigDraft}
                onChange={(event) => setRawConfigDraft(event.target.value)}
                spellCheck={false}
              />
              <div className="actions">
                <button type="button" className="btn primary" onClick={() => void handleSaveRawConfig()} disabled={loading}>
                  Save Config
                </button>
              </div>
            </article>
          </section>
        ) : null}
      </main>
    </div>
  );
}

function MetricCard(props: { title: string; value: number | string; accent: string }) {
  return (
    <article className={`metric-card tone-${props.accent}`}>
      <span>{props.title}</span>
      <strong>{props.value}</strong>
    </article>
  );
}

function summarizeConfig(config: ConfigResponse | null): Array<{ label: string; value: string }> {
  if (!config) {
    return [
      { label: "Host", value: "-" },
      { label: "Port", value: "-" },
      { label: "Debug", value: "-" },
      { label: "Auth Dir", value: "-" }
    ];
  }

  return [
    { label: "Host", value: stringifyValue(config.host) },
    { label: "Port", value: stringifyValue(config.port) },
    { label: "Debug", value: stringifyValue(config.debug) },
    { label: "Auth Dir", value: stringifyValue(config["auth-dir"]) }
  ];
}

function readUsageTotal(usage: UsageResponse | null): string | null {
  if (!usage) {
    return null;
  }

  const candidates = [usage.total_requests, usage.totalRequests, usage.total];
  for (const candidate of candidates) {
    if (typeof candidate === "number") {
      return candidate.toLocaleString("zh-CN");
    }
  }
  return null;
}

function normalizeArrayPayload(payload: Record<string, unknown>): unknown[] {
  const values = Object.values(payload);
  if (values.length === 1 && Array.isArray(values[0])) {
    return values[0];
  }
  if (Array.isArray(payload.items)) {
    return payload.items;
  }
  return [];
}

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value);
}

function formatError(error: unknown): string {
  if (error instanceof APIError) {
    return `${error.message}: ${error.body || "unknown error"}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "未知错误";
}

function ThemeToggle() {
  const [theme, setTheme] = useState<"system" | "light" | "dark">(() => {
    return (localStorage.getItem("cliproxy.theme") as "system" | "light" | "dark") || "system";
  });

  useEffect(() => {
    const isDark =
      theme === "dark" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem("cliproxy.theme", theme);
  }, [theme]);

  const themes = ["system", "light", "dark"] as const;
  const currentIndex = themes.indexOf(theme);

  return (
    <div className="theme-toggle">
      <div className="theme-toggle__track" style={{ "--theme-index": currentIndex } as React.CSSProperties}>
        <div className="theme-toggle__indicator"></div>
        <button
          className={`theme-toggle__button ${theme === "system" ? "active" : ""}`}
          onClick={() => setTheme("system")}
          title="System Theme"
        >
          <svg className="theme-icon" viewBox="0 0 24 24">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
        </button>
        <button
          className={`theme-toggle__button ${theme === "light" ? "active" : ""}`}
          onClick={() => setTheme("light")}
          title="Light Theme"
        >
          <svg className="theme-icon" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        </button>
        <button
          className={`theme-toggle__button ${theme === "dark" ? "active" : ""}`}
          onClick={() => setTheme("dark")}
          title="Dark Theme"
        >
          <svg className="theme-icon" viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
