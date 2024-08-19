<template>
    <!-- <component :is="compiledTemplate"></component> -->
     <div v-html="serializeData(data)"></div>
</template>
  
<script lang="ts">
import { defineComponent, PropType } from "vue"
// import { compile } from "esmBundler"
// import Icon from "jao-icons"
  
export interface SlateNode {
    children?: Array<SlateNode>
    bold?: boolean
    underline?: boolean
    strikethrough?: boolean
    italic?: boolean
    text?: string
    type?: string
    url?: string
}

const serialize = (node: SlateNode) => {
    let text = ""
    if (Array.isArray(node)) {
        text = node.map(n => serialize(n)).join("")
    }
    if (Array.isArray(node.children)) {
        text = node.children.map(n => serialize(n)).join("")
    }

    if (node.text) {
        text += node.text
    }

    if (node.type === "ol") { text = `<ol>${text}</ol>` }
    if (node.type === "ul") { text = `<ul>${text}</ul>` }
    if (node.type === "li") { text = `<li>${text}</li>` }
    if (node.type === "h1") { text = `<h1>${text}</h1>` }
    if (node.type === "h2") { text = `<h2>${text}</h2>` }
    if (node.type === "h3") { text = `<h3>${text}</h3>` }
    if (node.type === "h4") { text = `<h4>${text}</h4>` }
    if (node.type === "h5") { text = `<h5>${text}</h4>` }
    if (node.type === "h6") { text = `<h6>${text}</h4>` }

    if (node.bold) {
        text = `<strong>${text}</strong>`
    }

    if (node.italic) {
        text = `<em>${text}</em>`
    }

    if (node.strikethrough) {
        text = `<s>${text}</s>`
    }

    if (node.underline) {
        text = `<u>${text}</u>`
    }

    if (node.type === "link" && node.url) {
        text = `<a href="${node.url}">${text}</a>`
        // if (node.url[0] != "/") {
        //     const s = new XMLSerializer()
        //     const svg = Icon("medium/external-link")
        //     if (svg) {
        //         text = `<a href="${node.url}">${text}${s.serializeToString(svg)}</a>`
        //     } else {
        //         text = `<a href="${node.url}">${text}🔗</a>`
        //     }
                    
        // } else {
        //     text = `<RouterLink to="${node.url}">${text}</RouterLink>`
        // }
    }
    return text
}
        
export default defineComponent({
    props: {
        data: {
            type: Object as PropType<SlateNode>,
            required: true
        }
    },
    setup() {
        // Compile the HTML string into a render function
        // const compiledTemplate = computed(() => compile(serialize(props.data)))
  
        // return {
        //     compiledTemplate
        // }
    },
    data() {
        return {
            loaded: false
        }
    },
    methods: {
        serializeData(node: SlateNode) {
            const res = serialize(node)
        
            if (!this.loaded) {
                this.loaded = true

                // Timeout to give time for dom to be updated
                setTimeout(() => {
                    this.$emit("loaded")
                })
            }
            return res
        }
    }
})
</script>
  
<style lang="scss" scoped>
.jao-icon {
    height: 16px;
    margin: 0 4px;
    translate: 0 2px;
}
</style>