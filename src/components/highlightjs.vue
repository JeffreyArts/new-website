<template>
    <pre><code v-html="hljsCode"></code></pre>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import hljs from "highlight.js/lib/core"

export default defineComponent ({
    name: "highlightJs", 
    props: {
        language: {
            type: String  as PropType<"typescript" | "javascript" | "arduino" | "bash" | "html" | "php">,
            required: true
        },
        code: {
            type: String,
            required: true
        },
    },
    computed: {
        hljsCode() {
            return hljs.highlight(this.code, { language: this.language }).value
        }
    
    },
})

</script>
