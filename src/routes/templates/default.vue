<template>
    <section class="default-template">

        <Breadcrumbs />
        
        <Layout v-if="page.layout" :options="{
            layoutGap: 40,
            id: page.id,
            layoutSize: layoutSize,
            blocks: page.blocks
        }"/>
        <Filter v-if="page.filter" :options="page.filter"/>
    </section>
</template>


<script lang="ts">
import { defineComponent } from "vue"
import payloadStore from "@/stores/payload"
import Page, { PageType } from "@/services/payload/page"
import { useHead }  from "@unhead/vue"
import { useRoute, RouteLocationNormalizedLoaded } from "vue-router"
import Breadcrumbs from "@/components/breadcrumbs.vue"
import Filter from "@/components/filter.vue"
import Layout from "@/components/layout/index.vue"

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
        Breadcrumbs,
        Layout,
        Filter
    },
    props: [],
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
    watch: {
        "$route.path": {
            async handler() {
                // Remove old content
                await this.loadPage()
                if (typeof window === "undefined") {
                    return
                }

                if (this.head) {
                    this.head.patch({
                        title: this.$route.name,
                        meta: setMeta(this.$route)
                    })
                }
                
                // Add new content
                this.updateLayoutSize()
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
                this.page = res as PageType

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

<style lang="scss" scoped>
@import "@/assets/scss/variables.scss";



.site-breadcrumbs {
    margin-top: 40px;
    margin-left: 8px;
}
    
@media screen and (min-width: 640px) {
    .site-breadcrumbs {
        margin-left: 16px;
        margin-top: 60px;
    }
}

@media screen and (min-width: 800px) {
    .site-breadcrumbs {
        margin-top: 80px;
    }
}
</style>