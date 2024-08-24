<template>
    <Layout v-if="page.layout" :options="{
        layoutGap: 40,
        id: page.id,
        layoutSize: layoutSize,
        blocks: page.layout.blocks 
    }"/>
    <!-- <pre v-if="page">{{ page }}
    </pre> -->
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
        // window.addEventListener("resize", this.updateLayoutSize)
    },
    unmounted() {
        // window.removeEventListener("postMessage", this.onPostMessage)
        // window.removeEventListener("resize", this.updateLayoutSize)
    },
    methods: {
        loadPage(data) {
            try {
                console.log("data", data)
                // // Step 1: Decode the base64 string back to a Buffer/Uint8Array
                // const decodedBuffer = atob(this.$route.query.data)  // atob() decodes a base64-encoded string

                // // Step 2: Convert the Buffer back to a string
                // // In the browser, you can create a string from the decoded buffer using TextDecoder or String.fromCharCode
                // const decodedString = new TextDecoder().decode(
                //     new Uint8Array([...decodedBuffer].map(char => char.charCodeAt(0)))
                // )

                // // Step 3: Parse the JSON string back to an object
                // const req =  JSON.parse(decodedString)

                data.layout.blocks = _.map(data.layout.blocks, (block, index) => {
                    return {
                        size: block.size,
                        position: parseInt(index) + 1,
                        id: block.id,
                        data: _.omit(block, ["size", "id"]),
                    } as BlockType
                })

                this.page = data

                if (this.head) {
                    this.head.patch({
                        title: this.$route.name,
                        meta: setMeta(this.$route)
                    })
                }
                this.updateLayoutSize()
                // this.page =  JSON.parse(Buffer.from(this.$route.query.data, "base64").toString())
                
            } catch (error) {
                console.error("Error loading page:", error)
                this.$router.push("/404")
            }
        },
        // // mapBlocks(   ) {
            
        // // }
        // onPostMessage(e: Event, data) {
        //     console.log(e, data)
        // },
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
    // color: #f09;
    display: inline-block;
    width: 200px;
    text-align: center;
  }
}
</style>