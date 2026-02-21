<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
    <div class="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-md w-full border-4 border-white/30">
      <!-- 游戏标题 -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-center mb-2 text-white">
          <span class="text-5xl">🎴</span> UNO 游戏 <span class="text-5xl">✨</span>
        </h1>
        <p class="text-center text-white mb-4"><span class="text-2xl">🌟</span> 在线多人卡牌游戏 <span class="text-2xl">🌟</span></p>
      </div>

      <!-- 主菜单 -->
      <div v-if="mode === 'menu'" class="space-y-4">
        <button
          @click="setMode('create')"
          class="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg shadow-purple-600/30 border border-purple-500/50 transform hover:scale-105"
        >
          🏠 创建房间
        </button>
        <button
          @click="setMode('join')"
          class="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg shadow-purple-600/30 border border-purple-500/50 transform hover:scale-105"
        >
          🚀 加入房间
        </button>
        <p class="text-center text-xs text-white mt-4">
          👥 支持2-7人同时在线游戏 💫
        </p>
      </div>

      <div v-if="mode === 'create'" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-white mb-2">
            👤 玩家名称
          </label>
          <input
            v-model="playerName"
            class="w-full px-4 py-3 border-2 border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/10 text-white placeholder-white/50"
            placeholder="输入你的名字"
            maxlength="20"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-white mb-2">
            👥 最大玩家数
          </label>
          <select
            v-model="playerCount"
            class="w-full px-4 py-3 border-2 border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/10 text-white"
          >
            <option v-for="num in [2, 3, 4, 5, 6, 7]" :key="num" :value="num">{{ num }} 人</option>
          </select>
        </div>
        <div class="flex gap-2">
          <button
            @click="setMode('menu')"
            class="flex-1 bg-purple-700 text-white py-3 rounded-xl hover:bg-purple-800 transition-all duration-300 font-semibold border border-purple-600/50 transform hover:scale-105"
          >
            ↩️ 返回
          </button>
          <button
            @click="handleCreateRoom"
            class="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg shadow-green-600/30 border border-green-500/50 font-semibold transform hover:scale-105"
          >
            ✨ 创建
          </button>
        </div>
      </div>

      <div v-if="mode === 'join'" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-white mb-2">
            👤 玩家名称
          </label>
          <input
            v-model="playerName"
            class="w-full px-4 py-3 border-2 border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/10 text-white placeholder-white/50"
            placeholder="输入你的名字"
            maxlength="20"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-white mb-2">
            🔑 房间码
          </label>
          <input
            v-model="roomCode"
            class="w-full px-4 py-3 border-2 border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 uppercase bg-white/10 text-white placeholder-white/50"
            placeholder="输入房间码"
            maxlength="6"
          />
        </div>
        <div class="flex gap-2">
          <button
            @click="setMode('menu')"
            class="flex-1 bg-purple-700 text-white py-3 rounded-xl hover:bg-purple-800 transition-all duration-300 font-semibold border border-purple-600/50 transform hover:scale-105"
          >
            ↩️ 返回
          </button>
          <button
            @click="handleJoinRoom"
            class="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg shadow-blue-600/30 border border-blue-500/50 font-semibold transform hover:scale-105"
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
