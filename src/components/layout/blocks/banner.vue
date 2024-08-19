<template>
    <figure class="banner-block" :title="options.description">
        <a :href="options.link" v-if="options.link" @mouseenter="onMouseEnterEvent" @mouseleave="onMouseLeaveEvent">
            <img :src="src" :alt="options.description" ref="image"/>
        </a>

        <span v-if="!options.link">
            <img :src="src" :alt="options.description" ref="image"/>
        </span>
    </figure>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import gsap from "gsap"

export type BannerBlock = {
    size: number
    id: string
    link: string
    description: string
    source: {
        sizes: {
            banner: {
                width: number
                height: number
                url: string
            }
        }
    }
    blockType: "image"
}

export default defineComponent ({
    name: "bannerBlock",
    components: {
    }, 
    props: {
        options: {
            type: Object as PropType<BannerBlock>,
            required: true,
        },
    },
    data: function() {
        return {
            hoverEvent: undefined as undefined | gsap.core.Tween
        }
    },
    computed: {
        src() {
            let src = import.meta.env.VITE_PAYLOAD_REST_ENDPOINT.replace("/api","")
            if (!this.options.source) {
                // add placeholder image
            }
            // src += this.options.source.sizes.thumbnail.url
            return src
        }
    },
    mounted() {
        if (typeof window === "undefined") {
            return
        }
        
        const img = this.$refs["image"] as HTMLImageElement
        this.$emit("blockLoaded", this.$el.clientWidth / this.$el.clientHeight)
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
    methods: {
        onMouseEnterEvent(e:Event) {
            const target = e.target as HTMLElement
            if (!target) {
                return
            }
            
            const img = target.querySelector("img") 
            if (!img) {
                return
            }

            if (this.hoverEvent) {
                gsap.killTweensOf(this.hoverEvent)
            }

            this.hoverEvent = gsap.to(img, {
                scale: 1.16,
                boxShadow: `0 0 ${img.clientWidth/16}px rgba(0,0,0,.4)`,
                duration: .8,
                ease: "bounce.out"
            })
        },
        onMouseLeaveEvent(e:Event) {
            const target = e.target as HTMLElement
            if (!target) {
                return
            }
            
            const img = target.querySelector("img") 
            if (!img) {
                return
            }

            if (this.hoverEvent) {
                gsap.killTweensOf(this.hoverEvent)
            }

            this.hoverEvent = gsap.to(img, {
                scale: 1,
                boxShadow: "0 0 0px rgba(0,0,0,0)",
                duration: .48,
                ease: "bounce.out"
            })
        }
    }
})


</script>

<style lang="scss">
@import "./../../../assets/scss/variables.scss";
.banner-block {
    aspect-ratio: 1/4;
    margin: 0;
    
    img {
        width: 100%;
        object-fit: cover;
    }
}

</style>