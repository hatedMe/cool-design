<script setup lang="ts">
import { PageHeader, Breadcrumb } from '../../index';
const items = [{ label: '首页', to: '#' }, { label: '详情' }];
const goBack = () => {
  console.log('back');
};
</script>
<template>
  <PageHeader title="返回" content="用户详情" @back="goBack">
    <template #breadcrumb>
      <Breadcrumb :items="items" />
    </template>
    <template #extra>
      <button type="button">编辑</button>
    </template>
    <p>详情内容区域</p>
  </PageHeader>
</template>
