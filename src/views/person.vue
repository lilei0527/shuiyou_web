<script setup lang="ts">
import { ref } from 'vue'
import type { TabsPaneContext } from 'element-plus'
import Mind from './mind.vue'
import axios from '@/axios'
import { user } from '../stores/global'
import { Edit, Delete } from '@element-plus/icons-vue'
import CommentDialog from '../components/CommentDialog.vue'

const activeName = ref('my-mind')
const size = 'large'

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}

const busy = ref(false)

// 我的帖子
const myMindList = ref<Array<any>>([])
myMindList.value = myMindList.value.filter((item) => item.isDeleted != 1)

var myMindPageNum = 1
async function loadMyMindMore(isFirst: boolean) {
  if (!isFirst && activeName.value != 'my-mind') return
  busy.value = true
  const response = await axios.get('/mind/getMyMind', {
    params: {
      pageNum: myMindPageNum,
      pageSize: 10
    }
  })
  const newItems = response.data.data == null ? [] : response.data.data.records
  if (newItems.length > 0) {
    myMindList.value.push(...newItems)
    myMindPageNum++
  }
  busy.value = false
}
loadMyMindMore(true)

//我的关注
const myFollowList = ref<Array<any>>([])
var myFollowPageNum = 1
async function loadMyFollowMore(isFirst: boolean) {
  if (!isFirst && activeName.value != 'my-follow') return
  busy.value = true
  const response = await axios.get('/follow/getMyFollow', {
    params: {
      pageNum: myFollowPageNum,
      pageSize: 10
    }
  })
  const newItems = response.data.data == null ? [] : response.data.data.records
  if (newItems.length > 0) {
    myFollowList.value.push(...newItems)
    myFollowPageNum++
  }
  busy.value = false
}
loadMyFollowMore(true)

//我的回复
const myReplyList = ref<Array<any>>([])
var myReplyPageNum = 1
async function loadMyReplyMore(isFirst: boolean) {
  if (!isFirst && activeName.value != 'my-reply') return
  busy.value = true
  const response = await axios.get('/comment/getMyComments', {
    params: {
      pageNum: myReplyPageNum,
      pageSize: 10
    }
  })
  const newItems = response.data.data == null ? [] : response.data.data.records
  if (newItems.length > 0) {
    myReplyList.value.push(...newItems)
    myReplyPageNum++
  }
  busy.value = false
}
loadMyReplyMore(true)

//回复我的
const replyMyList = ref<Array<any>>([])
var replyMyPageNum = 1
async function loadReplyMyMore(isFirst: boolean) {
  if (!isFirst && activeName.value != 'reply-my') return
  busy.value = true
  const response = await axios.get('/comment/getCommentsToMe', {
    params: {
      pageNum: replyMyPageNum,
      pageSize: 10
    }
  })
  const newItems = response.data.data == null ? [] : response.data.data.records
  if (newItems.length > 0) {
    replyMyList.value.push(...newItems)
    replyMyPageNum++
  }
  busy.value = false
}
loadReplyMyMore(true)

const deleteComment = async (commentId: number) => {
  const response = await axios.delete('/comment', {
    params: {
      id: commentId
    }
  })
  if (response.data.code == 200) {
    const index = myReplyList.value.findIndex((item) => item.id == commentId)
    if (index > -1) {
      myReplyList.value.splice(index, 1)
    }
  }
}

const commentDialogVisible = ref(false)
const index = ref(0) // 评论id
const comment = ref<Comment>()

interface Comment {
  id?: number
  mindId?: number
  commentId?: number
  fromUserId?: number
  fromUserName?: string
  fromUserHeadImage?: string
  toUserId?: number
  toUserName?: string
  toUserHeadImage?: string
  content?: string
  createTime?: string
  childComments?: Array<Comment>
}

function onEdit(commentParam: Comment, choiceIndex: number) {
  index.value = choiceIndex
  comment.value = commentParam
  commentDialogVisible.value = true
}

// 回调
const afterSaveComment = (comment: Comment) => {
  if (index.value !== null) {
    myReplyList.value[index.value].content = comment.content
  }
}
</script>

<template>
  <CommentDialog
    v-if="commentDialogVisible && comment"
    :comment="comment"
    @afterSaveComment="afterSaveComment"
    v-model:comment-dialog-visible="commentDialogVisible"
  />

  <div class="my-content">
    <div class="main-content">
      <div class="12">
        <div class="info">
          <el-avatar shape="square" :size="size" :src="user.headImage" class="avatar" />
          <div class="name-edit">
            <span class="name">{{ user.accountName }}</span>
          </div>
        </div>

        <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
          <el-tab-pane
            label="我的帖子"
            name="my-mind"
            v-infinite-scroll="loadMyMindMore"
            :infinite-scroll-disabled="busy"
          >
            <div v-if="myMindList.length > 0">
              <Mind
                v-for="item in myMindList"
                :key="item.id"
                :mind="item"
                v-model:myMindList="myMindList"
              >
              </Mind>
            </div>
            <div v-if="myMindList.length == 0">
              <el-empty description="暂无数据" />
            </div>
          </el-tab-pane>
          <el-tab-pane
            label="我的关注"
            name="my-follow"
            v-infinite-scroll="loadMyFollowMore"
            :infinite-scroll-disabled="busy"
          >
            <div v-if="myFollowList.length == 0">
              <el-empty description="暂无数据" />
            </div>
            <Mind v-for="(item, index) in myFollowList" :key="index" :mind="item"> </Mind>
          </el-tab-pane>
          <el-tab-pane
            label="我的回复"
            name="my-reply"
            v-infinite-scroll="loadMyReplyMore"
            :infinite-scroll-disabled="busy"
          >
            <div v-for="item in myReplyList" :key="item.id">
              <div class="mind-content">
                <div>{{ item.mindContent }}</div>
              </div>
              <div class="user-header">
                <img :src="item.fromUserHeadImage" alt="" style="width: 40px; max-height: 40px" />
                <span class="user-name">{{ item.fromUserName }}</span>
                <span class="time">{{ item.createTime }}</span>
                <!-- 删除按钮，点击触发弹窗 -->
                <el-popconfirm
                  title="确定要删除该项吗？"
                  confirmButtonText="确定"
                  cancelButtonText="取消"
                  icon="el-icon-warning"
                  iconColor="red"
                  @confirm="deleteComment(item.id)"
                >
                  <template v-slot:reference>
                    <el-button
                      class="delete-btn"
                      type="danger"
                      :icon="Delete"
                      circle
                      size="small"
                    />
                  </template>
                </el-popconfirm>

                <el-button
                  type="info"
                  :icon="Edit"
                  circle
                  size="small"
                  @click="onEdit(item, index)"
                />
              </div>
              <div v-html="item.content" class="user-content"></div>

              <hr class="comment-line" />
            </div>
            <div v-if="myReplyList.length == 0">
              <el-empty description="暂无数据" />
            </div>
          </el-tab-pane>
          <el-tab-pane
            label="回复我的"
            name="reply-my"
            v-infinite-scroll="loadReplyMyMore"
            :infinite-scroll-disabled="busy"
          >
            <div v-for="(item, index) in replyMyList" :key="index">
              <div class="mind-content">{{ item.mindContent }}</div>
              <div class="user-header">
                <img :src="item.fromUserHeadImage" alt="" style="width: 40px; max-height: 40px" />
                <span class="user-name">{{ item.fromUserName }}</span>
                <span class="time">{{ item.createTime }}</span>
              </div>
              <div v-html="item.content" class="user-content"></div>
              <hr class="comment-line" />
            </div>
            <div v-if="replyMyList.length == 0">
              <el-empty description="暂无数据" />
            </div>
          </el-tab-pane>
        </el-tabs>
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
<style scoped="sass">
.info {
  /* margin: 20px auto 20px auto; */
  /* display: inline; */
  /* justify-content: center; */
  /* display: flex; */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.name-edit {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
}

.demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}

.demo-tabs {
  margin-top: 20px;
  margin-left: 20px;
  margin-right: 20px;
}

.user-header {
  display: flex;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 20px;
}

.user-name {
  margin-left: 20px;
}

.user-content {
  margin-left: 60px;
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

.mind-content {
  margin-top: 20px;
}

.delete-btn {
  margin-left: 12px;
}
</style>
