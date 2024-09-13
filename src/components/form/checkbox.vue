<template>
    <label class="checkbox" :class="modelValue ? '__isSelected' : ''">
        <span class="checkbox-label">
            {{name}}
        </span>
        <span class="checkbox-symbol">
            <jaoIcon
                size="medium"
                :active-color="modelValue ? '#222' : '#555'"
                :name="modelValue ? 'checkbox-cross' : 'checkbox'"
                :transit-effect="{ duration: .1, delay:.002, effect: 'left-to-right'}" 
                />
            <input type="checkbox" @change="changeInput($event)">
        </span>
    </label>
</template>


<script lang="ts">
import { defineComponent} from "vue"
import jaoIcon from "./../jao-icon.vue"

export default defineComponent({
    name: "checkboxFormComponent",
    components: {
        jaoIcon
    },
    props: {
        name: {
            type: String,
            required: false
        },
        modelValue: {
            type: Boolean,
            required: true
        },
    },
    methods: {
        changeInput(e:Event) {
            const target = e.target as HTMLInputElement
            
            if (!target) {
                return
            }
            
            this.$emit('update:modelValue', target.checked)
        }
    }
})
</script>

<style lang="scss" scoped>
@import "./../../assets/scss/variables";

.checkbox {
    display: flex;
    input { 
        display: none; 
    }
    svg {
        height: 18px;
    }
}

</style>
