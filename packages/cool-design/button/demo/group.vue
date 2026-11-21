<script setup lang="ts">
import { Button, ButtonGroup } from '../../index';
</script>

<template>
  <div class="button-demo-group">
    <ButtonGroup type="primary">
      <Button>上一页</Button>
      <Button>下一页</Button>
    </ButtonGroup>
    <ButtonGroup type="primary" direction="vertical">
      <Button icon="icon-add">新增</Button>
      <Button icon="icon-delete">删除</Button>
    </ButtonGroup>
  </div>
</template>

<style scoped>
.button-demo-group {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
</style>
