<script setup lang="ts">
import { ref } from "vue";
import { Select, SelectOption } from "../../index";
const values = ref<(string | number)[]>([1]);
</script>
<template><Select v-model="values" multiple clearable><SelectOption :value="1" label="启用" /><SelectOption :value="2" label="停用" /><SelectOption value="other" label="其他" /></Select></template>
