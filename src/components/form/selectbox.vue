<template>
    
    <label class="selectbox" @click="openSelect" :class="[isOpen ? '__isOpen' : '']">
        <span class="selectbox-label" v-if="name">
            {{displayName}}
        </span>
        <div class="selectbox-wrapper">
            <span class="selectbox-options" :style="direction == 'up' ? 'bottom: 0;' : ''">
                <span class="selectbox-option" v-for="(option,key) in options" :key="key" :class="!option.available ? '__isHidden' : ''" @click="option.selected = !option.selected">
                    
                    <jaoIcon size="medium"
                        :name="option.selected ? 'checkbox-checked' : 'checkbox'"
                        :transit-effect="{ duration: .1, delay:.002, effect: 'top-to-bottom'}" 
                        />
                    {{ option.value }}
                </span>
            </span>

            <jaoIcon size="medium"
                :name="isOpen ? 'expand-with-border' : 'expand'"
                :transit-effect="{ duration: .1, delay:.002, effect: 'top-to-bottom'}" 
                />
        </div>
    </label>
</template>


<script lang="ts">
import { defineComponent, PropType } from "vue"
import { filter } from "lodash"
import jaoIcon from "./../jao-icon.vue"
import gsap from "gsap"

type SelectBoxOptions = {
    value: number | string,
    selected: boolean
    available?: boolean, 
}

export default defineComponent({
    name: "filterComponent",
    components: {
        jaoIcon
    },
    props: {
        name: {
            type: String,
            required: false
        },
        options: {
            type: Object as PropType<SelectBoxOptions[]>,
            required: true
        },
    },
    data() {
        return {
            isOpen: false,
            direction: "down" as "down" | "up"
        }
    },
    computed: {
        displayName() {
            const selectedOptions = filter(this.options, {selected: true})

            if (selectedOptions.length <= 0) {
                return this.name
            }

            let name = ""
            selectedOptions.forEach(opt => {
                name += `${opt.value}, `
            })
            return name.slice(0, name.length - 2)
        }
    },
    methods: {
        openSelect() {
            if (this.isOpen) {
                return
            }

            this.isOpen = true
            if (window.innerHeight - 128 > this.$el.getBoundingClientRect().y) {
                this.direction = "down"
            } else {
                this.direction = "up"
            }
            
            console.log("Open select")
            setTimeout(() => {
                document.addEventListener("click", this.closeSelect)
            },0)
        },
        closeSelect(e:Event) {
            const target = e.target as HTMLElement
            if (!target) {
                return
            }
            
            let cancel = true
            let parent = target as HTMLElement | null
            while (cancel || parent !== null) {
                if (!parent) {
                    parent = null
                    cancel = true
                    break
                }
                
                if (typeof parent.className === "string" && parent.className !== "" && parent.className.startsWith("selectbox-options")) {
                    cancel = false
                }
                parent = parent.parentElement
            }
            
            console.log(cancel)
            if (cancel) {
                document.removeEventListener("click", this.closeSelect)
                this.isOpen = false
            }
        }
    }
})
</script>

<style lang="scss">
@import "./../../assets/scss/variables";

.selectbox-wrapper {
    display: flex;
    input { 
        display: none; 
    }
    svg {
        height: 18px;
    }
}


.selectbox {
    display: flex;
    width: calc(50% - 8px);
    flex-flow: row;
    align-items: center;
    gap: 8px;
    justify-content: space-between;
    position: relative;
    color: #555;
    
    &.__isSelected {
        color: #222;
    }

    &.__isOpen {
        .selectbox-options {
            display: flex;
        }
    }
}

.selectbox-options {
    position: absolute;
    display: none;
    left: 0;
    max-height: 128px;
    overflow: auto;
    width: calc(100% - 24px);
    background-color: #fff;
    gap: 8px;
    flex-flow: row wrap;
}

.selectbox-label {
    text-wrap: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}
.selectbox-option {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;

    &.__isHidden {
        display: none;
    }
}
</style>
