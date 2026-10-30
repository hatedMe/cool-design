<script setup lang="ts">
import { nextTick, reactive, ref } from 'vue';
import { Button, Form, FormItem, Input, Space } from '../../index';
import type { FormInstance, FormRule } from '../../index';
const form = ref<FormInstance>();
const model = reactive({ name: '', email: '' });
const result = ref('');
const rules: Record<string, FormRule[]> = {
  name: [{ required: true, message: '请输入用户名称', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    {
      trigger: 'blur',
      validator(value) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) throw new Error('请输入有效邮箱');
      }
    }
  ]
};
async function submit() {
  // 等待本次失焦触发的字段校验启动，再执行提交校验。
  await nextTick();
  result.value = (await form.value!.validate()) ? `已保存：${model.name}` : '请检查表单内容';
}
function reset() {
  form.value?.resetFields();
  result.value = '';
}
</script>

<template>
  <Form ref="form" :model="model" :rules="rules" style="max-width: 480px" @submit="submit">
    <FormItem prop="name" label="用户名称">
      <Input v-model="model.name" placeholder="请输入用户名称" />
    </FormItem>
    <FormItem prop="email" label="联系邮箱">
      <Input v-model="model.email" placeholder="name@example.com" />
    </FormItem>
    <Space>
      <Button type="primary" native-type="submit">保存</Button>
      <Button @click="reset">重置</Button>
      <span role="status">{{ result }}</span>
    </Space>
  </Form>
</template>

<style scoped>
/* 为单行校验提示预留空间，避免失焦校验时保存按钮跳动。 */
.i-form-item {
  min-height: 84px;
}
</style>
