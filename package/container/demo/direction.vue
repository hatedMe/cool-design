<script setup lang="ts">
import { ref } from "vue";
import { Container, Aside, Main } from "../../index";
const direction = ref<"horizontal" | "vertical" | "">("");
</script>
<template>
  <div class="direction-demo">
    <label>
      排列方向
      <select v-model="direction">
        <option value="">自动判断</option>
        <option value="horizontal">horizontal</option>
        <option value="vertical">vertical</option>
      </select>
    </label>
    <Container :direction="direction || undefined">
      <Aside width="35%">侧栏区域</Aside>
      <Main>主内容区域</Main>
    </Container>
    <p>没有直接 Header/Footer 时自动横排；显式 direction 可以覆盖默认方向。</p>
  </div>
</template>
<style scoped>
.direction-demo select {
  margin-left: 8px;
  padding: 4px 8px;
  background: var(--i-bg);
  color: var(--i-text);
  border: var(--i-border-base);
  border-radius: var(--i-radius-small);
}
.direction-demo .i-container {
  height: 160px;
  gap: 12px;
  margin-top: 16px;
}
.direction-demo .i-aside,
.direction-demo .i-main {
  display: grid;
  place-items: center;
  color: var(--i-primary);
  background: var(--i-primary-light-9);
}
.direction-demo p {
  font-size: 12px;
  color: var(--i-text-muted);
}
</style>
