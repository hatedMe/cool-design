<script setup lang="ts">
import { computed, ref } from 'vue';
import { Icon, Input, iconNames } from '../../index';
const query = ref('');
const selected = ref('');
const feedback = ref('');
const aliases: Record<string, string> = {
  'icon-search': '搜索 查找',
  'icon-close': '关闭 取消',
  'icon-add': '添加 新增',
  'icon-editor': '编辑 修改',
  'icon-delete': '删除',
  'icon-homepage': '首页',
  'icon-setup': '设置',
  'icon-people': '用户'
};
const filtered = computed(() => {
  const text = query.value.trim().toLowerCase();
  return iconNames.filter((name) => `${name} ${aliases[name] || ''}`.toLowerCase().includes(text));
});
async function copy(name: string) {
  selected.value = `<Icon type="${name}" />`;
  try {
    await navigator.clipboard.writeText(selected.value);
    feedback.value = '已复制图标用法';
  } catch {
    feedback.value = '无法自动复制，请手动复制下方代码';
  }
}
</script>
<template>
  <div class="icon-catalog">
    <label class="icon-catalog__search">
      搜索图标
      <Input v-model="query" type="search" clearable placeholder="输入名称或“搜索”“关闭”" />
    </label>
    <p>共 {{ iconNames.length }} 个图标，当前显示 {{ filtered.length }} 个。点击图标复制用法。</p>
    <output aria-live="polite">{{ feedback }}</output>
    <pre v-if="selected" tabindex="0"><code>{{ selected }}</code></pre>
    <div class="icon-catalog__grid">
      <button
        v-for="name in filtered"
        :key="name"
        class="icon-catalog__item"
        type="button"
        :aria-label="`复制 ${name}`"
        @click="copy(name)">
        <Icon :type="name" :size="24" />
        <span>{{ name }}</span>
      </button>
    </div>
    <p v-if="!filtered.length" role="status">没有匹配的图标，请更换搜索条件。</p>
  </div>
</template>
<style scoped>
.icon-catalog__search {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.icon-catalog__search .i-input {
  width: min(320px, 100%);
}
.icon-catalog__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
  max-height: 480px;
  overflow: auto;
  gap: 1px;
  border: 1px solid var(--i-border);
  background: var(--i-border);
}
.icon-catalog__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  min-width: 0;
  min-height: 100px;
  padding: 12px 6px;
  border: 0;
  background: var(--i-bg);
  color: var(--i-text);
}
.icon-catalog__item:hover {
  background: var(--i-primary-light-9);
  color: var(--i-primary);
}
.icon-catalog__item span {
  font-size: 11px;
  overflow-wrap: anywhere;
}
.icon-catalog output {
  display: block;
  min-height: 1.5em;
  color: var(--i-text-secondary);
}
</style>
