<template>
    <div class="home">
        <h1>301 - Redirect</h1>
    </div>
</template>


<script lang="ts">
import { defineComponent } from "vue"
import { useHead }  from "@unhead/vue"
import { useRoute, useRouter } from "vue-router"

export default defineComponent ({ 
    name: "errorPage301",
    setup() {
        const route = useRoute()
        const router = useRouter()
        
        if (!route.meta.redirect) {
            throw new Error("Incorrect inclusion of 301 redirect page")
        }
        
        useHead({
            meta: [
                {
                    name: "http-equiv",
                    content: "Refresh",
                    "http-equiv": "Refresh"
                },
                {
                    name: "content",
                    content: `0; url=${route.meta.redirect}`
                }
            ]
        })
        if (typeof window !== "undefined" && typeof route.meta.redirect === "string") {
            const baseURL = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ""}/`
            router.replace(route.meta.redirect.replace(baseURL,"")).catch(() => {
                window.location.href = route.meta.redirect + ""
            })
        }
    },
})
</script>
