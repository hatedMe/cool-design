<script setup lang="ts">
import { ref } from 'vue';
import { Button, ConfigProvider, Input, Space, Switch, Tag } from '../../index';
const dark = ref(false);
const name = ref('');
</script>

<template>
  <Space direction="vertical" align="stretch" :size="16">
    <Switch v-model="dark">局部深色主题</Switch>
    <ConfigProvider :theme="dark ? 'dark' : 'light'" size="large" class="theme-preview">
      <Space>
        <Button type="primary">大尺寸按钮</Button>
        <Tag type="success">已启用</Tag>
      </Space>
      <Input v-model="name" placeholder="体验主题和大尺寸控件" aria-label="主题示例输入框" />
    </ConfigProvider>
  </Space>
</template>

<style scoped>
.theme-preview {
  padding: 24px;
  background: var(--i-bg-page);
  border-radius: 6px;
}
.theme-preview .i-input {
  max-width: 360px;
  margin-top: 16px;
}
</style>
