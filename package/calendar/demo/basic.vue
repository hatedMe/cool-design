<script setup lang="ts">import { ref } from "vue"; import { Calendar } from "../../index"; const value = ref(new Date());</script>
<template><Calendar v-model="value" /></template>
