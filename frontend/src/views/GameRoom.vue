<template>
  <div class="game-room" v-if="currentRoom">
    <!-- 等待室 -->
    <div v-if="currentRoom.state === 'waiting'" class="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <div class="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-2xl w-full border border-white/20">
        <h2 class="text-3xl font-bold text-center mb-6 text-white">
          <span class="text-5xl">🎴</span> UNO 游戏 - 等待室 <span class="text-5xl">✨</span>
        </h2>
        
        <div class="mb-6 p-4 bg-white/20 rounded-xl border border-white/30 backdrop-blur-sm">
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

    <!-- 游戏中 -->
    <div v-if="currentRoom.state === 'playing'" class="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-4">
      <div class="max-w-6xl mx-auto">
        <div class="game-header mb-6 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
          <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold text-white">
              <span class="text-3xl">🎴</span> {{ currentRoom.name }}
            </h1>
            <button @click="handleLeaveRoom" class="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg shadow-red-600/30 border border-red-500/50 transform hover:scale-105">
              🚪 离开房间
            </button>
          </div>
        </div>

        <div class="game-info mb-6 flex justify-center gap-4">
          <div :class="['px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 shadow-lg transform hover:scale-105', currentColorClass]">
            当前颜色: {{ currentColorText }}
          </div>
          <div v-if="currentRoom.accumulatedDraw > 0" class="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-700 rounded-xl font-bold text-white shadow-lg shadow-orange-600/30 border border-orange-500/50 transform hover:scale-105">
            累计抽牌: {{ currentRoom.accumulatedDraw }}
          </div>
        </div>

        <div class="other-players mb-6 flex justify-center gap-4 flex-wrap">
          <div 
            v-for="(player, index) in otherPlayers" 
            :key="player.id" 
            :class="['bg-white/10 backdrop-blur-sm rounded-2xl p-4 border transition-all duration-300 min-w-[180px] text-center shadow-lg transform hover:scale-105', index === currentRoom.currentPlayerIndex ? 'border-yellow-500 shadow-yellow-500/50' : 'border-white/30']"
          >
            <div class="flex items-center justify-center gap-2 mb-2">
              <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm', ['bg-gradient-to-br from-red-600 to-red-700', 'bg-gradient-to-br from-blue-600 to-blue-700', 'bg-gradient-to-br from-green-600 to-green-700', 'bg-gradient-to-br from-yellow-600 to-yellow-700', 'bg-gradient-to-br from-purple-600 to-purple-700', 'bg-gradient-to-br from-pink-600 to-pink-700', 'bg-gradient-to-br from-indigo-600 to-indigo-700'][index % 7]]">
                {{ (player.name || 'Player').charAt(0).toUpperCase() }}
              </div>
              <span class="font-semibold text-white">{{ player.name || 'Player' }}</span>
            </div>
            <div class="text-white text-sm mb-2">{{ player.hand.length }} 张牌</div>
            <div v-if="player.hand.length === 1" class="text-red-500 font-bold animate-pulse">UNO!</div>
          </div>
        </div>

        <div class="play-area mb-6 flex justify-center p-8">
          <div class="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border-4 border-white/30 shadow-2xl w-full max-w-md">
            <h3 class="text-lg font-semibold mb-4 text-white text-center">弃牌堆</h3>
            <div class="flex justify-center">
              <div class="transform transition-all duration-300 hover:scale-110">
                <!-- 移除弃牌堆卡牌显示 -->
              </div>
            </div>
          </div>
        </div>

        <div v-if="myPlayer" class="my-hand bg-white/10 backdrop-blur-lg rounded-3xl p-6 border-4 border-white/30 shadow-2xl">
          <div class="flex justify-between items-center mb-4">
            <div class="flex items-center gap-3">
              <div :class="['w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg', 'bg-gradient-to-br from-purple-600 to-purple-700 border-2 border-purple-500']">
                {{ (myPlayer.name || 'Player').charAt(0).toUpperCase() }}
              </div>
              <span class="font-medium text-white">{{ myPlayer.name || 'Player' }}</span>
            </div>
            <div v-if="myPlayer.hand.length === 1" class="text-red-500 font-bold animate-pulse">UNO!</div>
          </div>
          <div class="cards flex justify-center gap-3 flex-wrap mb-4">
            <div 
              v-for="card in myPlayer.hand" 
              :key="card.id"
              class="transform transition-all duration-300 hover:scale-110 hover:translate-y-[-10px]"
            >
              <Card 
                :card="card" 
                :playable="isMyTurn && canPlayCard(card)"
                @click="handleCardClick(card)"
              />
            </div>
          </div>
          <div class="actions flex justify-center gap-3">
            <button v-if="isMyTurn" @click="handleDrawCard" class="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg shadow-blue-600/30 border border-blue-500/50 transform hover:scale-105">
              🎴 抽牌
            </button>
            <button v-if="isMyTurn && myPlayer.hand.length === 2" @click="handleCallUno" class="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg shadow-red-600/30 border border-red-500/50 transform hover:scale-105">
              📢 喊 UNO
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏结束 -->
    <div v-if="currentRoom.state === 'finished'" class="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <div class="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-md w-full border-4 border-white/30 text-center">
        <h2 class="text-4xl font-bold mb-6 text-white">
          <span class="text-5xl">🎉</span> 游戏结束! <span class="text-5xl">🎉</span>
        </h2>
        <div v-if="currentRoom.winner" class="winner mb-6 p-6 bg-white/20 backdrop-blur-sm rounded-xl border-2 border-white/30 shadow-lg">
          <p class="text-white text-sm mb-2">🏆 获胜者</p>
          <p class="text-3xl font-bold text-white">{{ currentRoom.winner.name }}</p>
        </div>
        <button @click="handleLeaveRoom" class="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg shadow-purple-600/30 border border-purple-500/50 transform hover:scale-105">
          🏠 返回大厅
        </button>
      </div>
    </div>

    <!-- 颜色选择器 -->
    <div v-if="showColorPicker" class="color-picker-modal fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div class="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border-4 border-white/30 shadow-2xl text-center max-w-md w-full">
        <h3 class="text-2xl font-bold mb-6 text-white">选择颜色</h3>
        <div class="color-options flex justify-center gap-6">
          <div class="color-option w-20 h-20 rounded-xl cursor-pointer transition-all duration-300 hover:scale-125 shadow-lg bg-gradient-to-br from-red-500 to-red-700 border-2 border-red-800" @click="handleColorPick(CardColor.RED)"></div>
          <div class="color-option w-20 h-20 rounded-xl cursor-pointer transition-all duration-300 hover:scale-125 shadow-lg bg-gradient-to-br from-yellow-400 to-yellow-700 border-2 border-yellow-800" @click="handleColorPick(CardColor.YELLOW)"></div>
          <div class="color-option w-20 h-20 rounded-xl cursor-pointer transition-all duration-300 hover:scale-125 shadow-lg bg-gradient-to-br from-green-500 to-green-700 border-2 border-green-800" @click="handleColorPick(CardColor.GREEN)"></div>
          <div class="color-option w-20 h-20 rounded-xl cursor-pointer transition-all duration-300 hover:scale-125 shadow-lg bg-gradient-to-br from-blue-500 to-blue-700 border-2 border-blue-800" @click="handleColorPick(CardColor.BLUE)"></div>
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

const otherPlayers = computed(() => {
  if (!currentRoom.value || !myPlayer.value) return [];
  return currentRoom.value.players.filter((p: any) => p.id !== myPlayer.value!.id);
});

const currentColorClass = computed(() => {
  if (!currentRoom.value) return '';
  const colorMap: Record<string, string> = {
    red: 'bg-gradient-to-r from-red-500 to-red-600',
    yellow: 'bg-gradient-to-r from-yellow-400 to-yellow-500',
    green: 'bg-gradient-to-r from-green-500 to-green-600',
    blue: 'bg-gradient-to-r from-blue-500 to-blue-600',
    wild: 'bg-gradient-to-r from-gray-600 to-gray-700'
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

const canPlayCard = (card: any) => {
  return gameStore.canPlayCard(card);
};

const handleLeaveRoom = () => {
  gameStore.leaveRoom();
};

const handleToggleReady = () => {
  gameStore.toggleReady();
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

// Notification helper function (currently unused but may be used in the future)
// const showNotification = (type: string, message: string) => {
//   notification.value = { type, message };
//   setTimeout(() => {
//     notification.value = null;
//   }, 3000);
// };

</script>

<style scoped>
.cards {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* 牌背面样式 */
.card-back {
  width: 90px;
  height: 130px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

/* 牌桌纹理效果 */
.play-area,
.my-hand {
  position: relative;
}

.play-area::before,
.my-hand::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
  border-radius: inherit;
  pointer-events: none;
}

/* 通知样式 */
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

/* 动画效果 */
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

/* 响应式设计 */
@media (max-width: 768px) {
  .card-back {
    width: 70px;
    height: 100px;
  }
  
  .card-back div {
    font-size: 30px;
  }
}

@media (max-width: 480px) {
  .card-back {
    width: 60px;
    height: 85px;
  }
  
  .card-back div {
    font-size: 24px;
  }
}
</style>
