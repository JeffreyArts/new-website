<template>
    <figure class="image-block" :style="`aspect-ratio:${ratio};`" :title="options.description">
        <a :href="options.link" v-if="options.link">
            <img :src="src" :alt="options.description" ref="image"/>
        </a>

        <span v-if="!options.link">
            <img :src="src" :alt="options.description" ref="image"/>
        </span>
    </figure>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"

export type ImageBlock = {
    size: number
    id: string
    link: string
    description: string
    source: {
        sizes: {
            thumbnail: {
                width: number
                height: number
                url: string
            }
        }
    }
    blockType: "image"
}

export default defineComponent ({
    name: "imageBlock",
    components: {
    }, 
    props: {
        options: {
            type: Object as PropType<ImageBlock>,
            required: true
        },
    },
    computed: {
        ratio() {
            if (this.options.source?.sizes?.thumbnail) {
                return this.options.source.sizes.thumbnail.width / this.options.source.sizes.thumbnail.width
                // add placeholder image
            }
            return  "undefined"
        },
        src() {
            let src = import.meta.env.VITE_PAYLOAD_REST_ENDPOINT.replace("/api","")
            if (!this.options.source) {
                // add placeholder image
            }
            src += this.options.source.sizes.thumbnail.url
            return src
            return `${this.options.source.sizes.thumbnail.url }`
        }
    },
    mounted() {
        if (typeof window === "undefined") {
            return
        }
        console.log(this.options)
        const img = this.$refs["image"] as HTMLImageElement
        if (!img) {
            this.$emit("blockLoaded", this.$el.clientWidth / this.$el.clientHeight)
        }
        
        new Promise<void>((resolve) => {
            if (img.complete) {
                resolve()
            } else {
                img.addEventListener("load", () => {
                    setTimeout(() => {
                        resolve()
                    })
                })
            }
        }).then(() => {
            this.$emit("blockLoaded", this.$el.clientWidth / this.$el.clientHeight)
        }).catch(() => {
            this.$emit("blockLoaded", this.$el.clientWidth / this.$el.clientHeight)
        })
    },
})


</script>

<style lang="scss">
@import "./../../../assets/scss/variables.scss";
.image-block {
    margin: 0;
    // aspect-ratio: 1/1;
    
    img {
        max-width: 100%;
        object-fit: cover;
    }
}

</style>