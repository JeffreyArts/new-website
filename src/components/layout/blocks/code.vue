<template>
    <div class="code-block">
        <header class="code-block-header">
            <jaoIcon size="medium" name="terminal" />{{ options.title }}
        </header>
        <section class="code-block-content" :style="maxHeight ? `max-height:${maxHeight}px;` : ''" ref="codeBlock">
            <highlightjs :language="options.language" :code="options.code" />
        </section>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import jaoIcon from "./../../jao-icon.vue"
import highlightjs from "./../../highlightjs.vue"

export type CodeBlock = {
    blockType: "code"
    size: number
    id: string
    title: string
    language: string
    code: string
}

export default defineComponent ({
    name: "codeBlock",
    components: {
        jaoIcon, 
        highlightjs
    }, 
    props: {
        options: {
            type: Object as PropType<CodeBlock>,
            required: true
        },
    },
    data() {
        return {
            maxHeight: undefined as undefined | number
        }
    },
    mounted() {
        if (typeof window === "undefined") {
            return
        }
        setTimeout(()=> {
            this.$emit("blockLoaded")
        })

        window.addEventListener("layoutChange", this.onLayoutChange)
    },
    unmounted() {
        window.removeEventListener("layoutChange", this.onLayoutChange)
    },
    methods: {
        onLayoutChange(){
            console.log("On layout Change")
            if (this.$el) {
                this.maxHeight = this.$el.clientWidth
            }
        }
    },
})

</script>

<style lang="scss">
@import "./../../../assets/scss/variables.scss";
.code-block-header {
    background-color: #dfdfdf;
    width: 100%;
    display: flex;
    align-items: center;
    border-radius: 8px 8px 0 0;
    padding: 8px;
    gap:12px;
    font-family: $accentFont;

    svg {
        height: 26px;
    }
}

.code-block-content {
    display: block;
    width: 100%;
    background-color: var(--contrast-color);
    color: var(--bg-color);
    padding: 0;
    border-radius: 0 0 4px 4px;
    overflow: auto;
    padding: 16px 12px;
    pre {
        margin: 0;
    }
}
</style>