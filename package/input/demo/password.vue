<script setup lang="ts">
import { ref } from "vue";
import { Input } from "../../index";
const password = ref("secret");
</script>

<template><Input v-model="password" type="password" show-password placeholder="请输入密码" /></template>
