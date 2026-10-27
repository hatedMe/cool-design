<script setup lang="ts">
import { ref } from "vue";
import { Switch } from "../../index";
const value = ref(false);
const beforeChange = () => window.confirm("确认切换吗？");
</script>
<template><Switch v-model="value" :before-change="beforeChange" active-text="已开启" inactive-text="已关闭" /></template>
