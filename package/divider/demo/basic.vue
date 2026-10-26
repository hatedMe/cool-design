<script setup lang="ts">
import { Divider, Space } from "../../index";
</script>

<template>
    <div>
        <span>基本信息</span>
        <Divider content-position="left">权限设置</Divider>
        <Space :size="8">
            <span>查看</span>
            <Divider vertical />
            <span>编辑</span>
            <Divider vertical />
            <span>更多</span>
        </Space>
    </div>
</template>
