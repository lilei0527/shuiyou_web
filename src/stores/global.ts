import { reactive, ref } from 'vue'

export const user = reactive({
    accountName: localStorage.getItem('accountName'),
    headImage: localStorage.getItem('headImage'),
    token: localStorage.getItem('token')
})

export const isLogin = ref(false);