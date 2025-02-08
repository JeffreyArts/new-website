<template>
    <div class="model3D-block">
        <iframe :src="url" frameborder="0" allow="fullscreen" allowfullscreen ref="model3D" class="model3D-iframe" />

        <span @click="setFullscreen" class="model3D-block-fullscreen-button">
            <jaoIcon name="fullscreen" size="medium" />
        </span>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import jaoIcon from "./../../jao-icon.vue"

export type model3DBlock = {
    blockType: "model3D"
    size: number
    id: string
    color: string
    source: {
        id: string
        mimeType: string
        url: string
        thumbnailURL: string
    }
}

export default defineComponent ({
    name: "model3DBlock",
    components: {
        jaoIcon, 
    }, 
    props: {
        options: {
            type: Object as PropType<model3DBlock>,
            required: true
        },
    },
    data() {
        return {
        }
    },
    mounted() {
        if (typeof window === "undefined") {
            return
        }
        console.log("3d model block loaded", this.options)
        this.$emit("blockLoaded")
    },
    computed: {
        url() {

            let url = `${import.meta.env.VITE_PAYLOAD_REST_ENDPOINT}/media/3d-model/${this.options.source.id}`

            if (this.options.color) {
                url += `?color=${this.options.color}`
            }

            return url
        }
    },
    methods: {
        refreshIframe(){
            const model3D = this.$refs["model3D"] as HTMLIFrameElement
            if (!model3D){
                return
            }
            model3D.src = model3D.src
        },
        setFullscreen() {
            const model3D = this.$refs["model3D"] as HTMLIFrameElement
            model3D.requestFullscreen()
        },
    },
})

</script>

<style lang="scss">
@use "./../../../assets/scss/variables.scss";

.model3D-block {
    position: relative;
    aspect-ratio: 1;
}

.model3D-iframe {
    width: 100%;
    aspect-ratio: 1;
}

.model3D-block-fullscreen-button {
    display: inline-block;
    transition: var(--transition-default);
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
    svg {
        transition: var(--transition-default);
        height: 26px;
        color: #111;
    }
}

</style>