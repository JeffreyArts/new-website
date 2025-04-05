<template>
        <div class="title-block">
            <h1 :title="options.text" ref="title">
                <dynamicFontSize :maxRows="options.rows" :maxSize="options.maxSize">{{options.text}}</dynamicFontSize>
            </h1>
        </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import dynamicFontSize from "./../../dynamic-font-size.vue"
export type TitleBlock = {
    blockType: "title"
    size: number
    id: string
    rows: number
    maxSize: number
    text: string
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
    watch: {
        "options": {
            handler() {
                this.$emit("blockLoaded")
            },
            deep: true,
            immediate: true
        }
    },
    data() {
        return {
            fontSize: 24,
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
    padding: 0px 16%;

    h1 {
        font-weight: 240;
        font-stretch: 80%;
        font-size: 24px;
        width: 100%;
        margin: 0;
    }    
}

</style>