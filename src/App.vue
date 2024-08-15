<template >
  <router-view />
</template>

<script setup lang="ts">
    
import Payload from "@/stores/payload"
import LocalDB from "@/stores/localdb"
import Locale from "@/stores/locale"

const payload = Payload()
const locale = Locale()
const localDB = LocalDB()

if (typeof window !== "undefined") {
    locale.select(localStorage.getItem("i18n_locale") || locale.current)
    localDB.load()
    payload.init()
}
</script>

<style src="./assets/scss/index.scss"></style>
