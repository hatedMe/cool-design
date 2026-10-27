<script setup lang="ts">
import { ref } from "vue";
import { Button, Message, Space } from "../../index";
const feedback = ref<{ type: "success" | "warning" | "info" | "error"; text: string }>();
const sequence = ref(0);
function show(type: "success" | "warning" | "info" | "error") {
    sequence.value++;
    feedback.value = { type, text: type === "success" ? "用户信息保存成功" : "保存失败，请检查网络后重试" };
}
</script>

<template>
    <Space direction="vertical" align="stretch" :size="16">
        <Space>
            <Button type="primary" @click="show('success')">成功提示</Button>
            <Button type="danger" @click="show('error')">错误提示</Button>
            <Button @click="show('warning')">警告提示</Button>
        </Space>
        <Message
            v-if="feedback"
            :key="sequence"
            :type="feedback.type"
            :message="feedback.text"
            :show-close="feedback.type !== 'info'"
            @close="feedback = undefined" />
    </Space>
</template>
