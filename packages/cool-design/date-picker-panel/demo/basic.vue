<script setup lang="ts">
import { ref } from 'vue';
import { DatePickerPanel, type DatePickerPanelModelValue } from '../../index';

const initialMonth = new Date(2026, 0, 1);
const date = ref<DatePickerPanelModelValue>(null);
const range = ref<DatePickerPanelModelValue>(null);
const disabledDate = (value: Date) => value.getDay() === 0;
</script>

<template>
  <div>
    <DatePickerPanel v-model="date" :default-value="initialMonth" :disabled-date="disabledDate">
      <template #default="{ text, disabled }">
        <span :class="{ 'is-unavailable': disabled }">{{ text }}</span>
      </template>
    </DatePickerPanel>
    <p>所选范围 {{ range ?? '请选择开始和结束日期' }}</p>
    <DatePickerPanel
      v-model="range"
      type="daterange"
      single-panel
      value-format="YYYY-MM-DD"
      :default-value="initialMonth"
    />
  </div>
</template>
