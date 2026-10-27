<script setup lang="ts">
import { ref } from "vue";
import { Button, Space } from "../../package/index";

const visible = ref(true);
const effect = ref("guide-fade");
</script>

<template>
  <Space direction="vertical" align="stretch" :size="20">
    <Space :size="16">
      <label>
        动画效果
        <select v-model="effect" aria-label="动画效果">
          <option value="guide-fade">淡入淡出</option>
          <option value="guide-slide">滑动渐变</option>
        </select>
      </label>
      <Button
        type="primary"
        :aria-expanded="visible"
        aria-controls="guide-transition-panel"
        @click="visible = !visible">
        切换显示
      </Button>
    </Space>
    <div class="transition-stage">
      <Transition :name="effect">
        <div v-if="visible" id="guide-transition-panel" class="transition-panel">
          <strong>筛选提示</strong>
          <p>可以为页面中的提示区域、筛选面板添加进入与离开动画。</p>
        </div>
      </Transition>
    </div>
  </Space>
</template>

<style scoped>
select {
  margin-left: 8px;
  padding: 6px 10px;
  border: 1px solid var(--i-border);
  border-radius: 4px;
  background: var(--i-bg);
  color: var(--i-text);
}
.transition-stage {
  min-height: 120px;
}
.transition-panel {
  padding: 20px;
  border: 1px solid var(--i-border);
  border-radius: 6px;
  background: var(--i-bg-subtle);
}
.transition-panel p {
  margin: 8px 0 0;
}
.guide-fade-enter-active,
.guide-fade-leave-active {
  transition: opacity 180ms ease;
}
.guide-fade-enter-from,
.guide-fade-leave-to {
  opacity: 0;
}
.guide-slide-enter-active,
.guide-slide-leave-active {
  transition:
    opacity 220ms ease,
    transform 220ms ease;
}
.guide-slide-enter-from,
.guide-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
@media (prefers-reduced-motion: reduce) {
  .guide-fade-enter-active,
  .guide-fade-leave-active,
  .guide-slide-enter-active,
  .guide-slide-leave-active {
    transition: none;
  }
}
</style>
