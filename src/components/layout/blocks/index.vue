<template>
    <div class="block" :block-size="size">
        <TitleBlock @blockLoaded="blockLoaded" :options="data" v-if="data.blockType === 'title'"/>
        <YearBlock @blockLoaded="blockLoaded" :options="data" v-if="data.blockType === 'year'"/>
        <NoteBlock @blockLoaded="blockLoaded" :options="data" v-if="data.blockType === 'note'"/>
        <IframeBlock @blockLoaded="blockLoaded" :options="data" v-if="data.blockType === 'iframe'"/>
        <ImageBlock @blockLoaded="blockLoaded" :options="data" v-if="data.blockType === 'image'"/>
        <LineBlock @blockLoaded="blockLoaded" :options="data" v-if="data.blockType === 'line'"/>
        <BannerBlock @blockLoaded="blockLoaded" :options="data" v-if="data.blockType === 'banner'"/>
        <GlitchBlock @blockLoaded="blockLoaded" :options="data" v-if="data.blockType === 'glitch'"/>
        <NewsletterBlock @blockLoaded="blockLoaded" :options="data" v-if="data.blockType === 'newsletter'"/>
        <TextBlock @blockLoaded="blockLoaded" :options="data" v-if="data.blockType === 'text'"/>
        <YoutubeBlock @blockLoaded="blockLoaded" :options="data" v-if="data.blockType === 'youtube'"/>
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
import LineBlock from "./line.vue"
import NoteBlock from "./note.vue"
import TextBlock from "./text.vue"
import TitleBlock from "./title.vue"
import NewsletterBlock from "./newsletter.vue"
import YoutubeBlock from "./youtube.vue"
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
        LineBlock,
        NewsletterBlock,
        NoteBlock,
        TextBlock,
        TitleBlock,
        YearBlock,
        YoutubeBlock,
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

    // Display blockType for dev purposes
    // > *:after {
    //     content: attr(data-blocktype);
    //     position: absolute;
    //     top: 8px;
    //     background-color: var(--contrast-color);
    //     color: var(--bg-color);
    //     padding: 4px 8px;
    //     left: 12px;
    //     opacity: 0.7;
    // }
}

</style>