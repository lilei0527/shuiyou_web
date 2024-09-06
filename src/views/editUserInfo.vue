<template>
    <div class="profile">
        <h1>修改个人信息</h1>
        <form @submit.prevent="updateProfile">
            <div>
                <label for="username">用户名：</label>
                <input type="text" id="username" v-model="user.username" />
            </div>
            <div>
                <label for="avatar">头像：</label>
                <input type="file" id="avatar" @change="onAvatarChange" />
                <img v-if="user.avatar" :src="user.avatar" alt="头像预览" />
            </div>
            <div>
                <label for="password">密码：</label>
                <input type="password" id="password" v-model="user.password" />
            </div>
            <button type="submit">提交</button>
        </form>
    </div>
</template>

<script>
export default {
    data() {
        return {
            user: {
                username: '',
                avatar: '',
                password: '',
            },
        };
    },
    methods: {
        onAvatarChange(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.user.avatar = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        },
        updateProfile() {
            // 在这里处理更新用户信息的逻辑，例如发送请求到后端API
            console.log('更新的用户信息：', this.user);
        },
    },
};
</script>

<style scoped>
.profile {
    width: 300px;
    margin: 0 auto;
}

form {
    display: flex;
    flex-direction: column;
}

div {
    margin-bottom: 10px;
}
</style>