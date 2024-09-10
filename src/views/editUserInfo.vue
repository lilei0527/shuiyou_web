<template>
  <div class="my-content">
    <div class="main-content">
      <div class="user-info-form">
        <el-form ref="ruleFormRef" :model="user" label-width="100px" :rules="rules" @input="handleInput"> 
          <!-- 用户头像 -->
          <el-form-item label="用户头像" prop="headImage">
            <el-upload
              class="avatar-uploader"
              action="http://123.60.87.243:8080/file/upload"
              :headers="headers"
              name="file"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
            >
              <img v-if="user.headImage !== ''" :src="user.headImage" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>

          <!-- 用户名 -->
          <el-form-item style="width: 50%" label="用户名" prop="accountName">
            <el-input v-model="user.accountName"></el-input>
          </el-form-item>

          <!-- 用户密码 -->
          <el-form-item style="width: 50%" label="新密码" prop="password">
            <el-input v-model="user.password" type="password"></el-input>
          </el-form-item>

          <el-form-item style="width: 50%" label="确认密码">
            <el-input v-model="user.confirmPassword" type="password"></el-input>
          </el-form-item>

          <!-- 保存按钮 -->
          <el-form-item>
            <el-button  @click="submitForm" :disabled="!isFormValid">保存</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="right-content">
        <el-card style="max-width: 100%; margin-top: 10px">
          <span>请上传头像，大小不超过2MB<br>请填写用户名，长度在2到8个字符<br>请填写密码，长度在6到16个字符(不修改密码请留空)</span>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, UploadProps } from 'element-plus'
import { user as globalUser } from '../stores/global'
import axios from '@/axios'; // 导入配置好的 axios 实例
const handleAvatarSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
//   user.headImage = URL.createObjectURL(uploadFile.raw!)
  user.headImage = response.data
}

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('Avatar picture size can not exceed 2MB!')
    return false
  }
  return true
}

function submitForm() {
  //两次密码是否一致
  if (user.password !== user.confirmPassword) {
    ElMessage.error('两次密码不一致')
    return
  }

  axios.post('/user/updateUserInfo', user).then((res) => {
    if (res.data.code === 200) {
      localStorage.setItem('accountName', user.accountName || '')
      localStorage.setItem('headImage', user.headImage || '')
      globalUser.accountName = user.accountName
      globalUser.headImage = user.headImage
    //   user.headImage = res.data.data
      ElMessage.success('修改成功')
    } else {
      ElMessage.error(res.data.msg)
    }
  })
}

const isFormValid = ref(false) // 表单是否验证通过
const ruleFormRef = ref<FormInstance>()


const user = reactive({
  headImage: globalUser.headImage, // 用户头像
  accountName: globalUser.accountName, // 用户名
  password: '', // 新密码
  confirmPassword: '' // 新密码
})

const headers = {
  Authorization: localStorage.getItem('token')
}

const rules = {
  headImage: [{ required: true, message: '请上传头像', trigger: 'blur' }
  ],
  accountName: [{ required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
  ],
  password: [{ validator: validatePassword, trigger: 'blur' }]
}


function validatePassword(rule: any, value: string, callback: any) {
  if (value.length !== 0 && value.length < 6) {
    callback(new Error('密码长度不能小于6位'))
  }else if(value.length>16){
    callback(new Error('密码长度不能大于16位'))
  } else {
    callback()
  }
}

function handleInput() {
  // 每次输入时验证表单
  if (ruleFormRef.value) {
    ruleFormRef.value.validate((valid: boolean) => {
      isFormValid.value = valid; // 根据验证结果控制按钮是否可用
    });
  }
}

</script>

<style scoped="sass">
.avatar-uploader {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 0;
  overflow: hidden;
  position: relative;
  cursor: pointer;
}

.avatar {
  width: 100%;
  height: 100%;
  display: block;
}

.avatar-uploader-icon {
  font-size: 40px;
  color: #8c939d;
  /* line-height: 100px; */
}

.el-form-item {
  margin-bottom: 30px; /* 增大间距为 30px，可以根据需求调整 */
}
</style>
