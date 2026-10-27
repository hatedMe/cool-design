<script setup lang="ts">
import { Button, Space } from '../../index';
</script>

<template>
  <Space>
    <Button type="primary" icon="icon-search">搜索</Button>
    <Button type="success" icon="icon-success">确认</Button>
    <Button type="danger" icon="icon-delete" aria-label="删除" />
    <Button type="primary">
      <i class="i-button__icon iconfont icon-add" aria-hidden="true" />
      自定义图标
    </Button>
  </Space>
</template>
