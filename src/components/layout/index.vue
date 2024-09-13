<template>
    <div class="layout-wrapper">
        <section class="layout" v-if="options" :layout-size="options.layoutSize" :layout-gap="options.layoutGap">
            <Breadcrumbs />
            
            <div v-if="oldBlocks.length > 0">
                <Block v-for="block,key in oldBlocks" :key="key"
                :id="`oldblock-${block.id}`"
                :style="{
                    width:   typeof block.width === 'number' ? `${block.width}px`: block.width,
                    height:  typeof block.height === 'number' ? `${block.height}px` : block.height,
                    top:  typeof block.y === 'number' ? `${block.y + offsetTop}px` : block.y,
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
    <Filter :options="{
        name: 'Archive',
        filterRange: {
            year: 'all'
        }
        }"/>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import _ from "lodash"
import Packer from "@/model/packer"
import gsap from "gsap"
import BlockComponent from "./blocks/index.vue"
import Breadcrumbs from "./../breadcrumbs.vue"
import Filter from "./../filter.vue"
import { BlockType, LayoutOptions } from "./layout-types"


export default defineComponent ({
    name: "LayoutComponent", 
    components: {
        Block: BlockComponent,
        Breadcrumbs,
        Filter
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
            offsetTop: 60,
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
                // Only watch fot block changes when on the live-preview page
                if (!this.$route.path.includes("live-preview")) {
                    return
                }
                
                if (this.animations) {
                    this.animations.forEach(tween => {
                        gsap.killTweensOf(tween)
                    })
                }
                this.options.blocks.forEach(optionBlock => {
                    const oldBlock = _.find(this.oldBlocks, { id: optionBlock.id })
                    if (oldBlock) {
                        oldBlock.position = optionBlock.position
                        oldBlock.size = optionBlock.size
                        oldBlock.data = optionBlock.data
                    }
                })

                if (this.$el) {
                    this.prepareLayoutUpdate()
                    this.updateResize()
                    return
                }

                this.prepareLayoutUpdate()
            },
            deep:true,
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
            if (this.layoutWidth > 640)  {
                this.offsetTop = 80   
            }
            if (this.layoutWidth > 800)  {
                this.offsetTop = 104
            }
            
            this.updateBlockSizes(this.oldBlocks)
            this.updateLayoutHeight()
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
            
            await Promise.all(blockWidthResized)

            // Convert height to number to match setBlocks
            // Re-position blocks according their default order to unshuffle setBlocks result
            const convertedBlocks = _.orderBy(blocks.map(block => {
                if (typeof block.height !== "number") {
                    console.warn("Invalid value for block.height", block.height)
                }

                return {
                    id: block.id,
                    position: block.position,
                    width: block.width || 0,
                    height: parseFloat(block.height + "")
                } 
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
                if (block.offsetTop, block.clientHeight > lastBlock.y) {
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
    min-height: 100vh;
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
    .site-breadcrumbs {
        margin-top: 40px;
        margin-left: 8px;
    }
}

@media screen and (min-width: 640px) {
    .layout {
        .site-breadcrumbs {
            margin-left: 16px;
            margin-top: 60px;
        }
    }
}
@media screen and (min-width: 800px) {
    .layout {
        .site-breadcrumbs {
            margin-top: 80px;
        }
    }
}


</style>