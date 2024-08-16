/* eslint-disable @typescript-eslint/no-unused-vars */

import { ViteSSG } from "vite-ssg"
import App from "./App.vue"
import { routerOptions } from "@/routes"
import { createPinia } from "pinia"
import { VueHeadMixin } from "@unhead/vue"

// Locale i18n packages
import { createI18n } from "vue-i18n"
import messages from "@/locale"
import $text from "@/services/vue-i18n-markdown"

import "./assets/scss/index.scss"
  
export const createApp = ViteSSG(
    App,
    routerOptions ,
    // function to have custom setups
    ({ app, router, routes, isClient, initialState }) => {
        
        const pinia = createPinia()

        const i18n = createI18n({
            legacy: false,
            warnHtmlMessage: import.meta.env.DEV,
            fallbackLocale: "en",
            messages,
        })
        
        
        app.use(i18n)
        app.use(pinia)
        app.mixin(VueHeadMixin)

        app.config.globalProperties.$text  = $text
        
        pinia.use(({ store }) => {
            if (store.$id === "locale") {
                store.$i18n = i18n.global
            }
        })
    },
)