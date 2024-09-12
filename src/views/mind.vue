<script setup lang="ts">
import { defineProps } from 'vue'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Delete, Edit } from '@element-plus/icons-vue'
import axios from '@/axios'
import { ElMessage } from 'element-plus'

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

var imgUrlList: String[] = []
if (mind && mind.images != null && mind.images != '') {
  imgUrlList = mind.images.split(';')
}
const imageList = ref(imgUrlList)

var $router = useRouter()
function jumpToComment() {
  $router.push({
    name: 'comment',
    query: {
      id: mind.id
    }
  })
}

function deleteMind() {
  axios.delete('/mind', {
    params: {
      id: mind.id
    }
  }).then(res => {
    console.log(res)
    if (res.data.code === 200) {
      ElMessage.success('删除成功');
      if (myMindList.value) {
        for (var i = 0; i < myMindList.value.length; i++) {
          if (myMindList.value[i].id == mind.id) {
            myMindList.value.splice(i, 1);
            break;
          }
        }
      }
    } else {
      ElMessage.error('删除失败');
    }
  })
}

</script>

<template>
  <table cellpadding="0" cellspacing="0" width="100%">
    <tr class="mind_row">
      <!-- 头像 -->
      <td width="24" valign="top">
        <img :src="mind.userHeadImage" class="avatar" width="24" style="width: 40px; max-height: 40px" alt="zj9495" />
      </td>
      <td width="100%" valign="top" class="mind_content_col">
        <div class="fr">
          <strong>{{ mind.accountName }}</strong>
          <span class="mind_content_tail">
            <span class="fade small time">{{ mind.createTime }}</span>
            <el-tag type="warning" class="comment-num">{{ mind.commentNum }}</el-tag>
            <el-popconfirm v-if="props.canEdit" title="确定要删除该项吗？" confirmButtonText="确定" cancelButtonText="取消"
              icon="el-icon-warning" iconColor="red" @confirm="deleteMind">
              <!-- 删除按钮，点击触发弹窗 -->
              <template v-slot:reference>
                <el-button class="delete-btn" type="danger" :icon="Delete" circle size="small" />
              </template>
            </el-popconfirm>

            <el-button v-if="props.canEdit" type="info" :icon="Edit" circle size="small"
              @click="$router.push({ name: 'create_mind', query: { mindId: mind.id } })" />
          </span>
        </div>
        <div class="mind_content">
          <span @click="jumpToComment">{{ mind.content }} </span>
        </div>
    <tr class="mind_images_row">
      <td class="mind_images" v-for="(item, index) in imageList" :key="index">
        <div class="demo-image__preview">
          <el-image style="width: 100px; height: 100px" :src="item" :preview-src-list="imageList"
            :initial-index="index">
          </el-image>
        </div>
      </td>
    </tr>
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
</style>
