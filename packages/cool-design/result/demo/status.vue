<script setup lang="ts">
import { Button, Result, Space } from '../../index';
</script>

<template>
  <Space direction="vertical" align="stretch" :size="16">
    <Result status="success" title="提交成功" sub-title="订单已创建，请留意短信通知">
      <template #extra>
        <Button type="primary">返回列表</Button>
        <Button>查看订单</Button>
      </template>
    </Result>
    <Result status="warning" title="需要确认" sub-title="部分商品库存不足" />
    <Result status="error" title="提交失败" sub-title="网络异常，请稍后重试">
      <template #extra>
        <Button type="primary">重试</Button>
      </template>
    </Result>
  </Space>
</template>
