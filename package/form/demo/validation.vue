<script setup lang="ts">
import { reactive, ref } from "vue";
import { Button, Form, FormItem, Input } from "../../index";
import type { FormInstance } from "../../index";
const model = reactive({ name: "" });
const form = ref<FormInstance>();
const rules = { name: [{ required: true, message: "请输入姓名", trigger: "blur" as const }] };
const submit = () => form.value?.validate();
</script>
<template>
  <Form ref="form" :model="model" :rules="rules">
    <FormItem label="姓名" prop="name" required>
      <Input v-model="model.name" placeholder="请输入姓名" />
    </FormItem>
    <Button type="primary" @click="submit">校验</Button>
  </Form>
</template>
