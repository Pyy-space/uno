<template>
  <div class="card" :class="[colorClass, { playable, selected, 'wild-card': isWild }]" @click="onClick">
    <div class="card-content">
      <!-- 左上角小数字 -->
      <div class="card-corner top-left">
        <div class="corner-value">{{ displayValue || displayType }}</div>
      </div>
      
      <!-- 中央大数字/符号 -->
      <div class="card-center">
        <div v-if="card.type === CardType.NUMBER" class="center-number">{{ displayValue }}</div>
        <div v-else class="center-symbol">{{ displayType }}</div>
      </div>
      
      <!-- 右下角小数字 (旋转180度) -->
      <div class="card-corner bottom-right">
        <div class="corner-value">{{ displayValue || displayType }}</div>
      </div>
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
  width: 90px;
  height: 130px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
  position: relative;
  background: white;
  border: 3px solid;
  font-family: 'Arial', sans-serif;
  overflow: hidden;
}

.card:hover {
  transform: translateY(-8px) rotate(2deg);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.card.playable {
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.9);
  animation: pulse 1.5s infinite;
}

.card.selected {
  transform: translateY(-12px) rotate(3deg);
  box-shadow: 0 0 25px rgba(255, 215, 0, 1);
}

.card-content {
  width: 100%;
  height: 100%;
  position: relative;
  padding: 10px;
}

.card-corner {
  position: absolute;
  font-weight: bold;
  color: white;
}

.top-left {
  top: 8px;
  left: 10px;
}

.bottom-right {
  bottom: 8px;
  right: 10px;
  transform: rotate(180deg);
}

.corner-value {
  font-size: 16px;
  line-height: 1;
}

.corner-type {
  font-size: 12px;
  line-height: 1;
}

.card-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.center-number {
  font-size: 50px;
  font-weight: bold;
  color: white;
  line-height: 1;
}

.center-symbol {
  font-size: 40px;
  font-weight: bold;
  color: white;
  line-height: 1;
}

/* 颜色样式 */
.card.red {
  border-color: #d32f2f;
  background: linear-gradient(135deg, #ff5252 0%, #d32f2f 100%);
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.4);
}

.card.yellow {
  border-color: #f57f17;
  background: linear-gradient(135deg, #ffeb3b 0%, #f57f17 100%);
  box-shadow: 0 4px 12px rgba(245, 127, 23, 0.4);
}

.card.green {
  border-color: #388e3c;
  background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  box-shadow: 0 4px 12px rgba(56, 142, 60, 0.4);
}

.card.blue {
  border-color: #1976d2;
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.4);
}

.card.wild {
  border-color: #424242;
  background: linear-gradient(135deg, #616161 0%, #212121 100%);
  box-shadow: 0 4px 12px rgba(66, 66, 66, 0.4);
}

/* 万能牌特殊效果 */
.wild-card .center-symbol {
  background: linear-gradient(135deg, #ff5252 25%, #ffeb3b 25%, #ffeb3b 50%, #4caf50 50%, #4caf50 75%, #2196f3 75%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 45px;
}

.wild-card .corner-value,
.wild-card .corner-type {
  background: linear-gradient(135deg, #ff5252 25%, #ffeb3b 25%, #ffeb3b 50%, #4caf50 50%, #4caf50 75%, #2196f3 75%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 动画效果 */
@keyframes pulse {
  0% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.9);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 215, 0, 1);
  }
  100% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.9);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card {
    width: 70px;
    height: 100px;
  }
  
  .center-number {
    font-size: 40px;
  }
  
  .center-symbol {
    font-size: 30px;
  }
  
  .corner-value {
    font-size: 12px;
  }
  
  .corner-type {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .card {
    width: 60px;
    height: 85px;
  }
  
  .center-number {
    font-size: 30px;
  }
  
  .center-symbol {
    font-size: 25px;
  }
  
  .corner-value {
    font-size: 10px;
  }
  
  .corner-type {
    font-size: 8px;
  }
}
</style>
