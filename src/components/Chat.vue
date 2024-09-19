<template>
  <div class="chat-container">
    <div class="chat-body" ref="chatList" @scroll="handleScroll">
      <div v-for="(message, index) in messages" :key="message.id">
        <span v-if="index == 0 || !isFiveMinutesApart(messages[index - 1].createTime, message.createTime)"
          class="message-time">{{
            message.createTime }}</span>

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
    </div>
    <div class="chat-footer">
      <textarea placeholder="请输入内容..." v-model="content"></textarea>
      <button class="send-btn" style="height: 40px" @click="sendMessage()">发送</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, ref, watch } from 'vue'
import axios from '@/axios'
import { ElMessage } from 'element-plus'
import { user } from '../stores/global'
import { useMessageStore } from '../stores/message'
import { pa } from 'element-plus/es/locales.mjs'
import moment from 'moment'

interface Message {
  id: number
  fromUserName: string
  fromUserAvatar: string
  fromUserId: number
  toUserId: number
  content: string
  createTime: string
  token: string
  contentType: number
  type: string
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
var pageNum = 1
var pageSize = 10
const messages = ref<Message[]>([])
const content = ref('')
const chatList = ref<HTMLElement | null>(null)
var isNearBottom = true // 判断是否接近底部的标志
const loading = ref(false) // 防止重复加载的标志
const hasMoreMessages = ref(true) // 判断是否还有更多历史消息

// 监听 props 变化，以便每次打开弹窗时更新输入框内容
watch(
  () => props.friend,
  (newFriend) => {
    if (newFriend != null) {
      friend.value = newFriend
      reset()
      loadMoreMessages()
    }
  }
)

function reset() {
  pageNum = 1
  pageSize = 10
  messages.value = []
  hasMoreMessages.value = true
  loading.value = false
  content.value = ''
  isNearBottom = true
}

const messageStore = useMessageStore()
//监听消息
watch(
  () => messageStore.messages,
  (newMessages) => {
    for (const message of newMessages) {
      if (message.fromUserId == friend.value?.userId) {
        messages.value.push(message)

        //消息已读
        axios.get('/friend/read', {
          params: {
            userId: friend.value.userId,
          }
        })

        if (isNearBottom) {
          nextTick(() => {
            scrollToBottom()
          })
        }
      }
    }
  }
)

const scrollToBottom = () => {
  if (chatList.value) {
    chatList.value.scrollTop = chatList.value.scrollHeight
  }
}

// 处理滚动事件，判断是否接近底部
const handleScroll = () => {
  const chatElement = chatList.value
  if (chatElement) {
    const { scrollTop, scrollHeight, clientHeight } = chatElement

    // 如果滚动条接近底部，设置 isNearBottom 为 true
    isNearBottom = scrollTop + clientHeight >= scrollHeight - 200
    if (chatElement.scrollTop === 0 && hasMoreMessages.value && !loading.value) {
      loadMoreMessages();
    }
  } else {
    // 处理 chatElement 为 null 的情况
    console.warn('chatList.value is null')
  }
}

//两个时间是否在5分钟内
function isFiveMinutesApart(time1: string, time2: string) {
  // 将时间字符串转换为 Date 对象
  const date1 = moment(time1, 'YYYY-MM-DD HH:mm:ss');
  const date2 = moment(time2, 'YYYY-MM-DD HH:mm:ss');
  // 计算两个 Date 对象之间的时间差（以毫秒为单位）
  const diff = Math.abs(date1.valueOf() - date2.valueOf());
  // 将时间差转换为分钟
  const minutesDiff = diff / (1000 * 60);
  // 判断时间差是否等于5分钟
  return minutesDiff <= 5;
}



//加载历史消息
function loadMoreMessages() {
  if (friend.value == null) {
    // 只需检查是否为 null 或 undefined
    return
  }

  if (loading.value || !hasMoreMessages.value) return // 防止重复加载
  loading.value = true

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
        const newMessages = res.data.data.records
        //反转
        newMessages.reverse()

        if (newMessages.length > 0) {
          pageNum = pageNum + 1
          const previousHeight = chatList.value!.scrollHeight
          messages.value = [...newMessages, ...messages.value] // 插入新消息

          // 保留用户当前的滚动位置
          nextTick(() => {
            const newHeight = chatList.value!.scrollHeight
            chatList.value!.scrollTop = newHeight - previousHeight
          })
        } else {
          // 如果没有更多消息，设置标志为 false
          hasMoreMessages.value = false
        }

        loading.value = false
        // nextTick(() => {
        //   scrollToBottom()
        // })
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

  const messageStore = useMessageStore()
  messageStore.websocket?.send(JSON.stringify(message))

  //添加到本地消息列表
  const newMessage = {
    id: 0,
    fromUserName: user.accountName!,
    fromUserAvatar: user.headImage!,
    fromUserId: parseInt(user.userId!),
    toUserId: friend.value.userId,
    content: content.value,
    contentType: 1,
    createTime: new Date().toLocaleString(),
    type: 'chat_single',
    token: user.token!
  }
  messages.value.push(newMessage)
  content.value = ''

  // 在下一个 DOM 更新后滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
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

.message-time {
  font-size: 12px;
  color: #999;
}
</style>
