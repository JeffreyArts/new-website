<template>
    <div>
        <figure class="image-block" :title="options.description">
            <a :href="link" v-if="link" @mouseenter="onMouseEnterEvent" @mouseleave="onMouseLeaveEvent">
                <img :src="src" :alt="options.description" ref="image"/>
            </a>
            <span v-if="!link">
                <img :src="src" :alt="options.description" ref="image" @mouseenter="onMouseEnterEvent" @mouseleave="onMouseLeaveEvent" @click="expandImage"/>
            </span>
            <span class="image-block-title" v-if="options.title">
                {{options.title}}
            </span>
        </figure>

        <teleport to="body">
            <modal-component :is-open="isModalOpen" @close="closeModal" :hide-submit="true">
                <div class="full-size-image">
                    <img :src="fullSize" :alt="options.description" ref="fullSizeImage"/>
                </div>
            </modal-component>
        </teleport>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import gsap from "gsap"
import modalComponent from "@/components/modal.vue"

export type ImageBlock = {
    blockType: "image"
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
        url: string
        sizes: {
            image_sm: {
                width: number
                height: number
                url: string
            }
            image_md: {
                width: number
                height: number
                url: string
            }
            image_lg: {
                width: number
                height: number
                url: string
            }
        }
    }
}

export default defineComponent ({
    name: "imageBlock",
    components: {
        modalComponent
    }, 
    props: {
        options: {
            type: Object as PropType<ImageBlock>,
            required: true,
        },
    },
    data: function() {
        return {
            hoverEvent: undefined as undefined | gsap.core.Tween,
            imageSize: "image_sm" as "image_sm" | "image_md" | "image_lg" | "original",
            link: "",
            patternHover: false,
            bgImageCache: "" as string,
            bgSizeCache: "" as string,
            isModalOpen: false
        }
    },
    computed: {
        ratio() {
            if (this.options.image?.sizes?.image_sm) {
                return this.options.image.sizes.image_sm.width / this.options.image.sizes.image_sm.width
                // add placeholder image
            }
            return  "undefined"
        },
        src() {
            let src = import.meta.env.VITE_PAYLOAD_REST_ENDPOINT.replace("/api","")
            
            if (this.options.image.mimeType.includes("svg")) {
                return src + this.options.image.url
            }

            if (this.imageSize === "original") {
                src += `/api/media/file/${this.options.image.filename}`
            } else {
                src += this.options.image.sizes[this.imageSize].url
            }
            return src
        },
        fullSize() {
            return import.meta.env.VITE_PAYLOAD_REST_ENDPOINT.replace("/api","") + this.options.image.url
        }
    },
    watch: {
        "$route.path": {
            handler() {
                this.updateLayoutChange()
            }
        },
        "options.link": {
            handler() {
                if (!this.options.link) {
                    return
                }

                if (this.options.link.startsWith("http") || this.options.link.startsWith("/")) {
                    this.link = this.options.link
                }

                if (this.options.link == "<pattern>") { 
                    this.patternHover = true
                }
            },
            immediate: true
        },
        "options.image": {
            handler() {
                this.$nextTick(() => {
                    this.loadImage();
                })
            }
        }
    },
    mounted() {
        if (typeof window === "undefined") {
            return;
        }
        
        this.loadImage();
        window.addEventListener("resize", this.updateLayoutChange);
        window.addEventListener("layoutChange", this.updateLayoutChange);
    },
    unmounted() {
        window.removeEventListener("resize", this.updateLayoutChange)
        window.removeEventListener("layoutChange", this.updateLayoutChange)
    },
    methods: {
        updateLayoutChange() {
            const width = this.$el.clientWidth
            if (width > this.options.image.width) {
                return this.imageSize = "original"
            }
            
            if (width <= 320) {
                this.imageSize = "image_sm"

                if (!this.options.image.sizes[this.imageSize]?.url) {
                    this.imageSize = "original"
                }
                return this.imageSize
            }

            if (width <= 800) {
                this.imageSize = "image_md"
                if (!this.options.image.sizes[this.imageSize]?.url) {
                    this.imageSize = "original"
                }
                return this.imageSize
            }

            if (width <= 1200) {
                this.imageSize = "image_lg"
                if (!this.options.image.sizes[this.imageSize]?.url) {
                    this.imageSize = "original"
                }
                return this.imageSize
            }


            return this.imageSize = "original"
        },
        onMouseEnterEvent(e:Event) {
            const target = e.target as HTMLElement
            if (!target) {
                return
            }

            if (this.link) {
                this.mouseEnterZoom(target)
            }
            
            if (this.patternHover) {
                this.addBackgroundPattern()
            }
        },
        addBackgroundPattern() {
            this.bgImageCache = getComputedStyle(document.body).backgroundImage 
            this.bgSizeCache = getComputedStyle(document.body).backgroundSize 


            let src = import.meta.env.VITE_PAYLOAD_REST_ENDPOINT.replace("/api","")
            src += `/api/media/file/${this.options.image.filename}`
            document.body.style.backgroundImage = `url(${src})`
            document.body.style.backgroundSize = "auto"
        },
        mouseEnterZoom(target: HTMLElement) {
            const img = target.querySelector("img") 
            const title = this.$el.querySelector(".image-block-title") 
            if (!img) {
                return
            }

            if (this.hoverEvent) {
                gsap.killTweensOf(this.hoverEvent)
            }

            this.hoverEvent = gsap.to(img, {
                scale: (img.clientWidth + 40) / img.clientWidth,
                // boxShadow: `0 0 ${img.clientWidth/16}px rgba(0,0,0,.16)`,
                duration: .64,
                zIndex: 1,
                ease: "bounce.out"
            })

            gsap.to(title, {
                bottom: -20,
                duration: .64,
                zIndex: 1,
                ease: "bounce.out"
            })
        },
        onMouseLeaveEvent(e:Event) {

            const target = e.target as HTMLElement
            if (!target) {
                return
            }

            if (this.link) {
                this.mouseLeaveZoom(target)
            }
            
            if (this.patternHover) {
                this.removeBackgroundPattern()
            }
        },
        mouseLeaveZoom(target: HTMLElement) {
            
            const img = target.querySelector("img") 
            const title = this.$el.querySelector(".image-block-title") 
            if (!img) {
                return
            }

            if (this.hoverEvent) {
                gsap.killTweensOf(this.hoverEvent)
            }

            this.hoverEvent = gsap.to(img, {
                scale: 1,
                // boxShadow: "0 0 0px rgba(0,0,0,0)",
                duration: .8,
                ease: "power3.out"
            })

            gsap.to(title, {
                bottom: -8,
                duration: .8,
                ease: "power3.out"
            })
        },
        removeBackgroundPattern() {
            document.body.style.backgroundSize = this.bgSizeCache
            document.body.style.backgroundImage = this.bgImageCache
            this.bgSizeCache = ""
            this.bgImageCache = ""
        },
        loadHandler() {
            // setTimeout(() => {
                this.$emit("blockLoaded");
            // }, 0)
        },
        loadImage() {
            const img = this.$refs["image"] as HTMLImageElement;
            
            if (!img) {
                this.$emit("blockLoaded");
                return;
            }

            img.addEventListener("load", this.loadHandler);
            img.addEventListener("error", this.loadHandler);
            
            if (img.complete && img.src) {
                setTimeout(() => {
                    this.$emit("blockLoaded");
                }, 0)
                return;
            }
        },
        expandImage() {
            this.isModalOpen = true
        },
        closeModal() {
            this.isModalOpen = false
        }
    }
})


</script>

<style lang="scss">
@use "./../../../assets/scss/variables.scss";
.image-block {
    margin: 0;
    position: relative;
    container-name: image-block;
    
    img {
        width: 100%;
        object-fit: cover;
        display: block;
    }
}

.image-block-title {
    display: inline-block;
    background-color: var(--contrast-color);
    color: var(--bg-color);
    position: absolute;
    bottom: -8px;
    left: -10px;
    padding: 4px 8px;
    font-size: 10px;
    font-family: 'Fixedsys';
    max-width: calc(100% + 16px);
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}

@container image-block (min-width: 256px) {
    .image-block-title {
        font-size: 14px;
        padding: 8px;
    }
}

.full-size-image {
    max-width: 100%;
    max-height: calc(90vh - 64px);
    display: flex;
    justify-content: center;
    align-items: center;
    
    img {
        max-width: calc(100% - 64px);
        max-height: 90vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
</style>