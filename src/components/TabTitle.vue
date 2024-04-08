<script lang="ts" setup>
import {computed, nextTick, ref, watch} from "vue";


const element = ref<HTMLDivElement | null>(null);
const title = defineModel<string>('title', {required: true})

defineProps<{
  active: boolean
}>()

const edit = ref(false)

const editable = computed(() => {
  return edit.value || title.value === ''
})

watch(editable, (newEdit) => {
  if (newEdit) {
    nextTick(() => {
      element.value?.focus()
    })
  }
}, {
  immediate: true
})

defineEmits<{
  click: []
  remove: []
}>()
</script>

<template>
  <div :class="{'tab-active border-slate-600': active}" class="tab p-3 border border-transparent justify-between gap-2 flex-nowrap text-left" @click="$emit('click')">
    <input
        v-if="editable"
        ref="element"
        v-model.lazy="title"
        class="input input-bordered input-xs input-info w-full max-w-xs"
        placeholder="Име на автомата"
        type="text"
        @change="edit = false"
        @focusout="edit = false"
    />
    <div v-else
         class="prevent-select break-all"
         @dblclick="edit = true"
    >
      {{ title }}
    </div>

    <div class="tooltip" data-tip="Изтрий">
      <button class="btn btn-outline btn-error btn-xs rounded" @click="$emit('remove')">-</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.btn-xs {
  height: 1rem;
  min-height: 1rem;
  padding-left: 0.3rem;
  padding-right: 0.3rem;
  font-size: 1em;
  line-height: 0.5em;
}

.tab.tab-active:not(.tab-disabled):not([disabled]) {
  background: #fff;
}

</style>
