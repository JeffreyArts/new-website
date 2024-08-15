<template>
    <div class="home">
        <section class="container">
            <h1>[route_name]</h1>
        </section>
    </div>
</template>


<script lang="ts">
import { defineComponent } from "vue"
import payloadStore from "@/stores/payload"

export default defineComponent ({ 
    components: {},
    props: [],
    setup() {
        const Payload = payloadStore()

        return { Payload }
    },
    data() {
        return {
        }
    },
    head: { 
        title: "[route_name]",
        meta: [
            {
                name: "description",
                content: "Lorem ipsum dolor samet...",
            },
        ]
    },
    watch: {
    },
    mounted() {
        //
    },
    unmounted() {
        //
    },
    methods: {
       
    }
})
</script>


<style lang="scss" scoped>
</style>