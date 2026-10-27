<script setup lang="ts">
import { Space } from "../../index";
const radii = ["none", "small", "base", "large", "round", "circle"];
const shadows = ["small", "base", "large", "inset"];
</script>
<template>
  <Space direction="vertical" align="stretch" :size="24">
    <div class="border-samples">
      <div
        v-for="style in ['solid', 'dashed', 'dotted']"
        :key="style"
        class="border-sample"
        :style="{ borderStyle: style }">
        {{ style }}
      </div>
    </div>
    <div class="border-samples">
      <div
        v-for="color in ['strong', 'base', 'light', 'lighter']"
        :key="color"
        class="border-sample"
        :style="{ borderColor: color === 'base' ? 'var(--i-border-color)' : `var(--i-border-color-${color})` }">
        {{ color }}
      </div>
    </div>
    <div class="border-samples">
      <div
        v-for="radius in radii"
        :key="radius"
        class="border-sample radius-sample"
        :style="{ borderRadius: `var(--i-radius-${radius})` }">
        {{ radius }}
      </div>
    </div>
    <div class="border-samples shadow-samples">
      <div
        v-for="shadow in shadows"
        :key="shadow"
        class="border-sample"
        :style="{ boxShadow: `var(--i-shadow-${shadow})` }">
        {{ shadow }}
      </div>
    </div>
  </Space>
</template>
<style scoped>
.border-samples {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.border-sample {
  display: grid;
  place-items: center;
  min-width: 110px;
  min-height: 64px;
  padding: 12px;
  border: var(--i-border-base);
  background: var(--i-bg);
  font-size: 13px;
}
.radius-sample {
  width: 88px;
  height: 88px;
  min-width: 0;
}
.shadow-samples {
  padding: 16px 8px;
  gap: 28px;
}
.shadow-samples .border-sample {
  border: 0;
  border-radius: var(--i-radius);
}
</style>
