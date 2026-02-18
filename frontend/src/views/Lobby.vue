<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 cute-pattern flex items-center justify-center p-4 relative">
    <div class="absolute inset-0 star-pattern"></div>
    <div class="bg-slate-900/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full border border-purple-500/40 relative z-10">
      <h1 class="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
        <span class="text-5xl">🎴</span> UNO 游戏 <span class="text-5xl">✨</span>
      </h1>
      <p class="text-center text-purple-300 mb-8"><span class="text-2xl">🌟</span> 在线多人卡牌游戏 <span class="text-2xl">🌟</span></p>

      <div v-if="mode === 'menu'" class="space-y-4">
        <button
          @click="setMode('create')"
          class="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3 rounded-xl hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 shadow-lg shadow-violet-500/40"
        >
          🏠 创建房间
        </button>
        <button
          @click="setMode('join')"
          class="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3 rounded-xl hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 shadow-lg shadow-violet-500/40"
        >
          🚀 加入房间
        </button>
        <p class="text-center text-xs text-purple-400 mt-4">
          👥 支持2-7人同时在线游戏 💫
        </p>
      </div>

      <div v-if="mode === 'create'" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-purple-300 mb-2">
            👤 玩家名称
          </label>
          <input
            v-model="playerName"
            class="w-full px-4 py-3 border border-purple-500/40 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 bg-slate-800/70 text-white placeholder-purple-400"
            placeholder="输入你的名字"
            maxlength="20"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-purple-300 mb-2">
            👥 最大玩家数
          </label>
          <select
            v-model="playerCount"
            class="w-full px-4 py-3 border border-purple-500/40 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 bg-slate-800/70 text-white"
          >
            <option v-for="num in [2, 3, 4, 5, 6, 7]" :key="num" :value="num">{{ num }} 人</option>
          </select>
        </div>
        <div class="flex gap-2">
          <button
            @click="setMode('menu')"
            class="flex-1 bg-slate-700 text-purple-300 py-3 rounded-xl hover:bg-slate-600 transition-all duration-300 font-semibold"
          >
            ↩️ 返回
          </button>
          <button
            @click="handleCreateRoom"
            class="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3 rounded-xl hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 shadow-lg shadow-violet-500/40 font-semibold"
          >
            ✨ 创建
          </button>
        </div>
      </div>

      <div v-if="mode === 'join'" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-purple-300 mb-2">
            👤 玩家名称
          </label>
          <input
            v-model="playerName"
            class="w-full px-4 py-3 border border-purple-500/40 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 bg-slate-800/70 text-white placeholder-purple-400"
            placeholder="输入你的名字"
            maxlength="20"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-purple-300 mb-2">
            🔑 房间码
          </label>
          <input
            v-model="roomCode"
            class="w-full px-4 py-3 border border-purple-500/40 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 uppercase bg-slate-800/70 text-white placeholder-purple-400"
            placeholder="输入房间码"
            maxlength="6"
          />
        </div>
        <div class="flex gap-2">
          <button
            @click="setMode('menu')"
            class="flex-1 bg-slate-700 text-purple-300 py-3 rounded-xl hover:bg-slate-600 transition-all duration-300 font-semibold"
          >
            ↩️ 返回
          </button>
          <button
            @click="handleJoinRoom"
            class="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3 rounded-xl hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 shadow-lg shadow-violet-500/40 font-semibold"
          >
            🚀 加入
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useGameStore } from '../stores/game';

const gameStore = useGameStore();
const mode = ref<'menu' | 'create' | 'join'>('menu');
const playerName = ref('');
const roomCode = ref('');
const playerCount = ref(4);

const setMode = (newMode: typeof mode.value) => {
  mode.value = newMode;
};

const handleCreateRoom = () => {
  if (!playerName.value.trim()) {
    alert('请输入你的昵称');
    return;
  }
  console.log('Creating room with player count:', playerCount.value, 'Player:', playerName.value);
  gameStore.createRoom('UNO 房间', playerName.value);
  playerName.value = '';
};

const handleJoinRoom = () => {
  if (!roomCode.value.trim()) {
    alert('请输入房间码');
    return;
  }
  if (!playerName.value.trim()) {
    alert('请输入你的昵称');
    return;
  }
  if (playerName.value === roomCode.value) {
    alert('玩家名字不能与房间码相同');
    return;
  }
  console.log('Joining room:', roomCode.value, 'Player:', playerName.value);
  gameStore.joinRoom(roomCode.value, playerName.value);
  roomCode.value = '';
  playerName.value = '';
};
</script>
