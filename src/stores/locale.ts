import { defineStore } from "pinia"
import { I18n } from "vue-i18n"

const locale = defineStore("locale", {
    state: () => ({
        current: "en",
        $i18n: null as I18n["global"] | null
    }),
    actions: {
        select(newLocale: string | null) {
            if (!newLocale) {
                return console.error("Missing locale")
            }

            if (!this.$i18n) {
                return console.error("$i18n is undefined")
            }
            
            if (this.$i18n.availableLocales.indexOf(newLocale) === -1) {
                return console.error(`Invalid locale ${newLocale}`)
            }
            
            localStorage.setItem("i18n_locale", newLocale)
            
            this.current = newLocale
            
            if (typeof this.$i18n.locale === "string") {
                this.$i18n.locale = this.current
            }
            
            // For updating computed components based on string lengths
            setTimeout(() => {
                window.dispatchEvent(new Event("resize"))
            })
        },
    },
    getters: {
    }
})

export default locale