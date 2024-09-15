<script setup lang="ts">
import axios from '@/axios'
import { onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import Compressor from 'compressorjs'
import { ElMessage } from 'element-plus'
const editorRef = shallowRef()
const editor = editorRef.value

onBeforeUnmount(() => {
  if (editor == null) return
  editor.destroy()
})

const handleCreated = (editor: any) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}
const handleChange = (editor: { getHtml: () => any }) => {
  //   comment.value.content = editor.getHtml()
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

const toolbarConfig = {
  excludeKeys: ['group-video', 'insertTable']
}

var uploadUrl = import.meta.env.VITE_IMAGE_URL + '/file/upload'

const editorConfig = {
  placeholder: '请输入内容...',
  MENU_CONF: {
    uploadImage: {
      // maxFileSize: 1 * 1024 * 1024, // 1M
      // server: uploadUrl, // 上传图片的服务器地址
      // fieldName: 'file', // 上传图片的字段名
      // headers: {
      //   Authorization: localStorage.getItem('token')
      // },
      async customUpload(file: any, insertFn: (arg0: any, arg1: any, arg2: any) => void) {
        var compressFile
        new Promise((resolve, reject) => {
          // 使用 Compressor.js 进行图片压缩
          new Compressor(file, {
            quality: 0.6, // 压缩质量 0-1，1 是不压缩
            success(result) {
              console.log('原文件大小：', file.size)
              console.log('压缩后文件大小：', result.size)
              // 返回压缩后的文件进行上传
              if (result.size > 1 * 1024 * 1024) {
                ElMessage.error('图片过大，请压缩或者裁剪后再上传！')
                return reject()
              }
              resolve(result)
              compressFile = result
              const formData = new FormData()
              formData.append('file', compressFile)
              axios
                .post(uploadUrl, formData, {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: localStorage.getItem('token')
                  }
                })
                .then((res) => {
                  const response = res.data
                  if (response.code === 200) {
                    // 从返回的数据中获取图片 URL
                    const url = response.data
                    // 调用 wangEditor 提供的 insertFn，将图片插入到编辑器中
                    insertFn(url, '图片', '')
                  } else {
                    console.error('图片上传失败：', response.message)
                  }
                })
                .catch((error) => {
                  console.error('图片上传失败：', error)
                })
            },
            error(err) {
              ElMessage.error('图片压缩失败')
              reject(err)
            }
          })
        })
      }
    }
  },
  onFailed(file: File, res: any) {
    // TS 语法
    console.log(`${file.name} 上传失败`, res)
  },
  onError(file: File, err: any, res: any) {
    // TS 语法
    console.log(`${file.name} 上传出错`, err, res)
  }
}

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

// const commentDialogVisible = defineModel<boolean>('commentDialogVisible')
// const commentList = defineModel<Array<Comment>>('commentList')
// const mind = defineModel<any>('mind')
// const commentValue = defineModel<string>('commentValue')//待编辑的评论
// var valueHtml = ref(commentValue)

// const props = defineProps<{
//     id?: number,
//     mindId?: number,
//     toUserId?: number,
//     commentId?: number | null
// }>()

const props = defineProps<{
  comment: Comment
}>()

const valueHtml = ref()
valueHtml.value = props.comment.content
const comment = ref(props.comment)
const commentDialogVisible = defineModel<boolean>('commentDialogVisible')

// 监听 props 变化，以便每次打开弹窗时更新输入框内容
watch(
  () => props.comment,
  (newComment) => {
    comment.value = { ...newComment }
  }
)

const emits = defineEmits(['afterSaveComment'])

//提交评论
const submitComment = () => {
  //是否输入内容
  if (valueHtml.value!.trim() == '<p><br></p>') {
    ElMessage.error('请输入回复内容')
    return
  }

  // 发送请求
  var response = axios.post('/comment', {
    id: comment.value.id,
    content: valueHtml.value,
    mindId: comment.value.mindId,
    toUserId: comment.value.toUserId,
    commentId: comment.value.commentId
  })

  // emits('afterSaveComment', valueHtml.value) // 通过 emit 将修改后的数据传回父组件

  response
    .then(function (response) {
      emits('afterSaveComment', response.data.data) // 通过 emit 将修改后的数据传回父组件
      valueHtml.value = ''
      commentDialogVisible.value = false
    })
    .catch(function (error) {
      console.log(error)
    })
}
</script>

<template>
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
        <el-button @click="commentDialogVisible = false" type="primary">取消</el-button>
        <el-button @click="submitComment" type="primary">提交</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<style scoped lang="scss"></style>
