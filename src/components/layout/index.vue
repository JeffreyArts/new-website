<template>
    <div class="layout-wrapper">
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
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import _ from "lodash"
import Packer, { Position } from "@/model/packer"
import gsap from "gsap"
import BlockComponent from "./blocks/index.vue"
import { BlockType, LayoutOptions } from "./layout-types"


export default defineComponent ({
    name: "LayoutComponent", 
    components: {
        Block: BlockComponent,
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
            animations: [] as gsap.core.Tween[],
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
                    this.animations.push(gsap.to(this.$el.querySelectorAll(".block"), {
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
                    }))
                } else {
                    this.prepareLayoutUpdate()
                }
            }, 
            immediate: true
        },
        "options.blocks": {
            handler() {
                // // Only watch fot block changes when on the live-preview page
                // if (!this.$route.path.includes("live-preview")) {
                    //     return
                    // }
                
                if (this.animations) {
                    this.animations.forEach(tween => {
                        gsap.killTweensOf(tween)
                    })
                }
                
                const newBlocks = [] as Array<BlockType>
                this.options.blocks.forEach(optionBlock => {
                    const oldBlock = _.find(this.oldBlocks, { id: optionBlock.id })
                    if (oldBlock) {
                        oldBlock.position = optionBlock.position
                        oldBlock.size = optionBlock.size
                        oldBlock.data = optionBlock.data
                    } else {
                        newBlocks.push(optionBlock)
                    }
                })

                
                this.newBlocks = _.map(newBlocks, block => {
                        return {
                        ...block,
                        size: block.size > this.options.layoutSize ? this.options.layoutSize : block.size,
                    }
                }) as Array<BlockType>

                // if (newBlocks.length > 0) {
                //     this.updateBlockSizes(newBlocks)
                // }
                // console.log("oldBlocks",this.oldBlocks.length)

                // if (this.oldBlocks.length === 0) {
                //     this.prepareLayoutUpdate()
                // }
                // if (this.$el) {
                //     return
                // }
                
                // this.prepareLayoutUpdate()
                this.updateBlockSizes(this.oldBlocks)
            },
            deep:true,
            immediate: true
        }
    },
    mounted() {
        if (typeof window !== "undefined") {

            this.prepareLayoutUpdate()
            this.updateResize()
            this.updateBlockSizes(this.oldBlocks)
            window.addEventListener("resize", this.onResizeEvent)
        }
    },
    unmounted() {
        window.removeEventListener("resize", this.onResizeEvent)
    },
    methods: {
        onResizeEvent() {
            this.updateResize()
            this.updateBlockSizes(this.oldBlocks)
        },
        updateResize() {
            this.layoutWidth = this.$el.clientWidth
            this.widthRatio = (this.layoutWidth) / this.options.layoutSize
        },
        async blockLoaded(block: BlockType) {
            if (this.options.blocks.length !== this.oldBlocks.length) {
                this.oldBlocks.push(block)
            }

            if (this.options.blocks.length === this.oldBlocks.length) {
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
                            this.updateLayoutHeight()
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
                
                // if (this.newBlocks.length <= 0) {
                //     this.newBlocks = _.map(this.options.blocks, block => {
                //         return {
                //             ...block,
                //             size: block.size > this.options.layoutSize ? this.options.layoutSize : block.size,
                //         }
                //     }) as Array<BlockType>
                // }
            }, 10)
        },
        async setBlockDimensions(blocks: Array<BlockType>){
            const result = [] as Array<Promise<void>>
            // Set block width + height
            _.each(blocks, (block) => {
                result.push(new Promise((resolve): void => {
                    const originalBlock = _.find(this.options.blocks, { id: block.id })
                    if (!originalBlock) {
                        throw new Error("Missing original reference")
                    }
                    
                    block.size = originalBlock.size > this.options.layoutSize ? this.options.layoutSize : originalBlock.size
                    block.width = block.size * this.widthRatio
                    block.height = "auto"
                    
                    setTimeout(() => {
                        const oldBlock = this.$el.querySelector(`#oldblock-${block.id}`)
                        if (!oldBlock) {
                            return
                        }
                        const blockStyle = window.getComputedStyle(oldBlock)
                        
                        if (blockStyle) {
                            block.height = parseInt(blockStyle.height)
                        }
                        resolve()
                            
                    }, 0)
                })) 
            })
            
            return await Promise.all(result)
        },
        
        updateBlockPositions(blocks: Array<BlockType>, sortedBlocks: Array<Position>) {
            _.each(sortedBlocks, (posBlock) => {
                const blockId = posBlock.id as string | number
                if (!blockId)  throw new Error("Missing id in posBlock")

                
                let oldBlock = undefined
                if (typeof blockId === "number") {
                    oldBlock = blocks[blockId] as BlockType | undefined
                } else if (typeof blockId === "string") {
                    oldBlock = _.find(blocks, { id: blockId }) as BlockType | undefined
                }
                
                if (!oldBlock) {
                    throw new Error("Invalid blockId ")
                }
                
                oldBlock.width = posBlock.width
                oldBlock.height = posBlock.height
                oldBlock.y = posBlock.y
                oldBlock.x = posBlock.x
            })
        },
        
        async updateBlockSizes(blocks: Array<BlockType>) {
            await this.setBlockDimensions(blocks)
            
            // Convert height(:auto) to number to match setBlocks
            // Re-position blocks according their default order to unshuffle setBlocks result
            const convertedBlocks = _.orderBy(blocks.map(block => {
                if (typeof block.height === "undefined") {
                    block.height = 0
                }

                if (typeof block.height === "string") {
                    block.height = parseFloat(block.height)
                }

                return {
                    id: block.id,
                    position: block.position,
                    width: block.width || 0,
                    height: block.height
                }
            }), "position")
            
            const layout = new Packer(this.layoutWidth, 0, { autoResize: "height" })
            const sortedBlocks = layout.setBlocks(convertedBlocks)

            if (sortedBlocks) {
                this.updateBlockPositions(blocks, sortedBlocks)
            }
            
            if (typeof window !== "undefined") {

                this.updateLayoutHeight()
                window.dispatchEvent(new CustomEvent("layoutChange"))
            }
        },
        updateLayoutHeight() {
            const layout = this.$el.querySelector('.layout')
            const blocks = layout.querySelectorAll(".block") as HTMLElement[]
            let lastBlock = {
                block: undefined,
                y: 0
            } as {
                block: undefined | HTMLElement,
                y: number
            }

            blocks.forEach(block => {
                if (block.offsetTop + block.clientHeight > lastBlock.y) {
                    lastBlock =  {
                        block,
                        y: block.offsetTop + block.clientHeight
                    }
                }
            })
            layout.style.height = `${lastBlock.y + 40}px`
        }
    }
})

</script>

<style lang="scss">
@import './../../assets/scss/variables.scss';
.layout-wrapper {
    display: block;
    width: 100vw;
}

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