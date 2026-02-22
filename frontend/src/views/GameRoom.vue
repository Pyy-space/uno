<template>
  <div class="game-room" v-if="currentRoom">
    <!-- 等待室 -->
    <div v-if="currentRoom.state === 'waiting'" class="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <div class="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-2xl w-full border border-white/20">
        <h2 class="text-3xl font-bold text-center mb-6 text-white">
          <span class="text-5xl">🎴</span> UNO 游戏 - 等待室 <span class="text-5xl">✨</span>
        </h2>
        
        <div class="mb-6 p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg">
          <div class="flex justify-between items-center">
            <div>
              <p class="text-sm text-white mb-1">🔑 房间码</p>
              <p class="text-2xl font-bold text-white">{{ currentRoom.id }}</p>
            </div>
            <div>
              <p class="text-sm text-white mb-1">👥 玩家人数</p>
              <p class="text-2xl font-bold text-white">{{ currentRoom.players.length }} / 7</p>
            </div>
          </div>
        </div>

        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3 text-white">🎯 玩家列表</h3>
          <div class="space-y-3">
            <div
              v-for="(player, index) in currentRoom.players"
              :key="player.id"
              :class="['p-4 rounded-xl flex justify-between items-center transition-all duration-300 backdrop-blur-sm', player.id === myPlayer?.id ? 'bg-purple-700/60 border-2 border-purple-500' : 'bg-white/10 hover:bg-white/20 border border-white/30']"
            >
              <div class="flex items-center gap-3">
                <div :class="['w-10 h-10 rounded-full flex items-center justify-center text-white font-bold', ['bg-gradient-to-br from-red-600 to-red-700', 'bg-gradient-to-br from-blue-600 to-blue-700', 'bg-gradient-to-br from-green-600 to-green-700', 'bg-gradient-to-br from-yellow-600 to-yellow-700', 'bg-gradient-to-br from-purple-600 to-purple-700', 'bg-gradient-to-br from-pink-600 to-pink-700', 'bg-gradient-to-br from-indigo-600 to-indigo-700'][index % 7]]">
                  {{ (player.name || 'Player').charAt(0).toUpperCase() }}
                </div>
                <span class="font-medium text-white">{{ player.name || 'Player' }}</span>
                <span v-if="player.id === myPlayer?.id" class="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">👤 你</span>
              </div>
              <div>
                <span v-if="player.isReady" class="text-green-400 font-semibold flex items-center gap-1">
                  <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  ✅ 准备就绪
                </span>
                <span v-else class="text-white">⏳ 等待中</span>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <div v-if="currentRoom.players.length < 2" class="p-4 bg-white/10 border border-white/30 rounded-xl text-center">
            <p class="text-white font-medium">⏳ 等待更多玩家加入 (至少需要2人)</p>
          </div>

          <button
            @click="handleToggleReady"
            :class="['w-full py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105', isReady ? 'bg-purple-700 text-white hover:bg-purple-800 border border-purple-600' : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 border border-green-500 shadow-lg shadow-green-600/30']"
          >
            {{ isReady ? '❌ 取消准备' : '✅ 准备' }}
          </button>

          <button
            @click="handleLeaveRoom"
            class="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg shadow-red-600/30 border border-red-500/50 transform hover:scale-105"
          >
            🚪 离开房间
          </button>
        </div>

        <div class="mt-6 text-center text-sm text-white">
          <p>📢 分享房间码给朋友加入游戏哦 🎉</p>
          <p class="mt-1">⚡ 所有玩家准备好后游戏将自动开始</p>
        </div>
      </div>
    </div>

    <!-- 游戏中 - 统一牌桌布局 -->
    <div v-if="currentRoom.state === 'playing'" class="game-screen min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 flex">
      <!-- 左侧游戏日志 -->
      <div class="game-log-sidebar w-72 bg-black/30 backdrop-blur-sm border-r border-white/10 p-4 flex flex-col">
        <h3 class="text-lg font-semibold mb-4 text-white text-center flex items-center justify-center gap-2">
          📋 游戏日志
        </h3>
        <div class="log-entries flex-1 overflow-y-auto space-y-2">
          <div v-if="gameLog.length === 0" class="text-white/60 text-center py-4 text-sm">
            游戏开始，等待玩家出牌...
          </div>
          <div 
            v-for="(log, index) in gameLog" 
            :key="index"
            class="log-entry text-white/90 text-sm p-2 bg-white/5 rounded-lg border border-white/10"
          >
            {{ log }}
          </div>
        </div>
      </div>

      <!-- 主游戏区域 -->
      <div class="main-area flex-1 flex flex-col p-4">
        <!-- 顶部信息栏 -->
        <div class="top-bar mb-4 p-3 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 flex justify-between items-center">
          <h1 class="text-xl font-bold text-white flex items-center gap-2">
            <span class="text-2xl">🎴</span> {{ currentRoom.name }}
          </h1>
          <div class="flex gap-3 items-center">
            <div :class="['px-4 py-2 rounded-xl font-bold text-white shadow-lg', currentColorClass]">
              当前: {{ currentColorText }}
            </div>
            <div v-if="currentRoom.accumulatedDraw > 0" class="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl font-bold text-white shadow-lg animate-pulse">
              +{{ currentRoom.accumulatedDraw }}
            </div>
            <button @click="handleLeaveRoom" class="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg border border-red-400/50">
              🚪 离开
            </button>
          </div>
        </div>

        <!-- 统一牌桌区域 -->
        <div class="game-table flex-1 bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 rounded-3xl border-4 border-amber-900/50 shadow-2xl relative overflow-hidden">
          <!-- 桌布纹理 -->
          <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0); background-size: 20px 20px;"></div>
          
          <!-- 所有玩家围绕牌桌 -->
          <div class="players-container absolute inset-0">
            <div 
              v-for="(player, index) in allPlayers" 
              :key="player.id"
              class="player-slot absolute"
              :style="getPlayerStyle(index, allPlayers.length)"
            >
              <div 
                :class="['player-card backdrop-blur-md rounded-xl p-3 border-2 transition-all duration-300 shadow-lg', 
                  player.id === myPlayer?.id ? 'bg-purple-600/40 border-purple-400 shadow-purple-500/30' : 
                  isCurrentPlayer(player.id) ? 'bg-yellow-500/30 border-yellow-400 shadow-yellow-500/50 animate-pulse' : 
                  'bg-white/10 border-white/20']"
              >
                <div class="flex items-center gap-2 mb-1">
                  <div :class="['w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md', 
                    player.id === myPlayer?.id ? 'bg-gradient-to-br from-purple-500 to-purple-600' : 
                    ['bg-gradient-to-br from-red-500 to-red-600', 'bg-gradient-to-br from-blue-500 to-blue-600', 
                    'bg-gradient-to-br from-green-500 to-green-600', 'bg-gradient-to-br from-yellow-500 to-yellow-600', 
                    'bg-gradient-to-br from-pink-500 to-pink-600', 'bg-gradient-to-br from-indigo-500 to-indigo-600'][getPlayerColorIndex(player.id)]]"
                  >
                    {{ (player.name || 'Player').charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="flex items-center gap-1">
                      <span class="font-semibold text-white text-sm drop-shadow">{{ player.name || 'Player' }}</span>
                      <span v-if="player.id === myPlayer?.id" class="text-xs bg-purple-500 text-white px-1.5 py-0.5 rounded-full">你</span>
                    </div>
                    <div class="text-white/80 text-xs">{{ player.hand.length }} 张牌</div>
                  </div>
                </div>
                <div v-if="player.hand.length === 1" class="text-red-400 font-bold text-xs text-center animate-pulse">UNO!</div>
                <div v-if="isCurrentPlayer(player.id)" class="text-yellow-300 font-bold text-xs text-center">出牌中...</div>
              </div>
            </div>
          </div>

          <!-- 中央牌堆 -->
          <div class="card-pile-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div class="bg-black/20 backdrop-blur-md rounded-2xl p-5 border-2 border-white/20 shadow-xl">
              <h3 class="text-sm font-semibold mb-3 text-white/80 text-center">牌堆</h3>
              <div class="flex justify-center">
                <div v-if="currentRoom.lastPlayedCard" class="transform transition-all duration-300 hover:scale-110">
                  <Card :card="currentRoom.lastPlayedCard" :playable="false" />
                </div>
                <div v-else class="w-20 h-28 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg border-2 border-white/20 flex items-center justify-center shadow-lg">
                  <span class="text-white text-xl">🎴</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部手牌区域 -->
        <div v-if="myPlayer" class="my-hand-area mt-4 bg-black/30 backdrop-blur-md rounded-2xl p-4 border-2 border-white/10 shadow-xl">
          <div class="flex justify-between items-center mb-3">
            <div class="flex items-center gap-2">
              <div :class="['w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shadow-lg', 'bg-gradient-to-br from-purple-500 to-purple-600 border-2 border-purple-400']">
                {{ (myPlayer.name || 'Player').charAt(0).toUpperCase() }}
              </div>
              <span class="font-medium text-white">{{ myPlayer.name || 'Player' }}</span>
              <span v-if="isMyTurn" class="text-yellow-400 font-bold animate-pulse text-sm">你的回合</span>
            </div>
            <div v-if="myPlayer.hand.length === 1" class="text-red-400 font-bold animate-pulse text-sm">UNO!</div>
          </div>
          <div class="cards flex justify-center gap-2 flex-wrap mb-3">
            <div 
              v-for="card in myPlayer.hand" 
              :key="card.id"
              class="transform transition-all duration-300 hover:scale-110 hover:translate-y-[-8px]"
            >
              <Card 
                :card="card" 
                :playable="isMyTurn && canPlayCard(card)"
                @click="handleCardClick(card)"
              />
            </div>
          </div>
          <div class="actions flex justify-center gap-3">
            <button v-if="isMyTurn" @click="handleDrawCard" class="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg border border-blue-400/50 transform hover:scale-105 text-sm">
              🎴 抽牌
            </button>
            <button v-if="myPlayer && myPlayer.hand.length <= 2 && myPlayer.hand.length > 0" @click="handleCallUno" class="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg border border-red-400/50 transform hover:scale-105 text-sm">
              📢 喊 UNO
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏结束 - 排行榜 -->
    <div v-if="currentRoom.state === 'finished'" class="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <div class="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-lg w-full border-4 border-white/30 text-center">
        <h2 class="text-4xl font-bold mb-6 text-white">
          <span class="text-5xl">🎉</span> 游戏结束! <span class="text-5xl">🎉</span>
        </h2>
        
        <!-- 排行榜 -->
        <div class="rankings mb-6">
          <h3 class="text-xl font-bold text-white mb-4">🏆 排行榜</h3>
          <div class="space-y-3">
            <div 
              v-for="(ranking, index) in currentRoom.rankings" 
              :key="ranking.playerId"
              :class="['p-4 rounded-xl flex items-center justify-between transition-all duration-300',
                index === 0 ? 'bg-gradient-to-r from-yellow-500 to-amber-600 border-2 border-yellow-400 shadow-lg shadow-yellow-500/30' :
                index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500 border-2 border-gray-300 shadow-lg' :
                index === 2 ? 'bg-gradient-to-r from-orange-600 to-orange-700 border-2 border-orange-500 shadow-lg' :
                'bg-white/10 border border-white/20']"
            >
              <div class="flex items-center gap-3">
                <div :class="['w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md',
                  index === 0 ? 'bg-yellow-400 text-yellow-900' :
                  index === 1 ? 'bg-gray-300 text-gray-700' :
                  index === 2 ? 'bg-orange-500 text-white' :
                  'bg-white/20 text-white']"
                >
                  {{ ranking.rank }}
                </div>
                <span class="font-semibold text-white text-lg">{{ ranking.playerName }}</span>
                <span v-if="ranking.playerId === myPlayer?.id" class="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">你</span>
              </div>
              <div class="text-white font-bold text-lg">
                {{ index === 0 ? '🥇 冠军' : index === 1 ? '🥈 亚军' : index === 2 ? '🥉 季军' : `第${ranking.rank}名` }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="space-y-3">
          <button @click="handleRestartGame" class="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg border border-green-400/50 transform hover:scale-105">
            🔄 重新开始
          </button>
          <button @click="handleLeaveRoom" class="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg border border-purple-400/50 transform hover:scale-105">
            🏠 返回大厅
          </button>
        </div>
      </div>
    </div>

    <!-- 颜色选择器 -->
    <div v-if="showColorPicker" class="color-picker-modal fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div class="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border-4 border-white/30 shadow-2xl text-center max-w-md w-full">
        <h3 class="text-2xl font-bold mb-6 text-white">选择颜色</h3>
        <div class="color-options flex justify-center gap-6">
          <div class="color-option w-20 h-20 rounded-xl cursor-pointer transition-all duration-300 hover:scale-125 shadow-lg bg-gradient-to-br from-red-500 to-red-600 border-2 border-red-400" @click="handleColorPick(CardColor.RED)"></div>
          <div class="color-option w-20 h-20 rounded-xl cursor-pointer transition-all duration-300 hover:scale-125 shadow-lg bg-gradient-to-br from-yellow-400 to-yellow-500 border-2 border-yellow-300" @click="handleColorPick(CardColor.YELLOW)"></div>
          <div class="color-option w-20 h-20 rounded-xl cursor-pointer transition-all duration-300 hover:scale-125 shadow-lg bg-gradient-to-br from-green-500 to-green-600 border-2 border-green-400" @click="handleColorPick(CardColor.GREEN)"></div>
          <div class="color-option w-20 h-20 rounded-xl cursor-pointer transition-all duration-300 hover:scale-125 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-blue-400" @click="handleColorPick(CardColor.BLUE)"></div>
        </div>
      </div>
    </div>

    <!-- 通知 -->
    <div v-if="notification" :class="['notification fixed top-4 right-4 px-6 py-4 rounded-xl font-bold shadow-2xl z-50 transition-all duration-300 transform hover:scale-105', notification.type]">
      {{ notification.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore } from '../stores/game';
import Card from '../components/Card.vue';
import { CardColor, CardType } from '../services/websocket';

const gameStore = useGameStore();
const showColorPicker = ref(false);
const selectedCard = ref<any>(null);
const notification = ref<{ type: string; message: string } | null>(null);

const currentRoom = computed(() => gameStore.currentRoom);
const myPlayer = computed(() => gameStore.myPlayer);
const isMyTurn = computed(() => gameStore.isMyTurn);
const isReady = computed(() => myPlayer.value?.isReady || false);
const gameLog = computed(() => gameStore.gameLog);

const allPlayers = computed(() => {
  if (!currentRoom.value) return [];
  return currentRoom.value.players;
});

const currentColorClass = computed(() => {
  if (!currentRoom.value) return '';
  const colorMap: Record<string, string> = {
    red: 'bg-gradient-to-r from-red-500 to-red-600',
    yellow: 'bg-gradient-to-r from-yellow-400 to-yellow-500',
    green: 'bg-gradient-to-r from-green-500 to-green-600',
    blue: 'bg-gradient-to-r from-blue-500 to-blue-600',
    wild: 'bg-gradient-to-r from-gray-500 to-gray-600'
  };
  return colorMap[currentRoom.value.currentColor] || colorMap.wild;
});

const currentColorText = computed(() => {
  if (!currentRoom.value) return '';
  const colorMap: Record<string, string> = {
    red: '红色',
    yellow: '黄色',
    green: '绿色',
    blue: '蓝色',
    wild: '万能'
  };
  return colorMap[currentRoom.value.currentColor] || currentRoom.value.currentColor;
});

const getPlayerStyle = (index: number, totalPlayers: number) => {
  if (totalPlayers === 1) {
    return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  }
  
  const angle = (index / totalPlayers) * Math.PI * 2 - Math.PI / 2;
  const radiusX = 42;
  const radiusY = 38;
  
  const x = 50 + Math.cos(angle) * radiusX;
  const y = 50 + Math.sin(angle) * radiusY;
  
  return {
    left: `${x}%`,
    top: `${y}%`,
    transform: 'translate(-50%, -50%)'
  };
};

const isCurrentPlayer = (playerId: string) => {
  if (!currentRoom.value) return false;
  const currentIndex = currentRoom.value.currentPlayerIndex;
  return currentRoom.value.players[currentIndex]?.id === playerId;
};

const getPlayerColorIndex = (playerId: string) => {
  if (!currentRoom.value) return 0;
  const index = currentRoom.value.players.findIndex((p: any) => p.id === playerId);
  return index % 7;
};

const canPlayCard = (card: any) => {
  return gameStore.canPlayCard(card);
};

const handleLeaveRoom = () => {
  gameStore.leaveRoom();
};

const handleToggleReady = () => {
  gameStore.toggleReady();
};

const handleRestartGame = () => {
  if (myPlayer.value) {
    gameStore.toggleReady();
    gameStore.toggleReady();
  }
};

const handleCardClick = (card: any) => {
  if (!isMyTurn.value) return;
  
  if (card.type === CardType.WILD || card.type === CardType.WILD_DRAW_FOUR) {
    selectedCard.value = card;
    showColorPicker.value = true;
  } else {
    gameStore.playCard(card.id);
  }
};

const handleColorPick = (color: CardColor) => {
  if (selectedCard.value) {
    gameStore.playCard(selectedCard.value.id, color);
    showColorPicker.value = false;
    selectedCard.value = null;
  }
};

const handleDrawCard = () => {
  gameStore.drawCard();
};

const handleCallUno = () => {
  gameStore.callUno();
};

</script>

<style scoped>
.game-screen {
  display: flex;
  min-height: 100vh;
}

.game-log-sidebar {
  width: 288px;
  display: flex;
  flex-direction: column;
}

.log-entries {
  flex: 1;
  overflow-y: auto;
}

.log-entries::-webkit-scrollbar {
  width: 4px;
}

.log-entries::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
}

.log-entries::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.game-table {
  position: relative;
  flex: 1;
  min-height: 400px;
}

.players-container {
  position: absolute;
  inset: 0;
}

.player-slot {
  position: absolute;
}

.player-card {
  width: 140px;
  min-height: 70px;
}

.card-pile-center {
  z-index: 10;
}

.cards {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.notification {
  animation: slideIn 0.3s ease-out forwards;
}

.notification.success {
  background: linear-gradient(to right, #4CAF50, #45a049);
}

.notification.error {
  background: linear-gradient(to right, #f44336, #da190b);
}

.notification.warning {
  background: linear-gradient(to right, #ff9800, #f57c00);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 193, 7, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0);
  }
}

@media (max-width: 1200px) {
  .game-log-sidebar {
    width: 220px;
  }
  
  .player-card {
    width: 120px;
    min-height: 60px;
    padding: 8px !important;
  }
}

@media (max-width: 768px) {
  .game-log-sidebar {
    display: none;
  }
  
  .game-table {
    min-height: 300px;
  }
  
  .player-card {
    width: 90px;
    min-height: 50px;
    padding: 6px !important;
    font-size: 0.7rem;
  }
  
  .player-card .w-9 {
    width: 24px !important;
    height: 24px !important;
    font-size: 0.6rem !important;
  }
  
  .card-pile-center .bg-black\/20 {
    padding: 8px !important;
  }
  
  .my-hand-area {
    padding: 8px !important;
  }
  
  .my-hand-area .cards {
    gap: 4px !important;
  }
  
  .my-hand-area .actions button {
    padding: 8px 12px !important;
    font-size: 0.75rem !important;
  }
}

@media (max-width: 480px) {
  .game-table {
    min-height: 250px;
  }
  
  .player-card {
    width: 70px;
    min-height: 45px;
    padding: 4px !important;
    font-size: 0.6rem;
  }
  
  .player-card .w-9 {
    width: 20px !important;
    height: 20px !important;
    font-size: 0.5rem !important;
  }
  
  .top-bar {
    flex-direction: column;
    gap: 8px;
  }
  
  .top-bar h1 {
    font-size: 1rem !important;
  }
  
  .top-bar > div {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>