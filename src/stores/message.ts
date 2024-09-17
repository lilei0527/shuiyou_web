import { defineStore } from 'pinia';

interface Message{
    fromUserName: string;
    fromUserAvatar: string;
    fromUserId: number;
    toUserId: number;
    content: string;
    createTime: string;
}

export const useMessageStore = defineStore('message', {
  state: () => ({
    websocket: null as WebSocket | null,
    messages: [] as Message[], // 存储所有收到的消息
    unreadCount: 0, // 未读消息数
  }),
  actions: {
    // 初始化 WebSocket 连接
    initWebSocket() {
      const wsUrl = 'wss://your-server-websocket-url';
      this.websocket = new WebSocket(wsUrl);

      // WebSocket 连接打开时
      this.websocket.onopen = () => {
        console.log('WebSocket connection established.');
      };

      // WebSocket 收到消息时
      this.websocket.onmessage = (event) => {
        const messageData = JSON.parse(event.data);
        this.handleIncomingMessage(messageData);
      };

      // WebSocket 连接关闭时
      this.websocket.onclose = () => {
        console.log('WebSocket connection closed. Reconnecting...');
        setTimeout(() => this.initWebSocket(), 1000); // 自动重连
      };

      // WebSocket 连接错误时
      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    },

    // 处理收到的消息
    handleIncomingMessage(messageData: Message) {
      // 将消息添加到消息数组中
      this.messages.push(messageData);
      this.unreadCount += 1; // 增加未读消息数

      // 触发语音提示或桌面通知
      this.notifyUser(messageData);
    },

    // 重置未读消息数
    resetUnreadCount() {
      this.unreadCount = 0;
    },

    // 播放通知音效或者浏览器通知
    notifyUser(messageData: Message) {
      const audio = new Audio('notification.mp3');
      audio.play();

      if (Notification.permission === "granted") {
        new Notification(`新消息: ${messageData.fromUserName}`, {
          body: messageData.content,
        });
      }
    }
  },
});
