<template>
        <div class="line-block">
            <ascii-line :character="options.charset" />
        </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import asciiLine from "./../../ascii-line.vue"
export type LineBlock = {
    blockType: "line"
    size: number
    id: string
    charset: string
}

export default defineComponent ({
    name: "lineBlock", 
    components: { asciiLine },
    props: {
        options: {
            type: Object as PropType<LineBlock>,
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
        }
    }
})

</script>

<style lang="scss">

.Line-block {
    width: 100%;
    line-height: 1;
}

</style>