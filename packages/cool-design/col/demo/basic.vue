<script setup lang="ts">
import { Col, Row, Space } from '../../index';
</script>

<template>
  <Space direction="vertical" align="stretch" :size="16">
    <Row :gutter="16">
      <Col :span="6">
        <div class="grid-cell">span 6</div>
      </Col>
      <Col :span="18">
        <div class="grid-cell">span 18</div>
      </Col>
    </Row>
    <Row :gutter="16">
      <Col :span="12" :offset="6">
        <div class="grid-cell">span 12 / offset 6</div>
      </Col>
    </Row>
  </Space>
</template>

<style scoped>
.grid-cell {
  padding: 16px;
  text-align: center;
  background: var(--i-bg-subtle);
  border: 1px solid var(--i-border);
  border-radius: 4px;
}
</style>
