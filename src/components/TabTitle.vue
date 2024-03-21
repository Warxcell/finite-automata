<script lang="ts" setup>
import {ref, watch} from "vue";


const element = ref<HTMLDivElement | null>(null);
const title = defineModel<string>('title', {required: true})

defineProps<{
  active: boolean
}>()

const edit = ref(false);

watch(edit, (newEdit) => {
  if (newEdit) {
    element.value?.focus()
  }
})

const input = () => {
  title.value = element.value?.textContent ?? ''
}

defineEmits<{
  click: []
  remove: []
}>()

</script>

<template>
  <div ref="element"
       :class="{active: active}"
       :contenteditable="edit"
       class="prevent-select"
       @click="$emit('click')"
       @dblclick="edit = true"
       @focusout="edit = false"
       @input="input"
       v-text="title"
       @keydown.enter.stop.prevent
       @keyup.enter.stop.prevent="edit = false"></div>

  <button @click="$emit('remove')">-</button>
</template>

<style lang="scss" scoped>
.active {
  border: green medium dashed;
}

.prevent-select {
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
}
</style>