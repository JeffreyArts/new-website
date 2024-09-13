<template>
    <canvas/>
</template>


<script lang="ts">
import { defineComponent, PropType, StyleValue } from "vue"
import { shuffle } from "lodash"
import gsap from "gsap"

export type DynamicImageOptions = {
    duration?: number
    tileSize?: number
}

export default defineComponent({
    name: "breadcrumbsComponent",
    props: {
        src: {
            type: String,
            required: true,
        },
        options: {
            type: Object as PropType<DynamicImageOptions>,
            required: false,
        }
    },
    data() {
        return {
            timeout: undefined as undefined | NodeJS.Timeout,
            sourceImage: undefined as undefined | HTMLImageElement,
            tiles: [] as Array<StyleValue>,
            tweens: [] as gsap.core.Tween[],
        }
    },
    watch: {
        "src": {
            async handler() {
                await this.loadImage(this.src)
            }, 
            immediate: true
        },
        "sourceImage": {
            handler() {
                this.drawImage()
            }
        }
    },
    beforeCreate() {
    },
    mounted() {
        if (!window) {
            return
        }

        window.addEventListener("resize", this.drawImage)

    },
    methods: {
        loadImage(src: string) {
            return new Promise(resolve => {
                const image = new Image()
                image.onload = () => {
                    this.sourceImage = image
                    resolve(image)
                }
                image.src = src
            })
        },
        drawImage() {
            const canvas = document.createElement("canvas")
            if (!canvas) {
                throw new Error("Can not find canvas element")
            }
            canvas.height = this.$el.clientHeight
            canvas.width = this.$el.clientWidth
            
            const context = canvas.getContext("2d")
            if (!context) {
                throw new Error("Can not get context")
            }
            if (!this.sourceImage) {
                throw new Error("Missing source image")
            }


            if (this.tweens.length > 0) {
                this.tweens.forEach(tween => gsap.killTweensOf(tween))
            }

            const canvasWidth = canvas.width
            const canvasHeight = canvas.height
            const imgWidth = this.sourceImage.width
            const imgHeight = this.sourceImage.height
            
            // Calculate aspect ratios
            const canvasAspect = canvasWidth / canvasHeight
            const imgAspect = imgWidth / imgHeight
            
            let drawWidth, drawHeight, offsetX, offsetY
            
            // Determine the dimensions and position to cover the canvas
            if (imgAspect < canvasAspect) {
                // Image is wider than the canvas
                drawWidth = canvasWidth
                drawHeight = canvasWidth / imgAspect
                offsetX = 0
                offsetY = (canvasHeight - drawHeight) / 2
            } else {
                // Image is taller than the canvas
                drawWidth = canvasHeight * imgAspect
                drawHeight = canvasHeight
                offsetX = (canvasWidth - drawWidth) / 2
                offsetY = 0
            }
            context.drawImage(this.sourceImage, offsetX, offsetY, drawWidth, drawHeight)

            let tileSize = this.options?.tileSize ? this.options.tileSize : 32
            let cols = canvasWidth / tileSize
            let rows = canvasHeight / tileSize
            
            let points = [] as Array<{ x: number, y:number }>
            // Loop through each tile
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const x = col * tileSize
                    const y = row * tileSize
                    points.push({ x,y })
                }
            }
            this.drawLoop({
                points: shuffle(points),
                sourceCanvas: canvas,
                tileSize
            })
            
        },
        drawLoop(opts: {
            sourceCanvas: HTMLCanvasElement,
            tileSize: number,
            points:Array<{ x:number, y:number }>
        }) {
            
            const canvas = this.$el as HTMLCanvasElement
            if (!canvas) {
                throw new Error("Can not find canvas element")
            }
            canvas.height = this.$el.clientHeight
            canvas.width = this.$el.clientWidth

            const context = canvas.getContext("2d")
            if (!context) {
                throw new Error("Can not get context")
            }

            const duration = this.options?.duration ? this.options.duration : .8
            const startScreenWidth = this.$el.clientWidth
            
            opts.points.forEach((point, index) => {
                // Draw each tile on the canvas with initial opacity of 0                
                context.globalAlpha = 0
                const delay = (index) * 0.0016 * duration
                // Animate the opacity of the tile
                this.tweens.push(gsap.to(context, {
                    globalAlpha: 1,
                    duration,
                    ease: "power3.inOut",
                    delay: delay,
                    onUpdate:() => {
                        if (this.$el.clientWidth != startScreenWidth) {
                            return
                        }
                        context.drawImage(opts.sourceCanvas, point.x, point.y, opts.tileSize, opts.tileSize, point.x, point.y, opts.tileSize, opts.tileSize)
                    }
                }))
            })
        }
    }
})
</script>

<style lang="scss">
@import "./../assets/scss/variables";

</style>
