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

// HighlightJS
import "highlight.js/styles/stackoverflow-light.css"
import hljs from "highlight.js/lib/core"

import arduino from "highlight.js/lib/languages/arduino"
import bash from "highlight.js/lib/languages/bash"
import javascript from "highlight.js/lib/languages/javascript"
import php from "highlight.js/lib/languages/php"
import typescript from "highlight.js/lib/languages/typescript"

hljs.registerLanguage("arduino", arduino)
hljs.registerLanguage("bash", bash)
hljs.registerLanguage("javascript", javascript)
hljs.registerLanguage("php", php)
hljs.registerLanguage("typescript", typescript)

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