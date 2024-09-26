import { reactive, ref } from 'vue'

export const user = reactive({
    userId: localStorage.getItem('userId'),
    accountName: localStorage.getItem('accountName'),
    headImage: localStorage.getItem('headImage'),
    token: localStorage.getItem('token'),
    inviteCode: localStorage.getItem('inviteCode'),
    point: 0
})

export const isLogin = ref(false);
export const inviteCode = ref('');