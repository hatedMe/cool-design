<script setup lang="ts">
import { ref } from "vue";
import { TreeSelect } from "../../index";
const value = ref(null);
const data = [{ value: 1, label: "部门", children: [{ value: 2, label: "研发组" }] }];
</script>
<template>
  <TreeSelect v-model="value" :data="data" filterable clearable />
</template>
