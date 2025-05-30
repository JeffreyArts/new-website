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
        
        <span class="site-header-settings" :class="[userMenuOpen ? '__isActive' : '']">
            <jaoIcon size="large" name="user" inactiveColor="transparent" :activeColor="userMenuColor" @click="toggleUserMenu"/>
        </span>

        <div class="site-header-user-menu">
            <form @submit.prevent="registerAccount" class="site-header-user-menu-form">
                <div class="row">
                    <label for="email">E-mailadres</label>
                    <input type="email" id="email" v-model="email" required>
                </div>
                <div class="row" v-if="showPassword">
                    <label for="password">Wachtwoord</label>
                    <input type="password" id="password" v-model="password" required>
                </div>
                <div class="row">
                    <button class="button small" type="submit">{{ showPassword ? 'Inloggen' : 'Registreren / Login' }}</button>
                </div>
            </form>
            
            <div v-if="emailSent" class="email-sent-message">
                An e-mail has been sent to {{ email }}, please follow the steps in the e-mail to complete the creation of this new account.
            </div>
        </div>
    </header>
</template>


<script lang="ts">
import { defineComponent } from "vue"
import Icon from "jao-icons"
import Navigation from "@/services/payload/navigation"
import jaoIcon from "@/components/jao-icon.vue"
import gsap from "gsap"
import AccountService from "@/services/account"
import Payload from "@/stores/payload"

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
    name: "siteHeader",
    components: {
        jaoIcon
    },
    data: () => {
        return {
            selection: "en",
            nav: [] as NavItem[],
            tweens: [] as gsap.core.Tween[],
            expendedItem: undefined as undefined | NavItem,
            email: "",
            password: "",
            showPassword: false,
            emailSent: false,
            userMenuColor: "#fff",
            userMenuOpen: false,
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
        },
        toggleUserMenu() {
            this.userMenuOpen = !this.userMenuOpen

            if (this.userMenuOpen) {
                this.userMenuColor = "#222"
                gsap.set(".site-header-user-menu", {
                    y: -8,
                    opacity: 0
                })

                gsap.to(".site-header-user-menu", {
                    y: 0,
                    opacity: 1,
                    duration: .8,
                    pointerEvents: "all"
                })

                // Voeg event listener toe voor klikken buiten het menu
                document.addEventListener('click', this.handleClickOutside)
            } else {
                this.userMenuColor = "#fff"
                gsap.killTweensOf(".site-header-user-menu")
                gsap.to(".site-header-user-menu", {
                    y: -8,
                    opacity: 0,
                    duration: .48,
                    pointerEvents: "none"
                })

                // Verwijder event listener wanneer menu sluit
                document.removeEventListener('click', this.handleClickOutside)
            }
        },
        handleClickOutside(event: MouseEvent) {
            const userMenu = this.$el.querySelector('.site-header-user-menu')
            const settingsButton = this.$el.querySelector('.site-header-settings')
            
            if (userMenu && settingsButton) {
                if (!userMenu.contains(event.target as Node) && !settingsButton.contains(event.target as Node)) {
                    this.userMenuOpen = false
                    this.userMenuColor = "#fff"
                    gsap.killTweensOf(".site-header-user-menu")
                    gsap.to(".site-header-user-menu", {
                        y: -8,
                        opacity: 0,
                        duration: .48,
                        pointerEvents: "none"
                    })
                    document.removeEventListener('click', this.handleClickOutside)
                }
            }
        },
        async registerAccount() {
            const valid = await AccountService.validateEmail(this.email)
            
            if (valid) {
                this.showPassword = true;
            } else {
                gsap.to(".site-header-user-menu-form", {
                    height: 0,
                    padding: 0
                })
                this.emailSent = true;
                let height = 0
                this.$nextTick(() => {
                    height = parseInt(gsap.getProperty(".email-sent-message", "height").toString())
                    
                    gsap.set(".email-sent-message", {opacity:0, height:0 })
                })
                const payload = Payload()
                const password = payload.auth?.self?.defaultPassword + ""
                const email = payload.auth?.self?.email + ""
                if (payload.auth?.self) {
                    await AccountService.register(this.email, email, password)

                    gsap.to(".email-sent-message", {
                        height,
                        opacity: 1,
                        delay: .2,
                        onComplete: () => {
                            gsap.to(".email-sent-message", {
                                opacity: 0,
                                delay: 6,
                                duration: .4,
                                onComplete: () => {
                                    this.userMenuOpen = false
                                    this.showPassword = false;
                                    this.emailSent = false;
                                    this.userMenuColor = "#fff"
                                }
                            })
                        }
                    })
                }
            }
        }
    }
})
</script>

<style lang="scss">
@use "./../assets/scss/variables";
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
    position: absolute;
    z-index: 1990;
    // mix-blend-mode: difference;
    // filter: invert(100%);
}

.site-header-navigation {
    height: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding-left: 8px;
}

.site-header-navigation-item {
    font-family: var(--accent-font);
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

                &:hover,
                &:focus {
                    text-shadow: -2px -2px 8px var(--bg-color), 2px -2px 8px var(--bg-color), 2px 2px 8px var(--bg-color), -2px 2px 8px var(--bg-color);
                }
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
    transition: var(--transition-default);
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
    
    [v="1"] {
        fill: var(--contrast-color) !important;
    }
    [v="0"] {
        fill: transparent !important;
    }
}

.site-header-settings {
    position: absolute;
    padding: 4px;
    background-color: var(--contrast-color);
    aspect-ratio: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    right: 4px;
    top: 4px;
    transition: .4s all ease;

    &.__isActive {
        outline: 1px solid var(--contrast-color);
        background-color: var(--bg-color);
    }

    svg {
        width: 13px;
    }
}

.site-header-user-menu {
    position: absolute;
    right: 16px;
    top: 64px;
    max-width: 256px;
    opacity: 0;
    pointer-events: none;
    
    .row {
        display: flex;
        flex-flow: column;
        +.row {
            padding-top: 8px;
        }
    }

    .email-sent-message {
        padding: 8px;
        margin-left: 8px;
        margin-bottom: 8px;
        width: calc(100% - 16px);
        background-color: #f5f5f5;
        border-radius: 4px;
        font-size: 14px;
        line-height: 1.4;
        overflow: hidden;
    }
}

.site-header-user-menu-form {
    padding: 8px;
    background-color: #fff;
    overflow: hidden;

    label {
        font-size: 12px;
        font-family: var(--accent-font);
    }

    input[type=text],input[type=email] {
        font-size: 14px;
        line-height: 2;
        outline-width: 1px;
        border-radius: 0;
        border: 1px solid var(--contrast-color);
        padding-left: 4px;

        &:focus {
            outline: 0 none transparent;
            border-left-color: #fff;
            border-right-color: #fff;
            border-top-color: #fff;
        }
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

    .site-header-settings {
        padding: 8px;
        right: 16px;
        top: 16px;

        svg {
            width: 26px;
        }
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
