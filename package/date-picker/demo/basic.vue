<script setup lang="ts">
import { ref } from "vue";
import { Calendar, DatePicker, DateTimePicker, TimePicker } from "../../index";
const date = ref<string | null>(null);
const time = ref<string | null>(null);
const datetime = ref<string | null>(null);
const calendar = ref<Date | null>(new Date());
</script>
<template>
  <div style="display:grid;gap:12px;max-width:420px">
    <DatePicker v-model="date" clearable placeholder="选择日期" />
    <TimePicker v-model="time" clearable placeholder="选择时间" />
    <DateTimePicker v-model="datetime" clearable placeholder="选择日期时间" />
    <Calendar v-model="calendar" />
  </div>
</template>
