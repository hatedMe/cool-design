<script setup lang="ts">
import { ref } from "vue";
import { Button, Loading, Space, Switch } from "../../index";
const loading = ref(true);
const count = ref(0);
</script>

<template>
  <Space direction="vertical" align="stretch" :size="20">
    <Switch v-model="loading">加载中</Switch>
    <Loading :loading="loading" overlay text="正在加载列表…">
      <div style="padding: 32px; border: 1px solid var(--i-border)">
        <Button @click="count++">区域内操作（{{ count }}）</Button>
      </div>
    </Loading>
  </Space>
</template>
