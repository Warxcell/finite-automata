<script lang="ts" setup>
import {ref} from "vue";

const props = withDefaults(
    defineProps<{
      text: string
      btnText?: string
      btnAlternateText?: string
      btnErrorText?: string
    }>(), {
      btnText: 'Копирай',
      btnAlternateText: 'Копирано!',
      btnErrorText: 'Грешка!',
    })

const emit = defineEmits<{
  click: []
}>()

const alternate = ref(false);
const error = ref<string | null>(null)

const copy = () => {
  navigator.clipboard.writeText(props.text)
      .then(() => {
        alternate.value = true;
      })
      .catch((reason) => {
        error.value = typeof reason === 'string' ? reason : props.btnErrorText
      });

  emit('click')
}
</script>

<template>
  <button :class="{'btn-info': !alternate, 'btn-success': alternate, 'btn-error': error !==null}"
          class="btn"
          @click="copy"
          @mouseleave="alternate = false">{{ alternate ? btnAlternateText : btnText }}
  </button>
</template>