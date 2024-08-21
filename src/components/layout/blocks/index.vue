<template>
    <div class="block" :block-size="size">
        <TitleBlock @blockLoaded="blockLoaded" :options="data" v-if="data.blockType === 'title'"/>
        <YearBlock @blockLoaded="blockLoaded" :options="data" v-if="data.blockType === 'year'"/>
        <NoteBlock @blockLoaded="blockLoaded" :options="data" v-if="data.blockType === 'note'"/>
        <IframeBlock @blockLoaded="blockLoaded" :options="data" v-if="data.blockType === 'iframe'"/>
        <ImageBlock @blockLoaded="blockLoaded" :options="data" v-if="data.blockType === 'image'"/>
        <BannerBlock @blockLoaded="blockLoaded" :options="data" v-if="data.blockType === 'banner'"/>
        <GlitchBlock @blockLoaded="blockLoaded" :options="data" v-if="data.blockType === 'glitch'"/>
        <CodeBlock @blockLoaded="blockLoaded" :options="data" v-if="data.blockType === 'code'"/>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import BannerBlock from "./banner.vue"
import CodeBlock from "./code.vue"
import GlitchBlock from "./glitch.vue"
import IframeBlock from "./iframe.vue"
import ImageBlock from "./image.vue"
import NoteBlock from "./note.vue"
import TitleBlock from "./title.vue"
import YearBlock from "./year.vue"
import { BlockType } from "@/components/layout/layout-types"

export default defineComponent ({
    name: "blockComponent", 
    components: { 
        BannerBlock,
        CodeBlock,
        GlitchBlock,
        IframeBlock,
        ImageBlock,
        NoteBlock,
        TitleBlock,
        YearBlock,
    },
    props: {
        data: {
            type: Object as PropType<BlockType["data"]>,
            required: true
        },
        size: {
            type: Number,
            required: true
        },
    },
    data() {
        return {
        
        }
    },
    computed: {
    },
    mounted() {
        if (typeof window === "undefined") {
            return
        }
    },
    unmounted() {
    //
    },
    methods: {
        blockLoaded() {
            this.$emit("blockLoaded")
        }
    }
})

</script>

<style lang="scss">

.block {
    padding: 20px;
    
    &.__isFixed {
        position: absolute;
    } 
}

</style>