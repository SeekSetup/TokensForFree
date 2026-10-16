# 龙虾风格设计系统

## 🎨 设计理念

基于 OpenClaw (龙虾) Gateway Dashboard 的设计系统，专注于：
- **专业性** - 工程感、精致、可靠
- **极简主义** - 去除多余装饰，突出核心功能
- **一致性** - 统一的间距、圆角、颜色系统

## 🎯 核心配色

### 主色调
```css
--accent: #ff5c5c;           /* 珊瑚红 - 主要操作 */
--accent-hover: #ff7070;     /* 悬停状态 */
--accent-subtle: rgba(255, 92, 92, 0.15);  /* 淡化背景 */
--accent-glow: rgba(255, 92, 92, 0.25);    /* 光晕效果 */
```

### 背景色
```css
--bg: #12141a;               /* 主背景 */
--bg-accent: #14161d;        /* 强调背景 */
--bg-elevated: #1a1d25;      /* 抬升元素 */
--bg-hover: #262a35;         /* 悬停状态 */
--card: #181b22;             /* 卡片背景 */
```

### 文字颜色
```css
--text: #e4e4e7;             /* 常规文字 */
--text-strong: #fafafa;      /* 强调文字 */
--muted: #71717a;            /* 次要文字 */
--muted-strong: #52525b;     /* 强调次要 */
```

### 边框
```css
--border: #27272a;           /* 常规边框 */
--border-strong: #3f3f46;    /* 强调边框 */
--border-hover: #52525b;     /* 悬停边框 */
```

### 功能色
```css
--ok: #22c55e;               /* 成功 */
--warn: #f59e0b;             /* 警告 */
--danger: #ef4444;           /* 危险 */
--info: #3b82f6;             /* 信息 */
```

## 📐 设计规范

### 圆角系统
```css
--radius-sm: 6px;            /* 小元素 */
--radius-md: 8px;            /* 中等元素 */
--radius-lg: 12px;           /* 大元素 */
--radius-full: 9999px;       /* 圆形 */
```

### 阴影系统
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.03);
--shadow-lg: 0 12px 28px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.03);
```

### 间距系统
- **卡片内边距**: 20px
- **卡片间距**: 16px
- **小间距**: 8-12px
- **大间距**: 24-32px

### 字体系统
```css
--font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace;
```

**字号规范**:
- 标题: 26px (h2), 17-18px (h3)
- 正文: 14px
- 小字: 13px
- 标签: 11-12px

## 🎭 组件设计

### 卡片 (Card)
```css
border: 1px solid var(--border);
background: var(--card);
border-radius: var(--radius-lg);
padding: 20px;
box-shadow: var(--shadow-sm), inset 0 1px 0 var(--card-highlight);
```

**悬停效果**:
- 边框变为 `--border-strong`
- 阴影升级为 `--shadow-md`

### 按钮 (Button)
```css
padding: 9px 16px;
border: 1px solid var(--accent);
border-radius: var(--radius-md);
background: var(--accent);
color: var(--accent-foreground);
font-size: 13px;
font-weight: 600;
```

**悬停效果**:
- 背景变为 `--accent-hover`
- 添加光晕: `0 0 20px var(--accent-glow)`
- 轻微上移: `translateY(-1px)`

### 输入框 (Input)
```css
padding: 10px 12px;
border: 1px solid var(--border);
border-radius: var(--radius-md);
background: var(--bg-elevated);
font-size: 14px;
```

**焦点效果**:
```css
border-color: var(--accent);
box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--accent);
```

### 导航项 (Nav Item)
```css
padding: 10px 12px;
border-radius: var(--radius-md);
font-size: 13px;
font-weight: 500;
```

**激活状态**:
```css
background: var(--accent-subtle);
border-color: rgba(255, 92, 92, 0.3);
color: var(--text-strong);
```

## 🎬 动画规范

### 缓动函数
```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### 持续时间
```css
--duration-fast: 0.12s;      /* 快速交互 */
--duration-normal: 0.2s;     /* 常规过渡 */
```

### 常用过渡
```css
transition: border-color var(--duration-fast) ease,
            background var(--duration-fast) ease,
            color var(--duration-fast) ease;
```

## 🔍 细节处理

### 高光效果
所有卡片添加内阴影高光：
```css
inset 0 1px 0 var(--card-highlight);
```

### 焦点环
```css
--focus-ring: 0 0 0 2px var(--bg), 0 0 0 4px var(--accent);
--focus-glow: 0 0 0 2px var(--bg), 0 0 0 4px var(--accent), 0 0 20px var(--accent-glow);
```

### 滚动条
```css
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: var(--radius-full);
}
::-webkit-scrollbar-thumb:hover {
  background: var(--border-strong);
}
```

## 📱 响应式断点

- **桌面**: > 1200px (侧边栏 + 内容区)
- **平板**: 720px - 1200px (堆叠布局)
- **手机**: < 720px (单列布局)

## ✨ 设计原则

1. **留白优先** - 给元素足够的呼吸空间
2. **层次分明** - 通过颜色、大小、间距建立视觉层次
3. **一致性** - 相同元素使用相同样式
4. **可访问性** - 足够的对比度、清晰的焦点状态
5. **性能优先** - 避免过度动画和复杂效果

## 🎨 与之前设计的对比

### 之前 (蓝紫色调)
- 主色: `#6366f1` (Indigo)
- 圆角: 10-16px
- 风格: 现代、科技感

### 现在 (龙虾风格)
- 主色: `#ff5c5c` (珊瑚红)
- 圆角: 6-12px (更小)
- 风格: 专业、工程感、精致

### 核心差异
1. **色彩** - 从冷色调改为暖色调
2. **圆角** - 更小的圆角，更硬朗
3. **间距** - 更紧凑的布局
4. **阴影** - 更微妙的阴影效果
5. **字体** - 更小的字号，更高的信息密度

## 🚀 使用建议

1. **严格遵循** - 不要随意修改颜色和间距
2. **保持简洁** - 避免添加不必要的装饰
3. **注重细节** - 1px 的边框、微妙的阴影都很重要
4. **测试交互** - 确保所有悬停、焦点状态正常
5. **响应式优先** - 确保在所有设备上都能正常显示

---

**参考**: OpenClaw Gateway Dashboard
**应用**: CLIProxyAPI Control Panel
**更新**: 2026-03-12
