<script setup lang="ts">
import { ref } from 'vue';
import { Countdown } from '../../index';

const deadline = ref(Date.now() + 3600 * 1000);
</script>

<template>
  <Countdown title="距结束" :value="deadline" format="HH:mm:ss" suffix="后截止" />
</template>
