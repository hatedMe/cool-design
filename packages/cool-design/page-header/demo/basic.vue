<script setup lang="ts">
import { PageHeader } from '../../index';
const goBack = () => {
  console.log('back');
};
</script>
<template>
  <PageHeader title="返回" content="详情页" @back="goBack">
    <template #extra>
      <button type="button">编辑</button>
    </template>
    <template #default>
      <p>用户信息</p>
    </template>
  </PageHeader>
</template>
