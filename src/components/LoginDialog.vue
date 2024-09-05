<script setup lang="ts">
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { vi } from 'element-plus/es/locales.mjs';
import { reactive, ref } from 'vue'



const visible = defineModel<boolean>('visible')
const type = defineModel<number>('type')

function cancel() {
    visible.value = false;
}

function login() {
    axios.post('http://localhost:8081/user/login', form).then((response) => {
        if (response.data.code != 200) {
            ElMessage.error(response.data.message);
            return;
        } else if (response.data.code == 200) {
            let token = response.data.data;
            localStorage.setItem('token', token);
            visible.value = true;
        }
    })
}

function onRegisterClick() {
    visible.value = false;
}

function reset() {
    visible.value = false;
}

const form = reactive({
    account: '',
    password: ''
})
</script>

<template>
    <el-dialog v-model="visible" title="登录" center width="300" close-on-press-escape @cancel="cancel" @closed="reset">
        <el-form :model="form" label-width="auto" style="max-width: 600px">
            <el-form-item label="邮箱">
                <el-input v-model="form.account" />
            </el-form-item>
            <el-form-item label="密码">
                <el-input v-model="form.password" />
            </el-form-item>
            <div class="register-link">
                <span>没有账号?</span><span class="to-register" @click="onRegisterClick">去注册</span>
            </div>
        </el-form>

        <template #footer>
            <div class="text-center">
                <el-button @click="cancel">
                    取消
                </el-button>

                <el-button type="primary" @click="login">
                    登录
                </el-button>
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
