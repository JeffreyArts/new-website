<template >
    
    <site-header />
    <router-view />
</template>

<script setup lang="ts">
import siteHeader from "@/components/site-header.vue"    
import Payload from "@/stores/payload"
import LocalDB from "@/stores/localdb"
import Locale from "@/stores/locale"
import gsap from "gsap"
// import { useRouter } from "vue-router"

const payload = Payload()
const locale = Locale()
const localDB = LocalDB()

if (typeof window !== "undefined") {
    locale.select(localStorage.getItem("i18n_locale") || locale.current)
    localDB.load()
    payload.init()
    
    gsap.to("html", {
        "--bg-size": 8,
        // "--bg-color":"#222", 
        // "--primary-bg-color":"#000", 
        // "--contrast-color": "#fafafa",
        duration:.8
    })
}
</script>

<style src="./assets/scss/index.scss"></style>
