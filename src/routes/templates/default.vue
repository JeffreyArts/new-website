<template>
    <div class="home">
    <h1>ASF</h1>
        <section class="container">
            {{ page }}
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

export default defineComponent ({ 
    name: "defaultTemplate",
    components: { 
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
            page: {} as PageType
        }
    },
    watch: {
        "$route.path": {
            handler() {
                // Remove old content
                this.loadPage()
                // Add new content
            }, 
            immediate: true
        }
    },
    mounted() {
        // Animation for Title block
        gsap.fromTo("h1", {
            fontWeight: 400,
            fontStretch: 80,
        },{
            fontWeight: 800,
            fontStretch: 100,
            ease:"bounce.out",
            duration: .8 
        })
    },
    methods: {
        async loadPage() {
            try {
                const res = await Page.getPageByPath(this.$route.path)
                if (!res.data || res.data.docs.length !== 1) {
                    this.$router.push("/404")
                    return
                }

                this.page = res.data.docs[0]

            } catch (error) {
                console.error("Error loading page:", error)
                this.$router.push("/404")
            }
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