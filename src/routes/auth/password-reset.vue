<template>
    <div class="home">
        <div class="container">
            
            <h1 class="home-title">
                <span class="left">
                    Jeff-frontend boilerplate
                </span>
            </h1>

            <form class="reset-password-form" v-if="token">
                <p>
                    Provide a new password below
                </p>
                
            </form>
        </div>
    </div>
</template>


<script lang="ts">
import { defineComponent } from "vue"
import payloadStore from "@/stores/payload"

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
            token: "",
        }
    },
    head: { 
        title: "Password reset",
        meta: [
            {
                name: "description",
                content: "Page for resetting the password of the user",
            },
        ]
    },
    created() {
        // set token based on query parameter token
        if (typeof this.$route.query.token == "string") {
            this.token = this.$route.query.token
        } else {
            this.redirect()
        }
    },
    methods: {
        redirect() {
            this.$router.push({ path: "/" })
        }
    }
})

</script>

<style lang="scss">
@use "@/assets/scss/variables.scss";

</style>