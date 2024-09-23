<script setup lang="ts">
import { defineProps, onMounted } from 'vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Delete, Edit } from '@element-plus/icons-vue'
import axios from '@/axios'
import { ElMessage } from 'element-plus'
import 'viewerjs/dist/viewer.css'
import Viewer from 'viewerjs'
import { useMessageStore } from '../stores/message'
import AuthDialog from '../components/AuthDialog.vue'
const messageStore = useMessageStore()

interface Mind {
  id: number
  userId: number
  accountName: string
  content: string
  images: string
  createTime: string
  commentNum: number
  userHeadImage: string
  isDeleted: number
}
const props = defineProps<{
  //子组件接收父组件传递过来的值
  mind: Mind
  canEdit: boolean
}>()
var mind: Mind = props.mind
const myMindList = defineModel<Array<Mind>>('myMindList')
  const showLoginDialog = ref(false)

var $router = useRouter()
function jumpToComment() {
  $router.push({
    name: 'comment',
    query: {
      id: mind.id
    }
  })
  //滚动到最顶部
  window.scrollTo(0, 0)
}

function deleteMind() {
  axios
    .delete('/mind', {
      params: {
        id: mind.id
      }
    })
    .then((res) => {
      if (res.data.code === 200) {
        ElMessage.success('删除成功')
        if (myMindList.value) {
          for (var i = 0; i < myMindList.value.length; i++) {
            if (myMindList.value[i].id == mind.id) {
              myMindList.value.splice(i, 1)
              break
            }
          }
        }
      } else {
        ElMessage.error('删除失败')
      }
    })
}

// 图片加载的 Promise 逻辑
const waitForImagesToLoad = () => {
  const images = document.querySelectorAll('.mind_row img')
  return Promise.all(
    Array.from(images).map((img) => {
      const imageElement = img as HTMLImageElement // 类型断言
      return new Promise((resolve) => {
        if (imageElement.complete) {
          resolve(true)
        } else {
          imageElement.onload = () => resolve(true)
          imageElement.onerror = () => resolve(true) // 即使图片加载失败也继续执行
        }
      })
    })
  )
}

// 初始化图片查看器
const initViewer = () => {
  const gallery = document.querySelector('.mind_row') as HTMLElement // 选择富文本容器
  if (gallery) {
    new Viewer(gallery, {
      toolbar: true, // 是否显示工具栏
      scalable: true, // 支持缩放
      movable: true, // 支持拖动
      zoomable: true // 支持放大
    })
  }
}

//添加最大宽度限制
const addMaxWidth = () => {
  const images = document.querySelectorAll('.mind_row img')
  Array.from(images).map((img) => {
    const imageElement = img as HTMLImageElement // 类型断言
    if (imageElement) {
      imageElement.style.maxWidth = '250px'
      imageElement.style.height = 'auto'
    }
  })
}

onMounted(() => {
  // 图片加载完毕后初始化图片查看器
  waitForImagesToLoad().then(() => {
    initViewer()
    addMaxWidth()
  })
})

function goto(path: string) {
  $router.push({ path: path })
}
const centerDialogVisible = ref(false)

//
function openChat(userId: number) {
  centerDialogVisible.value = false
  //扣除对应积分

  //打开聊天窗口
  messageStore.chatUserId = userId
  messageStore.chatVisible = true
}

//点击私聊
function onChat(){
  //判断是否已登录
  const token = localStorage.getItem('token')
  if (token == null) {
    showLoginDialog.value = true
    return
  }
  centerDialogVisible.value = true
}
</script>

<template>
  <AuthDialog v-model:isLoginDialogVisible="showLoginDialog" />

  <el-dialog v-model="centerDialogVisible" title="" width="500" center class="spend-points-dialog">
    <span class="spend-points-dialog-content">
      将花费10积分，是否确定私聊？
    </span>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="centerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="openChat(mind.userId)">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>

  <table cellpadding="0" cellspacing="0" width="100%">
    <tr class="mind_row">
      <!-- 头像 -->
      <td width="24" valign="top">
        <img
          :src="mind.userHeadImage"
          class="avatar"
          width="24"
          style="width: 40px; height: 40px"
          alt="zj9495"
        />
      </td>
      <td width="100%" valign="top" class="mind_content_col">
        <div class="fr">
          <strong class="account-name">{{ mind.accountName }}</strong>
          <span class="mind_content_tail">
            <span class="fade small time">{{ mind.createTime }}</span>
            <el-tag type="warning" class="comment-num">{{ mind.commentNum }}</el-tag>
            <el-button type="success" plain @click="onChat">私聊</el-button>
            <el-popconfirm
              v-if="props.canEdit"
              title="确定要删除该项吗？"
              confirmButtonText="确定"
              cancelButtonText="取消"
              icon="el-icon-warning"
              iconColor="red"
              @confirm="deleteMind"
            >
              <!-- 删除按钮，点击触发弹窗 -->
              <template v-slot:reference>
                <el-button class="delete-btn" type="danger" :icon="Delete" circle size="small" />
              </template>
            </el-popconfirm>

            <el-button
              v-if="props.canEdit"
              type="info"
              :icon="Edit"
              circle
              size="small"
              @click="$router.push({ name: 'create_mind', query: { mindId: mind.id } })"
            />
          </span>
        </div>
        <div v-html="mind.content" class="mind_content" @click="jumpToComment"></div>
        <!-- <div class="mind_content">
          <span @click="jumpToComment">{{ mind.content }} </span>
        </div> -->
        <!-- <tr class="mind_images_row">
      <td class="mind_images" v-for="(item, index) in imageList" :key="index">
        <div class="demo-image__preview">
          <el-image style="width: 100px; height: 100px" :src="item" :preview-src-list="imageList"
            :initial-index="index">
          </el-image>
        </div>
      </td>
    </tr> -->
      </td>
    </tr>
  </table>
</template>

<style scoped lang="scss">
.fade {
  color: #999;
}

.small {
  font-size: 12px;
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
  margin-bottom: 30px;
}

.mind_images_row {
  display: flex;
  margin-top: 10px;
}

.mind_images {
  margin-right: 10px;
}

.fr {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.time {
  display: flex;
  float: right;
  margin-right: 20px;
}

.mind_row {
  width: 100%;
}

.mind_content_col {
  padding-left: 20px;
  cursor: pointer;
}

.mind_content_col img {
  max-width: 250px !important; /* 限制图片的最大宽度为容器的宽度 */
  height: auto !important; /* 自动调整高度以保持宽高比 */
}

.mind_content :hover {
  color: #f5cb2b;
}

.mind_content_tail {
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn {
  margin-left: 12px;
}

.account-name {
  font-size: 16px;
  color: black;
  font-weight: 600;
}

.mind_content_col img {
  max-width: 250px !important; /* 限制图片的最大宽度为容器的宽度 */
  height: auto !important; /* 自动调整高度以保持宽高比 */
}

.comment-num{
  margin-right: 10px;
}

.spend-points-dialog{
  width: 200px;
}

.spend-points-dialog-content{
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  margin-bottom: 20px;
}
</style>
