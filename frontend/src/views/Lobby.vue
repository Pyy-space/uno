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
        <button
          @click="setMode('rules')"
          class="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg shadow-blue-600/30 border border-blue-500/50 transform hover:scale-105"
        >
          📖 游戏规则
        </button>
        <p class="text-center text-xs text-white mt-4">
          👥 支持2-7人同时在线游戏 💫
        </p>
      </div>

      <!-- 创建房间 -->
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
            class="w-full px-4 py-3 border-2 border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-purple-800 text-white"
          >
            <option v-for="num in [2, 3, 4, 5, 6, 7]" :key="num" :value="num" class="bg-purple-800 text-white">{{ num }} 人</option>
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

      <!-- 加入房间 -->
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

      <!-- 游戏规则 -->
      <div v-if="mode === 'rules'" class="space-y-4">
        <div class="rules-content max-h-96 overflow-y-auto pr-2">
          <h2 class="text-2xl font-bold text-white mb-4 text-center">📖 UNO 游戏规则</h2>
          
          <div class="space-y-4 text-white text-sm">
            <div class="bg-white/10 p-4 rounded-xl">
              <h3 class="font-bold text-lg mb-2">🎯 游戏目标</h3>
              <p>第一个出完手中所有牌的玩家获胜！</p>
            </div>

            <div class="bg-white/10 p-4 rounded-xl">
              <h3 class="font-bold text-lg mb-2">🃏 牌型介绍</h3>
              <ul class="space-y-2">
                <li><span class="font-bold text-red-400">红色牌</span> - 红色数字牌和功能牌</li>
                <li><span class="font-bold text-yellow-400">黄色牌</span> - 黄色数字牌和功能牌</li>
                <li><span class="font-bold text-green-400">绿色牌</span> - 绿色数字牌和功能牌</li>
                <li><span class="font-bold text-blue-400">蓝色牌</span> - 蓝色数字牌和功能牌</li>
                <li><span class="font-bold text-purple-400">万能牌</span> - 可以在任何时候出，并选择颜色</li>
                <li><span class="font-bold text-purple-400">万能+4</span> - 让下一位玩家抽4张牌，并选择颜色</li>
              </ul>
            </div>

            <div class="bg-white/10 p-4 rounded-xl">
              <h3 class="font-bold text-lg mb-2">⚡ 功能牌</h3>
              <ul class="space-y-2">
                <li><span class="font-bold">跳过</span> - 跳过下一位玩家的回合</li>
                <li><span class="font-bold">反转</span> - 改变出牌方向（顺时针↔逆时针）</li>
                <li><span class="font-bold">+2</span> - 下一位玩家抽2张牌并跳过回合</li>
              </ul>
            </div>

            <div class="bg-white/10 p-4 rounded-xl">
              <h3 class="font-bold text-lg mb-2">🎮 出牌规则</h3>
              <ul class="space-y-2">
                <li>• 必须出与弃牌堆顶牌<span class="font-bold">相同颜色</span>或<span class="font-bold">相同数字/符号</span>的牌</li>
                <li>• 万能牌可以在任何时候出</li>
                <li>• 如果没有可出的牌，必须从牌堆抽一张</li>
                <li>• 抽到的牌如果可以出，可以立即打出</li>
              </ul>
            </div>

            <div class="bg-white/10 p-4 rounded-xl">
              <h3 class="font-bold text-lg mb-2">📢 UNO 规则</h3>
              <p>当你手中只剩<span class="font-bold text-red-400">最后一张牌</span>时，必须点击"喊 UNO"按钮。如果忘记喊，会被罚抽2张牌！</p>
            </div>

            <div class="bg-white/10 p-4 rounded-xl">
              <h3 class="font-bold text-lg mb-2">🏆 胜利条件</h3>
              <p>第一个出完手中所有牌的玩家获胜！</p>
            </div>
          </div>
        </div>
        
        <button
          @click="setMode('menu')"
          class="w-full bg-purple-700 text-white py-3 rounded-xl hover:bg-purple-800 transition-all duration-300 font-semibold border border-purple-600/50 transform hover:scale-105"
        >
          ↩️ 返回主菜单
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useGameStore } from '../stores/game';

const gameStore = useGameStore();
const mode = ref<'menu' | 'create' | 'join' | 'rules'>('menu');
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

<style scoped>
.rules-content {
  max-height: 400px;
  overflow-y: auto;
}

.rules-content::-webkit-scrollbar {
  width: 6px;
}

.rules-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.rules-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.rules-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>