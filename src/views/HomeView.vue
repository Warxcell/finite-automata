<script lang="ts" setup>
import {ref} from "vue";
import FiniteAutomata from "@/components/FiniteAutomata.vue";
import TabTitle from "@/components/TabTitle.vue";
import {useFiniteAutomataStore} from "@/stores/finiteAutomataStore";
import {storeToRefs} from "pinia";
import {useRouteHash} from "@vueuse/router";

const itemsStore = useFiniteAutomataStore();

const {items} = storeToRefs(itemsStore);

const activeTab = ref<number>(0);

const add = () => {
  itemsStore.add()
  activeTab.value = items.value.length - 1
}

const remove = (index: number) => {
  itemsStore.remove(index)

  if (activeTab.value > items.value.length - 1) {
    activeTab.value = items.value.length - 1
  }
}

const hash = useRouteHash()

if (hash.value) {
  // const parsed = typia.json.assertParse<typeof items>(hash.value.substring(1));
  items.value = JSON.parse(hash.value.substring(1));
  hash.value = ''
}


const shareButtonTextOG = 'Сподели'
const shareButtonText = ref(shareButtonTextOG)
const share = () => {
  // hash.value = `#${typia.json.stringify(items.value)}`
  hash.value = `#${JSON.stringify(items.value)}`

  const url = `${window.location.origin}${window.location.pathname}${hash.value}`
  navigator.share({
    url: url
  })

  navigator.clipboard.writeText(url)
      .then(() => {
        shareButtonText.value = 'Копирано в клипборда'
      })
      .catch((reason) => {
        shareButtonText.value = typeof reason === 'string' ? reason : 'Грешка при копирането в клипборда'
      })
      .finally(() => {
        setTimeout(() => {
          shareButtonText.value = shareButtonTextOG
        }, 5000)
      });
}
</script>

<template>
  <div class="container mx-auto">
    <h1 class="main-title">Симулация на крайни автомати</h1>

    <button class="btn btn-info" @click="share">{{ shareButtonText }}</button>

    <div class="tabs tabs-lifted" role="tablist">
      <template v-for="(item, key) in items">
        <TabTitle
            v-model:title="item.name"
            :active="activeTab === key"
            @click="activeTab = key"
            @remove="remove(key)"/>

        <div v-if="activeTab === key" class="tab-content p-10" role="tabpanel">
          <FiniteAutomata
              v-model:alphabet="item.alphabet"
              v-model:final-states="item.finalStates"
              v-model:initial-state="item.initialState"
              v-model:states="item.states"
              v-model:transitions="item.transitions"
              v-model:type="item.type"
              v-model:words="item.words"
              :name="item.name"
          />
        </div>
      </template>

      <div class="tab">
        <div class="tooltip" data-tip="Добави нов прозорец с автомат">
          <button class="btn btn-success btn-xs btn-outline rounded" @click="add">+</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>

</style>
