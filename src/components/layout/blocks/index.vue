<template>
    <div class="block" :block-size="size">
        <TitleBlock @blockLoaded="blockLoaded" :options="data" v-if="data.blockType === 'title'"/>
        <YearBlock @blockLoaded="blockLoaded" :options="data" v-if="data.blockType === 'year'"/>
        <NoteBlock @blockLoaded="blockLoaded" :options="data" v-if="data.blockType === 'note'"/>
        <ImageBlock @blockLoaded="blockLoaded" :options="data" v-if="data.blockType === 'image'"/>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import TitleBlock from "./title.vue"
import YearBlock from "./year.vue"
import NoteBlock from "./note.vue"
import ImageBlock from "./image.vue"
import { BlockType } from "@/components/layout/layout-types"

export default defineComponent ({
    name: "blockComponent", 
    components: { TitleBlock, YearBlock, NoteBlock, ImageBlock },
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
        blockLoaded(ratio:number) {
            this.$emit("blockLoaded", ratio)
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