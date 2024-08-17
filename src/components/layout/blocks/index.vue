<template>
    <div class="block" :block-size="size" :id="`block-${data.id}`">
        <TitleBlock @blockLoaded="blockLoaded" :options="data" v-if="data.blockType === 'title'"/>
        <YearBlock @blockLoaded="blockLoaded" :options="data" v-if="data.blockType === 'year'"/>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
export type BlockData = object
import TitleBlock from "./title.vue"
import YearBlock from "./year.vue"

export type BlockType = {
    size: number
    data : TitleBlock | YearBlock
}

export default defineComponent ({
    name: "blockComponent", 
    components: { TitleBlock, YearBlock },
    props: {
        data: {
            type: Object as PropType<BlockData>,
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
    &.__isFixed {
        position: absolute;
    } 
}

</style>