<script setup lang="ts">
import { ref } from "vue";
import { Tabs } from "../../index";
const active = ref("first");
const panes = [
  { name: "first", label: "第一项" },
  { name: "second", label: "第二项" }
];
</script>
<template>
  <Tabs v-model="active" :panes="panes">
    <template #default="{ name }">
      <p>当前：{{ name }}</p>
    </template>
  </Tabs>
</template>
