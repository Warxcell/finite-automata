<script lang="ts" setup>
defineProps<{ error: string }>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <div class="alert alert-error" role="alert">
    <svg class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"/>
    </svg>

    <span>{{ error }}</span>

    <div>
      <button @click="$emit('close')">
        Ok
      </button>
    </div>
  </div>
</template>