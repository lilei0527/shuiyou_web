<script setup lang="ts">
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { reactive, ref } from 'vue'


const visible = defineModel<boolean>()


function cancel() {
    visible}

function register() {
    axios.post('http://localhost:8081/user/login', form).then((response) => {
        if (response.data.code != 200) {
            ElMessage.error(response.data.message);
            return;
        } else if (response.data.code == 200) {
            let token = response.data.data;
            localStorage.setItem('token', token);
            visible.value = false;
        }
    })
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
    <el-dialog v-model="visible" title="注册" center width="400" close-on-press-escape @cancel="cancel" @closed="reset">
        <div class="dialog-content">
            <el-form :model="form" label-width="auto" style="max-width: 600px">
                <el-form-item label="邮箱">
                    <el-input v-model="form.account" />
                </el-form-item>
                <el-form-item label="验证码">
                    <el-input v-model="form.password" />
                </el-form-item>
                <el-form-item label="密码">
                    <el-input v-model="form.password" />
                </el-form-item>
                <el-form-item label="确认密码">
                    <el-input v-model="form.password" />
                </el-form-item>
            </el-form>
        </div>

        <template #footer>
            <div class="text-center">
                <el-button @click="cancel">
                    取消
                </el-button>

                <el-button type="primary" @click="register">
                    注册
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style scoped lang="scss">
.dialog-content {
    .calculator-content {
        .input-box {
            height: 80px;
            border: 1px solid #e6e6e6;
            margin-top: 20px;
            border-radius: 5px;
            padding: 5px;
            overflow: hidden;
        }

        .calculator-show {
            width: 100%;
            display: flex;
            justify-content: space-between;
            gap: 20px;
            overflow: hidden;
            margin-top: 20px;

            .attributeShow {
                width: 65%;
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                grid-template-rows: repeat(auto-fill, 40px);
                gap: 10px;

                .item-block {
                    width: 100%;
                    border: 1px solid #e6e6e6;
                    border-radius: 5px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                }
            }
        }
    }
}
</style>
