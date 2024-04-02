<script lang="ts" setup>
import {nextTick, ref, watch} from "vue";


const element = ref<HTMLDivElement | null>(null);
const title = defineModel<string>('title', {required: true})

defineProps<{
  active: boolean
}>()

const edit = ref(false);

watch(edit, (newEdit) => {
  if (newEdit) {
    nextTick(() => {
      element.value?.focus()
    })
  }
})

defineEmits<{
  click: []
  remove: []
}>()

watch(title, (newTitle) => {
  if (newTitle === '') {
    edit.value = true;
  }
})
</script>

<template>
  <div :class="{'tab-active': active}" class="tab" @click="$emit('click')">
    <input
        v-if="edit"
        ref="element"
        v-model="title"
        class="prevent-select"
        type="text"
        @change="edit = false"
        @focusout="edit = false"
    />
    <div v-else
         class="prevent-select"
         @dblclick="edit = true"
    >
      {{ title }}
    </div>

    <div class="tooltip" data-tip="Изтрий автомата">
      <button class="btn btn-outline btn-error btn-xs rounded" @click="$emit('remove')">-</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tab {
  flex-wrap: nowrap;
}

.btn-xs {
  height: 1rem;
  min-height: 1rem;
  padding-left: 0.3rem;
  padding-right: 0.3rem;
  font-size: 1em;
  line-height: 0.5em;
}

.prevent-select {
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
  padding: 0px 5px;
  font-size: 14px;
  border: transparent 1px dashed;
}

</style>
