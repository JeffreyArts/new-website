<template>
    <div class="layout-wrapper">
        <section  class="layout"
            :class="{
                '__isLoaded': loaded,
                '__isProcessing': processing
            }"
            v-if="options && blocks.length > 0"
            :layout-size="options.layoutSize"
            :layout-gap="options.layoutGap">
            
            <Block v-for="block,key in blocks" :key="key" @blockLoaded="blockLoaded(block)"
                :id="`block-${block.id}`"
                :size="block.size" 
                :data="block.data"
                :class="{
                    '__isLoaded' : block.loaded,
                    '__isFixed' : typeof block.y != 'undefined' && typeof block.x != 'undefined'
                }"
                :style="{
                    width:   typeof block.width === 'number' ? `${block.width}px`: block.width,
                    height:  typeof block.height === 'number' ? `${block.height}px` : block.height,
                    top:  typeof block.y === 'number' ? `${block.y}px` : block.y,
                    left:  typeof block.x === 'number' ? `${block.x}px` : block.x,
                }">
            </Block>
        </section>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType, nextTick } from "vue"
import _ from "lodash"
import Packer from "@/model/packer"
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
            timeoutDelay: undefined as undefined | NodeJS.Timeout,
            gap: 40,
            animations: [] as gsap.core.Tween[],
            layoutWidth: 0 as number,
            widthRatio: 0 as number,
            packerLayout: undefined as Packer | undefined,
            loaded: false,
            processing: false,
            newBlocks: [] as BlockType[],
            blocks: [] as BlockType[],
        }
    },
    computed: {
    },
    watch:{
        "options.blocks": {
            handler(blocks) {
                if (blocks.length <= 0) {
                    return
                }
                this.loaded = false
                
                if (this.animations) {
                    this.animations.forEach(tween => {
                        gsap.killTweensOf(tween)
                    })
                }

                this.__addBlocks(this.options.blocks)
            },
            deep:false,
            immediate: true // Cause if will first be an empty array, than it will be filled with blocks
        }
    },
    mounted() {
        if (typeof window !== "undefined") {
            window.addEventListener("resize", this.__onResizeEvent)
        }
        this.newBlocks = []
        dispatchEvent(new Event('layoutLoaded'))
    },
    unmounted() {
        window.removeEventListener("resize", this.__onResizeEvent)
    },
    methods: {

        __onResizeEvent() { 
            if (this.timeoutDelay) {
                clearTimeout(this.timeoutDelay)
            }

            this.updateLayout()
            this.packerLayout = undefined
            this.timeoutDelay = setTimeout(this.updateBlockSizes, 24)
        },

        __addBlocks(newBlocks: BlockType[]){
            const blocks = _.values(_.omitBy(_.map(newBlocks, block => {
                if (this.__findBlock(block.id, this.blocks)) {
                    return 
                }
                
                return {
                    ...block,
                    size: block.size > this.options.layoutSize ? this.options.layoutSize : block.size,
                }
            }), _.isNil))
            this.blocks = [...this.blocks, ...blocks]
        },
        __findBlock(blockId: string | number, targetBlocks: BlockType[]) {
            if (!blockId)  throw new Error("Missing id in posBlock")

            let foundBlock = undefined
            if (typeof blockId === "number") {
                foundBlock = targetBlocks[blockId] as BlockType | undefined
            } else if (typeof blockId === "string") {
                foundBlock = _.find(targetBlocks, { id: blockId }) as BlockType | undefined
            }
            return foundBlock
        },
        __updateLayoutHeight() {
            if (!this.$el) {
                return
            }

            const layout = this.$el.querySelector(".layout")

            if (!layout) {
                return
            }
            
            const lastBlock = _.maxBy(this.blocks, block => Number(block.height) + Number(block.y))
            if (!lastBlock) {
                return
            }
             
            layout.style.height = `${Number(lastBlock.height) + Number(lastBlock.y)}px`
        },
        async __setBlockDimensions(blocks: Array<BlockType>){
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
                    
                    nextTick(() => {
                        const targetBlock = this.$el.querySelector(`#block-${block.id}`)
                        
                        if (!targetBlock) {
                            return
                        }
                        
                        const blockStyle = window.getComputedStyle(targetBlock)
                        
                        if (blockStyle) {
                            block.height = parseInt(blockStyle.height)
                        }
                        resolve()
                            
                    })
                })) 
            })
            return await Promise.all(result)
        },
        async blockLoaded(block: BlockType) {
            if (block.loaded) {
                return
            }   
            block.loaded = true
            this.newBlocks.push(block)
            

            // Delay the updateBlockSizes to prevent it from being called on every block loaded
            if (this.timeoutDelay) {
                clearTimeout(this.timeoutDelay)
            }
            this.timeoutDelay = setTimeout(this.updateBlockSizes, 240)
            
            
            // Update layout when all blocks are loaded
            if (_.every(_.map(this.blocks, block => block.loaded))) {
                this.loaded = false
                this.processing = true
                
                await this.updateBlockSizes()
                
                
                if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("layoutChange"))
                }

                // Double resize is required, 400 miliseconds is the same amount of how long a single block takes to fade-in
                setTimeout(async () => {
                    await this.updateBlockSizes()
                    window.dispatchEvent(new CustomEvent("layoutHasChanged"))
                }, 400)
                
                setTimeout(() => {
                    this.loaded = true
                    this.processing = false
                    this.newBlocks = []
                    dispatchEvent(new Event('layoutLoaded'))
                    this.updateLayout()
                }, 0)
            }
        },
        updateLayout() {
            if (!this.$el) {
                console.warn("Can not call updateLayout when this.$el has not yet been set")
                return
            }
            this.layoutWidth = this.$el.clientWidth
            this.widthRatio = (this.layoutWidth) / this.options.layoutSize
            this.__updateLayoutHeight()
        },
        updateBlockSizes() {
            return new Promise(async (resolve) => {
                    
                this.updateLayout()
            
                const blocks = this.blocks
                await this.__setBlockDimensions(blocks)
                
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
                
                if (!this.packerLayout) {
                    this.packerLayout = new Packer(this.layoutWidth, 0, { autoResize: "height" })
                }
                const sortedBlocks = this.packerLayout.setBlocks(convertedBlocks, 20)
                
                if (sortedBlocks) {
                    _.each(sortedBlocks, (posBlock) => {
                        const blockId = posBlock.id as string | number
                        let block = this.__findBlock(blockId, blocks)

                        if (!block) {
                            throw new Error("Invalid blockId ")
                        }
                        block.width = posBlock.width
                        block.height = posBlock.height
                        block.y = posBlock.y
                        block.x = posBlock.x
                    })
                }   

                if (typeof window !== "undefined") {
                    this.__updateLayoutHeight()
                }

                this.$nextTick(() => {
                    setTimeout(() => {
                        requestAnimationFrame(resolve)
                    })
                })
            })
        },
    }
})

</script>

<style lang="scss">
@use './../../assets/scss/variables.scss';
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
    overflow-y: hidden;

    .block {
        opacity: 0;
    }
}


</style>