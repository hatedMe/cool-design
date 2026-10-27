<template>
  <Select v-model="value" remote filterable :remote-method="search" placeholder="搜索用户">
    <SelectOption v-for="option in options" :key="option.value" :value="option.value" :label="option.label" />
  </Select>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Select, SelectOption } from "../../index";
const value = ref<string | number>();
const options = ref([
  { value: 1, label: "小明" },
  { value: 2, label: "小红" }
]);
const search = async (query: string) => options.value.filter((item) => item.label.includes(query));
</script>
