import './assets/main.css'

import {createApp} from 'vue'
import {createPinia} from 'pinia'
import {createPersistedState, type StorageLike} from 'pinia-plugin-persistedstate'
import Cookies from 'js-cookie'

import App from './App.vue'
import router from './router'

const app = createApp(App)

const cookiesStorage: StorageLike = {
    setItem(key, state) {
        return Cookies.set(key, state)
    },
    getItem(key) {
        return Cookies.get(key) ?? null
    },
}


const pinia = createPinia();
pinia.use(createPersistedState({
    storage: cookiesStorage,
}))

app.use(pinia)
app.use(router)

app.mount('#app')
