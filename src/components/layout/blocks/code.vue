<template>
    <div class="code-block">
        <header class="code-block-header">
            <jaoIcon size="medium" name="terminal" class="code-block-header-icon"/>
            
            <span class="code-block-header-title">
                {{ options.title }}
            </span>
            
            <span class="code-block-header-link">
                <a :href="options.link" target="_blank" title="View code at Github" v-if="options.link && options.link.indexOf('github') > 0">
                    <svg viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" fill="currentColor"/></svg>
                </a>
                <a :href="options.link" target="_blank" title="View code at NPM" v-if="options.link && options.link.indexOf('npm') > 0">
                    <svg id="npm-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 240"> <rect x="240" y="90" width="30" height="60"/> <rect x="90" y="90" width="30" height="90"/> <rect x="150" y="30" width="30" height="210"/> <rect x="390" y="90.5" width="30" height="90"/> <rect x="450" y="90" width="30" height="90"/> <rect x="510" y="30" width="30" height="180"/> <rect y="30" width="30" height="180"/> <rect x="300" y="30" width="30" height="180"/> <rect x="240" y="180" width="300" height="30"/> <rect y="30" width="540" height="30"/> <rect y="180" width="180" height="30"/> <rect x="150" y="210" width="120" height="30"/> </svg> 
                </a>
            </span>
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
    link: string
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
    background-image: linear-gradient(0deg, rgba(0,0,0,.08), transparent);
    width: 100%;
    display: flex;
    align-items: center;
    border-radius: 8px 8px 0 0;
    padding: 8px;
    gap:12px;
    font-family: $accentFont;
    justify-content: space-between;

    svg {
        height: 26px;
    }

    #npm-svg {
        height:20px;
        translate: 0 2px;
        rect {
            fill: currentColor;
        }
    }

    a { 
        color: var(--contrast-color);
        opacity: .64;
        transition: $transitionDefault;

        &:hover,
        &:focus {
            opacity: 1;
        }

        &:visited {
            color: var(--contrast-color);
        }
    }
}

.code-block-content {

    background-image: linear-gradient(180deg, rgba(0,0,0,.16), transparent 8px);
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