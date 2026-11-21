<script setup lang="ts">
import { Carousel, CarouselItem } from '../../index';
</script>
<template>
  <Carousel height="200px">
    <CarouselItem v-for="n in 4" :key="n" :label="`幻灯片 ${n}`">
      <div class="carousel-demo" :class="`carousel-demo--${n}`">第 {{ n }} 张</div>
    </CarouselItem>
  </Carousel>
</template>
<style scoped>
.carousel-demo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #fff;
  font-size: 20px;
}
.carousel-demo--1 {
  background: #409eff;
}
.carousel-demo--2 {
  background: #67c23a;
}
.carousel-demo--3 {
  background: #e6a23c;
}
.carousel-demo--4 {
  background: #f56c6c;
}
</style>
