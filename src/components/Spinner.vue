<template>
  <VueFeather type="loader" class="loading-item" :size="40" />
</template>
<script setup lang="ts">
import VueFeather from 'vue-feather';
</script>
<style>
.loading-item {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>