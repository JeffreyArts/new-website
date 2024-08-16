<template>
    <div class="home">
    <h1>404 - Not found</h1>
    </div>
</template>


<script lang="ts">
import { defineComponent } from "vue"
import payloadStore from "@/stores/payload"
import gsap from "gsap"

export default defineComponent ({ 
    name: "errorPage404",
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

        // Animation for Title block
        gsap.fromTo("h1", {
            fontWeight: 400,
            fontStretch: 80,
        },{
            fontWeight: 800,
            fontStretch: 100,
            ease:"bounce.out",
            duration: .8 
        })
    },
    methods: {
        
    }
})

</script>

<style lang="scss">
@import "@/assets/scss/variables.scss";
@supports (font-variation-settings: "wdth" 115) {
  h1 {
    // color: #f09;
    display: inline-block;
    width: 200px;
    text-align: center;
  }
}
</style>