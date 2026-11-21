<script setup lang="ts">
import { Splitter, SplitterPanel } from '../../index';
</script>

<template>
  <Splitter style="height: 250px; border: 1px solid #dcdfe6">
    <SplitterPanel size="30%">
      <div style="display: flex; align-items: center; justify-content: center; height: 100%">面板 1</div>
    </SplitterPanel>
    <SplitterPanel :min="200">
      <div style="display: flex; align-items: center; justify-content: center; height: 100%">面板 2</div>
    </SplitterPanel>
  </Splitter>
</template>
