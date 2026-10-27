<script setup lang="ts">
import { Col, Row } from "../../index";
</script>

<template>
  <Row :gutter="16">
    <Col :span="8">
      <div class="grid-cell">span 8</div>
    </Col>
    <Col :span="8">
      <div class="grid-cell">span 8</div>
    </Col>
    <Col :span="8">
      <div class="grid-cell">span 8</div>
    </Col>
  </Row>
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
