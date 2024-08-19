<template>
    <section class="layout" v-if="options" :layout-size="options.layoutSize" :layout-gap="options.layoutGap">
        <div v-if="oldBlocks.length > 0">
            <Block v-for="block,key in oldBlocks" :key="key"
                class="block"
                :id="`block-${block.id}`"
                :style="`width: ${block.width}px; height: ${block.height}px; left: ${block.x}px; top: ${block.y}px;`" 
                :class="{'__isFixed' : typeof block.y != 'undefined' && typeof block.x != 'undefined'}"
                :size="block.size" 
                :data="block.data" />
        </div>
        <div v-if="newBlocks.length > 0">
            <Block v-for="block,key in newBlocks" :key="key" @blockLoaded="blockLoaded($event, block)"
                class="block"
                :id="`block-${block.id}`"
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
            this.widthRatio = this.layoutWidth / this.options.layoutSize
            this.widthRatio = Math.round((this.widthRatio) / 8) * 8
            
            this.updateBlockSizes(this.oldBlocks)
        },
        blockLoaded(ratio:number, block: BlockType) {
            if (this.options.blocks.length !== this.oldBlocks.length) {
                block.ratio = ratio
                this.oldBlocks.push(block)
            }

            if (this.newBlocks.length === this.oldBlocks.length) {
                this.newBlocks.length = 0
                
                this.updateBlockSizes(this.oldBlocks)

                if (typeof window !== "undefined") {
                    setTimeout(() => {

                        window.dispatchEvent(new CustomEvent("layoutChange"))
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
                this.widthRatio = this.layoutWidth / this.options.layoutSize
                this.widthRatio = Math.round((this.widthRatio) / 8) * 8
                
                if (this.newBlocks.length <= 0) {
                    this.newBlocks = _.map(this.options.blocks, block => {
                        return {
                            size: block.size > this.options.layoutSize ? this.options.layoutSize : block.size,
                            id: block.id,
                            ratio: block.ratio,
                            y: block.y,
                            x: block.x,
                            width: block.width,
                            height: block.height,
                            data: block.data
                        }
                    }) as Array<BlockType>
                }
            }, 10)
        },
        
        updateBlockSizes(blocks: Array<BlockType>) {
            const layout = new Packer(this.layoutWidth, 0, { autoResize: "height" })

            _.each(blocks, (block, index) => {
                if (block.ratio === undefined) {
                    throw new Error("Block ratio should not be undefined")
                }
                const originalBlock = _.find(this.options.blocks, { id: block.id })
                
                if (!originalBlock) {
                    throw new Error("Missing original reference")
                }

                block.size = originalBlock.size > this.options.layoutSize ? this.options.layoutSize : originalBlock.size
                block.width = block.size * this.widthRatio - this.gap
                block.height = block.width / block.ratio
            })
            
            layout.setBlocks(blocks)
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
    .block {
        opacity: 0;
    }
}

</style>