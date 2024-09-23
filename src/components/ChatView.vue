<template>
  <div id="app">
    <div class="container">
      <FriendsList @select-friend="handleSelectFriend" v-model:userId="userId" />
      <Chat :friend="selectedFriend" />
      <img src="../assets/svg/x.svg" alt="关闭"
        style="width: 40px; height: 40px; right: 0px;  position: relative; cursor: pointer; " @click="handleClose">
    </div>
  </div>
</template>

<script lang="ts" setup>
import FriendsList from '../components/FriendsList.vue'
import Chat from '../components/Chat.vue'
import { ref } from 'vue'
import { useMessageStore } from '../stores/message'
const messageStore = useMessageStore()

interface Friend {
  userId: number
  name: string
  avatar: string
  unRead: number
}

// const route = useRoute()
// var userId = Number(route.query.userId)
const userId = defineModel<Number | null>('userId')

const selectedFriend = ref<Friend | null>(null)
function handleSelectFriend(friend: Friend) {
  selectedFriend.value = friend
}


function handleClose() {
  messageStore.chatVisible = false
}
</script>

<style scoped>
.container {
  border-left: 0.5px solid #c7d3d0;
  /* border-radius: 10px; */
  display: flex;
  height: 700px;
  width: 1200px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  /* margin-top: 20px; */
  z-index: 2;
  position: fixed;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
}
</style>
