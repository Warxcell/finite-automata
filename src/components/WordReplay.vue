<script lang="ts" setup>

import type {RecognizesResult} from "@/finiteAutomata";

const charIndex = defineModel<number>('charIndex', {
  required: true
})

defineProps<{
  word: string
  status: RecognizesResult<any>
  initialState: string
  finalStates: string[]
}>()

const prevStep = () => {
  charIndex.value--;
}

const nextStep = () => {
  charIndex.value++;
}
</script>

<template>
  <div class="replay flex gap-2 flex-wrap justify-center items-center">
    <div class="flex gap-2 items-center">
      <button :disabled="charIndex === 0" class="btn btn-outline btn-info btn-md pb-2 gap-2" @click="prevStep">
        <svg class="h-6 w-6 fill-current" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"></path>
        </svg>
        <span class="flex flex-col items-start">
            <span class="text-base-content/70 hidden text-xs md:block">предишна</span>
            <span>стъпка</span>
          </span>
      </button>

      <div class="flex gap-2 flex-wrap justify-center">
          <span v-for="(char, i) in word"
                :class="{'underline text-info': charIndex === i}"
                class="cursor-pointer text-3xl select-none"
                @click="charIndex = i">
            {{ char }}
          </span>
      </div>

      <button :disabled="status.steps[charIndex + 1] === undefined"
              class="btn btn-outline btn-info btn-md pb-2 gap-2"
              @click="nextStep">
          <span class="flex flex-col items-end">
            <span class="text-base-content/70 hidden text-xs md:block">следваща</span>
            <span>стъпка</span>
          </span>
        <svg class="h-6 w-6 fill-current" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"></path>
        </svg>
      </button>
    </div>

    <div class="text-sm breadcrumbs w-full">
      <ul class="justify-center flex-wrap gap-y-2">
        <li>
              <span :class="{'opacity-25': charIndex !== 0}"
                    class="border-double text-center border-sky-600 border-4 rounded-full py-2 px-3 select-none">
                {{ initialState }}
              </span>
        </li>
        <template v-for="(item, index) in status.steps">
          <li>
                <span :class="{'opacity-25': index !== charIndex, 'text-info underline': index === charIndex} "
                      class="rounded-full select-none">
                  {{ item.char }}
                </span>
          </li>
          <li>
                <span
                    :class="[(status.steps.length === index + 1 ? (item.targetState && finalStates.includes(item.targetState) ? 'border-green-400': 'border-red-400') : 'border-neutral-600'), {'opacity-25': !(index === charIndex || index + 1 === charIndex)}]"
                    class="text-center rounded-full border-2 py-2 px-3 select-none"
                >
                  {{ item.targetState ?? 'Липсва преход' }}
                </span>
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>

</style>
