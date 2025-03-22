<template>
  <canvas ref="rankingCanvas" class="ranking-canvas" :width="chartWidth" :height="chartHeight">
  </canvas>
</template>
<script setup lang="ts">
const chartWidth = 100;
const chartHeight = 100;
</script>
<style scoped></style>