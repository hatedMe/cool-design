<script setup lang="ts">
import { Button, Space } from '../../index';
</script>

<template>
  <Space wrap>
    <Button plain>朴素按钮</Button>
    <Button type="primary" plain>主要朴素</Button>
    <Button type="success" round>成功圆角</Button>
    <Button type="warning" dashed>警告虚线</Button>
    <Button type="danger" link>危险链接</Button>
    <Button type="primary" text>文字按钮</Button>
    <Button type="primary" circle icon="icon-add" aria-label="新增" />
  </Space>
</template>
