<script setup lang="ts">
import { ref } from "vue";
import { Checkbox, CheckboxGroup, Space } from "../../index";
const values = ref(["a"]);
</script>
<template>
  <Space direction="vertical" align="start">
    <CheckboxGroup v-model="values">
      <Checkbox value="a">选项 A</Checkbox>
      <Checkbox value="b">选项 B</Checkbox>
      <Checkbox value="c">选项 C</Checkbox>
    </CheckboxGroup>
    <span>已选：{{ values.join(",") }}</span>
  </Space>
</template>
