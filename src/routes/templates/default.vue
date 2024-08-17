<template>
    <Layout v-if="page.layout" :options="{
        layoutGap: 40,
        layoutSize: layoutSize,
        blocks: page.layout.blocks
    }"/>
    <div class="home">
    <h1>{{ breakpoint }}</h1>
        <section class="container">
            {{ page.layout }}
            
        </section>
    </div>
</template>


<script lang="ts">
import { defineComponent } from "vue"
import payloadStore from "@/stores/payload"
import Page, { PageType } from "@/services/payload/page"
import gsap from "gsap"
import { useHead }  from "@unhead/vue"
import { useRoute } from "vue-router"
import Layout from "@/components/layout/index.vue"

export default defineComponent ({ 
    name: "defaultTemplate",
    components: {
        Layout 
    },
    props: [],
    setup() {
        const Payload = payloadStore()
        const route = useRoute()
        const title = route.name as string
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

        useHead({
            title,
            meta
        })
        return { Payload }
    },
    data() {
        return {
            breakpoint: "",
            layoutSize: 8,
            page: {} as PageType,
        }
    },
    watch: {
        "$route.path": {
            async handler() {
                // Remove old content
                await this.loadPage()

                this.updateLayoutSize()
                // Add new content
            }, 
            immediate: true
        }
    },
    mounted() {
        if (typeof window === "undefined") {
            return
        }

        window.addEventListener("resize", this.updateLayoutSize)
    },
    unmounted() {
        window.removeEventListener("resize", this.updateLayoutSize)
    },
    methods: {
        async loadPage() {
            try {
                const res = await Page.getPageByPath(this.$route.path)
                if (!res.data || res.data.docs.length !== 1) {
                    this.$router.push("/404")
                    return
                }

                this.page = res.data.docs[0] as PageType

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
            let breakPoint = "xs"
            for (const point in breakPoints) {
                breakPoint = point
                if (breakPoints[point] > window.innerWidth) {
                    break
                }
            }
            this.breakpoint = breakPoint
            const size = `size_${this.breakpoint}` as "size_xs" | "size_s" | "size_m" | "size_l" | "size_xl" 
            this.layoutSize = this.page.layout[size]
            console.log("updateLayoutSize: ",breakPoint, window.innerWidth)
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