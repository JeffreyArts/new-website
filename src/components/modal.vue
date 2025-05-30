<template>
    <div v-if="isVisible" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <jao-icon name="cross" size="medium" inactiveColor="var(--bg-color)" @click="closeModal" />
            </div>
            <slot></slot>
            <div class="modal-actions">
                <button class="modal-submit" @click="handleSubmit">
                    <slot name="submit-text">Submit</slot>
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import jaoIcon from "@/components/jao-icon.vue"

export default defineComponent({
    name: "modalComponent",
    props: {
        isOpen: {
            type: Boolean,
            required: false,
            default: false
        },
        autoClose: {
            type: Boolean,
            required: false,
            default: true
        }
    },
    components: {
        jaoIcon
    },
    data() {
        return {
            isVisible: false
        }
    },
    watch: {
        isOpen: {
            handler(val) {
                this.isVisible = val
            },
            immediate: true
        }
    },
    mounted() {
        document.addEventListener('keydown', this.handleEscape)
    },
    beforeUnmount() {
        document.removeEventListener('keydown', this.handleEscape)
    },
    methods: {
        closeModal() {
            this.isVisible = false
            this.$emit('close')
        },
        handleSubmit() {
            this.$emit('submit')
            if (this.autoClose) {
                this.closeModal()
            }
        },
        handleEscape(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                this.closeModal()
            }
        }
    }
})
</script>

<style lang="scss">
@use "./../assets/scss/variables.scss";

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
}
.modal-header {
    position: absolute;
    top: 0;
    right: 0;
    padding: 16px;

    svg {
        height: 28px;
        aspect-ratio: 1;
    }
}

.modal-content {
    background-color: var(--bg-color);
    padding: 24px;
    width: 100%;
    max-width: calc(100% - 64px);
    max-height: 90vh;
    position: relative;
    font-family: var(--default-font);
}

.modal-actions {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
}

.modal-submit {
    background-color: var(--contrast-color);
    color: var(--bg-color);
    border: 0 none transparent;
    padding: 8px 16px;
    font-family: var(--accent-font);
    font-size: 16px;
    cursor: pointer;
    transition: var(--transition-default);

    &:hover,
    &:focus {
        opacity: 0.9;
        scale: 1.1;
    }
}

@media (min-width: 640px) {
    .modal-content {
        width: auto;
        min-width: 400px;
    }
}
</style> 