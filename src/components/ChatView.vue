<template>
  <div id="app">
    <div class="container">
      <FriendsList @select-friend="handleSelectFriend" :userId="userId" />
      <Chat :friend="selectedFriend" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import FriendsList from '../components/FriendsList.vue'
import Chat from '../components/Chat.vue'
import { ref } from 'vue'
import { useRoute } from 'vue-router';

interface Friend {
  userId: number
  name: string
  avatar: string
  unRead: number
}

const route = useRoute()
var userId = Number(route.query.userId)


const selectedFriend = ref<Friend | null>(null)
function handleSelectFriend(friend: Friend) {
  selectedFriend.value = friend
}
</script>

<style scoped>
.container {
  display: flex;
  height: 700px;
  width: 1200px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 20px;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
}
</style>
