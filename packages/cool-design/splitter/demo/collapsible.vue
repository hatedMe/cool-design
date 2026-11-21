<script setup lang="ts">
import { ref } from 'vue';
import { Splitter, SplitterPanel } from '../../index';

const leftSize = ref(120);
</script>

<template>
  <Splitter style="height: 220px; border: 1px solid #dcdfe6">
    <SplitterPanel v-model:size="leftSize" collapsible :min="80" :max="240">
      <div style="display: flex; align-items: center; justify-content: center; height: 100%">
        左 {{ leftSize }}px
      </div>
    </SplitterPanel>
    <SplitterPanel collapsible>
      <div style="display: flex; align-items: center; justify-content: center; height: 100%">右</div>
    </SplitterPanel>
  </Splitter>
</template>
