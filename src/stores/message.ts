import { ElMessage } from 'element-plus';
import { defineStore } from 'pinia';
import { e } from 'unocss';


interface Message {
  id: number;
  fromUserName: string;
  fromUserAvatar: string;
  fromUserId: number;
  toUserId: number;
  content: string;
  createTime: string;
  token: string;
  contentType: number;
  type: string;
}

interface Response {
  code: number;
  message: string;
  data: [Message];
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
      const wsUrl = 'ws://' + 'localhost:8080/api/channel/echo';
      this.websocket = new WebSocket(wsUrl);

      // WebSocket 连接打开时
      this.websocket.onopen = () => {
        console.log('WebSocket connection established.');

        //登录
        const token = localStorage.getItem('token');
        const heartbeatMessage = {
          type: 'heartbeat',
          token: token,
        };

        // 发送心跳包
        this.websocket!.send(JSON.stringify(heartbeatMessage));
      }

      // WebSocket 收到消息时
      this.websocket.onmessage = (event) => {
        console.log('WebSocket message received:', event.data);
        const resp = JSON.parse(event.data) as Response;
        if (resp.code === 200) {
          this.handleIncomingMessage(resp.data);
        } else {
          ElMessage.error(resp.message);
        }
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
    handleIncomingMessage(messageData: [Message]) {
      const messages = []
    
      if(messageData instanceof Array){
        for (const message of messageData) {
            messages.push(message)
          }
      }
      


      // 将消息添加到消息数组中
      this.messages = messages;
      this.unreadCount += 1; // 增加未读消息数

      // 触发语音提示或桌面通知
      // this.notifyUser(messageData);
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
