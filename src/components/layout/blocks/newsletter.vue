<template>
    <form class="newsletter-block" @submit="onSubmit">
        <input class="newsletter-block-input" type="text" ref="input" placeholder="Subscribe to newsletter" :style="`width:calc(100% - ${width *.75}px)`" v-model="email"/>
        <div class="newsletter-block-message" ref="message" v-show="submitMessage">{{ submitMessage }}</div>
        <button class="newsletter-block-button" type="submit" ref="button">subscribe</button>
    </form>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import PayloadNewsletterSubscription from "./../../../services/payload/newsletter-subscription"
import gsap from "gsap"

export type NewsletterBlock = {
    blockType: "newsletter"
    size: number
    id: string
}

export default defineComponent ({
    name: "newsletterBlock",
    components: {  }, 
    props: {
        options: {
            type: Object as PropType<NewsletterBlock>,
            required: true,
        },
    },
    data: function() {
        return {
            email: "",
            submitMessage: "",
            width: 24,
        }
    },
    mounted() {
        if (typeof window === "undefined") {
            return
        }
        
        this.$emit("blockLoaded")

        window.addEventListener("layoutChange", this.updateLayoutChange)
    },
    unmounted() {
        window.removeEventListener("layoutChange", this.updateLayoutChange)
    },
    methods: {
        updateLayoutChange() {
            const button = this.$refs["button"] as HTMLElement
            if (!button) {
                return
            }
            
            if (this.$el.clientWidth > 420) {
                this.width = button.clientWidth
            } else {
                this.width = 0
            }
        },
        onSubmit(e:Event) {
            e.preventDefault()
            
            PayloadNewsletterSubscription.add(this.email).then(() => {
                this.email = "" 
                this.submitMessage = "A mail has been sent to confirm your e-mailaddress"
                const messageEl = this.$refs["message"] as HTMLElement
                console.log(messageEl)
                if (!messageEl) {
                    return
                }
                messageEl.classList.remove("__isError")
                
                if (!messageEl.classList.contains("__isSuccess")) {
                    messageEl.classList.add("__isSuccess")
                }

                messageEl.style.height = "auto"

                gsap.fromTo(messageEl,{
                    opacity: 1,
                }, {
                    opacity: 0,
                    height: 0,
                    delay: 4.8,
                    duration: 1,
                    onComplete: () => {
                        this.submitMessage = ""
                    }
                })
            }).catch(() => {

                this.submitMessage = "This e-mail address could not be added"
                const messageEl = this.$refs["message"] as HTMLElement
                if (!messageEl) {
                    return
                }
                messageEl.classList.remove("__isSuccess")
                
                if (!messageEl.classList.contains("__isError")) {
                    messageEl.classList.add("__isError")
                }
                messageEl.style.height = "auto"

                gsap.fromTo(messageEl,{
                    opacity: 1,
                }, {
                    opacity: 0,
                    height: 0,
                    delay: 4,
                    duration: 1
                })
            })
        },
    }
})


</script>

<style lang="scss">
@import "./../../../assets/scss/variables.scss";
.newsletter-block {
    width: 100%;
    position: relative;
    container-name: newsletter-block;
    container-type: inline-size;
}

.newsletter-block-input {
    border: 0 none transparent;
    font-weight: 100;
    width: 100%;
    font-size: 14px;
    padding: 8px;

    &:focus {
        box-shadow: 0 0 16px var(--accentColor);
        outline: 0 none transparent;
    }
    
    &::placeholder {
        opacity: 0.5;
        font-style: italic;
    }
}

.newsletter-block-button {
    background-color: var(--contrast-color);
    color: var(--bg-color);
    border: 0 none transparent;
    padding: 8px 16px;
    font-family: $accentFont;
    font-size: 20px;
    margin-top: 16px;
}

.newsletter-block-message {
    opacity: 1;
    padding: 4px;
    margin-top: 8px;
    // margin-bottom: -8px;
    overflow: hidden;
    font-size: 12px;
    font-weight: 300;
    outline: 1px solid currentColor;

    &.__isSuccess {
        color: var(--green);
        background-color: var(--success-bg-color);
    }
    &.__isError {
        color: var(--red);
        background-color: var(--error-bg-color);
    }
}

@container newsletter-block (width > 290px) {
    /* Change the flex direction of the .child element. */
    .newsletter-block-input {
        width: auto;
        height: 64px;
        padding: 0 0 0 16px;
        line-height: 64px;
        font-size: 20px;
    }
    
}

@container newsletter-block (width > 420px) {
    /* Change the flex direction of the .child element. */
    .newsletter-block-input {
        font-size: 24px
    }
    
    .newsletter-block-button { 
        font-size: 16px;
        translate: 0 -50%;
        right: 0;
        top: 50%;
        margin-top: 0;
        position: absolute;
        
    }
}
</style>