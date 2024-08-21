<template>
    <div class="iframe-block">
        <header class="iframe-block-header">
            <ul>
                <li></li>
                <li></li>
                <li></li>
            </ul>
            
            <span class="iframe-block-header-title">
                <a :href="options.url" target="_blank" class="iframe-block-header-link">
                    {{ title }}
                    <jaoIcon name="external-link" size="medium" />
                </a>
            </span>
            
        </header>
        <section class="iframe-block-content" :style="{
            scale: options.autoScaling ? scale : 1,
            height: frame.height,
            width: frame.width}"
            :type="frame.size"
            ref="iframeBlock">
            <iframe :src="options.url" frameborder="0" ></iframe>
            
            <!-- Kost iets teveel moeite denk ik, ivm met logica van this.frame.width -->
            <!--
            <span @click="setFullscreen" target="_blank">
                <jaoIcon name="fullscreen" size="medium" />
            </span>
            -->
        </section>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import jaoIcon from "./../../jao-icon.vue"

export type iframeBlock = {
    blockType: "iframe"
    size: number
    id: string
    title: string
    url: string
    autoScaling: string
    portraitRatio: string
    landscapeRatio: string
}

export default defineComponent ({
    name: "iframeBlock",
    components: {
        jaoIcon, 
    }, 
    props: {
        options: {
            type: Object as PropType<iframeBlock>,
            required: true
        },
    },
    data() {
        return {
            scale: 1,
            title: "",
            isFullscreen: false,
            frame: {
                width: "100px",
                height: "100px",
                size: "dynamic" as "dynamic" | "phone" | "tablet" | "desktop"
            },
        }
    },
    mounted() {
        if (typeof window === "undefined") {
            return
        }
        this.setTitle()
        this.onLayoutChange()
        setTimeout(()=> {
            this.$emit("blockLoaded")
        })


        window.addEventListener("layoutChange", this.onLayoutChange)
    },
    unmounted() {
        window.removeEventListener("layoutChange", this.onLayoutChange)
    },
    methods: {
        setTitle(){
            this.title = this.options.title

            if (!this.title) {
                this.title = new URL(this.options.url).hostname
            }
        },
        setFullscreen() {

        },
        onLayoutChange(){
            if (!this.options.autoScaling) {
                if (window.innerHeight/window.innerWidth < 1) { // Landscape
                    const width = parseInt(this.options.landscapeRatio.split("/")[0])
                    const height = parseInt(this.options.landscapeRatio.split("/")[1])
                    const ratio =  height / width
                    this.frame.width = `${this.$el.clientWidth}px`
                    this.frame.height = `${this.$el.clientWidth * ratio}px`
                } else if (window.innerHeight/window.innerWidth > 1) { // Landscape
                    const width = parseInt(this.options.portraitRatio.split("/")[0])
                    const height = parseInt(this.options.portraitRatio.split("/")[1])
                    const ratio =  height / width
                    this.frame.width = `${this.$el.clientWidth}px`
                    this.frame.height = `${this.$el.clientWidth * ratio}px`
                } else {
                    // shouldn't occur, but better safe than sorry
                    this.frame.width = this.$el.clientWidth
                    this.frame.height = this.$el.clientWidth
                }
            } else {

                if (this.$el.clientWidth < 512) {
                    this.frame.width = "375px"
                    this.frame.height = "812px"
                    this.frame.size = "phone"
                    this.scale = this.$el.clientWidth / 375
                } else if (this.$el.clientWidth < 768) {
                    this.frame.size = "tablet"
                    this.frame.width = "1024px"
                    this.frame.height = "768px"
                    this.scale = this.$el.clientWidth / 1024
                } else {
                    this.frame.size = "desktop"
                    this.frame.width = "1440px"
                    this.frame.height = "810px"
                    this.scale = this.$el.clientWidth / 1440
                }

            }
        }
    },
})

</script>

<style lang="scss">
@import "./../../../assets/scss/variables.scss";


.iframe-block-header {
    position: relative;
    background-color: #dfdfdf;
    background-image: linear-gradient(0deg, rgba(0,0,0,.08), transparent);
    width: 100%;
    color: #111;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px 8px 0 0;
    gap:12px;
    font-family: $accentFont;


    ul { 
        position: absolute;
        top: 50%;
        display: flex;
        gap: 4px;
        flex-flow: row;
        top: 14px;
        left: 14px;
        margin: 0;
        padding: 0;

        li {
            display: block;
            padding: 0;
            margin: 0;
            border-radius: 100%;
            width: 8px;
            height: 8px;
            background-color: rgba(0,0,0,.08);
        }
    }
}

.iframe-block-header-title {
    padding: 8px;
    display: inline-block;
    text-decoration: none;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    max-width: calc(100% - 128px);
}

.iframe-block-header-link {
    color: currentColor;
    text-decoration: none;

    svg {
        transition: $transitionDefault;
        height: 13px;
        translate: 0 2px;
        opacity: 0;
    }

    &:hover,
    &:focus {
        svg {
            opacity: 1;
        }
    }
}

.iframe-block-content {
    background-image: linear-gradient(180deg, rgba(0,0,0,.16), transparent 8px);
    display: block;
    width: 100%;
    background-color: #111;
    color:  #eee;
    padding: 0;
    border-radius: 0 0 4px 4px;
    overflow: auto;
    padding: 0;
    overflow: hidden;
    position: relative;
    display: flex;
    border-left: 1px solid #ccc;
    border-right: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    transform-origin: top left;

    iframe {
        margin: 0;
        width: 100%;
        height: 100%;
    }
    a {
        display: inline-block;
        transition: $transitionDefault;
        padding: 8px 4px 4px 8px;
        position: absolute;
        bottom: 0;
        right: 0;

        &:hover,
        &:focus {
            background: rgba(255,255,255,.8);
            svg {
                height: 52px;
            }
        }
    }
    svg {
        transition: $transitionDefault;
        height: 26px;
        color: #111;
    }
}
</style>