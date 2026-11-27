<script setup lang="ts">
import { ref } from 'vue';
import { InputOtp } from '../../index';

const otp = ref('');
</script>

<template>
  <div>
    <InputOtp v-model="otp" :length="6" inputmode="numeric" />
    <p>验证码：{{ otp }}</p>
  </div>
</template>
