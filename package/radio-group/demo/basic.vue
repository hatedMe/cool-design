<script setup lang="ts">
import { ref } from 'vue';
import { Radio, RadioGroup } from '../../index';
const value = ref('a');
</script>

<template>
  <RadioGroup v-model="value" name="demo-kind">
    <Radio value="a">选项 A</Radio>
    <Radio value="b">选项 B</Radio>
  </RadioGroup>
</template>
