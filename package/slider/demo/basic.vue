<script setup lang="ts">import { ref } from "vue"; import { Slider } from "../../index"; const value = ref(30);</script>
<template><Slider v-model="value" show-input /></template>
