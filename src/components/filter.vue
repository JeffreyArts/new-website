<template>
    <header class="site-filter">
        <div class="site-filter-left">
            <jaoIcon :name="filterIcon" size="large" :transit-effect="{duration: 1, delay:0.02, effect: 'shuffle'}" class="site-filter-icon"/>
            <h4 class="site-filter-name">{{ filterName }}</h4>
        </div>
        <div class="site-filter-right">
            <label 
                style="order: 0"
                v-if="filterOptions.onlyFavorites"
                class="site-filter-section"
                :class="filterVal.onlyFavorites ? '__isSelected' : ''">
                <span class="site-filter-label">
                    Only favorites
                </span>
                <span class="site-filter-checkbox">
                    <jaoIcon
                        size="medium"
                        :active-color="filterVal.onlyFavorites ? '#222' : '#555'"
                        :name="filterVal.onlyFavorites ? 'checkbox-cross' : 'checkbox'"
                        :transit-effect="{ duration: .1, delay:.002, effect: 'left-to-right'}" 
                        />
                    <input type="checkbox" v-model="filterVal.onlyFavorites">
                </span>
            </label>

            
            <label style="order: 2"
                v-if="filterOptions.groupSeries"
                class="site-filter-section"
                :class="filterVal.groupSeries ? '__isSelected' : ''">
                <span class="site-filter-label">
                    Group series
                </span>
                <span class="site-filter-checkbox">
                    <jaoIcon
                        size="medium"
                        :active-color="filterVal.groupSeries ? '#222' : '#555'"
                        :name="filterVal.groupSeries ? 'checkbox-cross' : 'checkbox'"
                        :transit-effect="{ duration: .1, delay:.002, effect: 'left-to-right'}" 
                        />
                    <input type="checkbox" v-model="filterVal.groupSeries">
                </span>
            </label>
            
            <selectBox style="order: 2"
                v-if="filterOptions.year"
                class="site-filter-section"
                name="Year"
                :options="filterOptions.year"
                :class="[filterVal.yearOpen ? '__isOpen' : '']" />
            
        </div>
    </header>
</template>


<script lang="ts">
import { defineComponent, PropType } from "vue"
import { startCase } from "lodash"
import jaoIcon from "./jao-icon.vue"
import gsap from "gsap"
import selectBox from "./form/selectbox.vue"

type FilterOptions = {
    name: string,
    targetCollection?: string | string[],
    targetCollectionFilter?: {}
    filterRange?: {
        year?: "all" | string[],
        series?: "all" | string[],
        categories?: "all" | string[],
        pieces?: "all" | string[],
        projects?: "all" | string[],
    },
    showFilters?: {
        year?: boolean,
        series?: boolean,
        categories?: boolean,
        onlyFavorites?: boolean,
        groupSeries?: boolean,
    },
}

export default defineComponent({
    name: "filterComponent",
    components: {
        jaoIcon,
        selectBox
    },
    props: {
        options: {
            type: Object as PropType<FilterOptions>,
            required: true
        },
    },
    data() {
        return {
            blocks: [],
            filterVal: {
                onlyFavorites: false,
                groupSeries: false,
                yearOpen: false,
            },
            filterOptions: {
                onlyFavorites: true,
                groupSeries: true,
                year: [] as { available: boolean, value: number, selected: boolean}[],
                categories: [],
                series: [],
            },
            filterName: "",
            filterIcon: "empty"
        }
    },
    watch: {
        "options.name": {
            handler(Name: string) {
                const name = Name.toLowerCase()
                if (name === "archive") {
                    this.filterIcon = "archive"
                    this.filterName = "Archive"
                } else if (name === "projects") {
                    this.filterIcon = "projects"
                    this.filterName = "Projects"
                } else if (name === "tools") {
                    this.filterIcon = "wrench"
                    this.filterName = "Tools"
                } 
            },
            immediate: true
        },
        "options.filterRange": {
            handler(filterRange) {
                if (filterRange.year) {
                    this.setYearRange(filterRange.year)
                }
            },
            immediate: true
        }
    },
    beforeCreate() {
    },
    mounted() {
    },
    methods: {
        setYearRange(range: "all" | {min: number, max: number}) {
            const maxYear = new Date().getFullYear()
            
            if (range == "all") {
                this.filterOptions.year = []
                for (let index = 2008; index < maxYear; index++) {
                    this.filterOptions.year.push({
                        value: index,
                        available: true, 
                        selected: false
                    })
                }
            }
        },
       
    }
})
</script>

<style lang="scss">
@import "./../assets/scss/variables";
.site-filter {
    width: 100%;
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    font-family: $accentFont;
}

.site-filter-icon {
    height: 26px;
}

.site-filter-chevron {
    height: 10px;
    margin-left: 8px;
}

.site-filter-left {
    display: flex;
    flex-flow: row;
    align-items: center;
    gap: 8px;
    padding-left: 16px;
}

.site-filter-right {
    width: 50%;
    padding-right: 16px;
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    gap: 16px;
}

.site-filter-name {
    font-size: 18px;
}

.site-filter-checkbox,
.site-filter-select {
    display: flex;
    input { 
        display: none; 
    }
    svg {
        height: 18px;
    }
}


.site-filter-section {
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
        .site-filter-select-options {
            display: flex;
        }
    }
}

.site-filter-select-options {
    position: absolute;
    display: none;
    left: 0;
    max-height: 100px;
    overflow: auto;
    width: calc(100% - 24px);
    background-color: #fff;
    gap: 8px;
    flex-flow: row wrap;
}

.site-filter-select-option {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;

    &.__isHidden {
        display: none;
    }
}


@media all and ( min-width: 640px) {
    .site-filter-name {
        font-size: 24px;
    }

    .site-filter-icon {
        height: 52px;
    }

    .site-filter-left {
        gap: 16px;
    }
}
</style>
