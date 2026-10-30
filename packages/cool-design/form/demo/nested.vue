<template>
  <Form :model="model" :rules="rules" style="max-width: 480px">
    <FormItem label="联系人" prop="user.name">
      <Input v-model="model.user.name" placeholder="请输入联系人" />
    </FormItem>
    <Button type="primary" @click="validate">校验嵌套字段</Button>
  </Form>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { Button, Form, FormItem, Input } from '../../index';
const model = reactive({ user: { name: '' } });
const rules = { 'user.name': [{ required: true, message: '请输入联系人' }] };
const validate = () => undefined;
</script>
