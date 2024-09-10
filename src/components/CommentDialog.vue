<script setup lang="ts">
import axios from '@/axios';
import { onBeforeUnmount, ref, shallowRef } from 'vue';
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import Compressor from 'compressorjs'
import { ElMessage } from 'element-plus';


const editorRef = shallowRef()
const valueHtml = ref('')
const editor = editorRef.value

onBeforeUnmount(() => {
    if (editor == null) return
    editor.destroy()
})

const handleCreated = (editor: any) => {
    editorRef.value = editor // 记录 editor 实例，重要！
}
const handleChange = (editor: { getHtml: () => any }) => {
    valueHtml.value = editor.getHtml()
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

var uploadUrl = import.meta.env.BASE_URL+"/file/upload"

const editorConfig = {
    placeholder: '请输入内容...',
    MENU_CONF: {
        uploadImage: {
            maxFileSize: 2 * 1024 * 1024,
            server: uploadUrl, // 上传图片的服务器地址
            fieldName: 'file', // 上传图片的字段名
            headers: {
                Authorization: localStorage.getItem('token')
            },
            // eslint-disable-next-line no-unused-vars
            customInsert(
                res: { code: number; data: String; message: any },
                // eslint-disable-next-line no-unused-vars
                insertFn: (arg0: any) => void
            ) {
                // 检查返回的 code 是否为 200
                if (res.code === 200) {
                    // 从返回的数据中获取图片 URL
                    const url = res.data
                    // 调用 wangEditor 提供的 insertFn，将图片插入到编辑器中
                    insertFn(url)
                } else {
                    console.error('图片上传失败：', res.message)
                }
            },
            // 图片上传之前的处理：压缩
            onBeforeUpload(file: File) {
                new Compressor(file, {
                    quality: 0.6, // 图片压缩质量，0 - 1 之间的值，值越小质量越低，文件越小
                    success(result) {
                        // result 是压缩后的 Blob 对象
                        console.log('压缩成功: ', result)
                        const compressedFile = new File([result], file.name, {
                            type: result.type
                        })
                        // 在这里处理压缩后的 Blob，比如上传到服务器
                        return compressedFile
                    },
                    error(err) {
                        // 处理压缩过程中出现的错误
                        console.error('压缩失败: ', err)
                    }
                })
                // return file;
            }
        }
    }
}


interface Comment {
    id: number
    mindId: number
    commentId: number
    fromUserId: number
    fromUserName: string
    fromUserHeadImage: string
    toUserId: number
    toUserName: string
    toUserHeadImage: string
    content: string
    createTime: string
    childComments: Array<Comment>
}
const commentDialogVisible = defineModel<boolean>('commentDialogVisible')
const commentList = defineModel<Array<Comment>>('commentList')
const mind = defineModel<any>('mind')

const props = defineProps<{
    mindId: number,
    toUserId: number
    commentId: number | null
}>()


//提交评论
const submitComment = () => {
    //是否输入内容
    if (valueHtml.value.trim() == '<p><br></p>') {
        ElMessage.error("请输入回复内容")
        return
    }

    //清空输入框
    valueHtml.value = ''

    var commentId;
    if (props.commentId == 0) {
        commentId = null
    } else {
        commentId = props.commentId;
    }

    // 发送请求
    var response = axios.post('/comment', {
        content: valueHtml.value,
        mindId: props.mindId,
        toUserId: props.toUserId,
        commentId: commentId
    })

    response.then(function (response) {
        commentDialogVisible.value = false
        if (commentList.value) {
            if (props.commentId == 0) {
                //评论帖子
                response.data.data.childComments = []
                commentList.value.unshift(response.data.data)
            } else {
                for (let i = 0; i < commentList.value.length; i++) {
                    //回复评论
                    if (commentList.value[i].id === props.commentId) {
                        commentList.value[i].childComments.push(response.data.data)
                        break
                    }
                }
            }
        }

        if (mind.value) {
            if (mind.value.commentNum === null) {
                mind.value.commentNum = 0
            }
            mind.value.commentNum += 1
        }
    }).catch(function (error) {
        console.log(error)
    })
}
</script>

<template>
    <el-dialog v-model="commentDialogVisible" title="评论" width="800px" center>
        <Toolbar :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode"
            style="border-bottom: 1px solid #ccc" />
        <Editor :defaultConfig="editorConfig" :mode="mode" v-model="valueHtml" style="height: 500px; overflow-y: hidden"
            @onCreated="handleCreated" @onChange="handleChange" @onDestroyed="handleDestroyed" @onFocus="handleFocus"
            @onBlur="handleBlur" @customAlert="customAlert" @customPaste="customPaste" />
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="commentDialogVisible = false">取消</el-button>
                <el-button @click="submitComment">提交</el-button>
            </div>
        </template>
    </el-dialog>
</template>
<style scoped lang="scss"></style>
