<template>
  <!-- <img src="./assets/logo.png">
      <router-view/> -->
  <AuthDialog v-model:isLoginDialogVisible="isLogin" />

  <el-backtop :right="100" :bottom="100" />
  <div class="my-header">
    <div class="header-content">
      <img src="../assets/image/sy_logo.png" style="width: 80px; height: 80px" alt="logo" />
      <el-menu
        style="width: 100%"
        :default-active="activeIndex2"
        class="el-menu-demo"
        mode="horizontal"
        @select="handleSelect"
      >
        <el-menu-item index="1">广场</el-menu-item>
      </el-menu>
      <div class="info-content">
        <!-- <div class="search bar7">
          <form class="example" action="/" style="margin: auto; max-width: 300px">
            <input type="text" placeholder="搜索.." name="search2" />
            <button type="submit"><i class="fa fa-search"></i></button>
          </form>
        </div> -->

        <div v-if="user.token != null" class="personal-info">
          <img
            :src="user.headImage || '../assets/image/default_avatar.png'"
            class="avatar"
            width="24"
            style="width: 40px; max-height: 40px"
            alt="头像"
            @mouseenter="showActions"
            @mouseleave="scheduleHideMenu"
          />
          <span class="username" @mouseenter="showActions" @mouseleave="scheduleHideMenu">{{
            user.accountName
          }}</span>

          <ul
            v-if="actionsVisible"
            class="action-list"
            @mouseenter="cancelHideMenu"
            @mouseleave="scheduleHideMenu"
          >
            <li @click="goto('/person')">个人主页</li>
            <li @click="goto('/editUserInfo')">修改信息</li>
            <li @click="logout">退出登录</li>
          </ul>
        </div>

        <div v-else class="login-click">
          <span @click="onLoginClick">立即登录</span>
        </div>
      </div>
    </div>
    <router-view></router-view>
    <Footer></Footer>
  </div>

</template>

<script setup lang="ts">
import { ref } from 'vue'
import { user } from '../stores/global'
import { isLogin } from '../stores/global'
import AuthDialog from '../components/AuthDialog.vue'
import { useRouter } from 'vue-router'
import Footer from '../components/Footer.vue';

var hideMenuTimeout: number | null | undefined

function showActions() {
  actionsVisible.value = true
  if (hideMenuTimeout) {
    clearTimeout(hideMenuTimeout) // 清除隐藏菜单的定时器
    hideMenuTimeout = null
  }
}

function scheduleHideMenu() {
  // 设置一个短暂的延时，以避免菜单立即消失
  hideMenuTimeout = setTimeout(() => {
    actionsVisible.value = false
  }, 300) // 300 毫秒的延时，可以根据需要调整
}

function cancelHideMenu() {
  if (hideMenuTimeout) {
    clearTimeout(hideMenuTimeout) // 鼠标进入菜单时取消隐藏
    hideMenuTimeout = null
  }
}

const actionsVisible = ref(false)

function onLoginClick() {
  isLogin.value = true
  actionsVisible.value = false
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('accountName')
  localStorage.removeItem('headImage')
  user.headImage = null
  user.accountName = null
  user.token = null
}

function goto(path: string) {
  $router.push({ path: path })
}

const activeIndex2 = ref('1')
const $router = useRouter()
const handleSelect = (key: string, keyPath: string[]) => {
  if (key === '1') {
    $router.push({ path: '/' })
  }
}
</script>

<style>
@import '../assets/base.css';
body {
  margin: 0;
  padding: 0;
  background-color: #f3f3f3;
}

.my-header {
  background-color: white;
  height: 80px;
}

.avatar-frame {
  width: 60px;
  /* 设置宽度 */
  height: 60px;
  /* 设置高度 */
  border-radius: 50%;
  /* 设置为圆形 */
  overflow: hidden;
  /* 隐藏超出边框的内容 */
  display: flex;
  /* 使用Flexbox布局 */
  justify-content: center;
  /* 水平居中 */
  align-items: end;
  /* 垂直底部对齐 */
}

.avatar-frame img {
  width: 100%;
  /* 使图片填充整个框架 */
  height: auto;
  /* 保持图片的纵横比 */
}

.cell {
  padding: 10px;
  font-size: 14px;
  line-height: 150%;
  text-align: left;
  border-bottom: 1px solid var(--box-border-color);
  word-break: break-word;
}

table {
  display: flex;
  border-collapse: separate;
  box-sizing: border-box;
  text-indent: initial;
  unicode-bidi: isolate;
  border-spacing: 2px;
  border-color: gray;
  margin-top: 30px;
}

.fr {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.mind_operation_row {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.mind_operation_col {
  display: flex;
  align-items: center;
}

.mind_operation_text {
  margin-left: 10px;
}

.my-content {
  margin-left: auto;
  margin-right: auto;
  margin-bottom: auto;
  width: 1300px;
  /* height: auto; */
  display: flex;
}

.main-content {
  margin: 20px 20px auto 20px;
  padding: 20px;
  width: 70%;
  background-color: white;
}

.right-content {
  padding: 20px;
  margin: 20px 20px auto 20px;
  width: 25%;
  background-color: white;
  display: flex;
  flex-direction: column;
}

.header-content {
  display: flex;
  margin-left: auto;
  margin-right: auto;
  width: 1200px;
  height: 100%;
  align-items: center;
}

.info-content {
  display: flex;
  align-items: center;
  margin-left: auto;
  /* position: relative; */
}

form.example {
  display: flex;
  align-items: center;
}

form.example input[type='text'] {
  /* padding: 10px; */
  font-size: 17px;
  border: 1px solid grey;
  height: 30px;
  /* float: left; */
  /* width: 80%; */
  background: #f1f1f1;
}

form.example button {
  float: left;
  width: 35px;
  height: 35px;
  /* padding: 10px; */
  background: #f5cb2b;
  color: white;
  font-size: 17px;
  border: 1px solid grey;
  border-left: none;
  cursor: pointer;
}

form.example button:hover {
  background: hwb(69 4% 15%);
}

form.example::content {
  content: '\f002';
  clear: both;
  display: table;
}

.navigation {
  line-height: 30px;
}

.navigation-item {
  margin-left: 20px;
  text-decoration: none;
}

.username {
  margin-left: 10px;
  font-size: 16px;
  cursor: pointer;
}

.avatar {
  margin-left: 10px;
}

.action-list {
  list-style-type: none;
  /* 移除默认的列表样式 */
  padding-left: 0;
  /* 移除左侧填充 */
  width: 120px;
  list-style-type: none;
  position: absolute;
  top: 50px;
  right: 0;
  background-color: #fff;
  border: 1px solid #ccc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  /* display: none; */
}

.action-list li {
  /* padding: 8px 16px; */
  text-align: center;
  cursor: pointer;
  padding-top: 5px;
  padding-bottom: 5px;
}

.action-list li:hover {
  background-color: #f1f1f1;
}

.personal-info {
  display: flex;
  align-items: center;
  justify-content: right;
  width: 200px;
  position: relative;
}

.el-menu-demo {
  width: 100px;
}

.login-click {
  display: flex;
  justify-content: right;
  cursor: pointer;
  font-size: 16px;
  width: 100px;
}
</style>
