<template>
  <div class="collapsable">
    <div class="collapsable-header">
      <slot name="header"></slot>
    </div>
    <div class="cards" :class="{ 'cards-open': isOpen }">
      <div class="cards-inner">
        <slot name="content"></slot>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">

defineProps<{ isOpen: boolean }>();

</script>
<style scoped>
.collapsable {
  display: flex;
  flex-direction: column;
}

.collapsable-header {
  display: flex;
  align-items: center;
  gap: 10px
}

.cards {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.5s;
}

.cards-inner {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;
}

.cards-open {
  grid-template-rows: 1fr;
}
</style>