<template>
  <div class="friends-list">
    <el-dialog v-model="deleteDialogVishble" width="400" :before-close="handleClose" style="border-radius: 10px">
      <span style="font-size: 16px; font-weight: bold">确定删除好友吗?删除后将无法收到对方发来的消息</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteDialogVishble = false" type="primary">取消</el-button>
          <el-button type="primary" @click="deleteFriend(deleteUserId!)"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
    <ul>
      <li class="friend-item" v-for="(friend, index) in friends" :key="index"
        @contextmenu="onContextMenu($event, friend.userId)" :class="{ friendChoose: selectedFriend === friend }"
        @click="selectFriend(friend)">
        <el-badge :value="friend.unRead" class="friend-image" :show-zero="false" :max="99">
          <img :src="friend.avatar" alt=""
            style="width: 40px; height: 40px; border-radius: 10%; border: 0.1px solid #ddd" class="friend-avatar" />
        </el-badge>

        <div class="friend-info">
          <span class="friend-name"> {{ friend.name }} </span>
          <span class="friend-last-content"> {{ friend.lastContent }} </span>
        </div>

        <div class="friend-tail">
          <el-tag v-if="friend.isOnline" key="在线" type="success" effect="dark" round size="small"
            style="width: 40px">在线</el-tag>
          <el-tag v-else key="离线" type="danger" effect="dark" round size="small" style="width: 40px">离线</el-tag>
          <span class="friend-update-time"> {{ formatTime(friend.updateTime) }} </span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, ref, watch } from 'vue'
import { defineEmits } from 'vue'
import axios from '@/axios'
import { ElMessage } from 'element-plus'
import { useMessageStore } from '../stores/message'
import ContextMenu from '@imengyu/vue3-context-menu'
import { user } from '@/stores/global'

const deleteDialogVishble = ref(false)

const handleClose = () => {
  deleteDialogVishble.value = false
}

function onContextMenu(e: MouseEvent, userId: number) {
  //禁用浏览器右键菜单
  e.preventDefault()

  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,

    items: [
      {
        label: '删除好友',
        onClick: () => {
          deleteUserId.value = userId
          deleteDialogVishble.value = true
        }
      }
      // {
      //   label: "A submenu",
      //   children: [
      //     { label: "Item1" },
      //     { label: "Item2" },
      //     { label: "Item3" },
      //   ]
      // },
    ]
  })
}

const messageStore = useMessageStore()

interface Friend {
  userId: number
  name: string
  avatar: string
  unRead: number
  isOnline: boolean
  lastContent: string
  updateTime: string
}

const userId = defineModel<Number | null>('userId')

const friends = ref<Friend[]>()
const selectedFriend = ref<Friend | null>(null)
const emits = defineEmits(['select-friend'])
const deleteUserId = ref<number | null>(null)

function deleteFriend(userId: number) {
  axios
    .delete('/friend/deleteFriend', {
      params: {
        userId: userId
      }
    })
    .then((res) => {
      if (res.data.code === 200) {
        ElMessage.success('删除成功')
        deleteDialogVishble.value = false
        friends.value = friends.value?.filter((item) => item.userId !== userId)
      } else {
        ElMessage.error(res.data.msg)
      }
    })
}


//监听userId
watch(
  () => userId.value,
  (newUserId) => {
    if (newUserId !== null) {
      loadFriends()
    }
  }
)

//监听消息
watch(
  () => messageStore.messages,
  (newMessages) => {
    for (const message of newMessages) {
      if (message.type == 'chat_single') {
        var isNew = true
        for (const friend of friends.value!) {
          if (message.fromUserId == friend.userId) {
            if (message.fromUserId != selectedFriend.value?.userId) {
              friend.unRead += 1
            } else {
              messageStore.unreadCount = messageStore.unreadCount - 1
            }

            friend.updateTime = message.createTime
            if (message.contentType == 1) {
              friend.lastContent = message.content
            } else {
              friend.lastContent = '[图片]'
            }
            friend.isOnline = true
            isNew = false
            break
          }
        }
        if (isNew) {
          friends.value?.push({
            userId: message.fromUserId,
            name: message.fromUserName,
            avatar: message.fromUserAvatar,
            unRead: 1,
            lastContent: message.content,
            updateTime: message.createTime,
            isOnline: true
          })
        }
      } else if (message.type == 'online') {
        for (const friend of friends.value!) {
          if (message.fromUserId == friend.userId) {
            friend.isOnline = true
            break
          }
        }
      } else if (message.type == 'offline') {
        for (const friend of friends.value!) {
          if (message.fromUserId == friend.userId) {
            friend.isOnline = false
            break
          }
        }
      }
    }
  }
)

function formatTime(time: string) {
  const now = new Date()
  const date = new Date(time)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 600) {
    return '刚刚'
  } else if (date.getDay() == now.getDay()) {
    return (
      date.getHours() + ':' + (date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes())
    )
  } else {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${year}/${month}/${day}`
  }
}

function selectFriend(friend: Friend) {
  selectedFriend.value = friend
  emits('select-friend', friend)

  axios.get('/friend/read', {
    params: {
      userId: friend.userId
    }
  })

  //消息已读
  messageStore.unreadCount = messageStore.unreadCount - friend.unRead
  selectedFriend.value.unRead = 0
}

//加载好友列表
function loadFriends() {
  axios.get('/friend/getAll').then((res) => {
    if (res.data.code === 200) {
      friends.value = res.data.data

      var unreadCount = 0
      friends.value?.forEach((item) => {
        if (item.lastContent.startsWith('http')) {
          item.lastContent = '[图片]'
        }
        unreadCount += item.unRead
      })
      messageStore.unreadCount = unreadCount

      friends.value?.forEach((item) => {
        if (item.userId === userId.value) {
          selectFriend(item)
          return
        }
      })

      selectFriend(friends.value![0])
    } else {
      ElMessage.error(res.data.msg)
      return
    }
  })
}

onMounted(() => {
  if (user.token !== null) {
    loadFriends()
  }
})
</script>

<style scoped>
.friends-list {
  width: 320px;
  height: 100%;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 20px;
  background-color: white;
  overflow-y: auto;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 10px;
  cursor: pointer;
}

li:hover {
  background-color: #e4dede;
}

.friend-item {
  display: flex;
  font-size: 16px;
  /* align-items: center; */
}

.friend-item.hover {
  background-color: #c25617;
}

.friend-name {
  flex: 1;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: bold;
  text-align: left;
}

.friend-last-content {
  flex: 1;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  color: #999;
}

.friend-info {
  width: 110px;
  display: flex;
  flex-direction: column;
  margin-left: 10px;
  justify-content: center;
}

.friend-tail {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
}

.friend-update-time {
  font-size: 12px;
  color: #999;
  margin-right: 5px;
}

.friend-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.friendChoose {
  background-color: #e4dede;
}
</style>
