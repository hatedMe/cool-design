<script setup lang="ts">
import { Col, Row, Space } from "../../index";
</script>
<template>
    <Space direction="vertical" align="stretch" :size="20">
        <p>调整窗口宽度：小屏一列、平板两列、桌面三列、宽屏四列。</p>
        <Row :gutter="16" data-grid="responsive">
            <Col v-for="n in 4" :key="n" :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
                <div class="grid-cell">内容 {{ n }}</div>
            </Col>
        </Row>
        <p>下列内容只在 768px 及以上显示。</p>
        <Row data-grid="hidden">
            <Col :xs="0" :sm="24"><div class="grid-cell">小屏隐藏 / 桌面显示</div></Col>
        </Row>
    </Space>
</template>
<style scoped>
.grid-cell {
    margin-bottom: 12px;
    padding: 16px;
    text-align: center;
    background: var(--i-primary-light-9);
    color: var(--i-primary);
    border: 1px solid var(--i-primary-light-7);
    border-radius: var(--i-radius-small);
}
</style>
