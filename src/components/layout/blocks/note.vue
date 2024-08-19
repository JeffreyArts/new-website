<template>
    <div class="note-block">
        <SlateText class="note-block-text" @loaded="textLoaded" :data="options.text" />
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import SlateText, { SlateNode } from "@/components/slate-text.vue"

export type NoteBlock = {
    blockType: "note"
    size: number
    id: string
    text: SlateNode
}

export default defineComponent ({
    name: "noteBlock",
    components: {
        SlateText
    }, 
    props: {
        options: {
            type: Object as PropType<NoteBlock>,
            required: true
        },
    },
    mounted() {
        if (typeof window === "undefined") {
            return
        }
    },
    methods: {
        textLoaded() {
            // console.log("text loaded", this.$el.clientWidth, this.$el.clientHeight, this.$el.innerHTML)
            setTimeout(()=> {
                // Needs rework 
                this.$emit("blockLoaded")
            })
        }
    }
})

</script>

<style lang="scss">
@import "./../../../assets/scss/variables.scss";
.note-block {
    background-color: #ffffe8;
    padding: 16px 20px;
    line-height: 1.28;
    display: flex;
    width: 100%;

    a {
        color: var(--blue);
        [v="1"] {
            fill: var(--blue);
            transition: $transitionDefault;
        }

        &:hover,
        &:focus {
            text-decoration: none;

            [v="1"] {
                fill: var(--contrast-color);
            }
    
        }

        &:visited {
            color: var(--pink);
            [v="1"] {
                fill: var(--pink);
            }
        }
    }
}

.note-block-text {
    display: inline-block;
    width: 100%;
}


.note-block {
    font-family: $accentFont;

    h1, h2, h3, h4, h5, h6 {
        font-family: $defaultFont;
        margin: 0 0 8px;
    }
    
    h1 {
        font-stretch: 80%;
        font-weight: 400;
        font-size: 32px;
    }
    h2 {
        font-stretch: 100%;
        font-weight: 640;
        font-size: 24px;
    }
    h3 {
        font-stretch: 96%;
        font-weight: 480;
        font-size: 24px;
        letter-spacing: -.24px;
    }
    h4 {
        font-stretch: 120%;
        font-weight: 400;
        font-size: 20px;
        letter-spacing: -0.16px;
    }
    h5 {
        font-stretch: 120%;
        font-weight: 200;
        font-size: 18px;
        letter-spacing: -0.16px;
    }
    h6 {
        font-stretch: 88%;
        font-weight: 200;
        font-size: 16px;
    }

    ol, ul {
        margin: 8px 0;
        padding: 0 0 0 16px;
    }
}

</style>