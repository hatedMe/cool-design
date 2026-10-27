<script setup lang="ts">
import { reactive, ref } from "vue";
import { Button, Dialog, Form, FormItem, Input, Space } from "../../index";
const open = ref(false);
const model = reactive({ name: "陈晨" });
const result = ref("");
function edit() {
    model.name = "陈晨";
    open.value = true;
}
function save() {
    result.value = `已保存：${model.name}`;
    open.value = false;
}
</script>

<template>
    <Space>
        <Button type="primary" @click="edit">编辑用户</Button>
        <span role="status">{{ result }}</span>
    </Space>
    <Dialog v-model="open" title="编辑用户" width="520px" center destroy-on-close>
        <Form :model="model" @submit="save">
            <FormItem prop="name" label="用户名称"><Input v-model="model.name" /></FormItem>
        </Form>
        <template #footer>
            <Button @click="open = false">取消</Button>
            <Button type="primary" @click="save">保存</Button>
        </template>
    </Dialog>
</template>
