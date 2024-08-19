<template>
        <div class="title-block">
            <h1 :title="options.text" ref="title">
                <dynamicFontSize :rows="options.rows" :maxSize="options.maxSize">{{options.text}}</dynamicFontSize>
            </h1>
        </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import dynamicFontSize from "./../../dynamic-font-size.vue"
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
    components: { dynamicFontSize },
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
            this.$emit("blockLoaded", this.$el.clientWidth / this.$el.clientHeight)
        })
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