<script setup lang="ts">
import { ref } from "vue";
import { Select, SelectOption } from "../../index";
const role = ref<string>();
</script>

<template>
  <Select v-model="role" clearable aria-label="用户角色" style="max-width: 360px">
    <SelectOption value="admin" label="管理员" />
    <SelectOption value="member">普通成员</SelectOption>
    <SelectOption value="guest" label="访客（不可选）" disabled />
  </Select>
</template>
