<template>
    <div class="piece-thumbnail-block">
        <router-link class="piece-thumbnail-block-wrapper" :to="options.piece.path">
            <figure v-if="options.piece.type === 'image'" class="piece-thumbnail-block-image-wrapper">
                <img :src="src" class="piece-thumbnail-block-image" ref="image"/>
            </figure>

            <section v-if="options.piece.type === 'youtube'" class="piece-thumbnail-block-youtube-wrapper">
                <iframe 
                :style="`aspect-ratio: ${ratio}; pointer-events:none;`"
                :src="src"
                frameborder="0" 
                ref="youtube"/>
            </section>
                
            <section v-if="options.piece.type === 'code'" class="piece-thumbnail-block-code-wrapper">
                <highlightjs :language="options.piece.codeProperties.language" :code="options.piece.codeProperties.code" ref="code"/>
            </section>

            
            <section v-if="options.piece.type === 'iframe'" class="piece-thumbnail-block-iframe-wrapper">
                <iframe 
                :style="`aspect-ratio: ${ratio};`"
                :src="src"
                frameborder="0" 
                ref="iframe"/>
            </section>
        </router-link>

        <footer class="piece-thumbnail-footer">
            <div class="piece-thumbnail-footer-left">
                <h4 class="piece-thumbnail-block-title">
                    <span>{{ options.piece.title }}</span>
                    <!-- <jaoIcon name="chevron-right-fat" inactive-color="transparent" size="small"></jaoIcon> -->
                </h4>
                <div class="piece-thumbnail-tags" v-if="options.piece.categories">
                    <span class="piece-thumbnail-tag" v-for="category, index in options.piece.categories" :key="index" @click="goToCategory(category.id)">
                        {{ category.title }}
                    </span>
                </div>
            </div>
            <div class="piece-thumbnail-footer-right">
                <figure ref="yearSVG"></figure>
                
                <jaoIcon name="comment" size="medium"></jaoIcon>
                <jaoIcon name="heart-outline" size="medium"></jaoIcon>
            </div>
        </footer>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import jaoIcon from "@/components/jao-icon.vue"
import Icon from "jao-icons"
import highlightjs from "./../../highlightjs.vue"

export type IframeProperties = {
    landscapeRatio: string
    portraitRatio: string
    autoScaling: boolean
    url:string
}

export type YoutubeProperties = {
    url: string
    ratio: string
}

export type CodeProperties = {
    title: string
    link: string
    language: "typescript" | "javascript" | "arduino" | "bash" | "css" | "html" | "php"
    code: string
}

export type ImageProperties = {
    focalX: number
    focalY: number
    height: number
    width: number
    mimeType: number
    url: string
    filename: string
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

export type PieceThumbnailBlock = {
    blockType: "pieceThumbnail"
    piece: {
        type: string
        path: string
        title: string
        year: string
        favs: number
        categories?: Array<{
            id: string
            title: string
        }>
        series?: Array<{
            id: string
            title: string
        }>
        youtubeProperties: YoutubeProperties,
        imageProperties: {image: ImageProperties},
        codeProperties: CodeProperties,
        iframeProperties: IframeProperties
    }
}

export default defineComponent ({
    name: "pieceThumbnailBlock",
    components: {
        jaoIcon,
        highlightjs
    }, 
    props: {
        options: {
            type: Object as PropType<PieceThumbnailBlock>,
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
            yearSVG: undefined as undefined | SVGAElement,
            frame: {
                width: 0 as number,
                height: 0 as number,
                size: ""
            }
        }
    },
    computed: {
        ratio() {
           
            if (this.options.piece.type === "youtube") {
                const ratio = this.options.piece.youtubeProperties.ratio.split("/")
                return Number(ratio[0])/Number(ratio[1])
            } else if (this.options.piece.type === "iframe") {
                const ratio = this.options.piece.iframeProperties.landscapeRatio.split("/")
                return Number(ratio[0])/Number(ratio[1])
            } 
            return  "undefined"
        },
        src() {
            let src = import.meta.env.VITE_PAYLOAD_REST_ENDPOINT.replace("/api","")

            if (this.options.piece.type === "image") {
                let imageProperties = this.options.piece.imageProperties.image //? this.options.piece.imageProperties.image : this.options.piece.imageProperties

                if (imageProperties.mimeType.toString().includes("svg")) {
                    return src + imageProperties.url
                }

                if (this.imageSize === "original") {
                    src += `/api/media/file/${imageProperties.filename}`
                } else {
                    src += imageProperties.sizes[this.imageSize].url
                }
            } else if (this.options.piece.type === "youtube") {
                src = this.options.piece.youtubeProperties.url
            } else if (this.options.piece.type === "iframe") {
                src = this.options.piece.iframeProperties.url
            }

            return src
        }
    },
    watch: {
    },
    mounted() {
        if (typeof window === "undefined") {
            return
        }
        
        const img = this.$refs["image"] as HTMLImageElement

        if (!img) {
            return this.$emit("blockLoaded")
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
        }).catch((err) => {
            console.error(err)
            this.$emit("blockLoaded")
        })


        if (this.$refs.yearSVG && this.options.piece.year) {
            const svgContainer = this.$refs.yearSVG as HTMLElement
            const SVGElement = Icon(this.options.piece.year, "medium")
            if (!svgContainer || !SVGElement) {
                return
            }
            svgContainer.appendChild(SVGElement)
        }

        window.addEventListener("layoutChange", this.updateLayoutChange)
    },
    unmounted() {
        window.removeEventListener("layoutChange", this.updateLayoutChange)
    },
    methods: {
        updateLayoutChange() {
            // const width = this.$el.clientWidth
            // if (width > this.options.piece.properties.width) {
            //     return this.imageSize = "original"
            // }
            
            // if (width <= 320) {
            //     return this.imageSize = "image_sm"
            // }

            // if (width <= 800) {
            //     return this.imageSize = "image_md"
            // }

            // if (width <= 1200) {
            //     return this.imageSize = "image_lg"
            // }

            return this.imageSize = "original"
        },
        goToCategory(categoryId: string) {
            this.$router.push({
                path: "/archive",
                query: {
                    categories: categoryId
                }
            })
        }
    }
})


</script>

<style lang="scss">
@use "./../../../assets/scss/variables.scss";
.piece-thumbnail-block {

    container-name: piece-thumbnail;
    container-type: inline-size;
    margin: 0;
}
.piece-thumbnail-block-wrapper {
    color: var(--contrast-color);
    text-decoration: none;
    display: inline-block;
    cursor: pointer;
    transition: var(--transition-default);
    opacity: 0.9;
    filter: saturate(.9);
    width: 100%;

    &:hover,
    &:focus {
        background:var(--bg-color);
        filter: saturate(1.04);
        opacity: 1;
        img {
            border-radius: 8px;
            outline: 1px solid var(--bg-color);
            box-shadow: 0 0 12px rgba(0,0,0,.16);
        }
    }
}

.piece-thumbnail-block-image {
    width: 100%;
}

.piece-thumbnail-block-image-wrapper {
    margin: 0;
    display: flex;
    
    img {
        width: 100%;
        outline: 1px solid transparent;
        object-fit: cover;
        transition: var(--transition-default);
    }
}

.piece-thumbnail-block-youtube-wrapper {
    iframe {
        width: 100%;
    }
}

.piece-thumbnail-block-iframe-wrapper {
    iframe {
        width: 100%;
        pointer-events: none;
    }
}

.piece-thumbnail-block-code-wrapper {
    width: 100%;
    background: var(--contrast-color);
    color: var(--bg-color);
    overflow: auto;
    max-height: 240px;
    padding-left: 16px;
}

.piece-thumbnail-block-title {
    display: flex;
    margin: 0;
    padding: 8px 0 0;
    justify-content: space-between;
    width: 100%;
    font-family: var(--accent-font);
    font-size: 12px;
    font-weight: normal;
    line-height: 1em;
    align-items: center;
    transition: var(--transition-default);

    svg {
        height: 10px;
    }
}

.piece-thumbnail-tags {
    display: flex;
    gap: 8px;
    flex-flow: row wrap;
}

.piece-thumbnail-tag {
    font-size: 10px;
    opacity: 0.6;
    font-family: var(--accent-font);
    color: var(--contrast-color);

    &:hover, 
    &:focus {
        text-decoration: underline;
        cursor: pointer;
    }
}

@container piece-thumbnail (min-width: 256px) {
    .piece-thumbnail-block-title {
        padding: 8px 0 4px;
        font-size: 16px;
    }
}

.piece-thumbnail-footer {
    display: flex;
    flex-flow: row;
    justify-content: space-between;
}

.piece-thumbnail-footer-left {
    max-width: 80%;
}

.piece-thumbnail-footer-right {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    opacity: 0.8;

    figure {
        margin: 0;
    }

    svg {
        height: 24px;
        display: block;

        rect[v="0"] {
            opacity: 0;
        }
    }
}
</style>