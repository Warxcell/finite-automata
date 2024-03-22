<script lang="ts" setup>
import {ref} from "vue";
import FiniteAutomata from "@/components/FiniteAutomata.vue";
import TabTitle from "@/components/TabTitle.vue";
import {useFiniteAutomataStore} from "@/stores/finiteAutomataStore";
import {storeToRefs} from "pinia";
import {useRouteHash} from "@vueuse/router";
import CustomButton from "@/components/CustomButton.vue";

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

  navigator.share({
    url: window.location.href
  })

  navigator.clipboard.writeText(hash.value)
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
  <div class="container">
    <h1 class="main-title">Симулация на крайни автомати</h1>

    <CustomButton @click="share">{{ shareButtonText }}</CustomButton>

    <div class="tabs-holder">
      <TabTitle v-for="(item, key) in items"
                v-model:title="item.name"
                :active="activeTab === key"
                @click="activeTab = key"
                @remove="remove(key)"/>

      <CustomButton @click="add">+</CustomButton>
    </div>

    <div v-for="(item, key) in items" class="tab-content">
      <FiniteAutomata v-if="activeTab === key"
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
  </div>
</template>

<style lang="scss" scoped>
.tab-content {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.main-title {
  flex: 0 0 100%;
  text-align: center;
}

.tabs-holder {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 10px 0;
}

</style>
