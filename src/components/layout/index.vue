<template>
    <section class="layout" v-if="options" :layout-size="options.layoutSize" :layout-gap="options.layoutGap">
        <div v-if="oldBlocks.length > 0">
            <Block v-for="block,key in oldBlocks" :key="key"
                :id="`oldblock-${block.id}`"
                :style="{
                    width:   typeof block.width === 'number' ? `${block.width}px`: block.width,
                    height:  typeof block.height === 'number' ? `${block.height}px` : block.height,
                    top:  typeof block.y === 'number' ? `${block.y}px` : block.y,
                    left:  typeof block.x === 'number' ? `${block.x}px` : block.x,
                }"
                :class="{'__isFixed' : typeof block.y != 'undefined' && typeof block.x != 'undefined'}"
                :size="block.size" 
                :data="block.data" />
            </div>
            <div v-if="newBlocks.length > 0">
                <Block v-for="block,key in newBlocks" :key="key" @blockLoaded="blockLoaded(block)"
                :id="`newblock-${block.id}`"
                :size="block.size" 
                :data="block.data">
            </Block>
        </div>
    </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import _ from "lodash"
import Packer from "@/model/packer"
import gsap from "gsap"
import Block from "./blocks/index.vue"
import { BlockType, LayoutOptions } from "./layout-types"


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
            window.addEventListener("resize", this.updateResize)
        }
    },
    unmounted() {
        window.removeEventListener("resize", this.updateResize)
    },
    methods: {
        updateResize() {
            this.layoutWidth = this.$el.clientWidth
            this.widthRatio = (this.layoutWidth) / this.options.layoutSize
            
            this.updateBlockSizes(this.oldBlocks)
        },
        async blockLoaded(block: BlockType) {
            if (this.options.blocks.length !== this.oldBlocks.length) {
                this.oldBlocks.push(block)
            }

            if (this.newBlocks.length === this.oldBlocks.length) {
                this.newBlocks.length = 0
                
                await this.updateBlockSizes(this.oldBlocks)

                if (typeof window !== "undefined") {
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent("layoutChange"))
                        this.updateResize()
                    })
                }
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
                        }
                    })
                }, 0)
            }
        },
        prepareLayoutUpdate() { 
            clearTimeout(this.resizeDelay)
            this.resizeDelay = setTimeout(() => {
                
                this.layoutWidth = this.$el.clientWidth
                this.widthRatio = (this.layoutWidth - this.gap) / this.options.layoutSize
                
                if (this.newBlocks.length <= 0) {
                    this.newBlocks = _.map(this.options.blocks, block => {
                        return {
                            ...block,
                            size: block.size > this.options.layoutSize ? this.options.layoutSize : block.size,
                        }
                    }) as Array<BlockType>
                }
            }, 10)
        },
        
        async updateBlockSizes(blocks: Array<BlockType>) {

            const layout = new Packer(this.layoutWidth, 0, { autoResize: "height" })
            const blockWidthResized = [] as Array<Promise<void>>
            
            _.each(blocks, (block) => {
                blockWidthResized.push(new Promise((resolve): void => {
                    const originalBlock = _.find(this.options.blocks, { id: block.id })
                    if (!originalBlock) {
                        throw new Error("Missing original reference")
                    }
                    
                    block.size = originalBlock.size > this.options.layoutSize ? this.options.layoutSize : originalBlock.size
                    block.width = block.size * this.widthRatio
                    block.height = "auto"
                    
                    setTimeout(() => {
                        const oldBlock = this.$el.querySelector(`#oldblock-${block.id}`)
                        block.height = parseInt(window.getComputedStyle(oldBlock).height)
                        resolve()
                            
                    }, 0)
                })) 
            })
            
            await Promise.all(blockWidthResized)

            // Convert height to number to match setBlocks
            // Re-position blocks according their default order to unshuffle setBlocks result
            const convertedBlocks = _.orderBy(blocks.map(block => {
                if (typeof block.height !== "number") {
                    console.warn("Invalid value for block.height", block.height)
                }

                return _.pick({
                    ...block,
                    height: typeof block.height === "string" ? parseFloat(block.height) : block.height,
                }, ["width", "height", "id", "position"])
            }), "position")

            layout.setBlocks(convertedBlocks)

            _.each(layout.getOutput(), (posBlock) => {
                const blockId = posBlock.id as string | number
                if (!blockId)  throw new Error("Missing id in posBlock")

                
                let oldBlock = undefined
                if (typeof blockId === "number") {
                    oldBlock = blocks[blockId] as BlockType | undefined
                } else if (typeof blockId === "string") {
                    oldBlock = _.find(blocks, { id: blockId }) as BlockType | undefined
                }
                
                if (!oldBlock) {
                    throw new Error("Mismatch in index")
                }
                
                oldBlock.width = posBlock.width
                oldBlock.height = posBlock.height
                oldBlock.y = posBlock.y
                oldBlock.x = posBlock.x
            })
            
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("layoutChange"))
            }
        }
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
    overflow-x: hidden;
    .block {
        opacity: 0;
    }
}

</style>