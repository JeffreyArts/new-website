<template>
        <div class="title-block">
            <h1 title="options.text" ref="title">
                {{options.text}}
            </h1>
        </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"

export type TitleBlock = {
    size: number
    id: string
    rows: number
    maxSize: number
    text: string
    blockType: "title"
}

export default defineComponent ({
    name: "titleBlock", 
    props: {
        options: {
            type: Object as PropType<TitleBlock>,
            required: true
        },
    },
    data() {
        return {
            rows: 1,
            fontSize: 24,
        }
    },
    computed: {
    },
    watch:{
        "options.text": {
            handler() {
                
            },
            immediate: true
        }
    },
    mounted() {
        if (typeof window === "undefined") {
            return
        }
        this.rows = this.options.rows
        
        setTimeout(() => {
            this.setLines()
        })
        this.$emit("blockLoaded", this.$el.clientWidth / this.$el.clientHeight)
        window.addEventListener("layoutChange", this.onResize)
    },
    unmounted() {
        window.removeEventListener("layoutChange", this.onResize)
        //
    },
    methods: {
        onResize(){
            this.setLines()
        },
        setLines(){
            const domElement = this.$refs["title"] as HTMLElement
            if (!domElement) {
                return
            }

            if (!this.rows) {
                this.rows = 1
            }
            
            let originHeight = null
            if (domElement.style.height) {
                originHeight = domElement.style.height
            }

            const defaultStyles = {
                lineHeight: domElement.style.lineHeight,
                display: domElement.style.display,
                padding: domElement.style.padding,
                height: domElement.style.height,
                wordWrap: domElement.style.wordWrap
            }
            //  as {
            //     lineHeight?: string 
            //     display?: string 
            //     padding?: string 
            //     height?: string 
            //     wordWrap?: string 
            // }


            domElement.style.lineHeight = "1"
            domElement.style.display = "inline-block"
            domElement.style.padding = "0"
            domElement.style.height = "auto"
            domElement.style.wordWrap = "break-word"

            let height = 1
            let done = false
            domElement.style.fontSize = "1px"
            while (!done) {
                domElement.style.fontSize = height + "px"
                
                done = Math.floor(domElement.clientHeight/height) > this.rows
                
                if (typeof this.options.maxSize === "number" && this.options.maxSize >= height) {
                    done = true
                }
                
                height++
                if (height > 512) {
                    // safety feature
                    done = true
                }
            }

            domElement.style.fontSize = height - 2 + "px"
            
            this.fontSize = parseInt(domElement.style.fontSize, 10)

            domElement.style.lineHeight = defaultStyles.lineHeight
            domElement.style.height = defaultStyles.height
            domElement.style.display = defaultStyles.display
            domElement.style.padding = defaultStyles.padding
            domElement.style.wordWrap = defaultStyles.wordWrap

            if (originHeight != null) {
                domElement.style.height = originHeight
            }
        }
    }
})

</script>

<style lang="scss">

.title-block {
    display: flex;
    justify-content: center;
    align-items: center;
    aspect-ratio: 6/4;
    word-wrap: break-word;
    padding: 0px 20%;

    h1 {
        font-weight: 240;
        font-stretch: 80%;
        font-size: 24px;
        width: 100%;
        margin: 0;
    }    
}

</style>