<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, type Component } from 'vue';
import type { Demo } from './catalog';
import { highlightCode } from './highlight';

const props = defineProps<{ demo: Demo; id: string }>();
const component = shallowRef<Component>();
const source = ref<string>();
type LoadStatus = 'loading' | 'retry' | 'reload';
const componentStatus = ref<LoadStatus>('loading');
const sourceStatus = ref<LoadStatus>('loading');
const expanded = ref(false);
const feedback = ref('');
const highlightedSource = computed(() => highlightCode(source.value ?? '', 'vue'));

async function loadComponent(retrying = false) {
  componentStatus.value = 'loading';
  try {
    component.value = await props.demo.loadComponent();
  } catch (error) {
    // 模块请求失败可能可以重试。样式预加载等错误需重新初始化页面。
    componentStatus.value = !retrying && error instanceof TypeError ? 'retry' : 'reload';
  }
}

async function loadSource(retrying = false) {
  sourceStatus.value = 'loading';
  try {
    source.value = await props.demo.loadSource();
  } catch {
    sourceStatus.value = retrying ? 'reload' : 'retry';
  }
}

function reloadPage() {
  // 重新加载会保留 hash，并清除当前文档缓存的模块请求失败。
  window.location.reload();
}

onMounted(() => {
  void loadComponent();
  void loadSource();
});

async function copy() {
  if (source.value === undefined) return;
  try {
    await navigator.clipboard.writeText(source.value);
    feedback.value = '已复制';
  } catch {
    expanded.value = true;
    feedback.value = '请展开代码手动复制';
  }
}
</script>

<template>
  <section class="demo-section" :aria-labelledby="id">
    <h3 :id="id">
      {{ demo.title }}
    </h3>
    <p class="demo-description">
      {{ demo.description }}
    </p>
    <div class="demo-block">
      <div class="demo-preview">
        <component :is="component" v-if="component" />
        <template v-else-if="componentStatus !== 'loading'">
          <p role="alert">示例加载失败。</p>
          <button v-if="componentStatus === 'retry'" type="button" @click="loadComponent(true)">重试示例</button>
          <button v-else type="button" @click="reloadPage">重新加载当前页</button>
        </template>
        <p v-else role="status">正在加载示例…</p>
      </div>
      <div class="demo-toolbar">
        <button
          type="button"
          :aria-expanded="expanded"
          :aria-controls="`${id}-source`"
          :disabled="source === undefined"
          @click="expanded = !expanded">
          {{ expanded ? '收起代码' : '查看代码' }}
        </button>
        <span v-if="sourceStatus !== 'loading'" role="alert">源码加载失败。</span>
        <span v-else role="status">{{ source === undefined ? '正在加载源码…' : feedback }}</span>
        <button v-if="sourceStatus === 'retry'" type="button" data-action="retry-source" @click="loadSource(true)">
          重试源码
        </button>
        <button v-else-if="sourceStatus === 'reload'" type="button" @click="reloadPage">重新加载当前页</button>
        <button type="button" data-action="copy" :disabled="source === undefined" @click="copy">复制代码</button>
      </div>
      <pre v-if="expanded" :id="`${id}-source`" class="demo-source" tabindex="0"><code
class="hljs language-vue"
                   v-html="highlightedSource"
      /></pre>
    </div>
  </section>
</template>
