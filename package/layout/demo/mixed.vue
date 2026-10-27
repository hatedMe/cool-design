<script setup lang="ts">
import { Row, Col } from "../../index";
</script>
<template>
  <div class="layout-example">
    <Row :gutter="16">
      <Col :span="16">
        <div class="grid-cell">16</div>
      </Col>
      <Col :span="8">
        <div class="grid-cell">8</div>
      </Col>
    </Row>
    <Row :gutter="16">
      <Col v-for="(span, index) in [8, 8, 4, 4]" :key="index" :span="span">
        <div class="grid-cell">
          {{ span }}
        </div>
      </Col>
    </Row>
    <Row :gutter="16">
      <Col v-for="(span, index) in [4, 16, 4]" :key="index" :span="span">
        <div class="grid-cell">
          {{ span }}
        </div>
      </Col>
    </Row>
  </div>
</template>
<style scoped>
.layout-example {
  display: grid;
  gap: 16px;
  padding: 0 12px;
}
.grid-cell {
  padding: 12px 4px;
  text-align: center;
  color: var(--i-primary);
  background: var(--i-primary-light-8);
  border-radius: var(--i-radius-small);
}
.i-col:nth-child(even) .grid-cell {
  background: var(--i-primary-light-9);
}
</style>
