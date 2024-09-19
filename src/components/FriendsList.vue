<template>
  <div class="friends-list">
    <ul>
      <li class="friend-item" v-for="(friend, index) in friends" :key="index"
        :class="{ friendChoose: selectedFriend === friend }" @click="selectFriend(friend)">

        <el-badge :value="friend.unRead" class="friend-image" :show-zero="false" :max="99">
          <img :src="friend.avatar" alt=""
            style="width: 40px; height: 40px; border-radius: 10%; border: 0.1px solid #ddd" class="friend-avatar" />
        </el-badge>


        <div class="friend-info">
          <span class="friend-name"> {{ friend.name }} </span>
          <span class="friend-last-content"> {{ friend.lastContent }} </span>
        </div>

        <div class="friend-tail">
          <el-tag v-if="friend.isOnline" key="在线" type="success" effect="dark" round size="small">在线</el-tag>
          <el-tag v-else key="离线" type="danger" effect="dark" round size="small">离线</el-tag>
          <span class="friend-update-time"> {{ formatTime(friend.updateTime) }} </span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { defineEmits } from 'vue'
import axios from '@/axios'
import { ElMessage } from 'element-plus'
import { useMessageStore } from '../stores/message'

interface Friend {
  userId: number
  name: string
  avatar: string
  unRead: number
  isOnline: boolean
  lastContent: string
  updateTime: string
}

const props = defineProps<{ userId: number }>()

const friends = ref<Friend[]>()
const selectedFriend = ref<Friend | null>(null)
const emits = defineEmits(['select-friend'])
const messageStore = useMessageStore()

//监听消息
watch(
  () => messageStore.messages,
  (newMessages) => {
    for (const message of newMessages) {
      var isNew = true
      for (const friend of friends.value!) {
        if (message.fromUserId == friend.userId) {
          if (message.fromUserId != selectedFriend.value?.userId) {
            friend.unRead += 1
          }
          friend.updateTime = message.createTime
          friend.lastContent = message.content
          friend.isOnline = true
          isNew = false
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
    }
  }
)

function formatTime(time: string) {
  const now = new Date();
  const date = new Date(time);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 600) {
    return '刚刚';
  } else if (diff < 86400) {
    return date.getHours() + ':' + date.getMinutes();
  } else {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}/${month}/${day}日`;
  }
}



function selectFriend(friend: Friend) {
  selectedFriend.value = friend
  emits('select-friend', friend)

  //消息已读
  axios.get('/friend/read', {
    params: {
      userId: friend.userId
    }
  })

  //清空未读消息
  friend.unRead = 0
}

//加载好友列表
function loadFriends() {
  axios.get('/friend/getAll').then((res) => {
    if (res.data.code === 200) {
      friends.value = res.data.data

      friends.value?.forEach((item) => {
        if (item.userId === props.userId) {
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
  loadFriends()
})
</script>

<style scoped>
.friends-list {
  width: 320px;
  height: 100%;
  border-right: 1px solid #ddd;
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
  display: flex;
  width: 100px;
  font-size: 14px;
  white-space: nowrap;
  overflow: ellipsis;
  text-overflow: ellipsis;
  font-weight: bold;
  align-items: flex-start;
}

.friend-last-content {
  display: flex;
  width: 100px;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  align-items: flex-start;
  color: #999;
}

.friend-info {
  /* width: 200px; */
  display: flex;
  flex-direction: column;
  margin-left: 10px;
}

.friend-update-time {
  font-size: 12px;
  color: #999;
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
