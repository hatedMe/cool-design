<script setup lang="ts">
import { Row, Col } from "../../index";
</script>
<template>
  <div class="layout-example">
    <Row v-for="span in [24, 12, 8, 6, 4]" :key="span">
      <Col v-for="n in 24 / span" :key="n" :span="span">
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
