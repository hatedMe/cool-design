<script setup lang="ts">
import { ref } from "vue";
import { Button, Space, Tag } from "../../index";
const visible = ref(true);
</script>

<template>
    <Space direction="vertical" align="start" :size="20">
        <Space>
            <Tag>主要标签</Tag>
            <Tag type="success">已启用</Tag>
            <Tag type="warning">待审核</Tag>
            <Tag type="danger">已停用</Tag>
            <Tag type="info">草稿</Tag>
        </Space>
        <Space>
            <Tag effect="light">浅色</Tag>
            <Tag effect="plain">描边</Tag>
            <Tag effect="dark">实色</Tag>
            <Tag type="success" round>圆角</Tag>
            <Tag type="warning" hit>Hit</Tag>
        </Space>
        <Space>
            <Tag v-if="visible" closable @close="visible = false">可移除条件</Tag>
            <Button v-else size="small" @click="visible = true">恢复标签</Button>
        </Space>
    </Space>
</template>
