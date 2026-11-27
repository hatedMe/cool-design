<script setup lang="ts">
import { Anchor, AnchorLink } from '../../index';
</script>

<template>
  <div>
    <Anchor :offset="10">
      <AnchorLink href="#anchor-demo-1" title="第一节" />
      <AnchorLink href="#anchor-demo-2" title="第二节" />
    </Anchor>
    <div id="anchor-demo-1" style="height: 120px">第一节</div>
    <div id="anchor-demo-2" style="height: 120px">第二节</div>
  </div>
</template>
