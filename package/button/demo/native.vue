<script setup lang="ts">
import { ref } from "vue";
import { Button, Space } from "../../index";
const submitted = ref(false);
</script>

<template>
  <Space direction="vertical" align="start">
    <form @submit.prevent="submitted = true">
      <Button native-type="submit" type="primary">提交表单</Button>
      <Button native-type="reset">重置</Button>
    </form>
    <Button tag="a" href="#/components/button">自定义链接标签</Button>
    <span role="status">{{ submitted ? "已提交" : "等待提交" }}</span>
  </Space>
</template>
