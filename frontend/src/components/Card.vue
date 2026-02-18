<template>
  <div class="card" :class="[colorClass, { playable, selected, 'wild-card': isWild }]" @click="onClick">
    <div class="card-inner">
      <div class="card-value">{{ displayValue }}</div>
      <div class="card-type">{{ displayType }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Card } from '../services/websocket';
import { CardColor, CardType } from '../services/websocket';

const props = defineProps<{
  card: Card;
  playable?: boolean;
  selected?: boolean;
}>();

const emit = defineEmits<{
  click: [card: Card];
}>();

const colorClass = computed(() => {
  if (props.card.color === CardColor.WILD) {
    return 'wild';
  }
  return props.card.color;
});

const isWild = computed(() => {
  return props.card.type === CardType.WILD || props.card.type === CardType.WILD_DRAW_FOUR;
});

const displayValue = computed(() => {
  if (props.card.type === CardType.NUMBER) {
    return props.card.value;
  }
  return '';
});

const displayType = computed(() => {
  switch (props.card.type) {
    case CardType.SKIP:
      return '⊘';
    case CardType.REVERSE:
      return '⇄';
    case CardType.DRAW_TWO:
      return '+2';
    case CardType.WILD:
      return '★';
    case CardType.WILD_DRAW_FOUR:
      return '+4';
    default:
      return props.card.value?.toString() || '';
  }
});

const onClick = () => {
  emit('click', props.card);
};
</script>

<style scoped>
.card {
  width: 80px;
  height: 120px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  background: white;
  border: 3px solid;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.card.playable {
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.8);
}

.card.selected {
  transform: translateY(-10px);
  box-shadow: 0 0 20px rgba(255, 215, 0, 1);
}

.card.red {
  border-color: #ff4444;
  background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
}

.card.yellow {
  border-color: #ffcc00;
  background: linear-gradient(135deg, #ffcc00 0%, #ff9900 100%);
}

.card.green {
  border-color: #44ff44;
  background: linear-gradient(135deg, #44ff44 0%, #00cc00 100%);
}

.card.blue {
  border-color: #4444ff;
  background: linear-gradient(135deg, #4444ff 0%, #0000cc 100%);
}

.card.wild {
  border-color: #333;
  background: linear-gradient(135deg, #333 0%, #000 100%);
}

.card-inner {
  color: white;
  text-align: center;
  font-weight: bold;
}

.card-value {
  font-size: 32px;
  margin-bottom: 4px;
}

.card-type {
  font-size: 24px;
}

.wild-card .card-inner {
  background: linear-gradient(135deg, #ff4444 25%, #ffcc00 25%, #ffcc00 50%, #44ff44 50%, #44ff44 75%, #4444ff 75%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
