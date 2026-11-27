<script setup lang="ts">
import { ref } from 'vue';
import { Checkbox, CheckboxGroup } from '../../index';
const values = ref(['a']);
</script>
<template>
  <CheckboxGroup v-model="values" :max="2">
    <Checkbox value="a">A</Checkbox>
    <Checkbox value="b">B</Checkbox>
    <Checkbox value="c">C</Checkbox>
  </CheckboxGroup>
</template>
