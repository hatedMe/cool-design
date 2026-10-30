<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Demo } from './catalog';
import { highlightCode } from './highlight';

const props = defineProps<{ demo: Demo; id: string }>();
const expanded = ref(false);
const feedback = ref('');
const highlightedSource = computed(() => highlightCode(props.demo.source, 'vue'));
async function copy() {
  try {
    await navigator.clipboard.writeText(props.demo.source);
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
        <component :is="demo.component" />
      </div>
      <div class="demo-toolbar">
        <button type="button" :aria-expanded="expanded" :aria-controls="`${id}-source`" @click="expanded = !expanded">
          {{ expanded ? '收起代码' : '查看代码' }}
        </button>
        <span role="status">{{ feedback }}</span>
        <button type="button" data-action="copy" @click="copy">复制代码</button>
      </div>
      <pre v-if="expanded" :id="`${id}-source`" class="demo-source" tabindex="0"><code
class="hljs language-vue"
                   v-html="highlightedSource"
      /></pre>
    </div>
  </section>
</template>
