<template>
    <div class="language-selector-container">
        <strong class="language-selector" @mousedown="openMenu">{{ $text(`component::language-selector.selectLanguage`) }} &nbsp;<icon type="chevronDown"/></strong>
        <ul class="language-selector-list" ref="menu">
            <li class="language-selector-list-item" :key="k"
                :class="[languageCode === $i18n.locale ? '__isActive' : '']"
                @click="Locale.select(languageCode)" 
                v-for="(languageCode,k) in languages">
                {{$text(`locale.${languageCode}`)}}
            </li>
        </ul>
    </div>
</template>


<script lang="ts">
import { defineComponent } from "vue"
import localeStore from "@/stores/locale"
import icon from "@/components/icon.vue"
import gsap from "gsap"

export default defineComponent({
    name: "languageSelector",
    components: {
        icon
    },
    setup() {
        const Locale = localeStore()

        return { Locale }
    },
    data: () => {
        return {
            selection: "en",
            isOpen: false
        }
    },
    computed: {
        languages() {
            return this.$i18n.availableLocales
        }
    },
    methods: {
        openMenu() {
            if (this.isOpen) {
                return
            }

            this.isOpen = true

            const menuElement = this.$refs.menu as HTMLElement
            if (!menuElement) {
                return
            }

            const iconElement = this.$el.querySelector(".language-selector .icon") as HTMLElement
            if (!iconElement) {
                return
            }
            
            gsap.to(menuElement, {
                y: 0,
                opacity: 1,
                pointerEvents: "all"
            })

            gsap.to(iconElement, {
                rotate: -90,
                scale: .5
            })
                
            
            setTimeout(() => {
                window.addEventListener("mousedown", this.closeMenu)
            })
        },
        closeMenu(e:MouseEvent) {
            let target = e.target as HTMLElement
            let languageContainer = false
            
            while (target.parentElement && !languageContainer) {
                if (target.classList.contains("language-selector-list")) {
                    languageContainer = true
                }
                target = target.parentElement
            }
            
            if (!languageContainer) {
                this.isOpen = false
                window.removeEventListener("mousedown", this.closeMenu)
                
                const menuElement = this.$refs.menu as HTMLElement
                if (!menuElement) {
                    return
                }
                
                const iconElement = this.$el.querySelector(".language-selector .icon") as HTMLElement
                if (!iconElement) {
                    return
                }
                
                
                gsap.to(menuElement, {
                    y: 16,
                    opacity: 0,
                    pointerEvents: "none"
                })

                gsap.to(iconElement, {
                    rotate: 0,
                    scale: 1
                })
    
            }
        }
    }
})
</script>

<style lang="scss">
@use "./../assets/scss/variables.scss";
.language-selector-container {
    position: relative;
    z-index: 2024;
}

.language-selector-list {
    position: absolute;
    top: 1.6em;
    left: 0;
    right: 0;
    padding: 0 0;
    background-color: $white;
    border: 1px solid $grey;
    max-height: 80px;
    overflow-y: auto;
    z-index: 2024;
    margin: 0;
    opacity: 0;
    pointer-events: none;
    translate:  0 -16px;
}

.language-selector-list-item {
    list-style: none;
    margin: 0;
    padding: 4px 24px;
    display: inline-block;
    width: 100%;

    &:first-child {
        padding-top: 8px;
    }

    &:last-child {
        padding-bottom: 8px;
    }

    &:hover {
        background-color: var(--contrast-color);
    }

    &.__isActive {
        background-color: $accentColor;
        color: #fff;
    }
}
</style>
