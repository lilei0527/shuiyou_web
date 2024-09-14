<script lang="ts" setup>
import { reactive } from 'vue'
import { ref } from 'vue'
import { ElMessage, type FormInstance, type UploadProps, type UploadUserFile } from 'element-plus'
import axios from '@/axios'
import { Plus } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import router from '@/router'
import { el } from 'element-plus/es/locales.mjs'

const dialogImageUrl = ref('')
const dialogVisible = ref(false)

const handleRemove: UploadProps['onRemove'] = (uploadFile, uploadFiles) => {
  console.log(uploadFile, uploadFiles)
}

const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url!
  dialogVisible.value = true
}

// 图片压缩处理
const handleBeforeUpload = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      const img = new Image()
      const result = e?.target?.result // 使用可选链检查
      if (typeof result === 'string') {
        img.src = result
      } else {
        console.error('加载文件时出现问题')
      }
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const maxWidth = 800 // 设置最大宽度
        const maxHeight = 800 // 设置最大高度
        let width = img.width
        let height = img.height
        // 计算新的图片尺寸，保持宽高比
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height *= maxWidth / width))
            width = maxWidth
          } else {
            width = Math.round((width *= maxHeight / height))
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height
        if (!ctx) {
          throw new Error('无法获取 2D 绘图上下文')
        }
        ctx.drawImage(img, 0, 0, width, height)
        // 将压缩后的图片导出为 Blob 对象
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              throw new Error('压缩后的图片 Blob 对象为空')
            }
            const compressedFile = new File([blob], file.name, {
              type: file.type
            })

            if (compressedFile.size > 1024 * 1024 * 1) {
              ElMessage.error('图片过大,请裁剪或者压缩后再上传')
            }
            resolve(compressedFile) // 返回压缩后的图片文件
          },
          file.type,
          0.7
        ) // 0.7 为图片压缩质量
      }
    }
    reader.onerror = (error) => {
      console.error('Error reading file:', error)
      reject(error)
    }
  })
}

const fileList = ref<UploadUserFile[]>([])
const headers = {
  Authorization: localStorage.getItem('token')
}

// do not use same name with ref


const route = useRoute()
const mindId = route.query.mindId
var mind: Mind;

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
  type: 1,
  desc: ''
});
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
    form.desc = mind.content
    if (mind.images != null && mind.images != '') {
      mind.images.split(';').forEach((url) => {
        fileList.value.push({
          name: 'image.jpg',
          url: url,
          status: 'success'
        });
      })
    }
  })
}

if (mindId && mindId != null) {
  getMind()
}

const isDisabled = mindId != null


const onSubmit = async () => {
  var imageUrls = ''
  fileList.value.forEach((file) => {
    if (file.response && (file.response as { data: unknown }).data) {
      var url = (file.response as { data: string }).data
      imageUrls += (url + ';')
    } else {
      imageUrls += (file.url + ';')
    }
  })
  //去掉最后一个分号
  imageUrls = imageUrls.slice(0, -1)

  var response = await axios.post('/mind', {
    id: mindId,
    typeId: form.type,
    content: form.desc,
    images: imageUrls
  })
  ElMessage.success('发布成功')
  //返回路由
  router.back();
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
  router.back();
}

const isFormValid = ref(false) // 表单是否验证通过
const ruleFormRef = ref<FormInstance>()

function handleInput() {
  // 每次输入时验证表单
  if (ruleFormRef.value) {
    ruleFormRef.value.validate((valid: boolean) => {
      isFormValid.value = valid; // 根据验证结果控制按钮是否可用
    });
  }
}

const rules = {
  type: [
    { required: true, message: '请选择分类', trigger: 'blur' }
  ],
  desc: [
    { required: true, message: '请填写求购描述', trigger: 'blur' }
  ]
}

var uploadUrl = import.meta.env.VITE_IMAGE_URL + "/file/upload"
</script>

<template>
  <div class="my-content">
    <div class="main-content">
      <el-form :model="form" label-width="auto" style="max-width: 100%" :rules="rules" ref="ruleFormRef"
        @input="handleInput">
        <el-form-item label="分类" prop="type">
          <el-radio-group v-model="form.type" :disabled="isDisabled">
            <el-radio v-for="(item, index) in typeList" :key="index" :value="item.id">{{
              item.name
            }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="求购描述" prop="desc">
          <el-input v-model="form.desc" type="textarea" rows=10 />
        </el-form-item>

        <el-form-item label="上传图片">
          <el-upload :action="uploadUrl" :headers="headers" v-model:file-list="fileList" list-type="picture-card"
            :on-preview="handlePictureCardPreview" :on-remove="handleRemove" :before-upload="handleBeforeUpload">
            <el-icon>
              <Plus />
            </el-icon>
          </el-upload>
          <el-dialog v-model="dialogVisible">
            <img w-full :src="dialogImageUrl" alt="Preview Image" />
          </el-dialog>
        </el-form-item>

        <el-form-item>
          <el-button @click="onCancel">取消</el-button>
          <el-button @click="onSubmit" :disabled="!isFormValid">发布</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="right-content">
      <el-card style="max-width: 100%; margin-top: 10px">
        <span>发布求购信息时，建议提供详细的物品名称、数量、单价、联系方式等信息，以便卖家更快的与您联系。</span>
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
</style>
