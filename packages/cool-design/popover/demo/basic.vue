<script setup lang="ts">
import { Popover } from '../../index';
</script>
<template>
  <Popover title="标题" content="补充说明" placement="top" :width="200">
    <template #reference>
      <button type="button">查看说明</button>
    </template>
  </Popover>
</template>
