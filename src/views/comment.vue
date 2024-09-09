<script setup lang="ts">
import axios from '@/axios'
import { useRoute } from 'vue-router'
import Mind from './mind.vue'
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import CommentDialog from '../components/commentDialog.vue'

const route = useRoute()
var mindId = Number(route.query.id);
const mind = ref<any>()

interface Comment {
  id: number
  mindId: number
  commentId: number
  fromUserId: number
  fromUserName: string
  fromUserHeadImage: string
  toUserId: number
  toUserName: string
  toUserHeadImage: string
  content: string
  createTime: string
  childComments: Array<Comment>
}

//帖子详情
const getMind = () => {
  var response = axios.get('mind/detail', {
    params: {
      id: mindId
    }
  })

  response.then(function (response) {
    mind.value = response.data.data
  })
}

getMind()

// 评论列表
var pageNum = 1
const commentList = ref<Array<Comment>>([])
const getCommentList = () => {
  busy.value = true
  // 发送请求
  var response = axios.get('/comment/getComments', {
    params: {
      mindId: mindId,
      pageNum: pageNum,
      pageSize: 10
    }
  })

  response.then(function (response) {
    console.log(response)

    const newItems = response.data.data.records
    if (newItems.length > 0) {
      commentList.value.push(...newItems)
      pageNum++
    }

    if (newItems.length == 10) {
      pageNum++
    }
    busy.value = false
  })
}

onMounted(() => {
  getCommentList()
})

const reportRadio = ref(3)
const reportText = ref('')
const reportUserId = ref(0)
const reportCommentId = ref(0)
const commentUserId = ref(0)
const commentCId = ref(0) //根评论id
const reportDialogVisible = ref(false)
const commentDialogVisible = ref(false)

//举报评论
function report() {
  axios
    .post(
      'http://localhost:8081/report',
      {
        commentId: reportCommentId.value,
        type: reportRadio.value,
        content: reportText.value,
        toUserId: reportUserId.value
      },
      {
        headers: {
          Authorization: localStorage.getItem('token')
        }
      }
    )
    .then((res) => {
      console.log(res)
      ElMessage({
        type: 'success',
        message: '举报成功'
      })
      reportUserId.value = 0
      reportCommentId.value = 0
    })
  reportDialogVisible.value = false
}


function onReportClick(commentId: number, userId: number) {
  //判断是否已登录
  const token = localStorage.getItem('token')
  if (token == null) {
    showLoginDialog.value = true
    return
  }
  reportCommentId.value = commentId
  reportUserId.value = userId
  reportDialogVisible.value = true
}

function onCommentClick(commentId: number, userId: number) {
  //判断是否已登录
  const token = localStorage.getItem('token')
  if (token == null) {
    showLoginDialog.value = true
    return
  }

  commentUserId.value = userId
  commentCId.value = commentId
  commentDialogVisible.value = true
}


//关注帖子
function follow(mindId: number) {
  axios.post('/follow', { mindId: mindId }).then((res) => {
    console.log(res)
    ElMessage('已关注')
  })
}


const busy = ref(false)
const showLoginDialog = ref(false)
</script>



<template>
  <!-- <AuthDialog v-model:isLoginDialogVisible="isLogin" /> -->
  <CommentDialog v-model:commentDialogVisible="commentDialogVisible" v-model:commentList="commentList"
    v-model:mind="mind" :mindId="mindId" :toUserId="commentUserId" :commentId="commentCId" />

  <el-dialog v-model="reportDialogVisible" title="举报" width="500px" center class="report-dialog">
    <el-radio-group v-model="reportRadio" size="large">
      <el-radio :value="0">侮辱性、歧视性或攻击性言语</el-radio>
      <el-radio :value="1">法律和道德规范</el-radio>
      <el-radio :value="2">散布谣言</el-radio>
      <el-radio :value="3">传销诈骗</el-radio>
      <el-radio :value="4">侵权</el-radio>
    </el-radio-group>
    <span>具体描述：</span>
    <!-- <input type="text" size="10" width="100%" class="report-input"> -->
    <el-input type="textarea" v-model="reportText" rows="4" class="report-input" />
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="reportDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="report()"> 确定 </el-button>
      </div>
    </template>
  </el-dialog>



  <div class="my-content">
    <div class="main-content">
      <div class="edior">

        <Mind :mind="mind" v-if="mind" />

        <!-- 操作栏 -->
        <tr class="mind_operation_row" v-if="mind">
          <span class="mind_operation_col" plain @click="onReportClick(0, mind.fromUserId)">
            <img src="../assets/svg/report.svg" style="width: 40px; max-height: 40px" alt="举报" />
            <span class="mind_operation_text">举报</span>
          </span>
          <div @click="onCommentClick(0, mind.userId)">
            <span class="mind_operation_col">
              <img src="../assets/svg/comment.svg" style="width: 40px; max-height: 40px" alt="评论" />
              <span class="mind_operation_text">{{ mind.commentNum }}</span>
            </span>
          </div>

          <span class="mind_operation_col" @click="follow(mind.id)">
            <img src="../assets/svg/collect.svg" style="width: 40px; max-height: 40px" alt="关注" />
            <span class="mind_operation_text">关注</span>
          </span>
          <span></span>
        </tr>

        <!-- 评论区 -->
        <div class="comment" v-infinite-scroll="getCommentList" infinite-scroll-disabled="busy">
          <div class="comment-title-row">
            <img src="../assets/svg/planlist.svg" style="width: 20px; max-height: 20px" alt="方案" /><span
              class="plan-name">方案列表</span>
          </div>
          <div v-for="(item, index) in commentList" :key="index">
            <el-card>
              <div class="user-header">
                <img :src="item.fromUserHeadImage" alt="" style="width: 40px; max-height: 40px" />
                <span class="user-name">{{ item.fromUserName }}</span>
                <span class="time">{{ item.createTime }}</span>
              </div>
              <div v-html="item.content" class="user-content"></div>
              <span class="report-operate" @click="onReportClick(item.id, item.fromUserId)">举报</span><span
                class="reply-operate" @click="onCommentClick(item.id, item.fromUserId)">回复</span>
              <!-- <hr class="comment-line" /> -->

              <!-- 子评论 -->
              <div class="child-comment" v-for="(childItem, index) in item.childComments" :key="index">
                <div class="user-header">
                  <img :src="childItem.fromUserHeadImage" alt="" style="width: 30px; max-height: 30px" />
                  <span class="user-name">{{ childItem.fromUserName }}</span>
                  <span class="reply-text" @click="onCommentClick(childItem.id, childItem.fromUserId)">回复</span>
                  <span class="user-name-child">{{ childItem.toUserName }}</span>
                  <span class="time">{{ childItem.createTime }}</span>
                </div>
                <div v-html="childItem.content" class="user-content_child"></div>
                <span class="report-operate" @click="onReportClick(childItem.id, childItem.fromUserId)">举报</span><span
                  class="reply-operate" @click="onCommentClick(item.id, childItem.fromUserId)">回复</span>
                <!-- <hr class="comment-line" /> -->
              </div>
            </el-card>
          </div>
          <div v-if="commentList.length == 0">
            <el-empty description="快来抢首评吧!" />
          </div>
        </div>
      </div>
    </div>
    <div class="right-content">
      <div class="cell">
        <span>12dfdsfsdfsdfsdfsd</span>
        <div>df11</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.edior {
  margin: 10px;
}

.reply {
  margin-top: 30px;
  margin-left: 15px;
}

el-button {
  display: flex;
  position: inherit;
  float: right;
  margin: auto;
}

.operates {
  display: flex;
  justify-content: space-evenly;
}

.comment {
  margin: 10px;
}

.user-header {
  margin-top: 10px;
  display: flex;
  align-items: center;
}

.user-name {
  margin-left: 20px;
  font-size: 16px;
  color: black;
  font-weight: 600;
}

.user-name-child {
  font-size: 16px;
  color: black;
  font-weight: 600;
}

.user-content {
  margin-left: 60px;
  color: black;
  font-weight: 600;
}

.user-content_child {
  margin-left: 50px;
  color: black;
  font-weight: 700;
}

.comment-line {
  margin-top: 30px;
  height: 1px;
  border: none;
  background-color: #80808069;
  size: 1px;
}

.time {
  margin-left: auto;
  color: #999;
  font-size: 12px;
}

.plan-name {
  margin-left: 10px;
  font-size: 20px;
}

.comment-title-row {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.child-comment {
  margin-left: 60px;
}

.report-operate {
  color: #999;
  font-size: 12px;
  margin-left: 60px;
  cursor: pointer;
}

.report-operate:hover {
  color: #f5cb2b;
}

.reply-operate {
  color: #999;
  font-size: 12px;
  margin-left: 10px;
  cursor: pointer;
}

.reply-operate:hover {
  color: #f5cb2b;
}

.reply-text {
  margin: 0 10px 0 10px;
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
  cursor: pointer;
}

.mind_operation_text:hover {
  color: #f5cb2b;
}
</style>
