<template>
    <div class="youtube-block">
        <iframe 
        :style="`aspect-ratio: ${aspectRatio};`"
        :src="options.url"
        frameborder="0" 
        allow="fullscreen" 
        allowfullscreen />
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"

export type YoutubeBlock = {
    blockType: "youtube"
    size: number
    id: string
    title: string
    url: string
    ratio: string
}

export default defineComponent ({
    name: "youtubeBlock",
    props: {
        options: {
            type: Object as PropType<YoutubeBlock>,
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
            aspectRatio: "4/3",
        }
    },
    mounted() {
        if (typeof window === "undefined") {
            return
        }
        this.setRatio()

        setTimeout(()=> {
            this.$emit("blockLoaded")
        })
    },
    methods: {
        setRatio() {
            if (this.options.ratio) {
                this.aspectRatio = this.options.ratio
            }
        }
    }
})

</script>

<style lang="scss">
@use "./../../../assets/scss/variables.scss";


.youtube-block {
    iframe {
        width: 100%;
    }
}
</style>