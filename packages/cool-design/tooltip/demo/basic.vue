<script setup lang="ts">
import { ref } from 'vue';
import { Button, Space, Tooltip } from '../../index';

const visible = ref(false);
</script>

<template>
  <Space :size="16" wrap>
    <Tooltip content="查看此用户的详细资料" placement="top" show-arrow>
      <Button>上方提示</Button>
    </Tooltip>
    <Tooltip content="只有管理员可以修改权限" placement="bottom-start">
      <Button>下方提示</Button>
    </Tooltip>
    <Tooltip content="点击查看帮助" trigger="click" effect="light">
      <Button>点击提示</Button>
    </Tooltip>
    <Tooltip content="右键查看帮助" trigger="contextmenu">
      <Button>右键提示</Button>
    </Tooltip>
    <Tooltip content="<strong>HTML 提示</strong>" raw-content>
      <Button>HTML 内容</Button>
    </Tooltip>
    <Tooltip v-model:visible="visible" content="受控提示">
      <Button @click="visible = !visible">手动控制</Button>
    </Tooltip>
    <Tooltip content="已禁用的提示" disabled>
      <Button>禁用提示</Button>
    </Tooltip>
  </Space>
</template>
