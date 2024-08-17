<template>
    <section class="layout" v-if="options" :layout-size="options.layoutSize" :layout-gap="options.layoutGap">
        <div v-for="block,key in options.blocks" :key="key"
            class="block"
            :block-size="block.size" 
            :id="`block-${block.id}`">
            <TitleBlock :options="block" v-if="block.blockType === 'title'"/>
            <YearBlock :options="block" v-if="block.blockType === 'year'"/>
        </div>
    </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import _ from "lodash"
import Packer from "@/model/packer"
import gsap from "gsap"
import TitleBlock from "./blocks/title.vue"
import YearBlock from "./blocks/year.vue"

interface LayoutOptions {
    layoutGap: number
    layoutSize: number
    blocks: Array<LayoutBlock>
}

export type LayoutBlock = {
    size: number
    [key: string]: unknown
}

interface BlockDimension {
    el:HTMLElement
    top?: number
    left?: number
    width?: number
    height?: number
}

export default defineComponent ({
    name: "LayoutComponent", 
    components: {
        TitleBlock,
        YearBlock
    },
    props: {
        options: {
            type: Object as PropType<LayoutOptions>,
            required: true
        },
    },
    data() {
        return {
            resizeDelay: undefined as undefined | NodeJS.Timeout,
            gap: 40,
            blocks: [] as BlockDimension[]
        }
    },
    computed: {
    },
    watch:{
        "$route.path": {
            async handler() {
                if (typeof window === "undefined") {
                    return
                }
                // Remove old content
                
                setTimeout(() => {
                    this.generateLayout(this.$el)
                }, 0)
                // Add new content
            }, 
            immediate: true
        }
    },
    mounted() {
        if (typeof window !== "undefined") {
            window.addEventListener("resize", this.generateLayoutResize)
        }
    },
    unmounted() {
        window.removeEventListener("resize", this.generateLayoutResize)
    },
    methods: {
        generateLayoutResize() { 
            clearTimeout(this.resizeDelay)
            this.resizeDelay = setTimeout(() => {
                this.generateLayout(this.$el)
            }, 100)
        },
        generateLayout(layout: Element) {
            if (!layout) {
                throw new Error("Invalid layout")
            }

            const images = layout.querySelectorAll("image, img") 
            const imageLoadedPromises = [] as Array<Promise<void>>
            if (images) {
                images.forEach((image) => {
                    const img = image as HTMLImageElement
                    imageLoadedPromises.push(
                        new Promise<void>((resolve) => {
                            if (img.complete) {
                                resolve()
                            } else {
                                img.addEventListener("load", () => resolve())
                            }
                        })
                    )
                })
            }

            // Set gap
            const gap = layout.getAttribute("layout-gap") ? parseInt(layout.getAttribute("layout-gap") || "40") : 40
            
            // Get all 
            const maxSize = Number(layout.getAttribute("layout-size"))
            // const nodes = layout.querySelectorAll("[block-size]")
            const nodes = layout.querySelectorAll(".block")
            
            if (nodes.length <= 0) {
                console.warn("No nodes found, does layout contain elements with [block-size] property?")
                return
            }
                
            nodes.forEach(node => {
                const block = node as HTMLElement
                block.style.opacity = "0"
            })

            const layoutDimensions = window.getComputedStyle(layout)
        
            Promise.all(imageLoadedPromises).then(() => {
                this.calculateBlocks(nodes, {
                    maxSize,
                    gap: gap,
                    parentWidth:  parseInt(layoutDimensions.width) - gap
                })
            })
        },
        // defineRatio() {

        //     const layoutDimensions = window.getComputedStyle(this.$el)
        //     const parentWidth = parseInt(layoutDimensions.width) - this.gap
        //     this.layourData =new Packer(parentWidth, 0, { autoResize: "height" })
        //     this.layoutRatio = parentWidth /this.options.layoutSize

        // },
        // blockSize(size: number) {

        //     let newWidth = size * this.layoutRatio
        //     newWidth = Math.floor(newWidth)
        //     // newWidth = Math.round((newWidth) / 8) * 8
        //     // newWidth -= opts.gap
        //     block.style.width = `${newWidth - opts.gap}px`
        //     const updatedBlock = window.getComputedStyle(block)
        //     const newHeight = parseInt(updatedBlock.height) + opts.gap
        //     const newBlock = { width: newWidth, height: newHeight, id: index }
                
        // },
            
        calculateBlocks(nodes: NodeList, opts: {
            maxSize: number,
            gap: number,
            parentWidth: number
        }) {
            if (!nodes) {
                throw new Error("Missing nodes")
            }
            
            if (!opts) {
                const opts = {}
            }
            
            if (!opts.maxSize) {
                opts.maxSize = 6
            }
            
            if (typeof opts.gap === "undefined") {
                opts.gap = 40
            }
            
            const layout = new Packer(opts.parentWidth, 0, { autoResize: "height" })
            const layoutRatio = opts.parentWidth/opts.maxSize
            const blocks = _.map(nodes, (node, index) => {
                const block = node as HTMLElement
                
                gsap.to(block, {
                    opacity: 1,
                    ease: "power4.inOut",
                    duration: .32
                })
                const size = Number(block.getAttribute("block-size"))
                
                
                let newWidth = size * layoutRatio
                newWidth = Math.floor(newWidth)
                // newWidth = Math.round((newWidth) / 8) * 8
                // newWidth -= opts.gap
                block.style.width = `${newWidth - opts.gap}px`
                const updatedBlock = window.getComputedStyle(block)
                const newHeight = parseInt(updatedBlock.height) + opts.gap
                const newBlock = { width: newWidth, height: newHeight, id: index }
                
                console.log("calculateBlocks", "newWidth", newWidth)
                // For dev:
                block.style.display = "none"
                
                return newBlock
            })
            layout.setBlocks(blocks)
        

            // return
            const result = _.map(layout.getOutput(), block => {
                if (!block || typeof block.id === "undefined") {
                    return
                }
                const blockId = Number(block.id)
                return {
                    el: nodes[blockId],
                    top: block.y,
                    left: block.x
                    // width: bix.
                    // height: number
                }
            }) as Array<BlockDimension>
            this.updateBlockPositions(result, { gap: opts.gap })
        },
        updateBlockPositions(blocks: Array<BlockDimension>, opts?: {
            gap?: number
        }) {
            if (!opts) {
                let opts = {}
            }
            let gap = 40
            
            if (opts && typeof opts.gap !== "undefined") {
                gap = opts.gap
            }
            _.each(blocks, block => {
                if (!block) {
                    return
                }
                
                
                block.el.style.position = "absolute"
                block.el.style.display = "block"
                block.el.style.left = `${block.left + gap}px`
                block.el.style.top = `${block.top + gap}px`
                block.el.style.paddingBottom = ""
            })
            
            const lastBlock = _.reverse(_.sortBy(blocks, block => {
                const style = window.getComputedStyle(block.el)
                return parseFloat(style.top) + parseFloat(style.height)
            }))[0]
            lastBlock.el.style.paddingBottom = `${gap}px`
        },
    }
})

</script>

<style lang="scss">
@import './../../assets/scss/variables.scss';
.layout {
    display: block;
    width: 100%;
    height: 100%;
    position: relative;
}

</style>