<template>
    <section class="layout" v-if="options" :layout-size="options.layoutSize" :layout-gap="options.layoutGap">
        <div v-if="newBlocks.length > 0" style="opacity: 0;">
            <Block v-for="block,key in newBlocks" :key="key" @blockLoaded="blockLoaded($event, block)"
                class="block"
                :size="block.size" 
                :data="block.data">
            </Block>
        </div>
        <div v-if="oldBlocks.length > 0">
            <Block v-for="block,key in oldBlocks" :key="key"
                class="block"
                :style="`width: ${block.width}px; height: ${block.height}px; left: ${block.x}px; top: ${block.y}px; opacity: 0;`" 
                :class="{'__isFixed' : typeof block.y != 'undefined' && typeof block.x != 'undefined'}"
                :size="block.size" 
                :data="block.data" />   
        </div>
    </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import _ from "lodash"
import Packer from "@/model/packer"
import gsap from "gsap"
import Block, { BlockType } from "./blocks/index.vue"
// import TitleBlock from "./blocks/title.vue"
// import YearBlock from "./blocks/year.vue"

interface LayoutOptions {
    id: string
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
        Block,
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
            layoutWidth: 0 as number,
            widthRatio: 0 as number,
            oldBlocks: [] as BlockType[],
            newBlocks: [] as BlockType[],
        }
    },
    computed: {
    },
    watch:{
        "options.id": {
            async handler() {
                if (typeof window === "undefined") {
                    return
                }
                
                if (this.$el) {
                    gsap.to(this.$el.querySelectorAll(".block"), {
                        opacity: 0,
                        duration: .4,
                        stagger: {
                            each: .08,
                            from: "end"
                        },
                        onComplete: () => {
                            this.oldBlocks.length = 0
                            this.prepareLayoutUpdate()  
                        }
                    })
                } else {
                    this.prepareLayoutUpdate()
                }
            }, 
            immediate: true
        }
    },
    mounted() {
        if (typeof window !== "undefined") {
            window.addEventListener("resize", this.prepareLayoutUpdate)
        }
    },
    unmounted() {
        window.removeEventListener("resize", this.prepareLayoutUpdate)
    },
    methods: {
        blockLoaded(ratio:number, block: BlockType) {
            if (this.options.blocks.length !== this.oldBlocks.length) {
                block.ratio = ratio
                this.oldBlocks.push(block)
            }

            if (this.newBlocks.length === this.oldBlocks.length) {
                this.newBlocks.length = 0
                this.updateBlockSizes()
            }
        },
        prepareLayoutUpdate() { 
            clearTimeout(this.resizeDelay)
            this.resizeDelay = setTimeout(() => {
                
                this.layoutWidth = this.$el.clientWidth
                this.widthRatio = this.layoutWidth / this.options.layoutSize
                this.widthRatio = Math.round((this.widthRatio) / 8) * 8
                
                
                
                if (this.newBlocks.length <= 0) {
                    this.newBlocks = _.map(this.options.blocks, block => {
                        return {
                            size: block.size > this.options.layoutSize ? this.options.layoutSize : block.size,
                            data: _.omit(block, ["size"])
                        }
                    })
                }
                
                // layout.setBlocks(this.options.blocks)
                // // return
                // const result = _.map(layout.getOutput(), block => {
                //     if (!block || typeof block.id === "undefined") {
                //         return
                //     }
                //     const blockId = Number(block.id)
                //     return {
                //         el: nodes[blockId],
                //         top: block.y,
                //         left: block.x
                //     }
                // }) as Array<BlockDimension>
                // console.log("layout", layout, this.$el)

            }, 10)
        },
        updateBlockSizes() {
            
            const layout = new Packer(this.layoutWidth, 0, { autoResize: "height" })
            _.each(this.oldBlocks, block => {
                block.width = block.size * this.widthRatio - this.gap
                block.height = block.width / block.ratio 
            })
            layout.setBlocks(this.oldBlocks)
            _.each(layout.getOutput(), (posBlock) => {
                const oldBlock = this.oldBlocks[posBlock.id]
                if (!oldBlock) {
                    throw new Error("Mismatch in index")
                }
                oldBlock.width = posBlock.width
                oldBlock.height = posBlock.height
                oldBlock.y = posBlock.y
                oldBlock.x = posBlock.x
            })
            
            setTimeout(() => {
                const blocks = this.$el.querySelectorAll(".block.__isFixed")
                gsap.fromTo(blocks, {
                    opacity: 0
                },{
                    opacity: 1,
                    duration: .4,
                    stagger: {
                        each: .08,
                        from: "start"
                    },
                    onComplete: () => {
                        console.log("Blocks fully loaded 🤑")
                        // this.oldBlocks.length = 0
                    // this.prepareLayoutUpdate()  
                    }
                })
            }, 0)

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
                    maxSize: this.options.layoutSize,
                    gap: this.gap,
                    parentWidth:  parseInt(layoutDimensions.width) - this.gap
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
                block.style.width = `${newWidth - this.gap}px`
                const updatedBlock = window.getComputedStyle(block)
                const newHeight = parseInt(updatedBlock.height) + this.gap
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
                }
            }) as Array<BlockDimension>
            this.updateBlockPositions(result)
        },
        updateBlockPositions(blocks: Array<BlockDimension>) {
            
            _.each(blocks, block => {
                if (!block || !block.left || !block.top) {
                    throw new Error(`Invalid block:\r\n ${JSON.stringify(block, null ,2)}` )
                    return
                }
                
                
                block.el.style.position = "absolute"
                block.el.style.display = "block"
                block.el.style.left = `${block.left + this.gap}px`
                block.el.style.top = `${block.top + this.gap}px`
                block.el.style.paddingBottom = ""
            })
            
            const lastBlock = _.reverse(_.sortBy(blocks, block => {
                const style = window.getComputedStyle(block.el)
                return parseFloat(style.top) + parseFloat(style.height)
            }))[0]
            lastBlock.el.style.paddingBottom = `${this.gap}px`
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