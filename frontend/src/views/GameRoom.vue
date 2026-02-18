<template>
  <div class="game-room" v-if="currentRoom">
    <div v-if="currentRoom.state === 'waiting'" class="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 cute-pattern flex items-center justify-center p-4 relative">
      <div class="absolute inset-0 star-pattern"></div>
      <div class="bg-slate-900/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-2xl w-full border border-violet-500/40 relative z-10">
        <h2 class="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
          <span class="text-5xl">🎴</span> UNO 游戏 - 等待室 <span class="text-5xl">✨</span>
        </h2>
        
        <div class="mb-6 p-4 bg-gradient-to-r from-violet-900/50 to-fuchsia-900/50 rounded-xl border border-violet-500/40">
          <div class="flex justify-between items-center">
            <div>
              <p class="text-sm text-purple-300">🔑 房间码</p>
              <p class="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{{ currentRoom.id }}</p>
            </div>
            <div>
              <p class="text-sm text-purple-300">👥 玩家人数</p>
              <p class="text-2xl font-bold text-white">{{ currentRoom.players.length }} / 7</p>
            </div>
          </div>
        </div>

        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3 text-purple-300">🎯 玩家列表</h3>
          <div class="space-y-2">
            <div
              v-for="(player, index) in currentRoom.players"
              :key="player.id"
              :class="['p-4 rounded-xl flex justify-between items-center transition-all duration-300', player.id === myPlayer?.id ? 'bg-gradient-to-r from-violet-900/50 to-fuchsia-900/50 border-2 border-violet-400' : 'bg-slate-800/50 hover:bg-slate-800']"
            >
              <div class="flex items-center gap-3">
                <div :class="['w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg', ['bg-gradient-to-br from-red-500 to-pink-500', 'bg-gradient-to-br from-blue-500 to-cyan-500', 'bg-gradient-to-br from-green-500 to-emerald-500', 'bg-gradient-to-br from-yellow-500 to-orange-500', 'bg-gradient-to-br from-purple-500 to-violet-500', 'bg-gradient-to-br from-pink-500 to-rose-500', 'bg-gradient-to-br from-indigo-500 to-blue-500'][index % 7]]">
                  {{ (player.name || 'Player').charAt(0).toUpperCase() }}
                </div>
                <span class="font-medium text-white">{{ player.name || 'Player' }}</span>
                <span v-if="player.id === myPlayer?.id" class="text-xs bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-2 py-1 rounded-full shadow-md">👤 你</span>
              </div>
              <div>
                <span v-if="player.isReady" class="text-green-400 font-semibold flex items-center gap-1">
                  <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  ✅ 准备就绪
                </span>
                <span v-else class="text-purple-400">⏳ 等待中</span>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <div v-if="currentRoom.players.length < 2" class="p-4 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 rounded-xl text-center">
            <p class="text-yellow-400 font-medium">⏳ 等待更多玩家加入 (至少需要2人)</p>
          </div>

          <button
            @click="handleToggleReady"
            :class="['w-full py-3 rounded-xl font-semibold transition-all duration-300', isReady ? 'bg-slate-800 text-purple-300 hover:bg-slate-700' : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/40']"
          >
            {{ isReady ? '❌ 取消准备' : '✅ 准备' }}
          </button>

          <button
            @click="handleLeaveRoom"
            class="w-full py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-rose-700 transition-all duration-300 shadow-lg shadow-red-500/40"
          >
            🚪 离开房间
          </button>
        </div>

        <div class="mt-6 text-center text-sm text-purple-400">
          <p>📢 分享房间码给朋友加入游戏哦 🎉</p>
          <p class="mt-1">⚡ 所有玩家准备好后游戏将自动开始</p>
        </div>
      </div>
    </div>

    <div v-if="currentRoom.state === 'playing'" class="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 cute-pattern p-4 relative">
      <div class="absolute inset-0 star-pattern"></div>
      <div class="relative z-10 max-w-6xl mx-auto">
        <div class="game-header mb-6 p-4 bg-slate-900/95 backdrop-blur-sm rounded-2xl border border-violet-500/40">
          <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              <span class="text-3xl">🎴</span> {{ currentRoom.name }}
            </h1>
            <button @click="handleLeaveRoom" class="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-rose-700 transition-all duration-300 shadow-lg shadow-red-500/40">
              🚪 离开房间
            </button>
          </div>
        </div>

        <div class="game-info mb-6 flex justify-center gap-4">
          <div :class="['px-6 py-3 rounded-xl font-bold text-white transition-all duration-300', currentColorClass]">
            当前颜色: {{ currentColorText }}
          </div>
          <div v-if="currentRoom.accumulatedDraw > 0" class="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl font-bold text-white shadow-lg shadow-orange-500/40">
            累计抽牌: {{ currentRoom.accumulatedDraw }}
          </div>
        </div>

        <div class="other-players mb-6 flex justify-center gap-4 flex-wrap">
          <div 
            v-for="(player, index) in otherPlayers" 
            :key="player.id" 
            :class="['bg-slate-900/95 backdrop-blur-sm rounded-2xl p-4 border-2 transition-all duration-300 min-w-[180px] text-center shadow-lg', index === currentRoom.currentPlayerIndex ? 'border-yellow-400 shadow-yellow-400/50' : 'border-violet-500/40']"
          >
            <div class="flex items-center justify-center gap-2 mb-2">
              <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm', ['bg-gradient-to-br from-red-500 to-pink-500', 'bg-gradient-to-br from-blue-500 to-cyan-500', 'bg-gradient-to-br from-green-500 to-emerald-500', 'bg-gradient-to-br from-yellow-500 to-orange-500', 'bg-gradient-to-br from-purple-500 to-violet-500', 'bg-gradient-to-br from-pink-500 to-rose-500', 'bg-gradient-to-br from-indigo-500 to-blue-500'][index % 7]]">
                {{ (player.name || 'Player').charAt(0).toUpperCase() }}
              </div>
              <span class="font-semibold text-white">{{ player.name || 'Player' }}</span>
            </div>
            <div class="text-purple-300 text-sm mb-2">{{ player.hand.length }} 张牌</div>
            <div v-if="player.hand.length === 1" class="text-red-500 font-bold animate-pulse">UNO!</div>
          </div>
        </div>

        <div class="play-area mb-6 flex justify-center p-8">
          <div class="bg-slate-900/95 backdrop-blur-sm rounded-2xl p-6 border border-violet-500/40 shadow-lg shadow-violet-500/20">
            <h3 class="text-lg font-semibold mb-4 text-purple-300 text-center">弃牌堆</h3>
            <Card v-if="currentRoom.lastPlayedCard" :card="currentRoom.lastPlayedCard" />
          </div>
        </div>

        <div v-if="myPlayer" class="my-hand bg-slate-900/95 backdrop-blur-sm rounded-2xl p-6 border border-violet-500/40 shadow-lg shadow-violet-500/20">
          <div class="flex justify-between items-center mb-4">
            <div class="flex items-center gap-3">
              <div :class="['w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg', 'bg-gradient-to-br from-violet-500 to-fuchsia-500']">
                {{ (myPlayer.name || 'Player').charAt(0).toUpperCase() }}
              </div>
              <span class="font-semibold text-white text-lg">{{ myPlayer.name || 'Player' }}</span>
            </div>
            <div v-if="myPlayer.hand.length === 1" class="text-red-500 font-bold animate-pulse text-xl">UNO!</div>
          </div>
          <div class="cards flex justify-center gap-3 flex-wrap mb-4">
            <Card 
              v-for="card in myPlayer.hand" 
              :key="card.id" 
              :card="card" 
              :playable="isMyTurn && canPlayCard(card)"
              @click="handleCardClick(card)"
            />
          </div>
          <div class="actions flex justify-center gap-3">
            <button v-if="isMyTurn" @click="handleDrawCard" class="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 shadow-lg shadow-blue-500/40">
              🎴 抽牌
            </button>
            <button v-if="isMyTurn && myPlayer.hand.length === 2" @click="handleCallUno" class="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-rose-700 transition-all duration-300 shadow-lg shadow-red-500/40">
              📢 喊 UNO
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="currentRoom.state === 'finished'" class="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 cute-pattern flex items-center justify-center p-4 relative">
      <div class="absolute inset-0 star-pattern"></div>
      <div class="bg-slate-900/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full border border-violet-500/40 relative z-10 text-center">
        <h2 class="text-4xl font-bold mb-6 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
          <span class="text-5xl">🎉</span> 游戏结束! <span class="text-5xl">🎉</span>
        </h2>
        <div v-if="currentRoom.winner" class="winner mb-6 p-6 bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-xl border border-green-500/40">
          <p class="text-green-400 text-sm mb-2">🏆 获胜者</p>
          <p class="text-3xl font-bold text-white">{{ currentRoom.winner.name }}</p>
        </div>
        <button @click="handleLeaveRoom" class="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-semibold hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 shadow-lg shadow-violet-500/40">
          🏠 返回大厅
        </button>
      </div>
    </div>

    <div v-if="showColorPicker" class="color-picker-modal fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div class="modal-content bg-slate-900/95 backdrop-blur-sm rounded-2xl p-8 border border-violet-500/40 shadow-2xl text-center max-w-md w-full">
        <h3 class="text-2xl font-bold mb-6 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">选择颜色</h3>
        <div class="color-options flex justify-center gap-6">
          <div class="color-option w-20 h-20 rounded-xl cursor-pointer transition-all duration-300 hover:scale-110 shadow-lg bg-gradient-to-br from-red-500 to-red-600" @click="handleColorPick(CardColor.RED)"></div>
          <div class="color-option w-20 h-20 rounded-xl cursor-pointer transition-all duration-300 hover:scale-110 shadow-lg bg-gradient-to-br from-yellow-400 to-yellow-500" @click="handleColorPick(CardColor.YELLOW)"></div>
          <div class="color-option w-20 h-20 rounded-xl cursor-pointer transition-all duration-300 hover:scale-110 shadow-lg bg-gradient-to-br from-green-500 to-green-600" @click="handleColorPick(CardColor.GREEN)"></div>
          <div class="color-option w-20 h-20 rounded-xl cursor-pointer transition-all duration-300 hover:scale-110 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600" @click="handleColorPick(CardColor.BLUE)"></div>
        </div>
      </div>
    </div>

    <div v-if="notification" :class="['notification fixed top-4 right-4 px-6 py-4 rounded-xl font-bold shadow-2xl z-50 transition-all duration-300', notification.type]">
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

const showNotification = (type: string, message: string) => {
  notification.value = { type, message };
  setTimeout(() => {
    notification.value = null;
  }, 3000);
};
</script>

<style scoped>
.cards {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
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
</style>
