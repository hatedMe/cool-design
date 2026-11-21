<script setup lang="ts">
import { Breadcrumb, BreadcrumbItem } from '../../index';
</script>
<template>
  <Breadcrumb separator="/">
    <BreadcrumbItem :to="{ path: '/' }">首页</BreadcrumbItem>
    <BreadcrumbItem :to="'#/list'">列表</BreadcrumbItem>
    <BreadcrumbItem>详情</BreadcrumbItem>
  </Breadcrumb>
</template>
