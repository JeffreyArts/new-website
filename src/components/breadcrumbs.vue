<template>
    <nav class="site-breadcrumbs">
        <jaoIcon :name="icon" size="large" :transit-effect="{duration: 1, delay:.002, effect: 'shuffle'}" class="site-breadcrumbs-icon"/>
        <span class="site-breadcrumbs-route" v-for="(p,k) in path" :key="k">
            <router-link :to="p.link"><span v-html="p.name.join('')" /></router-link>
            <jaoIcon name="chevron-right" size="small"  class="site-breadcrumbs-chevron" v-if="k != path.length-1"/>
        </span>
    </nav>
</template>


<script lang="ts">
import { defineComponent } from "vue"
import { startCase } from "lodash"
import jaoIcon from "./jao-icon.vue"
import gsap from "gsap"

type BreadcrumbItem = {
    id: string,
    link: string,
    name: string[],
}
export default defineComponent({
    name: "breadcrumbsComponent",
    components: {
        jaoIcon
    },
    data() {
        return {
            path: [] as BreadcrumbItem[],
            icon: "empty"
        }
    },
    watch: {
        "$route.path": {
            handler() {
                // Add new content
                setTimeout(() => {

                    this.changePath()
                    this.changeIcon()
                })
            }, 
            immediate: true
        }
    },
    beforeCreate() {
    },
    mounted() {
    },
    methods: {
        changeIcon() {
            if (this.$route.path.startsWith("/")) { this.icon = "home"}
            if (this.$route.path.startsWith("/archive")) { this.icon = "archive"}
            if (this.$route.path.startsWith("/project")) { this.icon = "hammer"}
            if (this.$route.path.startsWith("/tool")) { this.icon = "wrench"}
            if (this.$route.path.startsWith("/about")) { this.icon = "user"}
        },
        changePath() {
            gsap.to(".site-breadcrumbs-route .char, .site-breadcrumbs-chevron", {
                opacity: 0,
                scale: 0,
                duration: .24,
                stagger: {
                    each: .032,
                    from: "end"
                },
                onComplete: () => {
                    this.updatePath()
                    
                    this.$nextTick(() => {
                        gsap.fromTo(".site-breadcrumbs-route .char, .site-breadcrumbs-chevron", {
                            opacity: 0,
                            scale: 0,
                        },{
                            scale: 1,
                            opacity: 1,
                            stagger: {
                                each: .1,
                                from: "start"
                            },
                        })
                    })
                }
            })
        },
        updatePath() {
            const arr = this.$route.path.slice(1).split("/")
            let link = ""
            this.path = arr.map((path: string, key:number) => {
                let name = startCase(path).toLowerCase()
                name = name.charAt(0).toUpperCase() + name.slice(1)
                link += `/${path}`
                return {
                    id: `${key}`,
                    link: link === '/project' ? '/projects' : link,
                    name: name.split("").map(c => {
                        if (c === " ") { c = "&nbsp;" }
                        return `<span class="char">${c}</span>`
                    }),
                }
            })
        }
    }
})
</script>

<style lang="scss">
@import "./../assets/scss/variables";
.site-breadcrumbs {
    width: 100%;
    display: flex;
    gap: 8px;
    align-items: center;
    font-family: $accentFont;
    
    a {
        color: var(--contrast-color);
        opacity: 0.64;
        text-decoration: none;
        transition: $transitionFast;

        &:last-child {
            opacity: 0.8;
        }

        &:focus,
        &:hover {
            opacity: 1;
        }
    }

    .char {
        display: inline-block;
    }
}

.site-breadcrumbs-icon {
    height: 26px;
}

.site-breadcrumbs-chevron {
    height: 10px;
    margin-left: 8px;
}
</style>
