<template>
  <div class="chat-container">
    <div class="chat-body">
      <div v-for="message in messages" :key="message.id">

        <div v-if="message.fromUserId === friend!.userId" class="message received">
          <img :src="friend!.avatar" alt="" style="width: 40px; height: 40px; border-radius: 10%; margin-right: 10px" />
          <div class="message-content">{{ message.content }}</div>
        </div>

        <div v-else class="message sent">
          <div class="message-content">{{ message.content }}</div>
          <img :src="user.headImage!" alt=""
            style="width: 40px; height: 40px; border-radius: 10%; margin-right: 10px" />
        </div>
      </div>

      <!-- <div class="message received">
        <div class="avatar">A</div>
        <div class="message-content">你好！这是一条消息。</div>
      </div>
      <div class="message sent">
        <div class="message-content">你好！这是另一条消息。</div>
        <div class="avatar">B</div>
      </div> -->
    </div>
    <div class="chat-footer">
      <!-- <input type="textarea" placeholder="输入消息..." /> -->
      <textarea placeholder="请输入内容..." v-model="content"></textarea>
      <button class="send-btn" style="height: 40px" @click="sendMessage()">发送</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import axios from '@/axios'
import { ElMessage } from 'element-plus'
import { user } from '../stores/global'
import { useMessageStore } from '../stores/message'


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

interface Friend {
  userId: number
  name: string
  avatar: string
  unRead: number
}

const props = defineProps<{
  friend: Friend | null
}>()
const friend = ref(props.friend)

const messages = ref<Message[]>([])
const content = ref('')

// 监听 props 变化，以便每次打开弹窗时更新输入框内容
watch(
  () => props.friend,
  (newFriend) => {
    if (newFriend != null) {
      friend.value = newFriend
      loadHistoryMessages()
    }
  }
)

const messageStore = useMessageStore()
//监听消息
watch(
  () => messageStore.messages,
  (newMessages) => {
    for (const message of newMessages) {
      if (message.fromUserId == friend.value?.userId) {
        messages.value.push(message)
      }
    }
  }
)

var pageNum = 1
var pageSize = 10

//加载历史消息
function loadHistoryMessages() {
  if (friend.value == null) {
    // 只需检查是否为 null 或 undefined
    return
  }
  axios
    .get('/message/chatWith', {
      params: {
        userId: friend.value.userId,
        pageNum: pageNum,
        pageSize: pageSize
      }
    })
    .then((res) => {
      if (res.data.code === 200) {
        messages.value = res.data.data.records
      } else {
        ElMessage.error(res.data.message)
      }
    })
}



//发送消息
function sendMessage() {
  if (friend.value == null) {
    // 只需检查是否为 null 或 undefined
    return
  }

  if (content.value.trim() === '') {
    ElMessage.error('消息不能为空')
    return
  }

  const message = {
    toUserId: friend.value.userId,
    content: content.value,
    contentType: 1,
    token: user.token!,
    type: 'chat_single'
  }

  const messageStore = useMessageStore();
  messageStore.websocket?.send(JSON.stringify(message))

  //添加到本地消息列表
  const newMessage = {
    id: 0,
    fromUserId: parseInt(user.userId!),
    toUserId: friend.value.userId,
    content: content.value,
    contentType: 1,
    createTime: new Date().toLocaleString(),
  }
  messages.value.push(newMessage)
  content.value = ''

}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 1200px;
  border: 1px solid #ddd;
  border-radius: 10px;
  overflow: hidden;
}

.chat-header {
  background: #007bff;
  color: #fff;
  padding: 10px;
  text-align: center;
}

.chat-body {
  flex: 1;
  padding: 20px 10px 10px 10px;
  overflow-y: auto;
  background: white;
}

.message {
  display: flex;
  margin-bottom: 10px;
  align-items: flex-start;
}

.message.sent {
  justify-content: flex-end;
}

.message.received .message-content {
  background: #e1ffc7;
}

.message.sent .message-content {
  background: #007bff;
  color: #fff;
}

.message-content {
  padding: 10px;
  border-radius: 10px;
  max-width: 70%;
}

.message img {
  margin: 0 10px 0 10px;
}

.avatar {
  width: 40px;
  height: 40px;
  background: #ccc;
  color: #fff;
  border-radius: 10%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 10px;
}

.chat-footer {
  height: 120px;
  display: flex;
  padding: 10px;
  background: #fff;
  border-top: 1px solid #ddd;
  align-items: center;
}

.chat-footer textarea {
  height: 100px;
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  overflow: auto;
}

.chat-footer button {
  background: #007bff;
  color: #fff;
  border: none;
  padding: 10px;
  border-radius: 5px;
  margin-left: 10px;
  cursor: pointer;
}

.send-btn {}
</style>
