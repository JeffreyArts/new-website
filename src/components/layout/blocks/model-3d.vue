<template>
    <div class="model3D-block">
        <iframe :src="url" frameborder="0" allow="fullscreen" allowfullscreen ref="model3D" class="model3D-iframe" />
        <div class="model3D-icons">
            <span v-if="options.downloadable" class="action" @click="downloadModel">
                <jaoIcon name="download" size="medium" />
            </span>
            <span @click="setFullscreen" class="action">
                <jaoIcon name="fullscreen" size="medium" />
            </span>
        </div>
        <span class="model3D-block-title" v-if="options.title">
            {{options.title}}
        </span>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import jaoIcon from "./../../jao-icon.vue"
import { saveAs } from 'file-saver';

export type Model3DBlock = {
    blockType: "model3D"
    size: number
    id: string
    color: string
    downloadable: boolean
    title: string
    source: {
        id: string
        mimeType: string
        url: string
        filename: string
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
            type: Object as PropType<Model3DBlock>,
            required: true
        },
    },
    watch: {
        "options": {
            handler() {
                this.$emit("blockLoaded")
            },
            deep: true,
            immediate: true
        }
    },
    data() {
        return {
        }
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
        downloadModel() {
            const url = `${import.meta.env.VITE_PAYLOAD_ENDPOINT}/${this.options.source.url}`
            saveAs(url, this.options.source.filename)
        }
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

.model3D-icons {
    display: flex;
    gap: 8px;
    padding: 8px 4px 4px 8px;
    position: absolute;
    bottom: 2px;
    right: 0;
    height: 26px;

    .action {
        transition: var(--transition-default);
        display: inline-block;
        

        &:hover,
        &:focus {
            background: rgba(255,255,255,.8);
            svg {
                translate: 0 -26px;
                height: 52px;
            }
        }
        svg {
            transition: var(--transition-default);
            height: 26px;
            color: #111;
        }
    }
}


.model3D-block-title {
    display: inline-block;
    background-color: var(--contrast-color);
    color: var(--bg-color);
    position: absolute;
    bottom: -10px;
    left: 0;
    padding: 8px;
    font-size: 14px;
    font-family: 'Fixedsys';
    max-width: calc(100% - 64px);
}

</style>