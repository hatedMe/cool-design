<script setup lang="ts">
import { Popover } from '../../index';
</script>
<template>
  <Popover title="标题" trigger="click" placement="top" :width="200">
    <template #default="{ hide }">
      <p>补充说明</p>
      <button type="button" @click="hide()">关闭</button>
    </template>
    <template #reference>
      <button type="button">查看说明</button>
    </template>
  </Popover>
</template>
