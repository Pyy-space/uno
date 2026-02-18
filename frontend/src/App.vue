<template>
  <div id="app">
    <Lobby v-if="!gameStore.currentRoom" />
    <GameRoom v-else />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useGameStore } from './stores/game';
import { useWebSocket } from './services/websocket';
import Lobby from './views/Lobby.vue';
import GameRoom from './views/GameRoom.vue';

const gameStore = useGameStore();
const ws = useWebSocket();

onMounted(() => {
  ws.on('room_created', (data: any) => {
    console.log('Room created:', data);
    gameStore.updateRoom(data.gameState);
  });
  ws.on('room_joined', (data: any) => {
    console.log('Room joined:', data);
    gameStore.updateRoom(data.gameState);
  });
  ws.on('room_left', () => {
    console.log('Room left');
    gameStore.updateRoom(null as any);
  });
  ws.on('game_started', (data: any) => {
    console.log('Game started:', data);
    gameStore.updateRoom(data.gameState);
  });
  ws.on('game_state_updated', (data: any) => {
    console.log('Game state updated:', data);
    gameStore.updateRoom(data.gameState);
  });
  ws.on('player_joined', (data: any) => {
    console.log('Player joined:', data);
    if (data.gameState) {
      gameStore.updateRoom(data.gameState);
    }
  });
  ws.on('player_left', (data: any) => {
    console.log('Player left:', data);
    if (data.gameState) {
      gameStore.updateRoom(data.gameState);
    }
  });
  ws.on('room_list', (data: any) => {
    console.log('Room list:', data);
    gameStore.updateRoomList(data.rooms);
  });
  ws.on('error', (data: any) => {
    console.error('Server error:', data.error);
    alert('服务器错误: ' + data.error);
  });
});
</script>

<style>
#app {
  min-height: 100vh;
}
</style>
