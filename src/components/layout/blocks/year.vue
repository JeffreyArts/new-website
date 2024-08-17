<template>
        <div class="year-block" ref="year">
            
        </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import _ from "lodash"
import gsap from "gsap"
import  * as jaoIcons  from "jao-icons"
const { Icon } = jaoIcons

export type YearBlock = {
    size: number
    id: string
    year: string
    blockType: "year"
}

export default defineComponent ({
    name: "yearBlock", 
    components: {},
    props: {
        options: {
            type: Object as PropType<YearBlock>,
            required: true
        },
    },
    data() {
        return {
            
        }
    },
    computed: {
    },
    watch:{
        "options.year": {
            handler() {
                this.updateSVG()
            },
            immediate: true
        }
    },
    mounted() {
        if (typeof window === "undefined") {
            return
        }
        this.updateSVG()
        window.addEventListener("layoutChange", this.updateSVG)
        window.addEventListener("layoutChange", this.onResize)
    },
    unmounted() {
        window.removeEventListener("layoutChange", this.onResize)
        window.removeEventListener("layoutChange", this.updateSVG)
        //
        //
    },
    methods: {
        updateSVG(){
            let size = "small"
            if (window.innerWidth > 960) {
                size = "medium"
            }
            const svg = Icon(this.options.year, size)
            const targetEL = this.$refs["year"] as HTMLElement
              
            if (!svg) {
                throw new Error(`Can not create icon for number ${this.options.year}`)
            }
            if (!targetEL) {
                return
            }

            const oldSVG = targetEL.querySelectorAll("svg")
            if (oldSVG) {
                oldSVG.forEach(old => old.remove())
            }

            targetEL.appendChild(svg)

            setTimeout(() => {
                const colorV1 = window.getComputedStyle( this.$el.querySelector("rect[v='1']")).fill
                const colorV0 = window.getComputedStyle( this.$el.querySelector("rect[v='0']")).fill
                const rects = this.$el.querySelectorAll("rect")
                let res = _.map(rects, rect => {
                    const val = parseInt(rect.getAttribute("v"), 10)
                    rect.setAttribute("v", "0")
                    return {
                        el: rect,
                        v:  val,
                    }
                })

                res = _.shuffle(res)
                _.each(res, (obj, i) => {
                    let color = colorV0
                    if (obj.v === 1) {
                        color = colorV1
                    }

                    gsap.to(obj.el, {
                        duration:.54,
                        delay: 0.0032*i,
                        fill: color,
                        onComplete: () => {
                            obj.el.setAttribute("v", obj.v.toString())
                        }
                    })
                })
                this.$emit("blockLoaded", this.$el.clientWidth / this.$el.clientHeight)
            })
        }
    }
})

</script>

<style lang="scss">

.year-block {
    display: flex;
    justify-content: left;
    align-items: end;
    aspect-ratio: 16/9;

    svg {
        height: 80px;
    }
}

@media all and (min-width: 960px) {

    .year-block {
        svg {
            height: 128px;
        }
    }
    
}

</style>