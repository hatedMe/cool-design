<script setup lang="ts">
import { ref } from "vue";
import { Button, Popconfirm, Space } from "../../index";
const result = ref("尚未执行操作");
</script>

<template>
  <Space :size="16">
    <Popconfirm
      title="确定停用该账号吗？"
      width="300"
      confirm-button-type="danger"
      hide-icon
      confirm-button-text="停用"
      @confirm="result = '账号已停用'"
      @cancel="result = '已取消操作'">
      <Button type="danger">停用账号</Button>
    </Popconfirm>
    <span role="status">{{ result }}</span>
  </Space>
</template>
