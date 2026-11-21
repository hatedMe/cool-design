<script setup lang="ts">
import { Skeleton, SkeletonItem, Space } from '../../index';
</script>

<template>
  <Space direction="vertical" align="stretch" :size="16">
    <Skeleton animated>
      <template #template>
        <SkeletonItem variant="image" />
        <SkeletonItem variant="h3" />
        <SkeletonItem variant="text" />
        <SkeletonItem variant="button" />
      </template>
    </Skeleton>
    <Skeleton :rows="0" animated>
      <template #template>
        <SkeletonItem variant="circle" />
        <SkeletonItem variant="caption" />
        <SkeletonItem variant="rect" />
      </template>
    </Skeleton>
  </Space>
</template>
