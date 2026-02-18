import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { useWebSocket } from './services/websocket'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const ws = useWebSocket()
;(window as any).__ws = ws

app.mount('#app')
