<template>
    <div class="img-view" @click="getClose" :style="cssVar" v-show="ifImgShow">
        <div class="img-layer">
            <img :src="imgSrc" alt="图片地址错误" />
        </div>
    </div>
</template>

<script>

export default {
    props: {
        ifImgShow: {
            type: Boolean,
            default: false,
        },
        imgSrc: {
            type: String,
            default: '',
        },
        imgSite: {
            type: Object,
            default: () => {
                return {}
            },
        },
    },
    data() {
        return {
            H: 0,
            W: 0,
        }
    },
    computed: {
        cssVar({ H, W }) {
            const _site = {
                '$height': H,
                '$width': W,
            }
            return _site
        },
    },
    watch: {
        ifImgShow(val) {
            if (val) {
                const _H = document.body.offsetHeight ?? 0 //容器高度
                const _W = document.body.offsetWidth ?? 0 //容器宽度

                const V = _H / this.imgSite.height > _W / this.imgSite.width //容器和图片的宽高比，是否高比大于宽比

                this.H = V ? null : '90vh'
                this.W = V ? '90vw' : null
            }
        },
    },
    methods: {
        /**
         * @description: 关闭图片放大
         * @return void
         */
        getClose() {
            this.$emit('closeBigImg')
        },
    },
}
</script>
