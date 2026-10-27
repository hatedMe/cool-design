<script setup lang="ts">
import { ref } from "vue";
import { Menu } from "../../index";
const active = ref("home");
const items = [
  { index: "home", label: "首页" },
  { index: "users", label: "用户管理" }
];
</script>
<template>
  <Menu v-model="active" :items="items" mode="horizontal" />
</template>
