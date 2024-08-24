<template>
    <Layout v-if="page.layout" :options="{
        layoutGap: 40,
        id: page.id,
        layoutSize: layoutSize,
        blocks: page.layout.blocks 
    }"/>
</template>


<script lang="ts">
import { defineComponent, PropType } from "vue"
import payloadStore from "@/stores/payload"
import { PageType } from "@/services/payload/page"
import { useHead }  from "@unhead/vue"
import { useRoute, RouteLocationNormalizedLoaded } from "vue-router"
import Layout from "@/components/layout/index.vue"
import _ from "lodash"
import { BlockType } from "./../components/layout/layout-types" 
import { subscribe, ready } from "@payloadcms/live-preview"


const setMeta = (route: RouteLocationNormalizedLoaded) => {
    const meta = [] as Array<{
        name: string,
        content: string
    }>

    if (typeof route.meta?.description === "string" && route.meta.description.length > 0) {
        meta.push({
            name: "description",
            content: route.meta.description
        })
    }

    if (typeof route.meta?.keywords === "string" && route.meta.keywords.length > 0) {
        meta.push({
            name: "keywords",
            content: route.meta.keywords
        })
    }
    return meta
} 

export default defineComponent ({ 
    name: "defaultTemplate",
    components: {
        Layout 
    },
    props: {
        initialData: {
            type: Object as PropType<PageType>,
            required: true
        },
    },
    setup() {
        const Payload = payloadStore()
        const route = useRoute()
        const title = route.name as string

        
        return { 
            Payload,
            head:  useHead({
                title,
                meta: setMeta(route)
            }) 
        }
    },
    data() {
        return {
            breakpoint: "",
            layoutSize: 8,
            oldData: "",
            page: {} as PageType,
        }
    },
    // watch: {
    //     "$route.path": {
    //         async handler() {
    //             // Remove old content
    //             if (typeof window === "undefined") {
    //                 return
    //             }
                    
                    
    //             // Add new content
    //             this.updateLayoutSize()
    //         }, 
    //         immediate: true
    //     }
    // },
    mounted() {
        if (typeof window === "undefined") {
            return
        }

        subscribe({
            serverURL: import.meta.env.VITE_PAYLOAD_ENDPOINT, 
            callback: this.loadPage,
            initialData: this.page,
            depth:2
        })
        ready({
            serverURL: import.meta.env.VITE_PAYLOAD_ENDPOINT, 
        })
                        
        // this.loadPage()
                        
        // window.addEventListener("postMessage", this.onPostMessage)
        window.addEventListener("resize", this.updateLayoutSize)
    },
    unmounted() {
        // window.removeEventListener("postMessage", this.onPostMessage)
        window.removeEventListener("resize", this.updateLayoutSize)
    },
    methods: {
        loadPage(data) {
            try {

                data.layout.blocks = _.map(data.layout.blocks, (block, index) => {
                    return {
                        size: block.size,
                        position: parseInt(index) + 1,
                        id: block.id,
                        data: _.omit(block, ["size", "id"]),
                    } as BlockType
                })

                                
                const oldData = btoa(JSON.stringify(data))
                if (oldData != this.oldData) {

                    this.page = data

                    if (this.head) {
                        this.head.patch({
                            title: this.$route.name,
                            meta: setMeta(this.$route)
                        })
                    }
                    this.updateLayoutSize()
                }
                this.oldData = oldData
                console.log(this.oldData)
                
            } catch (error) {
                console.error("Error loading page:", error)
                this.$router.push("/404")
            }
        },
        updateLayoutSize() {
            if (!this.page.layout) {
                return
            }
            // console.log(this.page)
            // Match these with Payload::pages.fields.layout for best DX
            const breakPoints = {
                xs: 320,
                s: 640,
                m: 960,
                l: 1280,
                xl: 1600,
            }
            
            let breakPoint: keyof typeof breakPoints = "xs"
            for (const point in breakPoints) {
                breakPoint = point as keyof typeof breakPoints
                
                if (typeof breakPoints[breakPoint] === "number" && breakPoints[breakPoint] > window.innerWidth) {
                    break
                }
            }
            this.breakpoint = breakPoint
            const size = `size_${this.breakpoint}` as "size_xs" | "size_s" | "size_m" | "size_l" | "size_xl" 
            this.layoutSize = this.page.layout[size]
        }
    }
})

</script>

<style lang="scss">
@import "@/assets/scss/variables.scss";
@supports (font-variation-settings: "wdth" 115) {
  h1 {
    display: inline-block;
    width: 200px;
    text-align: center;
  }
}
</style>