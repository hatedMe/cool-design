<script setup lang="ts">
import { reactive } from 'vue';
import { Form, FormItem, Input } from '../../index';
const model = reactive({ name: '' });
</script>

<template>
  <Form
    :model="model"
    :rules="{ name: [{ required: true, message: '请输入姓名', trigger: 'blur' }] }"
    style="max-width: 480px">
    <FormItem prop="name" label="姓名">
      <Input v-model="model.name" placeholder="聚焦后离开，查看必填提示" />
    </FormItem>
  </Form>
</template>
