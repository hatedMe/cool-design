<template>
    <Space wrap>
        <Tag type="success" round>成功</Tag>
        <Tag type="warning" effect="plain" hit>待处理</Tag>
        <Tag type="danger" effect="dark" size="large">高风险</Tag>
        <Tag color="#7c3aed" closable @close="closed = true">自定义颜色</Tag>
    </Space>
    <p v-if="closed">标签已关闭</p>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Space, Tag } from "../../index";

const closed = ref(false);
</script>
