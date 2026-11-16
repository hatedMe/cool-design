<script setup lang="ts">
import { Timeline, TimelineItem } from '../../index';
</script>
<template>
  <Timeline mode="alternate" :reverse="false">
    <TimelineItem timestamp="2026-01-01" type="primary" size="large">需求评审</TimelineItem>
    <TimelineItem timestamp="2026-02-01" type="success">
      开发完成
      <template #dot><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#67c23a" /></template>
    </TimelineItem>
    <TimelineItem timestamp="2026-03-01" hide-timestamp center>上线（隐藏时间戳并居中）</TimelineItem>
  </Timeline>
</template>
