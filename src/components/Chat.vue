<template>
  <div class="chat-container">
    <div class="chat-body" ref="chatList" @scroll="handleScroll">
      <div v-for="(message, index) in messages" :key="message.id">
        <span
          v-if="
            index == 0 || !isFiveMinutesApart(messages[index - 1].createTime, message.createTime)
          "
          class="message-time"
          >{{ message.createTime }}</span
        >

        <div v-if="message.fromUserId === friend!.userId" class="message received">
          <img
            :src="friend!.avatar"
            alt=""
            style="width: 40px; height: 40px; border-radius: 10%; margin-right: 10px"
          />
          
          <div v-if="message.contentType === 1" class="message-content">{{ message.content }}</div>
          <div v-else-if="message.contentType === 2" class="message-content-img">
            <img :src="message.content" alt="" style="width: 100px; height: auto" />
          </div>
        </div>

        <div v-else class="message sent">
            <div v-if="message.contentType === 1" class="message-content">{{ message.content }}</div>
          <div v-else-if="message.contentType === 2" class="message-content-img">
            <img :src="message.content" alt="" style="width: 100px; height: auto" />
          </div>
          <img
            :src="user.headImage!"
            alt=""
            style="width: 40px; height: 40px; border-radius: 10%; margin-right: 10px"
          />
        </div>

      </div>
    </div>
    <div class="chat-footer">
        <div class="toolbar">
        <!-- 图片上传按钮 -->
        <button @click="triggerFileInput" class="photo-btn">
          <img src="../assets/svg/photo.svg" alt="上传图片" style="width: 20px; height: 20px;" />
        </button>
        <!-- 隐藏的文件选择器 -->
        <input type="file" ref="fileInput" style="display: none" @change="handleImageUpload" />
      </div>
      <textarea class="input-area" placeholder="请输入内容..." v-model="content"></textarea>
      <div class="send-btn-container">
        <button class="send-btn" style="height: 40px" @click="sendMessage(content,1)">发送</button>
      </div>
      
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, ref, watch } from 'vue'
import axios from '@/axios'
import { ElMessage } from 'element-plus'
import { user } from '../stores/global'
import { useMessageStore } from '../stores/message'
import moment from 'moment'
import rawAxios from 'axios'
import Compressor from 'compressorjs'

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
    const fileInput = ref<HTMLInputElement | null>(null);


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
      if (message.type === 'chat_single') {
        if (message.fromUserId == friend.value?.userId) {
          message.createTime = formatTimestamp(message.createTime)
          messages.value.push(message)

          //消息已读
          axios.get('/friend/read', {
            params: {
              userId: friend.value.userId
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
  }
)

const triggerFileInput = () => {
  fileInput.value?.click();
};

// 处理图片上传
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    console.log('Selected image:', file);
    uploadImage(file);

    // 重置文件输入框
    target.value = '';
  }
};

var uploadUrl = import.meta.env.VITE_IMAGE_URL + '/file/upload'
function uploadImage(file: File) {
        var compressFile
        new Promise((resolve, reject) => {
          // 使用 Compressor.js 进行图片压缩
          new Compressor(file, {
            quality: 0.6, // 压缩质量 0-1，1 是不压缩
            success(result) {
              // console.log('原文件大小：', file.size)
              // console.log('压缩后文件大小：', result.size)
              // 返回压缩后的文件进行上传
              if (result.size > 1 * 1024 * 1024) {
                ElMessage.error('图片过大，请压缩或者裁剪后再上传！')
                return reject()
              }
              resolve(result)
              compressFile = result
              const formData = new FormData()
              formData.append('file', compressFile)
              rawAxios
                .post(uploadUrl, formData, {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: localStorage.getItem('token')
                  }
                })
                .then((res) => {
                  const response = res.data
                  if (response.code === 200) {
                    // 从返回的数据中获取图片 URL
                    const url = response.data
                    sendMessage(url,2)
                  } else {
                    console.error('图片上传失败：', response.message)
                  }
                })
                .catch((error) => {
                  console.error('图片上传失败：', error)
                })
            },
            error(err) {
              ElMessage.error('图片压缩失败')
              reject(err)
            }
          })
        })
      }

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

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
      loadMoreMessages()
    }
  } else {
    // 处理 chatElement 为 null 的情况
    console.warn('chatList.value is null')
  }
}

//两个时间是否在5分钟内
function isFiveMinutesApart(time1: string, time2: string) {
  // 将时间字符串转换为 Date 对象
  const date1 = moment(time1, 'YYYY-MM-DD HH:mm:ss')
  const date2 = moment(time2, 'YYYY-MM-DD HH:mm:ss')
  // 计算两个 Date 对象之间的时间差（以毫秒为单位）
  const diff = Math.abs(date1.valueOf() - date2.valueOf())
  // 将时间差转换为分钟
  const minutesDiff = diff / (1000 * 60)
  // 判断时间差是否等于5分钟
  return minutesDiff <= 5
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
function sendMessage(sendContent:string,contentType:number) {
  if (friend.value == null) {
    // 只需检查是否为 null 或 undefined
    return
  }

  if (sendContent.trim() === '') {
    ElMessage.error('消息不能为空')
    return
  }

  const message = {
    toUserId: friend.value.userId,
    content: sendContent,
    contentType: contentType,
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
    content: sendContent,
    contentType: contentType,
    createTime: new Date().toLocaleString(),
    type: 'chat_single',
    token: user.token!
  }
  messages.value.push(newMessage)
  if(contentType===1){
    content.value = ''
  }

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
  flex-direction: column;
  height: 150px;
  display: flex;
  padding: 10px;
  background: #fff;
  border-top: 1px solid #ddd;
  /* align-items: center; */
  
}

.toolbar {
  display: flex;
  justify-content: flex-start;
}

.chat-footer textarea {
  height: 100px;
  flex: 1;
  padding: 10px;
  border: none;
  resize: none;
  outline: none;
  font-size: 16px;
  overflow: auto;
}

.chat-footer button {
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

.photo-btn{
    background: white;
}

.send-btn{
    width: 50px;
    background: #007bff;
}
.send-btn-container{
    display: flex;
    justify-content: flex-end;
}
</style>
