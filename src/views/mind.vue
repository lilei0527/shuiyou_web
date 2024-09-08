<script setup lang="ts">
import axios from '@/axios'
import { ElMessage } from 'element-plus'
import { defineProps, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import '@wangeditor/editor/dist/css/style.css' // 引入 css

import { onBeforeUnmount, ref, shallowRef } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import Compressor from 'compressorjs'

const editorRef = shallowRef()
const valueHtml = ref('<p>hello</p>')

// onMounted(() => {
//     setTimeout(() => {
//         valueHtml.value = '<p>模拟 Ajax 异步设置内容</p>'
//     }, 1500)
// })

const toolbarConfig = {
  excludeKeys: ['group-video', 'insertTable']
}
const editorConfig = {
  placeholder: '请输入内容...',
  MENU_CONF: {
    uploadImage: {
      maxFileSize: 2 * 1024 * 1024,
      server: 'http://123.60.87.243:8080/file/upload', // 上传图片的服务器地址
      fieldName: 'file', // 上传图片的字段名
      headers: {
        Authorization: localStorage.getItem('token')
      },
      // eslint-disable-next-line no-unused-vars
      customInsert(
        res: { code: number; data: String; message: any },
        insertFn: (arg0: any) => void
      ) {
        // 检查返回的 code 是否为 200
        if (res.code === 200) {
          // 从返回的数据中获取图片 URL
          const url = res.data
          // 调用 wangEditor 提供的 insertFn，将图片插入到编辑器中
          insertFn(url)
        } else {
          console.error('图片上传失败：', res.message)
        }
      },
      // 图片上传之前的处理：压缩
      onBeforeUpload(file: File) {
        new Compressor(file, {
          quality: 0.6, // 图片压缩质量，0 - 1 之间的值，值越小质量越低，文件越小
          success(result) {
            // result 是压缩后的 Blob 对象
            console.log('压缩成功: ', result)
            const compressedFile = new File([result], file.name, {
              type: result.type
            })
            // 在这里处理压缩后的 Blob，比如上传到服务器
            return compressedFile
          },
          error(err) {
            // 处理压缩过程中出现的错误
            console.error('压缩失败: ', err)
          }
        })
        // return file;
      }
    }
  }
}
const editor = editorRef.value
onBeforeUnmount(() => {
  if (editor == null) return
  editor.destroy()
})

const handleCreated = (editor: any) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}

const handleChange = (editor: { getHtml: () => any }) => {
  valueHtml.value = editor.getHtml()
  console.log('change:', editor.getHtml())
}
const handleDestroyed = (editor: any) => {
  console.log('destroyed', editor)
}
const handleFocus = (editor: any) => {
  console.log('focus', editor)
}
const handleBlur = (editor: any) => {
  console.log('blur', editor)
}
const customAlert = (info: any, type: any) => {
  alert(`【自定义提示】${type} - ${info}`)
}
const customPaste = (editor: any, event: any) => {
  console.log('ClipboardEvent 粘贴事件对象', event)
}
const mode = 'default'

const $router = useRouter()

const reportRadio = ref(3)
const reportText = ref('')
const centerDialogVisible = ref(false)
const commentDialogVisible = ref(false)

const props = defineProps<{
  //子组件接收父组件传递过来的值
  mind: Mind
}>()

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

var mind: Mind = props.mind

//获取帖子
var imgUrlList: any[] = []
if (mind && mind.images != null && mind.images != '') {
  imgUrlList = mind.images.split(',')
}
const imageList = ref(imgUrlList)

function onCommentClick() {
  const routerPath = $router.currentRoute.value.path
  if (routerPath == '/minds' || routerPath == '/') {
    $router.push({ path: '/comment', query: { id: mind.id } })
  } else if (routerPath == '/comment') {
    commentDialogVisible.value = true
  }
}

//提交评论
const submitComment = () => {
  // 发送请求
  var response = axios.post('/comment', {
    content: valueHtml.value,
    mindId: mind.id,
    toUserId: mind.userId
  })

  response
    .then(function (response) {
      console.log(response)
      commentDialogVisible.value = false
      // 刷新页面
      location.reload()
    })
    .catch(function (error) {
      console.log(error)
    })
}

//举报
function report() {
  axios
    .post('/report', {
      mindId: mind.id,
      type: reportRadio.value,
      content: reportText.value,
      toUserId: mind.userId
    })
    .then((res) => {
      console.log(res)
      ElMessage({
        type: 'success',
        message: '举报成功'
      })
    })

  centerDialogVisible.value = false
}

//关注帖子
function follow(mindId: number) {
  axios.post('/follow', { mindId: mindId }).then((res) => {
    console.log(res)
    ElMessage('已关注')
  })
}
</script>

<template>
  <el-dialog v-model="centerDialogVisible" title="举报" width="500px" center class="report-dialog">
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
        <el-button @click="centerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="report"> 确定 </el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog v-model="commentDialogVisible" title="评论" width="800px" center>
    <Toolbar
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
      style="border-bottom: 1px solid #ccc"
    />
    <Editor
      :defaultConfig="editorConfig"
      :mode="mode"
      v-model="valueHtml"
      style="height: 500px; overflow-y: hidden"
      @onCreated="handleCreated"
      @onChange="handleChange"
      @onDestroyed="handleDestroyed"
      @onFocus="handleFocus"
      @onBlur="handleBlur"
      @customAlert="customAlert"
      @customPaste="customPaste"
    />
    <template #footer>
      <div class="dialog-footer">
        <el-button type="success" @click="submitComment">提交</el-button>
        <el-button type="info" @click="commentDialogVisible = false">取消</el-button>
      </div>
    </template>
  </el-dialog>

  <table cellpadding="0" cellspacing="0" width="100%">
    <tr class="mind_row">
      <td width="24" valign="top">
        <img
          :src="mind.userHeadImage"
          class="avatar"
          width="24"
          style="width: 40px; max-height: 40px"
          alt="zj9495"
        />
      </td>
      <td width="100%" valign="top" class="mind_content_col">
        <div class="fr">
          <strong>{{ mind.accountName }}</strong
          ><span class="fade small time">{{ mind.createTime }}</span>
        </div>
        <div class="mind_content">
          <span>{{ mind.content }} </span>
        </div>
        <tr class="mind_images_row">
          <td class="mind_images" v-for="(item, index) in imageList" :key="index">
            <div class="demo-image__preview">
              <el-image
                style="width: 100px; height: 100px"
                :src="item"
                :preview-src-list="imageList"
                :initial-index="index"
              >
              </el-image>
            </div>
          </td>
        </tr>
        <tr class="mind_operation_row">
          <span class="mind_operation_col" plain @click="centerDialogVisible = true">
            <img src="../assets/svg/report.svg" style="width: 40px; max-height: 40px" alt="举报" />
            <span class="mind_operation_text">举报</span>
          </span>
          <div @click="onCommentClick">
            <span class="mind_operation_col">
              <img
                src="../assets/svg/comment.svg"
                style="width: 40px; max-height: 40px"
                alt="评论"
              />
              <span class="mind_operation_text">{{ mind.commentNum }}</span>
            </span>
          </div>

          <span class="mind_operation_col" @click="follow(mind.id)">
            <img src="../assets/svg/collect.svg" style="width: 40px; max-height: 40px" alt="关注" />
            <span class="mind_operation_text">关注</span>
          </span>

          <span></span>
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
}

.time {
  display: flex;
  float: left;
}

.mind_row {
  width: 100%;
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

.mind_content_col {
  padding-left: 20px;
}
</style>
