<template>
        <div class="title-block">
            <h1 title="options.text" ref="title">
                {{options.text}}
            </h1>
        </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"

export type TitleBlock = {
    size: number
    id: string
    text: string
    blockType: "title"
}

export default defineComponent ({
    name: "titleBlock", 
    props: {
        options: {
            type: Object as PropType<TitleBlock>,
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
        "options.text": {
            handler() {
                
            },
            immediate: true
        }
    },
    mounted() {
        if (typeof window === "undefined") {
            return
        }

        this.$emit("blockLoaded", this.$el.clientWidth / this.$el.clientHeight)
    },
    unmounted() {
        //
    },
    methods: {
        animateIn(){
            const h1 = this.$refs["title"] as HTMLElement
            if (!h1) {
                return
            }
        }
    }
})

</script>

<style lang="scss">

.title-block {
    display: flex;
    justify-content: center;
    align-items: center;
    aspect-ratio: 6/4;

    h1 {
        font-weight: 240;
        font-stretch: 80%;
        letter-spacing: .016em;
        font-size: 48px;
    }    
}

</style>