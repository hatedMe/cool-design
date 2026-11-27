<script setup lang="ts">
import { ref } from 'vue';
import { Checkbox, CheckboxButton, CheckboxGroup, Space } from '../../index';
const values = ref(['a']);
const options = [
  { code: 'a', text: '选项 A' },
  { code: 'b', text: '选项 B', blocked: true }
];
</script>
<template>
  <Space direction="vertical" align="start">
    <CheckboxGroup v-model="values">
      <Checkbox value="a">选项 A</Checkbox>
      <Checkbox value="b">选项 B</Checkbox>
      <Checkbox value="c">选项 C</Checkbox>
    </CheckboxGroup>
    <span>已选：{{ values.join(',') }}</span>
    <CheckboxGroup v-model="values" type="button" :options="options" :props="{ value: 'code', label: 'text', disabled: 'blocked' }" />
    <CheckboxGroup v-model="values" tag="section">
      <CheckboxButton value="a">按钮 A</CheckboxButton>
      <CheckboxButton value="b">按钮 B</CheckboxButton>
    </CheckboxGroup>
  </Space>
</template>
