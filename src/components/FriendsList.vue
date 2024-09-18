<template>
  <div class="friends-list">
    <ul>
      <li class="friend-item" v-for="(friend, index) in friends" :key="index"
        :class="{ active: selectedFriend === friend }" @click="selectFriend(friend)">
        <el-badge :value="friend.unRead" class="item" :show-zero="false" :max="99">
          <img :src="friend.avatar" alt=""
            style="width: 40px; height: 40px; border-radius: 10%; border: 0.1px solid #ddd" class="friend-avatar" />
        </el-badge>
        <span class="friend-name"> {{ friend.name }} </span>
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
      var isNew = true;
      for (const friend of friends.value!) {
        if (message.fromUserId == friend.userId) {
          friend.unRead += 1
          isNew = false;
        }
      }
      if (isNew) {
        friends.value?.push({ userId: message.fromUserId, name: message.fromUserName, avatar: message.fromUserAvatar, unRead: 1 })
      }
    }
  }
)


function selectFriend(friend: Friend) {
  selectedFriend.value = friend
  emits('select-friend', friend)
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

.friend-item.active {
  /* 下划线 */
  text-decoration: underline;
  color: #f5cb2b;
  font-size: 17px;
}

.friend-item {
  display: flex;
  align-items: center;
}

.friend-avatar {
  /* margin-right: 10px; */
}

/* .item {
  margin-top: 10px;
  margin-right: 30px;
} */

.friend-name {
  margin-left: 20px;
  font-weight: bold;
}
</style>
