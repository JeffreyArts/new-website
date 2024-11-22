<template>
    <section class="default-template" v-if="!is404">

        <Breadcrumbs />
        
        <Layout v-if="Payload?.page?.data?.layout" :options="{
            layoutGap: 40,
            id: Payload.page?.data.id,
            layoutSize: layoutSize,
            blocks: pageBlocks
        }" ref="layout"/>
        <FilterComponent v-if="Payload.page?.data?.filter?.name && showFilters" :options="Payload.page?.data?.filter" :pageDetails="Payload.page.data" ref="filter" @filterUpdated="updateFilter"/>
    </section>

    <page404 v-if="is404"/>
</template>


<script lang="ts">
import { defineComponent, ref, nextTick } from "vue"
import { PageType } from "@/model/payload/page"
import payloadStore from "@/stores/payload"
import { useHead }  from "@unhead/vue"
import { useRoute, RouteLocationNormalizedLoaded } from "vue-router"
import Breadcrumbs from "@/components/breadcrumbs.vue"
import FilterComponent from "@/components/filter.vue"
import Layout from "@/components/layout/index.vue"
import page404 from "@/routes/error-404.vue"
import { BlockType } from "@/components/layout/layout-types"

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
        page404,
        FilterComponent
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
    computed: {
        showFilters() {
            if (this.Payload?.page?.data?.filter && typeof this.Payload.page.data.displayFilters === "boolean") {
                return this.Payload.page.data.displayFilters
            } else {
                return true
            }
        },
    },
    data() {
        return {
            breakpoint: "",
            layoutSize: 8,
            is404: false,
            pageBlocks: [] as Array<BlockType>
        }
    },
    watch: {
        "Payload.page.data.blocks": {
            handler() {
                this.pageBlocks = []
                this.$nextTick(() => {
                    if (this.Payload.page) {
                        this.pageBlocks = this.Payload.page.data.blocks
                    }
                })
            }
        },
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
                const res = await this.Payload.getPageByPath(this.$route.path)
                // this.Payload.page?.data = res as PageType

            } catch (error) {
                console.error("Error loading page:", error)
                this.is404 = true
                // this.$router.push("/404")
            }
        },
        updateLayoutSize() {
            if (!this.Payload.page?.data.layout) {
                return
            }
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
            this.layoutSize = this.Payload.page?.data.layout[size]
        },
        updateFilter() {
            // Do stuff if you'd wish
        }
    }
})

</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables.scss";



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