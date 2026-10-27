# 过渡动画

为桌面应用的提示区域、筛选面板和列表变化添加适度动画，有助于理解内容如何出现或消失。本页使用 Vue 3 内置的 Transition、TransitionGroup 和标准 CSS。

## 当前支持范围

| 能力                      | 当前行为                                                       |
| ------------------------- | -------------------------------------------------------------- |
| 业务区域的进入、离开      | 使用 Vue 3 Transition 包裹业务元素，动画类由应用定义           |
| 列表增删、排序过渡        | 使用 Vue 3 TransitionGroup，并为每项提供稳定唯一的 key         |
| Loading 旋转              | 组件内置 `0.8s` 循环动画，遵循减少动态效果偏好                 |
| Dialog、MessageBox 等浮层 | 当前未提供 `transition`、`duration` 等动画属性                 |
| 通用动画类                | 当前组件库没有导出通用淡入、缩放等样式类，本页示例包含所需 CSS |

页面底部可切换“淡入淡出”“滑动渐变”并查看完整 Vue 源码。

## 淡入淡出

Transition 包裹一个元素，通过 `v-if` 或 `v-show` 改变其可见性。`name="panel-fade"` 对应下面的 CSS 类名前缀。

```vue
<script setup lang="ts">
import { ref, Transition } from "vue";
import { Button, Space } from "cool-design";
const visible = ref(true);
</script>

<template>
  <Space direction="vertical" align="stretch" :size="16">
    <Button :aria-expanded="visible" aria-controls="filter-tip" @click="visible = !visible">切换提示</Button>
    <div class="panel-stage">
      <Transition name="panel-fade">
        <div v-if="visible" id="filter-tip" class="panel">修改筛选条件后，点击查询更新列表。</div>
      </Transition>
    </div>
  </Space>
</template>

<style scoped>
.panel-stage {
  min-height: 72px;
}
.panel {
  padding: 20px;
  border: 1px solid var(--i-border);
  border-radius: var(--i-radius);
}
.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: opacity 180ms ease;
}
.panel-fade-enter-from,
.panel-fade-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .panel-fade-enter-active,
  .panel-fade-leave-active {
    transition: none;
  }
}
</style>
```

样式导入和应用根部 ConfigProvider 的配置同 [快速上手](#/guide/quickstart)。Transition 默认只对后续显示变化执行动画；需要首次渲染也执行时，添加 `appear`。

## 过渡类如何对应

| 类名             | 生效时机           | 常见用途             |
| ---------------- | ------------------ | -------------------- |
| `*-enter-from`   | 进入动画的起始状态 | 透明度 0、轻微位移   |
| `*-enter-active` | 进入动画全过程     | 时长、缓动、过渡属性 |
| `*-enter-to`     | 进入动画的结束状态 | 透明度 1、位移归零   |
| `*-leave-from`   | 离开动画的起始状态 | 保持正常显示状态     |
| `*-leave-active` | 离开动画全过程     | 时长、缓动、过渡属性 |
| `*-leave-to`     | 离开动画的结束状态 | 透明度 0、轻微位移   |

示例中的正常状态已经是透明度 1，因此省略了 `enter-to` 和 `leave-from` 的显式定义。

## 滑动与渐变

对进入与离开状态同时设置 `opacity`、`transform`。只过渡需要变化的属性，避免使用 `transition: all`：

```css
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition:
    opacity 220ms ease,
    transform 220ms ease;
}
.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
@media (prefers-reduced-motion: reduce) {
  .panel-slide-enter-active,
  .panel-slide-leave-active {
    transition: none;
  }
}
```

配合 `<Transition name="panel-slide">` 使用。实际布局可为动画区域保留高度，避免相邻操作按钮随内容显隐跳动。

## 列表过渡

TransitionGroup 可处理多个子元素。稳定的业务 ID 用作 key，排序和删除时不要使用数组下标作为 key。

```vue
<script setup lang="ts">
import { ref, TransitionGroup } from "vue";
import { Button, Space } from "cool-design";
let nextId = 3;
const items = ref([
  { id: 1, name: "产品设计" },
  { id: 2, name: "研发中心" }
]);
function add() {
  const id = nextId++;
  items.value.push({ id, name: `新增部门 ${id}` });
}
</script>

<template>
  <Space direction="vertical" align="stretch" :size="16">
    <Button @click="add">添加部门</Button>
    <TransitionGroup name="department" tag="ul" class="department-list">
      <li v-for="item in items" :key="item.id">
        <span>{{ item.name }}</span>
        <Button size="small" @click="items = items.filter((row) => row.id !== item.id)">移除</Button>
      </li>
    </TransitionGroup>
  </Space>
</template>

<style scoped>
.department-list {
  position: relative;
  margin: 0;
  padding: 0;
  list-style: none;
}
.department-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid var(--i-border);
}
.department-move,
.department-enter-active,
.department-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}
.department-enter-from,
.department-leave-to {
  opacity: 0;
  transform: translateX(12px);
}
.department-leave-active {
  position: absolute;
  width: 100%;
}
@media (prefers-reduced-motion: reduce) {
  .department-move,
  .department-enter-active,
  .department-leave-active {
    transition: none;
  }
}
</style>
```

## 显示切换与交互

- `v-if` 会在离开动画结束后移除元素；再次显示会重新创建其中的表单状态。
- `v-show` 保留节点和状态，适合需要频繁展开、收起的区域。
- 切换两个不同内容时可使用不同的 `key`，并通过 `mode="out-in"` 先离开后进入；列表过渡使用 TransitionGroup。
- 交互控件隐藏前应处理焦点，避免键盘焦点留在不可见区域。示例将切换按钮放在动画区域外。
- Dialog、MessageBox 自己管理挂载、浮层宿主、焦点和滚动锁，不能把外包 Transition 当作现成的弹窗动画 API。本页示例用于业务内容区域。

## 减少动态效果

为自定义动画添加 `prefers-reduced-motion: reduce` 规则，在用户选择减少动态效果时关闭过渡。内置 Loading 也会停止旋转，但继续显示加载文字。

通常使用 150–250ms 的轻微透明度或位移动画即可；避免让必须等待动画完成才能操作的区域影响表单录入和高频操作。
