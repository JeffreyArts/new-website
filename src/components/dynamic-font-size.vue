<template>
        <span class="dynamic-font-size">
            <slot />
        </span>
</template>

<script lang="ts">
import { defineComponent, } from "vue"

export default defineComponent ({
    name: "dynamicFontSize", 
    props: {
        maxRows: {
            type: Number,
            required: false
        },
        maxSize: {
            type: Number,
            required: false
        },
    },
    data() {
        return {
            rows: 1,
            fontSize: 24,
        }
    },
    watch:{
        "maxRows": {
            handler() {
                if (this.maxRows) {
                    this.rows = this.maxRows
                    // setTimeout(() => {
                        this.setLines()
                    // })
                }
            },
            immediate: true
        },
        "maxSize": {
            handler() {
                this.setLines()
            },
            immediate: true
        },
    },
    mounted() {
        if (typeof window === "undefined") {
            return
        }
        window.addEventListener("layoutChange", this.setLines)
    },
    unmounted() {
        window.removeEventListener("layoutChange", this.setLines)
    },
    methods: {
        setLines(){
            const domElement = this.$el as HTMLElement

            if (!domElement) {
                return
            }

            if (!this.rows) {
                this.rows = 1
            }
            
            let originHeight = 0
            if (domElement.style.height) {
                originHeight = parseInt(domElement.style.height)
            }

            const defaultStyles = {
                lineHeight: domElement.style.lineHeight,
                display: domElement.style.display,
                padding: domElement.style.padding,
                height: domElement.style.height,
                wordWrap: domElement.style.wordWrap
            }

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
                
                if ((typeof this.maxSize === "number" && this.maxSize <= height)) {
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

            if (originHeight != 0) {
                domElement.style.height = `${originHeight}px`
            }
        }
    }
})

</script>
<style scoped>
.dynamic-font-size {
    display: inline-block;
    width: 100%;
}
</style>