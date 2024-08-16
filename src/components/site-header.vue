<template>
    <header class="site-header">
        <RouterLink to="/">
            <span class="site-header-logo" ref="logo"></span>
        </RouterLink>
        <nav class="site-header-navigation">
            <span class="site-header-navigation-item" v-for="navItem, key in nav" :key="key">
                
                <RouterLink :to="navItem.link">
                    {{ navItem.name }}
                </RouterLink>
                
                <div class="site-header-navigation-dropdown" v-if="navItem.subitems" :id="`item${navItem.id}`" >
                    <RouterLink class="site-header-navigation-dropdown-item" :to="subItem.link" v-for="subItem, subKey in navItem.subitems" :key="subKey" @click="closeMenu">
                        <jaoIcon size="small" name="play" />
                        {{subItem.name}}
                    </RouterLink>
                </div>
            </span>
        </nav>
    </header>
</template>


<script lang="ts">
import { defineComponent } from "vue"
import { Icon } from "jao-icons"
import Navigation from "@/services/payload/navigation"
import jaoIcon from "@/components/jao-icon.vue"
import gsap from "gsap"

type NavItem = {
    id: string,
    link: string,
    name: string,
    expanded?: boolean,
    subitems: {
        id: string,
        link: string,
        name: string,     
    }[],

}
export default defineComponent({
    name: "languageSelector",
    components: {
        jaoIcon
    },
    data: () => {
        return {
            selection: "en",
            nav: [] as NavItem[],
            tweens: [] as gsap.core.Tween[],
            expendedItem: undefined as undefined | NavItem,
        }
    },
    computed: {
    },
    beforeCreate() {
        Navigation.getNav("header").then(res => {
            this.nav = res.data.docs[0].items
        }) 
    },
    mounted() {
        const logo = this.$refs["logo"] as HTMLElement
        const icon = Icon("medium/logo")
        // this.loadMenu()
        if (logo && icon) {
            logo.appendChild(icon)
        }
    },
    methods: {
        closeMenu(e: Event) {
            const targetEl = e.target as HTMLElement
            if (!targetEl) {
                return
            }
            const parentEl = targetEl.parentElement
            if (!parentEl) {
                return
            }
            parentEl.style.display = "none"
            setTimeout(()=> {
                parentEl.style.display = ""
            },110)
        },
        closeExpandedItem(e: Event, navItem: NavItem) {
            if (!navItem) {
                return
            }
            
            const targetEl = this.$el.querySelector(`#item${navItem.id}`)
            if (!targetEl) {
                return
            }
            // Kill any existing animations
            if (this.tweens.length > 0) {
                this.tweens.forEach( t => {t.kill()})
                this.tweens = []
            }
            
            const children = targetEl.querySelectorAll(".site-header-navigation-dropdown-item")
            const childTween = gsap.fromTo(children, {
                x: 0,
                opacity: 1
            },{
                x: 8,
                opacity: 0,
                pointerEvents: "none",
                stagger: {
                    each: .16,
                    from: "end",
                    ease: "power2.inOut",
                },
                onComplete: () => {
                    navItem.expanded = false
                    this.expendedItem = undefined
                },
            })
            
            this.tweens.push(childTween)
        },
        cancelExpension(navItem: NavItem) {
            if (!navItem) {
                return
            }
            const el = this.$el
            if (!el || !navItem) {
                return
            }

            const targetEl = el.querySelector(`#item${navItem.id}`)
            const children = targetEl.querySelectorAll(".site-header-navigation-dropdown-item")
            gsap.killTweensOf(children)
            gsap.to(children, {
                // x: 0,
                opacity: 0,
                pointerEvents: "none",
                duration: .16,
                stagger: {
                    each: .08,
                    from: "end",
                    ease: "power2.inOut",
                },
                onComplete: () => {
                    navItem.expanded = false
                }
            })
        },
        expand(e:Event, navItem: NavItem) {
            // e.preventDefault()
            
            navItem.expanded = true
            const el = this.$el
            if (!el) {
                return
            }
            if (this.expendedItem?.id == navItem.id) {
                return
            }
            
            
            this.expendedItem = navItem

            this.nav.forEach((item) => {
                if (item.id != navItem.id) {
                    this.cancelExpension(item)
                }
            })  
            
            // Kill any existing animations
            if (this.tweens.length > 0) {
                this.tweens.forEach( t => {
                    t.kill()
                })
                this.tweens = []
            }
            
            if (navItem.expanded) {
                const targetEl = el.querySelector(`#item${navItem.id}`)
                const children = targetEl.querySelectorAll(".site-header-navigation-dropdown-item")


                const childTween = gsap.fromTo(children, {
                    x: 0,
                    y: -8,
                    opacity: 0
                },{
                    x: 0,
                    y: 8,
                    opacity: 1,
                    pointerEvents: "all",
                    stagger: {
                        each: .16,
                        from: "start",
                        ease: "power2.inOut",
                    },
                    duration: .48,
                    onComplete: () => {
                        this.expendedItem = navItem
                    }
                })

                this.tweens.push(childTween)
            }
        }
    }
})
</script>

<style lang="scss">
@import "./../assets/scss/variables";
.site-header-logo {
    height: 36px;
    padding: 7px;
    display: block;
    svg {
        display: inline-block;
        height: 100%;
    }
}
.site-header {
    display: flex;
    width: 100vw;
    height: 36px;
}

.site-header-navigation {
    height: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding-left: 8px;
}

.site-header-navigation-item {
    font-family: $accentFont;
    position: relative;

    a {
        text-decoration: none;
        color: var(--contrast-color);
    }

    &:hover,
    &:focus {
        .site-header-navigation-dropdown {
            display: flex;

            .site-header-navigation-dropdown-item {
                opacity: 1;
                pointer-events: all;
            }
        }
    }
}

.site-header-navigation-dropdown {
    position: absolute;
    top: calc(100% - 4px);
    display: none;
    flex-flow: column;
    width: 128px;
    
}

.site-header-navigation-dropdown-item {
    display: flex;
    padding: 4px 0;
    font-size: .8em;
    opacity: 0;
    pointer-events: none;
    transition: $transitionDefault;
    transition-delay: .2s;
    align-items: center;

    &:hover {
        .jao-icon {
            opacity: 1;
        }
    }
}

.site-header-navigation-dropdown-item .jao-icon {
    height: 8px;
    padding-right: 4px;
    margin-left: -12px;
    opacity: 0;
    
    [v="0"] {
        fill: transparent !important;
    }
}



@media all and (min-width: 640px) {
    .site-header-logo,
    .site-header {
        height: 56px;
    }

    .site-header-navigation {
        gap:16px;
    }

    .site-header-navigation-item {
        font-size: 24px;
        padding-left: 24px;
    }

    .site-header-navigation-dropdown {
        top: calc(100%);
    }
    
    .site-header-navigation-dropdown-item .jao-icon {
        height: 20px;
        padding-right: 8px;
        margin-left: -28px;
    }
}

@media all and (min-width: 800px) {
    .site-header-logo,
    .site-header {
        height: 72px;
    }

    
    .site-header-navigation {
        gap:32px;
    }

    .site-header-navigation-item {
        font-size: 32px;
        padding-left: 16px;
    }
}
</style>
