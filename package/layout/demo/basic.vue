<script setup lang="ts">
import { ref } from "vue";
import { Row, Col, Space } from "../../index";
const gutter = ref(16);
const justify = ref<"start" | "end" | "center" | "space-around" | "space-between" | "space-evenly">("start");
const align = ref<"top" | "center" | "bottom">("center");
</script>
<template>
  <Space direction="vertical" align="stretch" :size="20">
    <Space>
      <label>
        列间距
        <input v-model.number="gutter" type="number" min="0" max="48" step="8" />
      </label>
      <label>
        水平排列
        <select v-model="justify">
          <option
            v-for="value in ['start', 'end', 'center', 'space-around', 'space-between', 'space-evenly']"
            :key="value">
            {{ value }}
          </option>
        </select>
      </label>
      <label>
        垂直对齐
        <select v-model="align">
          <option v-for="value in ['top', 'center', 'bottom']" :key="value">{{ value }}</option>
        </select>
      </label>
    </Space>
    <div class="layout-stage">
      <Row :gutter="gutter" :justify="justify" :align="align" style="min-height: 120px">
        <Col v-for="n in 3" :key="n" :span="6">
          <div class="layout-cell" :style="{ height: `${32 + n * 16}px` }">span 6</div>
        </Col>
      </Row>
    </div>
  </Space>
</template>
<style scoped>
.layout-stage {
  padding: 16px 24px;
  border: var(--i-border-base);
  background: var(--i-bg-subtle);
}
.layout-cell {
  display: grid;
  place-items: center;
  background: var(--i-primary-light-8);
  color: var(--i-primary);
  border-radius: var(--i-radius-small);
  font-size: 12px;
}
label {
  display: flex;
  align-items: center;
  gap: 8px;
}
input,
select {
  min-width: 0;
  max-width: 150px;
  border: var(--i-border-base);
  border-radius: 4px;
  background: var(--i-bg);
  color: var(--i-text);
  padding: 4px 8px;
}
input {
  width: 64px;
}
</style>
