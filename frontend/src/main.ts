import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createUnhead } from '@unhead/vue'
import router from './router'
import App from './App.vue'
import './assets/css/main.css'

createUnhead()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
