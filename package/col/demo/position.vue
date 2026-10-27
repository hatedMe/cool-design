<script setup lang="ts">
import { Col, Row, Space } from "../../index";
</script>
<template>
  <Space direction="vertical" align="stretch" :size="16">
    <Row data-grid="push-pull">
      <Col :span="8" :push="16">
        <div class="grid-cell">第一个 DOM 元素 / push 16</div>
      </Col>
      <Col :span="16" :pull="8">
        <div class="grid-cell">第二个 DOM 元素 / pull 8</div>
      </Col>
    </Row>
    <Row>
      <Col :span="12" :offset="6">
        <div class="grid-cell">offset 6 / 居中</div>
      </Col>
    </Row>
  </Space>
</template>
<style scoped>
.grid-cell {
  padding: 16px;
  text-align: center;
  border: 1px solid var(--i-border);
  background: var(--i-bg-subtle);
  overflow-wrap: anywhere;
}
</style>
