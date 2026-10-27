<script setup lang="ts">
import { ref } from "vue";
import { Input } from "../../index";
const text = ref("");
</script>

<template><Input v-model="text" type="textarea" :rows="3" maxlength="100" show-word-limit placeholder="请输入描述" /></template>
