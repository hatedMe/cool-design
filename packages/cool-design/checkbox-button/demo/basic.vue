<script setup lang="ts">
import { ref } from 'vue';
import { CheckboxButton, CheckboxGroup, Space } from '../../index';
const checked = ref(false);
const values = ref(['a']);
</script>
<template>
  <Space>
    <CheckboxButton v-model="checked" value="a">按钮 A</CheckboxButton>
    <CheckboxGroup v-model="values">
      <CheckboxButton value="a">按钮 A</CheckboxButton>
      <CheckboxButton value="b">按钮 B</CheckboxButton>
    </CheckboxGroup>
  </Space>
</template>
