<script setup lang="ts">
import { Button, Space } from "../../index";
</script>

<template>
  <Space wrap>
    <Button plain>朴素</Button>
    <Button type="primary" text>文字</Button>
    <Button type="success" link>链接样式</Button>
    <Button type="warning" round>圆角</Button>
    <Button type="danger" dashed>虚线</Button>
    <Button type="primary" circle icon="icon-add" aria-label="新增" />
  </Space>
</template>
