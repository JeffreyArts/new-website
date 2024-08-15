<template>
    <div class="home">
        <section class="container">
            <button>click here</button>
        </section>
    </div>
</template>


<script lang="ts">
import { defineComponent } from "vue"
import payloadStore from "@/stores/payload"
import gsap from "gsap"

export default defineComponent ({ 
    name: "homePage",
    components: { 
    },
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
        title: "Home",
        meta: [
            {
                name: "description",
                content: "Lorem ipsum dolor samet...",
            },
        ]
    },
    mounted() {
        gsap.to("html", {
            "--secondary-bg-color":"#000",
            "--primary-bg-color":"#111", 
            yoyo:true,
            repeat:20,
            repeatDelay: 3.2,
            duration:.8
        })
        gsap.to("html", {
            "--bg-size": 32,
            yoyo:true,
            repeat:20,
            repeatDelay: 1.6,
            duration: .8 
        })
    },
    methods: {
        
    }
})

</script>

<style lang="scss">
@import "@/assets/scss/variables.scss";

</style>