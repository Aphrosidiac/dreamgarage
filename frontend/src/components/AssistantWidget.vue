<template>
  <!-- Floating trigger button (draggable) -->
  <button
    v-if="!assistant.isOpen"
    @mousedown="startDrag" @touchstart.passive="startDrag"
    :style="{ bottom: pos.y + 'px', right: pos.x + 'px' }"
    class="fixed w-14 h-14 rounded-full bg-gold-500 hover:bg-gold-400 shadow-lg shadow-gold-500/30 flex items-center justify-center text-dark-950 transition-shadow z-40 cursor-grab active:cursor-grabbing select-none"
    title="Ask DG Assistant"
  >
    <Sparkles class="w-6 h-6 pointer-events-none" />
  </button>

  <!-- Chat drawer -->
  <div
    v-if="assistant.isOpen"
    :style="{ bottom: pos.y + 'px', right: pos.x + 'px' }"
    class="fixed w-[480px] h-[620px] max-h-[85vh] bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-dark-800 bg-dark-900">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center">
          <Sparkles class="w-4 h-4 text-gold-500" />
        </div>
        <div>
          <div class="text-sm font-medium text-dark-100">DG Assistant</div>
          <div class="text-xs text-dark-400">Ask about your data</div>
        </div>
      </div>
      <div class="flex gap-1">
        <button @click="assistant.clear" title="Clear" class="p-1.5 text-dark-400 hover:text-dark-100 rounded-md hover:bg-dark-800">
          <RotateCcw class="w-4 h-4" />
        </button>
        <button @click="assistant.close" title="Close" class="p-1.5 text-dark-400 hover:text-dark-100 rounded-md hover:bg-dark-800">
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Messages -->
    <div ref="scrollEl" class="flex-1 overflow-y-auto px-4 py-3 space-y-3">
      <div v-if="assistant.messages.length === 0" class="text-center text-sm text-dark-400 mt-8">
        <Sparkles class="w-8 h-8 mx-auto mb-3 text-gold-500/60" />
        <div class="font-medium text-dark-200 mb-1">Hi! I can help you check your data.</div>
        <div class="text-xs mb-4">Try asking:</div>
        <div class="space-y-1.5 text-left max-w-[260px] mx-auto">
          <button
            v-for="s in suggestions"
            :key="s"
            @click="quickSend(s)"
            class="w-full text-left px-3 py-2 bg-dark-800/50 hover:bg-dark-800 border border-dark-700 rounded-lg text-xs text-dark-300 hover:text-dark-100 transition-colors"
          >{{ s }}</button>
        </div>
      </div>

      <div
        v-for="(m, i) in assistant.messages"
        :key="i"
        :class="m.role === 'user' ? 'flex justify-end' : 'flex justify-start'"
      >
        <div
          :class="[
            'max-w-[92%] rounded-2xl px-3.5 py-2 text-sm break-words',
            m.role === 'user'
              ? 'bg-gold-500 text-dark-950 rounded-br-sm whitespace-pre-wrap'
              : 'bg-dark-800 text-dark-100 rounded-bl-sm assistant-md',
          ]"
          v-html="m.role === 'assistant' ? renderMarkdown(m.content) : escapeHtml(m.content)"
        />
      </div>

      <div v-if="assistant.isLoading" class="flex justify-start">
        <div class="bg-dark-800 rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm text-dark-400 flex items-center gap-2">
          <span class="w-2 h-2 bg-gold-500 rounded-full animate-pulse"></span>
          <span class="w-2 h-2 bg-gold-500 rounded-full animate-pulse" style="animation-delay: 150ms"></span>
          <span class="w-2 h-2 bg-gold-500 rounded-full animate-pulse" style="animation-delay: 300ms"></span>
        </div>
      </div>

      <div v-if="assistant.error" class="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
        {{ assistant.error }}
      </div>
    </div>

    <!-- Input -->
    <form @submit.prevent="handleSend" class="p-3 border-t border-dark-800 bg-dark-900 flex gap-2">
      <input
        v-model="input"
        type="text"
        placeholder="Ask about invoices, stock, debtors..."
        :disabled="assistant.isLoading"
        class="flex-1 bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-gold-500/50 disabled:opacity-50"
      />
      <button
        type="submit"
        :disabled="!input.trim() || assistant.isLoading"
        class="px-3 bg-gold-500 hover:bg-gold-400 disabled:opacity-40 disabled:cursor-not-allowed text-dark-950 rounded-lg transition-colors flex items-center justify-center"
      >
        <Send class="w-4 h-4" />
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, watch, onMounted } from 'vue'
import { Sparkles, X, Send, RotateCcw } from 'lucide-vue-next'
import { useAssistantStore } from '../stores/assistant'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const assistant = useAssistantStore()
const input = ref('')
const scrollEl = ref<HTMLElement | null>(null)

const pos = reactive({ x: 24, y: 24 })
let dragging = false
let dragStart = { mx: 0, my: 0, ox: 0, oy: 0 }
let hasMoved = false

function startDrag(e: MouseEvent | TouchEvent) {
  dragging = true
  hasMoved = false
  const point = 'touches' in e ? e.touches[0] : e
  dragStart = { mx: point.clientX, my: point.clientY, ox: pos.x, oy: pos.y }
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', endDrag)
  document.addEventListener('touchmove', onDrag)
  document.addEventListener('touchend', endDrag)
}

function onDrag(e: MouseEvent | TouchEvent) {
  if (!dragging) return
  const point = 'touches' in e ? e.touches[0] : e
  const dx = dragStart.mx - point.clientX
  const dy = dragStart.my - point.clientY
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved = true
  pos.x = Math.max(0, Math.min(window.innerWidth - 60, dragStart.ox + dx))
  pos.y = Math.max(0, Math.min(window.innerHeight - 60, dragStart.oy + dy))
}

function endDrag() {
  dragging = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', endDrag)
  if (!hasMoved) assistant.toggle()
}

onMounted(() => {
  const saved = localStorage.getItem('dg_assistant_pos')
  if (saved) { try { const p = JSON.parse(saved); pos.x = p.x; pos.y = p.y } catch {} }
})

watch(pos, () => { localStorage.setItem('dg_assistant_pos', JSON.stringify({ x: pos.x, y: pos.y })) })

const suggestions = [
  'How many invoices created today?',
  'Show me outstanding invoices',
  'What items are low on stock?',
  'Today\'s revenue so far',
  'Who owes us the most money?',
]

async function handleSend() {
  const text = input.value
  input.value = ''
  await assistant.send(text)
}

async function quickSend(text: string) {
  input.value = ''
  await assistant.send(text)
}

watch(() => assistant.messages.length, async () => {
  await nextTick()
  if (scrollEl.value) scrollEl.value.scrollTop = scrollEl.value.scrollHeight
})
watch(() => assistant.isLoading, async () => {
  await nextTick()
  if (scrollEl.value) scrollEl.value.scrollTop = scrollEl.value.scrollHeight
})

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}

function renderMarkdown(s: string): string {
  const raw = marked.parse(s, { async: false }) as string
  return DOMPurify.sanitize(raw)
}
</script>

<style>
.assistant-md p { margin: 0.25rem 0; }
.assistant-md p:first-child { margin-top: 0; }
.assistant-md p:last-child { margin-bottom: 0; }
.assistant-md strong { color: #fff; }
.assistant-md table { width: 100%; margin: 0.5rem 0; font-size: 0.75rem; border-collapse: collapse; }
.assistant-md th { text-align: left; padding: 0.35rem 0.5rem; border-bottom: 1px solid #333; color: #999; font-weight: 600; }
.assistant-md td { padding: 0.35rem 0.5rem; border-bottom: 1px solid #222; }
.assistant-md tr:last-child td { border-bottom: none; }
.assistant-md ul, .assistant-md ol { margin: 0.25rem 0; padding-left: 1.25rem; }
.assistant-md li { margin: 0.15rem 0; }
.assistant-md code { background: #111318; padding: 0.1rem 0.35rem; border-radius: 0.25rem; font-size: 0.75rem; color: #e5c07b; }
</style>
