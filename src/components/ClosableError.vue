<script lang="ts" setup>
defineProps<{ error: string }>()

defineEmits<{
  close: []
}>()
</script>

<template>
  {{ error }}
  <button @click="$emit('close')">OK</button>
</template>

<style lang="scss" scoped>

</style>