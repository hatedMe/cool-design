<script setup lang="ts">
import { Descriptions, DescriptionsItem } from '../../index';
</script>

<template>
  <Descriptions title="订单详情" direction="vertical" :column="4" size="small" border>
    <DescriptionsItem label="订单号">202611120001</DescriptionsItem>
    <DescriptionsItem label="金额">¥ 1,280.00</DescriptionsItem>
    <DescriptionsItem label="下单时间">2026-11-12 10:00</DescriptionsItem>
    <DescriptionsItem label="状态">已发货</DescriptionsItem>
    <DescriptionsItem label="收货地址" :span="2">上海市浦东新区张江路 100 号</DescriptionsItem>
    <DescriptionsItem label="物流单号" :span="2">SF1234567890</DescriptionsItem>
  </Descriptions>
</template>
