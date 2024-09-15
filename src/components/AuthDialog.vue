<script setup lang="ts">
import axios from '@/axios'
import { ElMessage, type FormInstance } from 'element-plus'
import { reactive, ref } from 'vue'
import { user } from '../stores/global' 



const isLoginDialogVisible = defineModel<boolean>('isLoginDialogVisible')
const isRegisterDialogVisible = defineModel<boolean>('isRegisterDialogVisible')

function login() {
  axios.post('/user/login', loginForm).then((response) => {
    if (response.data.code != 200) {
      ElMessage.error(response.data.message)
      return
    } else if (response.data.code == 200) {
      var userData = response.data.data
      localStorage.setItem('token', userData.token)
      localStorage.setItem('accountName',userData.accountName)
      localStorage.setItem('headImage',userData.headImage)
      localStorage.setItem('userId',userData.userId)
      user.accountName = userData.accountName
      user.headImage = userData.headImage
      user.token = userData.token
      user.userId = userData.userId
      isLoginDialogVisible.value = false
    }
  })
}

function register() {
  //两次密码输入是否一致
  if (registerForm.password != registerForm.confirmPassword) {
    ElMessage.error('两次密码输入不一致')
    return
  }

  axios.post('/user/register', registerForm).then((response) => {
    if (response.data.code != 200) {
      ElMessage.error(response.data.message)
      return
    } else if (response.data.code == 200) {
      isRegisterDialogVisible.value = false
      isLoginDialogVisible.value = true
    }
  })
}

function onRegisterClick() {
  isLoginDialogVisible.value = false
  isRegisterDialogVisible.value = true
}

function loginReset() {
  loginForm.account = ''
  loginForm.password = ''
  isLoginDialogVisible.value = false
}

function registerReset() {
  registerForm.account = ''
  registerForm.code = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''
  isRegisterDialogVisible.value = false
}

function loginCancel() {
  loginReset()
}

function registerCancel() {
  registerReset()
}

const loginForm = reactive({
  account: '',
  password: ''
})

const registerForm = reactive({
  account: '',
  code: '',
  password: '',
  confirmPassword: ''
})

const isRegisterFormValid = ref(false) // 表单是否验证通过
const redisterRuleFormRef = ref<FormInstance>()


const rules = {
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 5, max: 20, message: '账号长度在 6 到 16 个字符', trigger: 'blur' }
  ],

  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 16 个字符', trigger: 'blur' }
  ],
}

function handleInput() {
  // 每次输入时验证表单
  if (redisterRuleFormRef.value) {
    redisterRuleFormRef.value.validate((valid: boolean) => {
      isRegisterFormValid.value = valid; // 根据验证结果控制按钮是否可用
    });
  }
}
</script>

<template>
  <!-- 登录弹窗 -->
  <el-dialog
    v-model="isLoginDialogVisible"
    title="登录"
    center
    width="300"
    close-on-press-escape
    @cancel="loginCancel"
    @closed="loginReset"
  >
    <el-form :model="loginForm" label-width="auto" style="max-width: 600px">
      <el-form-item label="账号">
        <el-input v-model="loginForm.account" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="loginForm.password" type        ="password" />
      </el-form-item>
      <div class="register-link">
        <span>没有账号?</span><span class="to-register" @click="onRegisterClick">去注册</span>
      </div>
    </el-form>

    <template #footer>
      <div class="text-center">
        <el-button type="primary" @click="loginCancel"> 取消 </el-button>
        <el-button type="primary" @click="login"> 登录 </el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog
    v-model="isRegisterDialogVisible"
    title="注册"
    center
    width="400"
    close-on-press-escape
    @cancel="registerCancel"
    @closed="registerReset"
  >
    <div class="dialog-content">
      <el-form :model="registerForm" label-width="auto" style="max-width: 600px" :rules="rules" ref="redisterRuleFormRef" @input="handleInput">
        <el-form-item label="账号" style="width: 90%;" prop="account">
          <el-input v-model="registerForm.account" />
        </el-form-item>
        <el-form-item label="密码" style="width: 90%;" prop="password">
          <el-input v-model="registerForm.password" type="password" />
        </el-form-item>
        <el-form-item label="确认密码" style="width: 90%;">
          <el-input v-model="registerForm.confirmPassword" type="password"/>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="text-center">
        <el-button type="primary" @click="registerCancel"> 取消 </el-button>
        <el-button type="primary"  @click="register" :disabled="!isRegisterFormValid"> 注册 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.to-register {
  color: #f5cb2b;
  margin-left: 20px;
  cursor: pointer;
}

.register-link {
  display: flex;
  justify-content: center;
}
</style>
