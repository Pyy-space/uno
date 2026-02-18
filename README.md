# UNO 网页联机游戏

一个基于 Vue 3 + TypeScript + WebSocket 的 UNO 网页联机游戏，支持 2-7 人实时对战。

## 功能特性

- 支持 2-7 人联机对战
- 完整的 UNO 游戏规则实现
- 实时 WebSocket 通信
- 精美的游戏界面
- 特殊功能支持：
  - +4 质疑机制
  - UNO 喊话功能
  - 禁止、反转、+2 等功能牌
  - 万能牌颜色选择

## 技术栈

### 前端
- Vue 3
- TypeScript
- Vite
- Pinia (状态管理)
- WebSocket

### 后端
- Node.js
- TypeScript
- WebSocket (ws 库)
- UUID

## 项目结构

```
Uno/
├── frontend/          # Vue 3 前端
│   ├── src/
│   │   ├── components/   # 组件
│   │   ├── views/        # 页面
│   │   ├── stores/       # 状态管理
│   │   └── services/     # 服务层
├── backend/           # Node.js 后端
│   └── src/
│       ├── game/         # 游戏逻辑
│       └── server/       # WebSocket 服务器
└── shared/            # 共享类型和常量
```

## 安装和运行

### 前置要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

#### 后端
```bash
cd backend
npm install
```

#### 前端
```bash
cd frontend
npm install
```

### 运行项目

#### 启动后端服务器
```bash
cd backend
npm run dev
```
后端服务器将在 `http://localhost:3001` 运行

#### 启动前端开发服务器
```bash
cd frontend
npm run dev
```
前端开发服务器将在 `http://localhost:5173` 运行

### 构建生产版本

#### 后端
```bash
cd backend
npm run build
npm start
```

#### 前端
```bash
cd frontend
npm run build
```

## 游戏规则

### 牌类组成
- 四色数字牌：1~9 每色各 2 张、0 每色各 1 张（76 张）
- 四色功能牌：跳过、转向、+2 各两张（24 张）
- 黑色万能牌：改色、+4 改色各四张（8 张）

### 初始设置
- 每人 5 张手牌
- 庄家从牌堆取出首张数字牌作为起始牌

### 出牌规则
- 出牌必须和上一张牌的颜色或者图案相同，或者出万能牌
- 若玩家无牌可出，则从牌堆抽 1 张牌
- 当你在打剩 1 张牌的时候，要喊出 "UNO"

### 特殊规则

#### +4 质疑
- 只有出牌者手中没有与参照牌同颜色才能合法出 +4 牌
- 下家有权利质疑你的出牌是否合法
- 若合法，下家被罚抽 6 张牌
- 若不合法，出牌者罚抽 4 张牌

#### UNO 质疑
- 玩家忘记说 "UNO"，在被其他人发现后罚抽 2 张牌
- 错喊 "UNO" 的玩家罚抽 2 张牌
- 错检举不是剩下 1 张牌的人，错检举的玩家罚抽 2 张牌

## 开发说明

### 后端 API

#### WebSocket 消息类型

**客户端发送：**
- `create_room` - 创建房间
- `join_room` - 加入房间
- `leave_room` - 离开房间
- `start_game` - 开始游戏
- `play_card` - 出牌
- `draw_card` - 抽牌
- `call_uno` - 喊 UNO
- `challenge_uno` - 质疑 UNO
- `challenge_wild_draw_four` - 质疑 +4
- `get_room_list` - 获取房间列表

**服务器发送：**
- `connected` - 连接成功
- `room_created` - 房间创建成功
- `room_joined` - 加入房间成功
- `room_left` - 离开房间
- `game_started` - 游戏开始
- `game_state_updated` - 游戏状态更新
- `player_joined` - 玩家加入
- `player_left` - 玩家离开
- `room_list` - 房间列表
- `error` - 错误信息

### 前端组件

#### Card.vue
卡牌组件，显示单张卡牌

#### Lobby.vue
游戏大厅，显示房间列表和创建房间功能

#### GameRoom.vue
游戏房间，显示游戏界面和玩家操作

