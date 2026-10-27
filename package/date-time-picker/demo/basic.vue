<script setup lang="ts">import { ref } from "vue"; import { DateTimePicker } from "../../index"; const value = ref(null);</script>
<template><DateTimePicker v-model="value" clearable placeholder="选择日期时间" /></template>
