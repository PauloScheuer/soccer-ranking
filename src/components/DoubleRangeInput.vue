<template>
  <div class="input-container">
    <span class="input-label">{{ low }}</span>
    <div class="input-wrapper">
      <div class="input-line"></div>
      <input type="range" class="input-item" :disabled="disabled" :value="low" @input="handleLow"
        @change="emit('change', low, high)" :min="min" :max="max" />
      <input type="range" class="input-item" :disabled="disabled" :value="high" @input="handleHigh"
        @change="emit('change', low, high)" :min="min" :max="max" />
    </div>
    <span class="input-label">
      {{ high }}
    </span>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  min: number,
  max: number,
  disabled?: boolean
}>();

const emit = defineEmits<{
  (e: 'change', low: number, high: number): void
}>();

const low = ref(props.min);
const high = ref(props.max);

function handleLow(e: Event) {
  const target = (e.target as any);
  const newValue = target.value;
  low.value = Math.min(newValue, high.value);
  target.value = low.value;
}

function handleHigh(e: Event) {
  const target = (e.target as any);
  const newValue = target.value;
  high.value = Math.max(newValue, low.value);
  target.value = high.value;
}

</script>
<style scoped>
.input-wrapper {
  position: relative;
  width: 100px;
  height: 100%;
  margin-left: -2px;
}

.input-item {
  width: 100px;
  position: absolute;
  appearance: none;
  -webkit-appearance: none;
}

.input-line {
  position: absolute;
  top: -1px;
  left: 2px;
  width: 100%;
  height: 2px;
  background-color: black;
}

.input-item::-webkit-slider-runnable-track {
  height: 0px;
}

.input-item::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  margin-top: -7px;
  background-color: #6B3FA0;
  height: 10px;
  width: 10px;
  border-radius: 50%;
}

.input-container {
  padding: 8px;
  border-radius: 5px;
  background-color: white;
  font-size: 8;
  display: flex;
  align-items: center;
  gap: 5px;
}

.input-label {
  vertical-align: middle
}
</style>