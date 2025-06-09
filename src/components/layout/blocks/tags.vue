<template>
    <div class="tags-block">
        <a v-for="tag in options.tags" :href="tag.url + '#filter-layout'" class="tag">{{ tag.name }}</a>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"


export type TagsBlock = {
    blockType: "tags"
    tags: {name: string, url: string}[]
}

export default defineComponent ({
    name: "tagsBlock",
    watch: {
        "options": {
            handler() {
                this.$nextTick(() => {
                    this.$emit("blockLoaded")
                })
            },
            deep: true,
            immediate: true
        }
    },
    props: {
        options: {
            type: Object as PropType<TagsBlock>,
            required: true
        },
    },
    methods: {
        textLoaded() {
            this.$emit("blockLoaded")
        }
    }
})

</script>

<style lang="scss">
@use "./../../../assets/scss/variables";
.tags-block {
    width: 100%;

    a {
        line-height: 1.28;
        padding: 4px 8px;
        display: inline-block;
        font-size: 14px;
        font-family: var(--accent-font);
        text-decoration: none;
        color: var(--bg-color);
        background-color: var(--contrast-color);
        margin-right: 4px;
        margin-bottom: 4px;
        transition: background-color 0.16s ease;

        &:hover, &:focus {
            background-color: var(--accent-color);
        }
    }
}

</style>