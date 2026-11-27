<script setup lang="ts">
import { Result, Space } from '../../index';
</script>

<template>
  <Space direction="vertical" align="stretch" :size="16">
    <Result status="404" title="页面不存在" sub-title="抱歉，你访问的页面不存在" />
    <Result status="403" title="没有权限" sub-title="请联系管理员开通权限" />
    <Result status="500" title="服务异常" sub-title="服务器开小差了，请稍后重试" />
  </Space>
</template>
