import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './assets/main.css'

import App from './App.vue'
import router from './router'
import { setupApiInterceptors } from '@/plugins/apiInterceptors'
import { useAuthStore } from '@/stores/authStore'
import { useCompanyStore } from '@/stores/companyStore'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)

// Hydrate stores before mounting so guards/interceptors see persisted state.
useAuthStore(pinia).initializeAuthFromStorage()
useCompanyStore(pinia).loadFromStorage()
setupApiInterceptors(router)
app.use(router)

app.mount('#app')
