<script setup lang="ts">
import { Timeline, TimelineItem } from '../../index';
</script>
<template>
  <Timeline>
    <TimelineItem timestamp="2026-01-01" type="success">发布 1.0 版本</TimelineItem>
    <TimelineItem timestamp="2026-02-01" type="primary" placement="top">发布 1.1 版本</TimelineItem>
    <TimelineItem timestamp="2026-03-01" color="#e6a23c" hollow>灰度验证</TimelineItem>
  </Timeline>
</template>
