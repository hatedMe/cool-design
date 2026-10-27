<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { Input, Switch, Table, Tag, version } from '../../package/index';
import type { TableColumn } from '../../package/index';

const title = 'Cool Design';
const typedTitle = ref('');
let typingTimer: ReturnType<typeof setTimeout>;
let motionPreference: MediaQueryList;

function startTyping() {
  clearTimeout(typingTimer);
  typedTitle.value = title;
  if (motionPreference.matches) return;
  let deleting = false;
  function tick() {
    typedTitle.value = title.slice(0, typedTitle.value.length + (deleting ? -1 : 1));
    let delay = deleting ? 80 : 155;
    if (!typedTitle.value.length) {
      deleting = false;
      delay = 650;
    } else if (typedTitle.value === title) {
      deleting = true;
      delay = 2400;
    }
    typingTimer = setTimeout(tick, delay);
  }
  typedTitle.value = '';
  typingTimer = setTimeout(tick, 350);
}
onMounted(() => {
  motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  startTyping();
  motionPreference.addEventListener('change', startTyping);
});
onBeforeUnmount(() => {
  clearTimeout(typingTimer);
  motionPreference.removeEventListener('change', startTyping);
});

const search = ref('');
const members = ref([
  { id: 1, name: '陈晨', department: '产品设计', enabled: true },
  { id: 2, name: '林沐', department: '研发中心', enabled: true },
  { id: 3, name: '周远', department: '运营支持', enabled: false }
]);
const filteredMembers = computed(() => {
  const keyword = search.value.trim();
  return members.value.filter((member) => `${member.name}${member.department}`.includes(keyword));
});
const columns: TableColumn[] = [
  { key: 'name', title: '成员', width: 100 },
  { key: 'department', title: '所属部门', width: 120 },
  { key: 'status', title: '状态', width: 90 },
  { key: 'action', title: '启用', width: 70 }
];
const resources = [
  {
    title: '从第一个按钮开始',
    description: '安装、引入与使用，用一个简单示例了解 Cool Design。',
    href: 'guide/quickstart',
    label: '快速上手'
  },
  {
    title: '搭建清晰的页面结构',
    description: '用栅格、间距和布局容器，组织桌面应用的信息层级。',
    href: 'components/container',
    label: '布局组件'
  },
  {
    title: '让数据与操作有序呈现',
    description: '组合表单、表格与反馈组件，完成日常业务流程。',
    href: 'examples/user-management',
    label: '业务示例'
  },
  {
    title: '让界面拥有你的风格',
    description: '从主题色到深浅模式，让组件融入产品的视觉语言。',
    href: 'guide/theme',
    label: '自定义主题'
  }
];
const capabilities = [
  {
    number: '01',
    title: '基础与布局',
    description: '按钮、输入、间距、栅格与容器，先把页面骨架搭稳。',
    href: 'components/container',
    label: '查看布局'
  },
  {
    number: '02',
    title: '表单与数据',
    description: '表单校验、选择器、表格和分页，覆盖常见的后台工作流。',
    href: 'components/form',
    label: '查看表单'
  },
  {
    number: '03',
    title: '反馈与状态',
    description: '提示、弹窗、加载和空状态，让每一次操作都有明确回应。',
    href: 'components/dialog',
    label: '查看反馈'
  }
];
const scenarios = [
  { title: '后台工作台', description: '侧栏导航、工具栏、表格和批量操作，快速组成高频业务页面。' },
  { title: '数据录入工具', description: '用清晰的字段关系和即时校验，降低复杂表单的填写成本。' },
  { title: '运营管理台', description: '把筛选、状态、反馈与权限操作放在用户熟悉的位置。' }
];
</script>

<template>
  <div class="home-page">
    <section class="home-hero" aria-labelledby="home-title">
      <div class="home-intro">
        <span class="home-release">
          Vue 3 桌面组件库
          <span>v{{ version }}</span>
        </span>
        <h1 id="home-title" :aria-label="title">
          <span class="home-title-placeholder" aria-hidden="true">{{ title }}</span>
          <TransitionGroup tag="span" name="home-letter" class="home-title-typed" aria-hidden="true">
            <span v-for="(letter, index) in typedTitle" :key="index" class="home-title-letter">
              {{ letter }}
            </span>
          </TransitionGroup>
        </h1>
        <p class="home-headline">
          为桌面应用提供
          <br />
          清晰、一致的交互。
        </p>
        <p class="home-description">从一颗按钮到一整套工作台，用熟悉的组件构建顺手的界面，让你专注于产品本身。</p>
        <div class="home-actions">
          <a class="home-primary" href="#/guide/quickstart">开始使用</a>
          <a class="home-secondary" href="#/components/button">
            浏览组件
            <span aria-hidden="true">↗</span>
          </a>
        </div>
        <code class="home-install">npm install cool-design</code>
      </div>

      <div class="home-preview-area">
        <section class="home-workspace" aria-label="组件交互预览">
          <div class="home-window-bar">
            <span class="home-window-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>Cool 工作台</span>
            <span class="home-window-hint">组件预览</span>
          </div>
          <div class="home-workspace-body">
            <div class="home-workspace-heading">
              <div>
                <span class="home-workspace-caption">团队空间 / 成员</span>
                <h2>成员管理</h2>
              </div>
              <Tag type="success">协作中</Tag>
            </div>
            <div class="home-preview-toolbar">
              <Input v-model="search" clearable aria-label="搜索预览成员" placeholder="搜索姓名或部门" />
              <span role="status">{{ filteredMembers.length }} 位成员</span>
            </div>
            <Table :data="filteredMembers" :columns="columns" empty-text="未找到成员，试试其他关键词">
              <template #status="{ row }">
                <Tag :type="row.enabled ? 'success' : 'info'" size="small">
                  {{ row.enabled ? '已启用' : '已停用' }}
                </Tag>
              </template>
              <template #action="{ row }">
                <Switch v-model="row.enabled" :aria-label="`启用${row.name}`" />
              </template>
            </Table>
            <div class="home-workspace-footer">
              <span>每一次操作，都有清晰的状态。</span>
              <a href="#/examples/user-management">查看完整示例</a>
            </div>
          </div>
        </section>
        <p class="home-preview-note">
          <span aria-hidden="true">↖</span>
          试着搜索成员，或切换启用状态
        </p>
      </div>
    </section>

    <section class="home-principles" aria-label="设计理念">
      <div>
        <h2>清晰的层级</h2>
        <p>让信息易于浏览，让关键操作一眼可见。</p>
      </div>
      <div>
        <h2>一致的体验</h2>
        <p>统一尺寸、间距与状态，减少操作中的犹豫。</p>
      </div>
      <div>
        <h2>恰当的反馈</h2>
        <p>从输入到完成，让每一步都有明确回应。</p>
      </div>
    </section>

    <section class="home-capabilities" aria-labelledby="home-capabilities-title">
      <div class="home-section-heading">
        <h2 id="home-capabilities-title">一套组件，覆盖日常工作台。</h2>
        <p>从页面结构到操作反馈，保持同一套体验。</p>
      </div>
      <div class="home-capability-grid">
        <a
          v-for="capability in capabilities"
          :key="capability.number"
          :href="`#/${capability.href}`"
          class="home-capability">
          <span class="home-capability-number">{{ capability.number }}</span>
          <div class="home-capability-art" aria-hidden="true">
            <template v-if="capability.number === '01'">
              <span class="home-art-sidebar" />
              <span class="home-art-panel home-art-panel--wide" />
              <span class="home-art-panel home-art-panel--short" />
              <i />
              <i />
              <i />
              <i />
            </template>
            <template v-else-if="capability.number === '02'">
              <span class="home-art-field home-art-field--long" />
              <span class="home-art-field" />
              <span class="home-art-field home-art-field--short" />
              <span class="home-art-button" />
            </template>
            <template v-else>
              <span class="home-art-toast">
                <b />
                已保存
              </span>
              <span class="home-art-dialog">
                <b />
                <b />
                <b />
              </span>
            </template>
          </div>
          <h3>{{ capability.title }}</h3>
          <p>{{ capability.description }}</p>
          <span class="home-capability-link">
            {{ capability.label }}
            <span aria-hidden="true">↗</span>
          </span>
        </a>
      </div>
    </section>

    <section class="home-scenarios" aria-labelledby="home-scenarios-title">
      <div class="home-scenario-copy">
        <span class="home-kicker">为桌面场景而做</span>
        <h2 id="home-scenarios-title">
          让复杂的工作，
          <br />
          变得更容易完成。
        </h2>
        <p>Cool Design 关注桌面应用里真正重要的细节：稳定的布局、可预期的状态和不打断工作的反馈。</p>
        <a class="home-text-link" href="#/guide/transition">
          了解交互细节
          <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div class="home-scenario-list">
        <article v-for="(scenario, index) in scenarios" :key="scenario.title" class="home-scenario">
          <span>0{{ index + 1 }}</span>
          <div>
            <h3>{{ scenario.title }}</h3>
            <p>{{ scenario.description }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="home-resources" aria-labelledby="home-resources-title">
      <div class="home-section-heading">
        <h2 id="home-resources-title">从这里，开始构建。</h2>
        <p>找到下一步需要的文档和示例。</p>
      </div>
      <div class="home-resource-grid">
        <a v-for="resource in resources" :key="resource.href" :href="`#/${resource.href}`" class="home-resource">
          <span class="home-resource-label">
            {{ resource.label }}
            <span aria-hidden="true">↗</span>
          </span>
          <h3>{{ resource.title }}</h3>
          <p>{{ resource.description }}</p>
        </a>
      </div>
    </section>
    <footer class="docs-footer home-footer">
      <span>Cool Design · 为桌面应用提供清晰、一致的交互。</span>
      <a href="#/guide/install">安装指南</a>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.home-page {
  padding-top: 12px;
  h1,
  h2,
  h3,
  p {
    margin: 0;
  }
}
.home-hero {
  display: grid;
  grid-template-columns: 0.95fr 1.15fr;
  align-items: center;
  gap: 64px;
  padding: 64px 0 76px;
}
.home-release {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: var(--i-text-secondary);
  font-size: 13px;
  span {
    padding: 2px 8px;
    border: 1px solid var(--i-border);
    border-radius: 20px;
    font-size: 11px;
  }
}
.home-page h1 {
  display: grid;
  margin: 22px 0 18px;
  color: var(--i-primary);
  font-size: clamp(44px, 4.6vw, 66px);
  font-weight: 750;
  letter-spacing: -2.5px;
  line-height: 1.1;
}
.home-title-placeholder,
.home-title-typed {
  grid-area: 1 / 1;
  white-space: pre;
}
.home-title-placeholder {
  visibility: hidden;
}
.home-title-letter {
  display: inline-block;
  max-width: 1.5em;
  overflow-x: clip;
  overflow-y: visible;
  vertical-align: bottom;
  transition:
    max-width 180ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 160ms ease,
    transform 180ms ease,
    filter 160ms ease;
}
.home-letter-enter-from,
.home-letter-leave-to {
  max-width: 0;
  opacity: 0;
  transform: translateY(0.04em);
  filter: blur(2px);
}
.home-title-typed::after {
  content: '';
  display: inline-block;
  width: 3px;
  height: 0.85em;
  margin-left: 5px;
  background: currentColor;
  vertical-align: -0.02em;
  animation: home-cursor-blink 1.2s ease-in-out infinite;
}
@keyframes home-cursor-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.15;
  }
}
@media (prefers-reduced-motion: reduce) {
  .home-title-letter {
    transition: none;
  }
  .home-title-typed::after {
    display: none;
    animation: none;
  }
}
.home-headline {
  font-size: clamp(25px, 2.7vw, 36px);
  font-weight: 600;
  letter-spacing: -1px;
  line-height: 1.55;
}
.home-description {
  max-width: 365px;
  margin-top: 22px !important;
  color: var(--i-text-secondary);
  font-size: 15px;
}
.home-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin: 30px 0 20px;
}
.home-actions a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 11px 23px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
}
.home-actions .home-primary {
  color: var(--i-on-primary);
  background: var(--i-primary);
  border: 1px solid var(--i-primary);
  &:hover {
    background: var(--i-primary-hover);
  }
}
.home-actions .home-secondary {
  color: var(--i-text);
  border: 1px solid var(--i-border);
  &:hover {
    background: var(--i-bg-subtle);
  }
}
.home-install {
  color: var(--i-text-secondary);
  &::before {
    content: '$ ';
    color: var(--i-text-muted);
  }
}
.home-preview-area {
  min-width: 0;
  position: relative;
  padding: 24px 0 0;
  &::before {
    content: '';
    position: absolute;
    inset: -30px -25px 0;
    border-radius: 50%;
    background: radial-gradient(ellipse, color-mix(in srgb, var(--i-primary) 10%, transparent), transparent 70%);
    pointer-events: none;
  }
}
.home-workspace {
  position: relative;
  border: 1px solid var(--i-border);
  border-radius: 10px;
  background: var(--i-bg);
  box-shadow: 0 20px 65px -28px color-mix(in srgb, var(--i-text) 30%, transparent);
  overflow: hidden;
}
.home-window-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 18px;
  background: var(--i-bg-subtle);
  border-bottom: 1px solid var(--i-border);
  color: var(--i-text-secondary);
  font-size: 11px;
}
.home-window-dots {
  display: flex;
  gap: 5px;
  i {
    width: 7px;
    height: 7px;
    border: 1px solid var(--i-border);
    border-radius: 50%;
    background: var(--i-bg);
  }
}
.home-window-hint {
  margin-left: auto;
}
.home-workspace-body {
  padding: 24px 20px 18px;
}
.home-workspace-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  h2 {
    margin-top: 9px;
    font-size: 20px;
  }
}
.home-workspace-caption {
  color: var(--i-text-secondary);
  font-size: 11px;
}
.home-preview-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 22px 0 16px;
  .i-input {
    max-width: 240px;
    min-width: 0;
  }
  > span:last-child {
    margin-left: auto;
    white-space: nowrap;
    font-size: 11px;
    color: var(--i-text-secondary);
  }
}
.home-workspace-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  margin-top: 18px;
  font-size: 11px;
  color: var(--i-text-secondary);
}
.home-preview-note {
  position: relative;
  margin-top: 18px !important;
  text-align: center;
  color: var(--i-text-secondary);
  font-size: 12px;
  span {
    margin-right: 6px;
    color: var(--i-primary);
  }
}
.home-principles {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  padding: 32px 0;
  border-top: 1px solid var(--i-border);
  border-bottom: 1px solid var(--i-border);
  h2 {
    font-size: 16px;
  }
  p {
    margin-top: 9px;
    color: var(--i-text-secondary);
    font-size: 13px;
  }
}
.home-resources {
  padding-top: 58px;
}
.home-capabilities {
  padding-top: 58px;
}
.home-capability-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 28px;
}
.home-capability {
  min-height: 230px;
  padding: 22px;
  border: 1px solid var(--i-border);
  border-radius: 8px;
  background: var(--i-bg-subtle);
  transition:
    border-color 160ms ease,
    transform 160ms ease;
  &:hover {
    border-color: var(--i-primary);
    transform: translateY(-3px);
  }
  h3 {
    margin: 36px 0 10px;
    font-size: 18px;
  }
  p {
    color: var(--i-text-secondary);
    font-size: 13px;
    line-height: 1.8;
  }
}
.home-capability-number,
.home-kicker {
  color: var(--i-primary);
  font-family: Consolas, 'Cascadia Code', monospace;
  font-size: 12px;
}
.home-capability-art {
  position: relative;
  height: 70px;
  margin-top: 16px;
  overflow: hidden;
  border: 1px solid var(--i-border);
  border-radius: 5px;
  background: var(--i-bg);
}
.home-art-sidebar {
  position: absolute;
  inset: 0 auto 0 0;
  width: 22%;
  background: color-mix(in srgb, var(--i-primary) 13%, var(--i-bg));
  border-right: 1px solid var(--i-border);
}
.home-art-panel {
  position: absolute;
  left: 31%;
  height: 7px;
  border-radius: 2px;
  background: var(--i-primary);
  opacity: 0.75;
  &--wide {
    top: 17px;
    width: 48%;
  }
  &--short {
    top: 31px;
    width: 30%;
    opacity: 0.25;
  }
}
.home-capability-art > i {
  position: absolute;
  top: 49px;
  width: 13px;
  height: 10px;
  border: 1px solid var(--i-border);
  border-radius: 2px;
  background: var(--i-bg-subtle);
  &:nth-of-type(1) {
    left: 31%;
  }
  &:nth-of-type(2) {
    left: 43%;
  }
  &:nth-of-type(3) {
    left: 55%;
  }
  &:nth-of-type(4) {
    left: 67%;
  }
}
.home-art-field {
  position: absolute;
  left: 14%;
  top: 22px;
  width: 29%;
  height: 9px;
  border: 1px solid var(--i-border);
  border-radius: 2px;
  &--long {
    top: 13px;
    width: 56%;
  }
  &:nth-of-type(3) {
    top: 38px;
    width: 42%;
  }
}
.home-art-button {
  position: absolute;
  left: 67%;
  top: 38px;
  width: 18%;
  height: 10px;
  border-radius: 2px;
  background: var(--i-primary);
}
.home-art-toast,
.home-art-dialog {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--i-border);
  border-radius: 3px;
  background: var(--i-bg);
  box-shadow: var(--i-shadow);
  color: var(--i-text-secondary);
  font-size: 9px;
}
.home-art-toast {
  top: 11px;
  right: 13%;
  padding: 5px 8px;
  b {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--i-success);
  }
}
.home-art-dialog {
  left: 18%;
  top: 32px;
  width: 51%;
  height: 24px;
  padding: 0 7px;
  b {
    display: block;
    width: 22%;
    height: 4px;
    border-radius: 2px;
    background: var(--i-border);
    &:first-child {
      width: 37%;
      background: var(--i-primary);
    }
  }
}
.home-capability-link,
.home-text-link {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin-top: 24px;
  color: var(--i-primary);
  font-size: 12px;
}
.home-scenarios {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 80px;
  margin-top: 82px;
  padding: 58px 0;
  border-top: 1px solid var(--i-border);
  border-bottom: 1px solid var(--i-border);
}
.home-scenario-copy {
  h2 {
    margin-top: 18px;
    font-size: clamp(25px, 3vw, 36px);
    letter-spacing: -1px;
    line-height: 1.45;
  }
  p {
    max-width: 380px;
    margin-top: 20px;
    color: var(--i-text-secondary);
    font-size: 14px;
    line-height: 1.9;
  }
}
.home-scenario-list {
  border-top: 1px solid var(--i-border);
}
.home-scenario {
  display: grid;
  grid-template-columns: 46px 1fr;
  gap: 18px;
  padding: 22px 0;
  border-bottom: 1px solid var(--i-border);
  > span {
    color: var(--i-text-muted);
    font-family: Consolas, 'Cascadia Code', monospace;
    font-size: 12px;
  }
  h3 {
    font-size: 16px;
  }
  p {
    margin-top: 8px;
    color: var(--i-text-secondary);
    font-size: 13px;
    line-height: 1.75;
  }
}
.home-section-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  h2 {
    font-size: 24px;
  }
  p {
    color: var(--i-text-secondary);
    font-size: 13px;
  }
}
.home-resource-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-top: 28px;
}
.home-resource {
  padding: 20px 0;
  border-top: 2px solid var(--i-border);
  &:hover {
    border-color: var(--i-primary);
  }
  h3 {
    margin: 18px 0 10px;
    color: var(--i-text);
    font-size: 16px;
  }
  p {
    color: var(--i-text-secondary);
    font-size: 13px;
  }
}
.home-resource-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  span {
    color: var(--i-text-muted);
  }
}
.home-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
}
@media (max-width: 1100px) {
  .home-hero {
    gap: 32px;
  }
  .home-resource-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 900px) {
  .home-hero {
    grid-template-columns: 1fr;
    padding-top: 24px;
    gap: 24px;
  }
  .home-description {
    max-width: 460px;
  }
  .home-preview-area {
    max-width: 620px;
    width: 100%;
  }
  .home-principles {
    gap: 20px;
  }
  .home-scenarios {
    gap: 36px;
  }
}
@media (max-width: 540px) {
  .home-page {
    padding-top: 0;
  }
  .home-hero {
    padding-bottom: 36px;
  }
  .home-principles {
    grid-template-columns: 1fr;
    gap: 22px;
  }
  .home-resource-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .home-capability-grid,
  .home-scenarios {
    grid-template-columns: 1fr;
  }
  .home-capability-grid {
    gap: 12px;
  }
  .home-scenarios {
    gap: 36px;
    margin-top: 54px;
    padding: 38px 0;
  }
  .home-workspace-body {
    padding: 18px 12px;
  }
  .home-resources {
    padding-top: 36px;
  }
  .home-preview-area::before {
    inset: -20px 0 0;
  }
}
</style>
