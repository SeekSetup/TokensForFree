# CLIProxyAPI 前端面板改造计划

## 📋 Context

当前的 CLIProxyAPI 管理面板已经基本采用了龙虾（OpenClaw）的设计风格，但在实现细节上还有差距。通过分析龙虾面板的源码（OpenClaw checkout 的 `ui/`），发现以下需要改进的地方：

1. **CSS 实现不够精细** - 缺少龙虾面板的一些微妙细节（内高光、多层阴影、精确的过渡动画）
2. **组件样式不完整** - 缺少一些龙虾面板的组件样式（pill、theme-toggle、statusDot等）
3. **响应式设计可优化** - 移动端适配不够细致
4. **交互细节缺失** - 缺少一些微交互效果（loading状态、动画等）

**目标**：完全对标龙虾面板的视觉效果和交互体验，让用户感受到专业、精致、工程感的管理界面。

## 🎯 改造策略

### 阶段一：CSS 设计系统完善

**参考文件**：
- OpenClaw checkout 的 `ui/src/styles.css`
- OpenClaw checkout 的 `ui/src/styles/layout.css`
- OpenClaw checkout 的 `ui/src/styles/components.css`

**目标文件**：
- `web/src/styles.css`

**改进内容**：

1. **完善 CSS 变量系统**
   - 添加缺失的变量：`--card-highlight`、`--chrome`、`--panel`、`--secondary`
   - 补充完整的阴影系统：`--shadow-xl`、`--shadow-glow`
   - 添加动画变量：`--ease-spring`、`--duration-slow`

2. **优化卡片样式**
   ```css
   /* 当前 */
   box-shadow: var(--shadow-sm), inset 0 1px 0 var(--card-highlight);

   /* 改进：添加内高光效果 */
   box-shadow: var(--shadow-sm), inset 0 1px 0 rgba(255, 255, 255, 0.05);
   ```

3. **完善按钮系统**
   - 添加 `.btn--sm` 小按钮样式
   - 添加 `.btn.active` 激活状态
   - 添加 `.btn.danger` 危险按钮
   - 优化 hover 时的光晕效果

4. **添加缺失的组件**
   - `.pill` - 状态标签
   - `.statusDot` - 状态指示器（带脉冲动画）
   - `.theme-toggle` - 主题切换器
   - `.callout` - 提示框（info、warning、danger）

5. **优化响应式设计**
   - 参考龙虾的 `layout.mobile.css`
   - 添加 600px 和 400px 断点的细致优化
   - 优化移动端的间距、字号、触摸区域

### 阶段二：组件功能增强

**目标文件**：
- `web/src/app.tsx`

**改进内容**：

1. **添加状态指示器**
   ```tsx
   <div className="topbar-status">
     <div className="pill">
       <span className="statusDot ok"></span>
       <span>Connected</span>
     </div>
   </div>
   ```

2. **优化加载状态**
   - 添加骨架屏（skeleton）
   - 按钮添加 loading 状态
   - 数据加载时显示脉冲动画

3. **改进错误提示**
   - 使用 `.callout.danger` 样式
   - 添加图标和关闭按钮
   - 支持多种提示类型（info、warning、success）

4. **添加空状态**
   ```tsx
   {!state.authFiles.length && (
     <div className="config-empty">
       <div className="config-empty__icon">📁</div>
       <div className="config-empty__text">No auth files found</div>
     </div>
   )}
   ```

### 阶段三：细节打磨

1. **动画优化**
   - 卡片入场动画：`animation: rise 0.35s var(--ease-out) backwards`
   - 添加 stagger 延迟：`.stagger-1` ~ `.stagger-6`
   - 优化过渡时间和缓动函数

2. **焦点状态**
   - 所有交互元素添加 `:focus-visible` 样式
   - 使用双层焦点环：`--focus-ring`
   - 重要操作添加光晕：`--focus-glow`

3. **滚动优化**
   - 自定义滚动条样式
   - 添加平滑滚动：`scroll-behavior: smooth`
   - 优化滚动容器的性能

4. **可访问性**
   - 添加 ARIA 标签
   - 优化键盘导航
   - 确保颜色对比度符合 WCAG AA 标准

## 📁 关键文件

### 需要修改的文件

1. **`web/src/styles.css`**
   - 完善 CSS 变量系统
   - 添加缺失的组件样式
   - 优化响应式设计
   - 添加动画和过渡效果

2. **`web/src/app.tsx`**
   - 添加状态指示器组件
   - 优化加载和错误状态
   - 添加空状态提示
   - 改进交互反馈

### 参考文件（只读）

1. **OpenClaw checkout 的 `ui/src/styles.css`**
   - 完整的 CSS 变量定义
   - 组件样式参考

2. **OpenClaw checkout 的 `ui/src/styles/layout.css`**
   - Shell 布局系统
   - 响应式设计规则

3. **OpenClaw checkout 的 `ui/src/styles/components.css`**
   - 按钮、卡片、表单组件
   - 状态指示器、标签等

## 🔍 具体改进点

### 1. CSS 变量补充

```css
/* 添加到 :root */
--card-highlight: rgba(255, 255, 255, 0.05);
--chrome: rgba(18, 20, 26, 0.95);
--chrome-strong: rgba(18, 20, 26, 0.98);
--panel: #12141a;
--panel-strong: #1a1d25;
--panel-hover: #262a35;
--secondary: #1e2028;
--secondary-foreground: #f4f4f5;

--shadow-xl: 0 24px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.03);
--shadow-glow: 0 0 30px var(--accent-glow);

--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--duration-slow: 0.35s;
```

### 2. 状态指示器组件

```css
.statusDot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--danger);
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
  animation: pulse-subtle 2s ease-in-out infinite;
}

.statusDot.ok {
  background: var(--ok);
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
  animation: none;
}

@keyframes pulse-subtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

### 3. Pill 标签组件

```css
.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--border);
  padding: 6px 12px;
  border-radius: var(--radius-full);
  background: var(--secondary);
  font-size: 13px;
  font-weight: 500;
  transition: border-color var(--duration-fast) ease;
}

.pill:hover {
  border-color: var(--border-strong);
}

.pill.danger {
  border-color: var(--danger-subtle);
  background: var(--danger-subtle);
  color: var(--danger);
}
```

### 4. Callout 提示框

```css
.callout {
  padding: 14px 16px;
  border-radius: var(--radius-md);
  background: var(--secondary);
  border: 1px solid var(--border);
  font-size: 13px;
  line-height: 1.5;
}

.callout.danger {
  border-color: rgba(239, 68, 68, 0.25);
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.04));
  color: var(--danger);
}

.callout.info {
  border-color: rgba(59, 130, 246, 0.25);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(59, 130, 246, 0.04));
  color: var(--info);
}
```

### 5. 空状态组件

```css
.config-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 80px 24px;
  text-align: center;
}

.config-empty__icon {
  font-size: 56px;
  opacity: 0.35;
}

.config-empty__text {
  color: var(--muted);
  font-size: 15px;
}
```

### 6. 加载状态

```css
.config-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 80px 24px;
  color: var(--muted);
}

.config-loading__spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: var(--radius-full);
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

## ✅ 验证方法

### 视觉验证
1. 启动开发服务器：`cd web && npm run dev`
2. 访问 `http://127.0.0.1:5173`
3. 对比龙虾面板 `http://127.0.0.1:18789/overview`
4. 检查以下方面：
   - 颜色是否一致
   - 圆角大小是否一致
   - 阴影效果是否一致
   - 间距是否一致
   - 动画是否流畅

### 交互验证
1. 测试所有按钮的 hover、active、disabled 状态
2. 测试输入框的 focus 状态和焦点环
3. 测试卡片的 hover 效果
4. 测试导航项的激活状态
5. 测试响应式布局（调整浏览器窗口大小）

### 功能验证
1. 输入管理密钥，验证连接功能
2. 切换不同的页面，验证导航功能
3. 编辑 API Keys，验证保存功能
4. 编辑 config.yaml，验证保存功能
5. 触发错误，验证错误提示

### 响应式验证
1. 桌面端（>1200px）- 侧边栏 + 内容区
2. 平板端（720-1200px）- 堆叠布局
3. 手机端（<720px）- 单列布局
4. 小屏端（<400px）- 极简布局

## 📊 预期效果

改造完成后，CLIProxyAPI 管理面板将：

1. **视觉上** - 与龙虾面板完全一致，专业、精致、工程感
2. **交互上** - 流畅的动画、清晰的反馈、舒适的操作体验
3. **功能上** - 保持现有功能完整性，增强用户体验
4. **代码上** - 更规范的 CSS 结构，更易维护和扩展

## 🎯 实施优先级

### P0 - 必须完成
- [ ] 完善 CSS 变量系统
- [ ] 优化卡片和按钮样式
- [ ] 添加状态指示器和 pill 组件
- [ ] 优化响应式设计

### P1 - 重要改进
- [ ] 添加加载和空状态
- [ ] 优化错误提示样式
- [ ] 完善动画效果
- [ ] 优化焦点状态

### P2 - 锦上添花
- [ ] 添加主题切换器
- [ ] 添加更多微交互
- [ ] 优化可访问性
- [ ] 性能优化

---

**预计工作量**：2-3小时
**风险评估**：低（只涉及样式和 UI 改进，不改变核心逻辑）
**回滚方案**：Git 版本控制，可随时回退
