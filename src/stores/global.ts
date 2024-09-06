import { reactive } from 'vue'

export const user = reactive({
    username: localStorage.getItem('accountName'),
    headImage: localStorage.getItem('headImage'),
})