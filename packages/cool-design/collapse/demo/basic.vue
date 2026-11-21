<script setup lang="ts">
import { ref } from 'vue';
import { Collapse, CollapseItem } from '../../index';
const active = ref(['1']);
</script>
<template>
  <Collapse v-model="active">
    <CollapseItem title="一致性 Consistency" name="1">
      <p>与现实生活一致：与现实生活的流程、逻辑保持一致，遵循用户习惯的语言和概念。</p>
    </CollapseItem>
    <CollapseItem title="反馈 Feedback" name="2">
      <p>通过界面样式和交互动效让用户可以清晰地感知自己的操作。</p>
    </CollapseItem>
    <CollapseItem title="效率 Efficiency" name="3" disabled>
      <p>禁用状态下不可展开。</p>
    </CollapseItem>
  </Collapse>
</template>
