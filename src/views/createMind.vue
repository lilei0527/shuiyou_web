<!-- eslint-disable no-unused-vars -->
<script lang="ts" setup>
import { onBeforeUnmount, reactive, shallowRef } from 'vue'
import { ref } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import axios from '@/axios'
import { useRoute } from 'vue-router'
import router from '@/router'
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import Compressor from 'compressorjs'

const route = useRoute()
const mindId = route.query.mindId
var mind: Mind

interface Mind {
  id: number
  userId: number
  accountName: string
  content: string
  images: string
  createTime: string
  commentNum: number
  userHeadImage: string
  typeId: number
}

const form = reactive({
  type: 1
})
//帖子详情
const getMind = () => {
  var response = axios.get('mind/detail', {
    params: {
      id: mindId
    }
  })

  response.then(function (response) {
    mind = response.data.data
    form.type = mind.typeId
    valueHtml.value = mind.content
  })
}

if (mindId && mindId != null) {
  getMind()
}

const isDisabled = mindId != null

const onSubmit = async () => {
  //是否输入内容
  if (valueHtml.value!.trim() == '<p><br></p>') {
    ElMessage.error('请输入内容')
    return
  }

   await axios.post('/mind', {
    id: mindId,
    typeId: form.type,
    content: valueHtml.value
  })
  ElMessage.success('发布成功')
  //返回路由
  router.back()
  // $router.push('/minds')
}

//类型
const typeList: any = ref(null)
const fetchType = async () => {
  try {
    const response = await axios.get('/type/getAll', {
      headers: {
        Authorization: localStorage.getItem('token')
      }
    })
    typeList.value = response.data.data
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}
fetchType()

function onCancel() {
  //回到上一级页面
  router.back()
}

const isFormValid = ref(false) // 表单是否验证通过
const ruleFormRef = ref<FormInstance>()

function handleInput() {
  // 每次输入时验证表单
  if (ruleFormRef.value) {
    ruleFormRef.value.validate((valid: boolean) => {
      isFormValid.value = valid // 根据验证结果控制按钮是否可用
    })
  }
}

const rules = {
  type: [{ required: true, message: '请选择分类', trigger: 'blur' }]
}

const editorRef = shallowRef()
const editor = editorRef.value
const valueHtml = ref('')

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
    console.log(`${file.name} 上传失败`, res)
  },
  onError(file: File, err: any, res: any) {
    console.log(`${file.name} 上传出错`, err, res)
  }
}
</script>

<template>
  <div class="my-content">
    <div class="main-content">
      <el-form
        :model="form"
        label-width="auto"
        style="max-width: 100%"
        :rules="rules"
        ref="ruleFormRef"
        @input="handleInput"
      >
        <el-form-item label="分类" prop="type">
          <el-radio-group v-model="form.type" :disabled="isDisabled">
            <el-radio v-for="(item, index) in typeList" :key="index" :value="item.id">{{
              item.name
            }}</el-radio>
          </el-radio-group>
        </el-form-item>

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
            style="height: 500px;"
            @onCreated="handleCreated"
            @onChange="handleChange"
            @onDestroyed="handleDestroyed"
            @onFocus="handleFocus"
            @onBlur="handleBlur"
            @customAlert="customAlert"
            @customPaste="customPaste"
          />

          <div class="dialog-footer">
              <el-button @click="onCancel" type="primary">取消</el-button>
              <el-button @click="onSubmit" type="primary">提交</el-button>
          </div>
      </el-form>
    </div>
    <div class="right-content">
      <el-card style="max-width: 100%; margin-top: 10px">
        <span
          >发布求购信息时，建议提供详细的物品名称、数量、单价、联系方式等信息，以便卖家更快的与您联系。</span
        >
      </el-card>
    </div>
  </div>
</template>

<style scoped="scss">
form {
  margin-left: 10px auto;
  position: inherit;
  width: 100%;
}

button {
  display: flex;
  position: inherit;
  float: right;
  margin: auto;
}
.dialog-footer{
  display: flex;
  justify-content: space-between;
}
</style>
