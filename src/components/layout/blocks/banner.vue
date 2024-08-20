<template>
    <figure class="banner-block" :title="options.description">
        <a class="banner-block-image-container" :href="options.link" v-if="options.link" @mouseenter="onMouseEnterEvent" @mouseleave="onMouseLeaveEvent">
            <img :src="src" :alt="options.description" ref="image"/>
        </a>
        <span class="banner-block-image-container" v-if="!options.link">
            <img :src="src" :alt="options.description" ref="image"/>
        </span>

        <div class="banner-block-title">
            <dynamicFontSize :maxSize="maxFontSize" rows="1">
                {{ options.title }}
            </dynamicFontSize>
        </div>
    </figure>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import dynamicFontSize from "./../../dynamic-font-size.vue"
import gsap from "gsap"

export type BannerBlock = {
    blockType: "banner"
    size: number
    id: string
    link: string
    title: string
    description: string
    image: {
        width: number
        height: number
        filename: string
        mimeType: string
        title: string
        description: string
        sizes: {
            banner_sm: {
                width: number
                height: number
                url: string
            }
            banner_md: {
                width: number
                height: number
                url: string
            }
            banner_lg: {
                width: number
                height: number
                url: string
            }
        }
    }
}

export default defineComponent ({
    name: "bannerBlock",
    components: { dynamicFontSize }, 
    props: {
        options: {
            type: Object as PropType<BannerBlock>,
            required: true,
        },
    },
    data: function() {
        return {
            hoverEvent: undefined as undefined | gsap.core.Tween,
            maxFontSize: 24,
            imageSize: "banner_sm" as "banner_sm" | "banner_md" | "banner_lg"
        }
    },
    computed: {
        src() {
            let src = import.meta.env.VITE_PAYLOAD_REST_ENDPOINT.replace("/api","")
            src += this.options.image.sizes[this.imageSize].url
            return src
        }
    },
    mounted() {
        if (typeof window === "undefined") {
            return
        }
        
        const img = this.$refs["image"] as HTMLImageElement
        if (!img) {
            this.$emit("blockLoaded")
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
            this.$emit("blockLoaded")
        }).catch(() => {
            this.$emit("blockLoaded")
        })

        window.addEventListener("layoutChange", this.updateLayoutChange)
    },
    unmounted() {
        window.removeEventListener("layoutChange", this.updateLayoutChange)
    },
    methods: {
        updateLayoutChange(e:Event) {

            // Update font-size
            if (this.$el) {
                this.maxFontSize = this.$el.clientHeight - 20
            }
            const width = this.$el.clientWidth
            if (width <= 320) {
                return this.imageSize = "banner_sm"
            }

            if (width <= 800) {
                return this.imageSize = "banner_md"
            }

            if (width > 800) {
                return this.imageSize = "banner_lg"
            }
        },
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
    aspect-ratio: 4/1;
    position: relative;
    margin: 0;
    padding: 0;
    overflow: hidden;

    a:hover,
    a:focus {
        img {
            filter: blur(32px);
        }

        + .banner-block-title {
            scale: 1.08;
        }
    }
    
    img {
        width: 100%;
        object-fit: cover;
        opacity: 0.8;
        transition: $transitionDefault;
    }
}
.banner-block-image-container {
    width: 100%;
    height: 100%;
    display: block;
    background-color: #000;
}

.banner-block-title {
    pointer-events: none;
    font-family: $accentFont;
    color: #fff;
    text-shadow: 0 0 2px rgba(0,0,0,.32);
    text-align: center;
    inset: 0;
    position: absolute;
    display: flex;
    justify-content: center;
    padding-left: 20%;
    padding-right: 20%;
    align-items: center;
    transition: $transitionDefault;
}

</style>