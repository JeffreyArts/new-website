<template>
        <h4 class="glitch-block" :style="fontSize ? `font-size: ${fontSize}vw` : ''">
            <Glitch :inputs="glitchValues" :options="glitchOptions"/>
        </h4>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import Glitch from "./../../glitch.vue"
export type GlitchBlock = {
    blockType: "glitch"
    size: number
    id: string
    hover: undefined | boolean
    repeat: undefined | boolean
    duration: number
    fontSize?: number
    delay: number
    values: Array<{
        id: string
        text: string
        url?: string
    }>
}

export default defineComponent ({
    name: "glitchBlock", 
    components: { Glitch },
    props: {
        options: {
            type: Object as PropType<GlitchBlock>,
            required: true
        },
    },
    data() {
        return {
            glitchValues: [] as string[],
            fontSize: 0,
            glitchOptions: {
                hover: false,
                repeat: 0,
                duration: 1000,
                delay: 500
            },
        }
    },
    computed: {

    },
    watch:{
        "options": {
            handler(val) {
                if (!val) {
                    return
                }

                if (val.hover) {
                    this.glitchOptions.hover = !!val.boolean
                }
                if (val.repeat) {
                    this.glitchOptions.repeat = !!val.boolean ? 0 : 100000
                }
                if (val.duration) {
                    this.glitchOptions.duration = val.duration * 1000
                }
                if (val.delay) {
                    this.glitchOptions.delay = val.delay * 1000
                }
                if (val.values) {
                    this.glitchValues = val.values.map((d: { text: string }) => d.text)
                }
                if (val.fontSize) {
                    this.fontSize = val.fontSize
                }
            },
            deep: true,
            immediate: true
        }
    },
    mounted() {
        if (typeof window === "undefined") {
            return
        }
        
        setTimeout(() => {
            this.$emit("blockLoaded")
        })
    }
})

</script>

<style lang="scss">
@import "./../../../assets/scss/variables.scss";

.glitch-block {
    display: flex;
    justify-content: center;
    align-items: center;
    word-wrap: break-word;
    padding: 0px 20%;
    font-size: 32px;
    line-height: 1;
    font-family: $accentFont;
}

</style>