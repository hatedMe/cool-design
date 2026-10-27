<script setup lang="ts">
import { Button, Space, Tooltip } from "../../index";
</script>

<template>
    <Space :size="16">
        <Tooltip content="查看此用户的详细资料" placement="top"><Button>上方提示</Button></Tooltip>
        <Tooltip content="只有管理员可以修改权限" placement="bottom"><Button>下方提示</Button></Tooltip>
        <Tooltip content="点击查看帮助" trigger="click" effect="light"><Button>点击提示</Button></Tooltip>
        <Tooltip content="已禁用的提示" disabled><Button>禁用提示</Button></Tooltip>
    </Space>
</template>
