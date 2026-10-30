<script setup lang="ts">
import { Badge, Space } from '../../index';
</script>

<template>
  <Space>
    <Badge :value="0" :show-zero="true" :offset="[4, 6]" color="#626aef">零值</Badge>
    <Badge :value="120" :max="99">上限</Badge>
    <Badge :hidden="true" value="隐藏">隐藏</Badge>
  </Space>
</template>
