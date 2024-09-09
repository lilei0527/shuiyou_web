<script setup lang="ts">
import { defineProps } from 'vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router';

interface Mind {
  id: number
  userId: number
  accountName: string
  content: string
  images: string
  createTime: string
  commentNum: number
  userHeadImage: string
}
const props = defineProps<{
  //子组件接收父组件传递过来的值
  mind: Mind
}>()
var mind: Mind = props.mind

var imgUrlList: String[] = []
if (mind && mind.images != null && mind.images != '') {
  imgUrlList = mind.images.split(',')
}
const imageList = ref(imgUrlList)

function jumpToComment() {
  var $router = useRouter()
  $router.push({
    name: 'comment', query: {
      id: mind.id,
    },
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
      <td width="100%" valign="top" class="mind_content_col" @click="jumpToComment">
        <div class="fr">
          <strong>{{ mind.accountName }}</strong>
          <span class="mind_content_tail">
            <span class="fade small time">{{ mind.createTime }}</span>
            <el-tag type="warning" class="comment-num">{{ mind.commentNum }}回复</el-tag>
          </span>
        </div>
        <div class="mind_content">
          <span>{{ mind.content }} </span>
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
  ;
}

.mind_content_tail {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
