<template>
    <div class="password-reset">
        <h2 v-if="page == 1">Change password</h2>
        <h2 v-if="page == 2">Welcome</h2>
        <form @submit.prevent="handleSubmit"> 
            <div class="password-reset-form" ref="newPasswordForm" v-if="page == 1">
                <div class="row">
                    <label for="password">New password</label>
                    <input type="password" id="password" minlength="6" v-model="password" required>
                </div>
                <div class="row">
                    <label for="passwordConfirm">Confirm password</label>
                    <input type="password" id="passwordConfirm" minlength="6" v-model="passwordConfirm" required>
                </div>
                <div v-if="error" class="error-message">
                    {{ error }}
                </div>
                <div v-if="success" class="success-message">
                    {{ success }}
                </div>
            </div>

            
            <div class="password-reset-form" ref="welcomeForm" v-if="page == 2">
                <div class="row">
                    <label>Identify yourself</label>
                    <input type="text" id="name" v-model="username" placeholder="Your name" required>
                    <div v-if="error" class="error-message">
                        {{ error }}
                    </div>
                </div>
                <div class="row">
                    <label class="newsletter-label">
                        <input type="checkbox" id="newsletter" v-model="subscribeToNewsletter">
                        <span> Subscribe to newsletter </span>
                    </label>
                    <p class="newsletter-text">May I use your e-mail address to send you future updates about my work?</p>
                </div>
            </div>
        </form>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import isArray from "lodash/isArray"
import { Payload } from "@/stores/payload"
import PayloadNewsletterSubscription from "@/services/payload/newsletter-subscription"


export default defineComponent({
    name: "passwordResetComponent",
    props: {
        token: {
            type: String,
            required: true
        }
    },
    emits: ['update:submit-text'],
    data() {
        return {
            password: "",
            passwordConfirm: "",
            error: "",
            success: "",
            username: "",
            subscribeToNewsletter: false,
            email: "",
            page: 1
        }
    },
    watch: {
        page(newPage) {
            this.$emit('update:submit-text', newPage === 1 ? 'Change password' : 'Save username')
        }
    },
    setup() {
        const payload = Payload()
        return {
            payload
        }
    },
    methods: {
        async handlePasswordResetForm() {

            if (this.password !== this.passwordConfirm) {
                this.error = "Passwords do not match"
                return false
            }

            if (this.password.length < 6) {
                this.error = "Password must be at least 6 characters long"
                return false
            }

            try {
                if (!this.payload.auth) {
                    throw new Error("Auth not initialized")
                }
                
                const response = await this.payload.auth.resetPassword({
                    paswordForgotCode: this.token,
                    newPassword: this.password
                })

                if (response.data.user) {
                    const event = new CustomEvent("removeCatterpillar", { detail: { id: this.payload.auth.self?.id } })
                    window.dispatchEvent(event)
                   this.email = response.data.user.email
                }
                return true
            } catch (e) {
                
                if (isArray(e)) { 
                    this.error = e[0].message
                } else {
                    this.error = "Something went wrong while resetting your password"
                }

                this.success = ""
                return false
            }
        },
        async handleWelcomeForm() {

            if (this.username.length < 3) {
                this.error = "Username must be at least 3 characters long"
                return false
            }

            try {
                if (!this.payload.auth) {
                    throw new Error("Auth not initialized")
                }
                if (!this.payload.auth.self) {
                    throw new Error("User not found")
                }
                
                await this.payload.PATCH(`${import.meta.env.VITE_PAYLOAD_AUTH_COLLECTION}/${this.payload.auth.self.id}`, {
                    username: this.username
                })
                
                if (this.subscribeToNewsletter) {
                    PayloadNewsletterSubscription.add(this.email)
                }
                this.payload.auth.authenticate({
                    email: this.email,
                    password: this.password
                })
                this.success = "Username updated"
                return true

            } catch (e) {
                this.error = "Something went wrong while updating your username, try a different username. Or send an e-mail to contact@jeffreyarts.nl"
                return false
            }
        },
        async handleSubmit() {
            if (this.page == 1) {
                return await this.handlePasswordResetForm().then(success => {
                    if (this.$route.query.newUser) {
                        this.page = success ? 2 : 1
                        if (this.page == 2) {
                            this.$emit('update:submit-text', 'Change name')
                        }
                    } else {
                        return success
                    }
                })
            } else if (this.page == 2) {
                return this.handleWelcomeForm()
            }
        }
    }
})
</script>

<style lang="scss">

.password-reset {
    padding: 24px;
    max-width: 400px;
    margin: 0 auto;

    h2 {
        font-family: var(--accent-font);
        margin-top: 0;
        margin-bottom: 24px;
    }
}

.password-reset-form {
    .row {
        display: flex;
        flex-flow: column;
        margin-bottom: 16px;

        label {
            font-size: 12px;
            font-family: var(--accent-font);
            margin-bottom: 8px;
        }

        input {
            font-size: 14px;
            line-height: 2;
            outline-width: 1px;
            border-radius: 0;
            border: 1px solid var(--contrast-color);
            padding-left: 4px;

            &:focus {
                outline: 0 none transparent;
                border-left-color: #fff;
                border-right-color: #fff;
                border-top-color: #fff;
            }
        }
    }
}
.newsletter-label {
    input {
        translate: 0 2px;
    }
    
}

.newsletter-text {
    font-size: 12px;
    font-family: var(--accent-font);
    margin-top: 8px;
    opacity: 0.8;
}

.error-message {
    color: var(--red);
    background-color: var(--error-bg-color);
    padding: 8px;
    margin-top: 16px;
    font-size: 14px;
}

.success-message {
    color: var(--green);
    background-color: var(--success-bg-color);
    padding: 8px;
    margin-top: 16px;
    font-size: 14px;
}
</style> 