<template>
        <div class="year-block" ref="year">
            
        </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import  * as jaoIcons  from "jao-icons"
const { Icon } = jaoIcons

export type yearBlock = {
    size: number
    year: string
}

export default defineComponent ({
    name: "yearBlock", 
    components: {},
    props: {
        options: {
            type: Object as PropType<yearBlock>,
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
        window.addEventListener("resize", this.updateSVG)
    },
    unmounted() {
        window.removeEventListener("resize", this.updateSVG)
        //
    },
    methods: {
        updateSVG(){
            let size = "small"
            if (window.innerWidth > 960) {
                size = "medium"
            }
            const svg = Icon(this.options.year, size)
            const targetEL = this.$refs["year"]
            console.log("targetEL",targetEL)
              
            if (!targetEL) {
                return
            }

            const oldSVG = targetEL.querySelectorAll("svg")
            if (oldSVG) {
                oldSVG.forEach(old => old.remove())
            }

            targetEL.appendChild(svg)
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