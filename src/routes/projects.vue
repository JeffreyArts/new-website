<template>
    <div class="projects-container">
        <Breadcrumbs />
        <div class="projects">
            <section class="projects-main" v-if="projects[0]" @click="goToProject(projects[0].path, $event)" :to="projects[0].path">
                <dynamic-image class="projects-main-image" :src="src(projects[0].thumbnail.sizes.image_lg.url)" :options="{duration: 2,tileSize: 64}"/>
                <YearBlock :options="{
                    blockType: 'year',
                    size: 1,
                    id: 'string',
                    year: projects[0].year
                }" />
                <header class="projects-main-text">
                    <h1 class="projects-main-title">{{ projects[0].title }}</h1>
                    <SlateText  class="projects-main-description" :data="projects[0].description" />
                </header>

                <button class="projects-main-button">View project</button>
            </section>

            <aside class="projects-sidebar" v-if="projects[1]">
                <section class="projects-thumbnail" @click="onThumbnailClick(1)">
                    <dynamic-image class="projects-thumb-image" :src="src(projects[1].thumbnail.sizes.image_md.url)" :options="{tileSize: 32, duration: 1}" />
                    <footer class="projects-thumbnail-footer">
                        <h2 class="projects-thumbnail-title">
                            <DynamicFontSize :maxRows="1" :maxSize="25">{{ projects[1].title }}</DynamicFontSize>
                        </h2>
                    </footer>
                </section>
                

                <section class="projects-thumbnail" @click="onThumbnailClick(2)">
                    <dynamic-image class="projects-thumb-image" :src="src(projects[2].thumbnail.sizes.image_md.url)" :options="{tileSize: 32, duration: 1}" />
                    <footer class="projects-thumbnail-footer">
                        <h2 class="projects-thumbnail-title">
                            <DynamicFontSize :maxRows="1" :maxSize="25">{{ projects[2].title }}</DynamicFontSize>
                        </h2>
                    </footer>
                </section>


                <section class="projects-thumbnail" @click="onThumbnailClick(3)">
                    <dynamic-image class="projects-thumb-image" :src="src(projects[3].thumbnail.sizes.image_md.url)" :options="{tileSize: 32, duration: 1}" />
                    <footer class="projects-thumbnail-footer">
                        <h2 class="projects-thumbnail-title">
                            <DynamicFontSize :maxRows="1" :maxSize="25">{{ projects[3].title }}</DynamicFontSize>
                        </h2>
                    </footer>
                </section>


            </aside>
        </div>
    </div>
</template>


<script lang="ts">
import { defineComponent } from "vue"
import payloadStore from "@/stores/payload"
import Page, { PageType } from "@/services/payload/page"
import Breadcrumbs from "./../components/breadcrumbs.vue"
import _ from "lodash"
import gsap from "gsap"
import { useHead }  from "@unhead/vue"
import { useRoute, RouteLocationNormalizedLoaded } from "vue-router"
import DynamicImage from "./../components/dynamic-image.vue"
import YearBlock from "./../components/layout/blocks/year.vue"
import DynamicFontSize from "./../components/dynamic-font-size.vue"
import SlateText, { SlateNode } from "@/components/slate-text.vue"

export type ProjectType = {
    id: string
    createdAt?: string
    updatedAt?: string
    path: string
    title: string
    year: string
    description: SlateNode
    thumbnail: {
        width: number
        height: number
        filename: string
        mimeType: string
        title: string
        description: string
        sizes: {
            image_sm: {
                width: number
                height: number
                url: string
            }
            image_md: {
                width: number
                height: number
                url: string
            }
            image_lg: {
                width: number
                height: number
                url: string
            }
        }
    }
    pieces?: Array<string>
    series?: Array<string>
}

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
        DynamicImage,
        DynamicFontSize,
        SlateText,
        YearBlock
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
            projects: [] as Array<ProjectType>,
            page: {} as PageType,
        }
    },
    watch: {
        "$route.path": {
            async handler() {
                console.log(this.$route.path != "/projects")
                if (this.$route.path != "/projects") {
                    throw new Error("")
                }
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
                // const res = await Page.getPageByPath()
                this.projects = await Page.getProjectsPage() as Array<ProjectType>
                setTimeout(() => {

                    gsap.fromTo(".projects-main", {
                        opacity: 0,
                        x: -40,
                    }, {
                        duration: 0.96,
                        x: 0,
                        opacity: 1,
                        ease: "power4.inOut"
                    })

        
                    const domElements = this.$el.querySelectorAll(".projects-thumbnail")
                    _.each(domElements, (el, index) => {
                        gsap.fromTo(el, {
                            opacity: 0,
                            x: 40 + parseInt(index, 10) * 16,
                        }, {
                            opacity: 1,
                            x: 0,
                            duration: 1.28,
                            delay: .4,
                            ease: "power4.out",
                        })
                    })
                })
            } catch (error) {
                console.error("Error loading page:", error)
                // this.$router.push("/404")
            }
        },
        src(path: string) {
            let src = import.meta.env.VITE_PAYLOAD_REST_ENDPOINT.replace("/api","")
            return src + path
        },
        updateLayoutSize() {
            if (!this.page.layout) {
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
            this.layoutSize = this.page.layout[size]
        },
        onThumbnailClick(index:number) {
            const newMain = this.projects[index]
            const oldMain = this.projects[0]
            this.projects[index] = oldMain
            this.projects[0] = newMain

            if (window.innerWidth < 640) {
                this.goToProject(newMain.path)
            }
        },
        goToProject(path: string, event?:Event) {
            if (event) {
                event.preventDefault()
            }

            if (path) {
                gsap.set(".projects-thumbnail", {
                    backgroundColor: "transparent"
                })
                gsap.set(".projects-container", {
                    overflowX: "hidden"
                })
                gsap.to(".projects-main", {
                    duration: .8,
                    opacity: 0,
                    ease: "power4.inOut"
                })

                const domElements = this.$el.querySelectorAll(".projects-thumbnail")
                _.each(domElements, (el, index) => {

                    gsap.to(el, {
                        opacity: 0,
                        x: 40 + parseInt(index, 10) * 16,
                        duration: 1.28,
                        ease: "power4.out",
                        stagger: {
                            each: .05,
                            from: "start",
                        },
                        onComplete: () => {
                            setTimeout(() => {
                                this.$router.push(path)
                            }, 64)
                        }
                    })
                })
            }
        }
    }
})

</script>

<style lang="scss">
@import "@/assets/scss/variables.scss";
.projects-container {
    padding: 40px 16px;
    width: 100vw;
}

.projects {
    margin-top: 16px;
    display: flex;
    flex-flow: column;
    width: 100%;
}

.projects-main {
    aspect-ratio: 16/9;    
    position: relative;
    width: 100%;
    margin-bottom: 40px;
    opacity: 0; // Set by GSAP

    &:after {
        content: "";
        inset: 0;
        position: absolute;
        // background-color: #f09;
        // background-image: linear-gradient(40deg, rgba(0,0,0,.24),  rgba(0,0,0,.08));
    }
}

.projects-main-text {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    
    &:after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 100%;
        background-color: #2b2b2b;
        mix-blend-mode: hard-light;
        opacity: 0.8;
    }

    &:before {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 100%;
        background-color: #2b2b2b;
        mix-blend-mode: color-burn;
    }
}

.projects-main-title {
    font-size: 24px;
    text-shadow: 2px 4px 8px rgba(0,0,0,.16);
    color: #fff;
    margin: 0;
    padding-left: 16px;
    font-weight: 300;
    font-stretch: 80%;
    padding-bottom: 4px;
    position: relative;
    z-index: 1;
}

.projects-main-description {
    display: none;
    text-decoration: none;
    color: #222;
    padding: 8px 16px 12px;
    font-size: 16px;
    line-height: 1.28;
    font-family: $accentFont;
    background-color: rgba(255,255,255,.96);
}

.projects-main-button {
    position: absolute;
    right: 16px;
    bottom: 16px;
    background-color: #222;
    color: #fff;
    border: 0 none transparent;
    padding: 0 24px;
    display: none;
    align-items: center;
    height: 40px;
    font-family: $accentFont;
    font-size: 24px;
}

.projects-main .year-block {
    position: absolute;
    right: 8px;
    top: 8px;
    z-index: 2;
    aspect-ratio: 0;
    display: none;
    mix-blend-mode: multiply;

    svg {
        height: 26px;
    }
 }

.projects-main-image,
.projects-thumb-image {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
}





.projects-sidebar {
    width: 100%;
}

.projects-thumbnail {
    aspect-ratio: 16/9;    
    width: 100%;
    position: relative;
    opacity: 0; // Set by GSAP
    
    &:nth-child(1) {
        background-color: #09f;
        margin-bottom: 40px;
    }
    &:nth-child(2) {
        background-color: #90f;
        margin-bottom: 40px;
    }
    &:nth-child(3) {
        background-color: #0f9;
    }
}

.projects-thumbnail-title {
    margin: 0;
    color: #fff;
    z-index: 1;
    position: relative;
    font-weight: 300;
    font-stretch: 80%;
}

.projects-thumbnail-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40px;
    display: flex;
    align-items: center;
    padding-left: 16px;
    padding-right: 16px;

    &:after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 100%;
        background-color: #2b2b2b;
        mix-blend-mode: hard-light;
        opacity: 0.8;
    }

    &:before {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 100%;
        background-color: #2b2b2b;
        mix-blend-mode: color-burn;
    }
}


@media screen and (min-width: 512px) {
    .projects-main {
        .year-block {
            display: block;
        }
    }
}

@media screen and (min-width: 640px) {
    .projects-container {
        padding: 60px 16px;
    }
}

@media screen and (min-width: 800px) {
    .projects-container {
        padding: 80px 16px;
    }

    .projects {
        flex-flow: row;
    }

    .projects-main-description {
        display: block;
    }

    .projects-main-title {
        font-size: 32px;
        font-weight: 640;
        font-stretch: 80%;
        padding-bottom: 12px;
    }
    
    .projects-main-text {
        width: calc(50% - 16px);
        max-width: 480px;
        bottom: 16px;
        left: 16px;
        height: auto;
        display: block;
        z-index: 1;

        &:after,
        &:before {
            display: none;
        }
    }

    .projects-main-button {
        display: flex;
    }

    .projects-main {
        margin-bottom: 0;
        width: calc(75% - 20px);
        margin-right: 40px;
        
        &:after {
            background-image: linear-gradient(40deg, rgba(0,0,0,.16), transparent);
        }

        .year-block {
            svg {
                height:26px;
            }
        }
    }

    .projects-thumbnail-footer {
        padding-left: 8px;
        padding-right: 8px;
    }

    .projects-sidebar {
        width: calc(25% - 20px);
    }
}
</style>