<script setup lang="ts">
import { Row, Col } from "../../index";
const classes = [
    "xs-only",
    "sm-only",
    "sm-and-down",
    "sm-and-up",
    "md-only",
    "md-and-down",
    "md-and-up",
    "lg-only",
    "lg-and-down",
    "lg-and-up",
    "xl-only"
];
</script>
<template>
    <div class="hidden-demo">
        <p>缩放浏览器窗口，下列标签会按当前视口宽度隐藏。虚线框保留，便于对照隐藏状态。</p>
        <div class="hidden-demo__list">
            <div v-for="name in classes" :key="name" class="hidden-demo__item">
                <code>hidden-{{ name }}</code>
                <span class="hidden-demo__frame">
                    <span :class="`hidden-${name}`" :data-hidden="name">当前可见</span>
                </span>
            </div>
        </div>
        <Row :gutter="16">
            <Col :span="12"><div class="hidden-demo__cell">常驻内容</div></Col>
            <Col :span="12" class="hidden-xs-only"><div class="hidden-demo__cell">Col：小屏隐藏</div></Col>
        </Row>
    </div>
</template>
<style scoped>
.hidden-demo {
    padding: 0 12px;
}
.hidden-demo__list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 12px;
    margin: 16px 0 24px;
}
.hidden-demo__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 12px;
}
.hidden-demo__frame {
    border: 1px dashed var(--i-border);
    min-width: 64px;
    min-height: 28px;
}
.hidden-demo__frame span,
.hidden-demo__cell {
    display: block;
    padding: 6px;
    color: var(--i-primary);
    background: var(--i-primary-light-9);
    text-align: center;
}
</style>
