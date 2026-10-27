<script setup lang="ts">import { ref } from "vue"; import { Autocomplete } from "../../index"; const value = ref(""); const suggestions = ["北京", "上海", "深圳"];</script>
<template><Autocomplete v-model="value" :suggestions="suggestions" clearable placeholder="输入城市" /></template>
