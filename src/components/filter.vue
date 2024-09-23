<template>
    <header class="site-filter">
        <div class="site-filter-left">
            <jaoIcon :name="filterIcon" size="large" :transit-effect="{duration: 1, delay:0.02, effect: 'shuffle'}" class="site-filter-icon"/>
            <h4 class="site-filter-name">{{ filterName }}</h4>
        </div>
        
        <div class="site-filter-right">
            <template v-for="filter,k in options.displayFilters" :key="k">
                <checkBox :style="`order: ${k}`"
                    v-if="filter == 'onlyFavorites'"
                    class="site-filter-section"
                    name="Only favorites"
                    v-model="filterVal.onlyFavorites"
                    :class="[filterVal.onlyFavorites ? '__isSelected' : '']" />
    
                
                <checkBox :style="`order: ${k}`"
                    v-if="filter == 'groupSeries'"
                    class="site-filter-section"
                    name="Group series"
                    v-model="filterVal.groupSeries"
                    :class="[filterVal.groupSeries ? '__isSelected' : '']" />
                    
                <selectBox :style="`order: ${k}`"
                    v-if="filter == 'year'"
                    class="site-filter-section"
                    name="Year"
                    :options="filterOptions.year"
                    />

                <selectBox :style="`order: ${k}`"
                    v-if="filter == 'series'"
                    class="site-filter-section"
                    name="Series"
                    :options="filterOptions.series"
                    />

                <selectBox :style="`order: ${k}`"
                    v-if="filter == 'categories'"
                    class="site-filter-section"
                    name="Categories"
                    :options="filterOptions.categories"
                    />
            </template>
        </div>
            
    </header>
    <Layout v-if="blocks.length > 0" id="filterLayout" :options="{
            layoutGap: 40,
            id: 'filter',
            layoutSize: 6,
            blocks: blocks
        }"
        ref="layout"
        @blocksUpdated="updateLayout"/>
</template>


<script lang="ts">
import { defineComponent, PropType, nextTick } from "vue"
import axios from "axios"
import jaoIcon from "./jao-icon.vue"
import selectBox from "./form/selectbox.vue"
import checkBox from "./form/checkbox.vue"
import { BlockType, LayoutOptions } from "@/components/layout/layout-types"
import Layout from "@/components/layout/index.vue"
import { map, omit } from "lodash"

type TargetCollections = "projects" | "pieces"

export type FilterOptions = {
    type: string
    name: string
    targetCollection: TargetCollections | TargetCollections[]
    prefill: {
        year?:  string | string[]
        projects?:  string | string[]
        series?:  string | string[]
        categories?:  string | string[]
    }
    displayFilters: string[] 
}
interface PaginationData {
    docs: Array<any>;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
    nextPage: number;
    page: number;
    pagingCounter: number;
    prevPage: null | number;
    totalDocs: number;
    totalPages: number;
}

// type FilterOptions = {
//     name: string,
//     targetCollection?: string | string[],
//     targetCollectionFilter?: {}
//     filterRange?: {
//         year?: "all" | string[],
//         series?: "all" | string[],
//         categories?: "all" | string[],
//         pieces?: "all" | string[],
//         projects?: "all" | string[],
//     },
//     showFilters?: {
//         year?: boolean,
//         series?: boolean,
//         categories?: boolean,
//         onlyFavorites?: boolean,
//         groupSeries?: boolean,
//     },
// }

export default defineComponent({
    name: "filterComponent",
    components: {
        jaoIcon,
        selectBox,
        checkBox,
        Layout
    },
    props: {
        options: {
            type: Object as PropType<FilterOptions>,
            required: true
        },
    },
    data() {
        return {
            blocks: [] as Array<BlockType>,
            limit: 8,
            page: 1,
            updating: false,
            hasNextPage: false,
            firstLoad: false,
            filterVal: {
                onlyFavorites: false,
                groupSeries: false,
                yearOpen: false,
            },
            filterOptions: {
                onlyFavorites: true,
                groupSeries: true,
                year: [] as { available: boolean, value: number, selected: boolean }[],
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
                if (!Name) {
                    return
                }
                const name = Name.toLowerCase()
                if (name === "archive") {
                    this.filterIcon = "archive"
                    this.filterName = "Archive"
                } else if (name === "projects") {
                    this.filterIcon = "hammer"
                    this.filterName = "Projects"
                } else if (name === "tools") {
                    this.filterIcon = "wrench"
                    this.filterName = "Tools"
                } else {
                    this.filterIcon = "archive"
                    this.filterName = Name
                }
            },
            immediate: true
        },
        // "options.filterRange": {
        //     handler(filterRange) {
        //         if (filterRange.year) {
        //             this.setYearRange(filterRange.year)
        //         }
        //     },
        //     immediate: true
        // }
    },
    beforeCreate() {
    },
    mounted() {
        this.setYearRange("all")
        this.updateResults()

        document.addEventListener("scroll", this.onScrollEvent)
    },
    methods: {
        onScrollEvent(e: Event) {

            if (!this.hasNextPage) {
                return
            }

            const htmlEl = document.querySelector("html") as HTMLElement
            const layout = document.getElementById("filterLayout")
            if (!layout) {
                return
            }
            const blocks = layout.querySelectorAll(".block")
            let lastBlock = {
                block: undefined,
                y: 0
            } as {
                block: undefined | HTMLElement,
                y: number
            }

            blocks.forEach(Block => {
                const block = Block as HTMLElement
                if (block.offsetTop + block.clientHeight > lastBlock.y) {
                    lastBlock =  {
                        block,
                        y: block.offsetTop 
                    }
                }
            })

            if (layout.offsetTop + lastBlock.y < htmlEl.scrollTop + window.innerHeight/2) {
                this.updateResults(this.page + 1)
            }
        
        },
        setYearRange(range: "all" | { min: number, max: number }) {
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
        
        getResults: (targetCollection: TargetCollections | TargetCollections[], options?: {
            limit: number,
            page: number
        }) => new Promise<PaginationData>(async (resolve, reject) => {
            if (!options) {
                options = {
                    limit: 8,
                    page: 1
                }
            }

            if (!options.limit) {
                options.limit = 8
            }

            if (!options.page) {
                options.page = 1
            }

            const collection = targetCollection
            
            try {
                const req = await axios.get(`${import.meta.env.VITE_PAYLOAD_REST_ENDPOINT}/${collection}?depth=1&limit=${options.limit}&page=${options.page}`)
                if (req.data?.docs.length < 1) {
                    throw new Error(`Can not retrieve ${collection}`)
                }
                const data = req.data as PaginationData
                resolve(data)

            } catch(err) {
                reject(err)
            }
        }),
        updateResults(page = 1) {
            if (this.updating) {
                return
            }
            this.updating = true

            this.getResults(this.options.targetCollection, {
                limit: this.limit,
                page: page
            }).then((data) => {
                this.hasNextPage = data.hasNextPage
                
                if (this.options.targetCollection === "projects") {                    
                    const blocks = map(data.docs, (doc, index) => {
                        const block = {
                            size: 3,
                            id: doc.id,
                            data: {
                                blockType: "image",
                                link: doc.path,
                                image: doc.thumbnail
                            }
                        } as BlockType

                        return block
                    })
                    this.blocks = [...this.blocks, ...blocks]
                }
                this.$emit("filterUpdated")
                setTimeout(() => {
                    const refLayout = this.$refs.layout
                    
                    if (!refLayout) {
                        return
                    }
                    refLayout.fadeInNewBlocks()
                    setTimeout(() => {
                        refLayout.updateBlockSizes()
                        // nextTick(() => {
                        //     refLayout.updateLayout()
                        // })
                    })
                    
                })
                
                this.updating = false
            }).catch(() => {
                this.updating = false
            })
        },
        updateLayout() {
            if (this.firstLoad) {
                return
            }
            
            this.firstLoad = true
            const refLayout = this.$refs.layout
            
            if (!refLayout) {
                return
            }
            console.log("Fade in all blocks")
            refLayout.fadeInAllBlocks()

            setTimeout(() => {
                console.log("updateBlockSizes ")
                refLayout.updateBlockSizes()
                setTimeout(() => {
                    refLayout.updateBlockSizes()
                })
            })
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
    background-color: var(--bg-color);
    margin-top: 40px;

    + .layout-wrapper {
        padding-top: 40px;
    }
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
