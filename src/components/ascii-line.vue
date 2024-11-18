<template>
    <div class="ascii-line-wrapper">
        <div class="ascii-line" ref="line">{{ line }}</div>
    </div>
</template>


<script lang="ts">
import { defineComponent } from "vue"


export default defineComponent({
    name: "acii-line",
    props: {
        character: {
            type: String,
            required: false,
            default: "─"
        },
    },
    data: () => {
        return {
        }
    },
    computed: {
        line() {
            return this.character.repeat(256)
        }
    },
    mounted() {
        if (this.$refs["line"] instanceof HTMLElement) {
            const lineHeight = parseInt(window.getComputedStyle(this.$refs["line"]).lineHeight)
            this.$refs["line"].style.height = `${ lineHeight }px`
        }
    },
    methods: {
        
    }
})
</script>

<style lang="scss" scoped>
@use "./../assets/scss/variables.scss";
.ascii-line {
    width: 100vw;
    line-height: 1.28em;
}

.ascii-line-wrapper {
    width: 100%;
    overflow: hidden;
}
</style>
