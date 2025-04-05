<template>
    <section class="favorite-block" @click="toggleLike">
        <jaoIcon :name="icon" size="medium" class="favorite-block-heart" :transitEffect="{duration: .64, effect:'shuffle'}"/>
        <div class="favorite-block-amount" v-html="favsNumber"></div>
    </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import Payload from "@/stores/payload"
import { Icon } from "jao-icons"
import jaoIcon from "@/components/jao-icon.vue"
import ProjectType  from "../../../types/project"

export type FavoriteBlock = {
    blockType: "favorite"
    project: ProjectType
}

export default defineComponent ({
    name: "favoriteBlock",
    components: {
        jaoIcon,
    }, 
    props: {
        options: {
            type: Object as PropType<FavoriteBlock>,
            required: true,
        },
    },   
     setup() {
        const payload = Payload()

        return {
            payload
        }
    },
    watch: {
        "options": {
            handler() {
                this.$emit("blockLoaded")
            },
            immediate: true,
            deep: true
        }
    },
    data: () => {
        return {
            favs: 0,
            selfLove: false,
            blocked: false
        }
    },
    computed: {
        icon() {
            if (this.selfLove) {
                return "heart"
            } 
            return "heart-outline"
        },
        favsNumber() {
            const svgElement = Icon(this.favs,"medium")
            const serializer = new XMLSerializer();
            // Serialize the SVG element to a string
            if (svgElement ) {
                return serializer.serializeToString(svgElement);
            }
            return ""
        }
    },
    created() {
        this.setSelfLove()
        this.loadFavs()
    },
    mounted() {
        if (typeof window === "undefined") {
            return
        }
        
    },
    methods: {
        async setSelfLove() {
            if (!this.payload.page || !this.payload.auth?.self) {
                return
            }
            
            const pageId = this.payload.page.data.id
            const pageType = this.payload.page.data.collectionType
            const userId = this.payload.auth.self.id.toString()

            const request = {
                payload_collection: pageType,
                user: userId
            } as {
                payload_collection: string
                user: string,
                project_id?: string,
                piece_id?: string
                page_id?: string
            }

            if (pageType === "projects") {
                request.project_id = pageId
            } else if (pageType === "pieces") {
                request.piece_id = pageId
            } else {
                request.page_id = pageId
            }

            let query  = `?`
            for (const key in request) {
                const value = request[key as keyof typeof request]
                if (value) {
                    query += `where[${key}][equals]=${value}&`
                }
            }
            
            // Get Favorite from DB and add/remove it depending on the result
            this.payload.GET("favorites" + query).then(response => {
                if (response.data?.docs.length != 0) {
                    this.selfLove = true
                }
            }).catch(error => {
                console.error("error", error)
            })
        },

        async loadFavs() {
            if (!this.payload?.page)  {
                return
            }
            const query = {} as {
                project_id?: string
                piece_id?: string
                page_id?: string
            }
            const pageType = this.payload.page.data.collectionType
            switch (pageType) {
                case "projects":
                    query.project_id = this.payload.page.data.id
                    break
                case "pieces":
                    query.piece_id = this.payload.page.data.id
                    break
                case "pages":
                    query.page_id = this.payload.page.data.id
                    break
            }

            this.payload.POST("favorites/totaldocs",query).then(response => {
                this.favs = response.data.favs
            }).catch(error => {
                this.favs = 0
                console.error("error", error)
            })
        },
        async toggleLike() {
            if (this.blocked) {
                return
            }

            if (!this.payload.page || !this.payload.auth?.self) {
                return
            }
            
            const pageId = this.payload.page.data.id
            const pageType = this.payload.page.data.collectionType
            const userId = this.payload.auth.self.id.toString()

            const request = {
                payload_collection: pageType,
                user: userId
            } as {
                payload_collection: string
                user: string,
                project_id?: string,
                piece_id?: string
                page_id?: string
            }

            if (pageType === "projects") {
                request.project_id = pageId
            } else if (pageType === "pieces") {
                request.piece_id = pageId
            } else {
                request.page_id = pageId
            }

            let query  = `?`
            for (const key in request) {
                const value = request[key as keyof typeof request]
                if (value) {
                    query += `where[${key}][equals]=${value}&`
                }
            }

            if (this.selfLove)  {
                this.selfLove = false
                this.favs--
            } else {
                this.selfLove = true
                this.favs++
            }
            this.blocked = true
            // Get Favorite from DB and add/remove it depending on the result
            this.payload.GET("favorites" + query).then(response => {
                if (response.data?.docs.length == 0) {
                    this.payload.POST("favorites", request).then((response: any) => {
                        this.selfLove = true
                        this.blocked = false
                    }).catch(error => {
                        this.favs--
                        this.blocked = false
                    })
                } else {
                    response.data.docs.forEach((doc: { id: string }) => {
                        this.payload.DELETE(`favorites/${doc.id}`).then((response: any) => {
                            this.selfLove = false
                            this.blocked = false
                        }).catch(error => {
                            this.favs--
                            this.blocked = false
                        })
                    })
                }
            }).catch(error => {
                console.error("error", error)
            })
        }
    }
})


</script>

<style lang="scss">
@use "./../../../assets/scss/variables.scss";

.favorite-block {
    display: flex;
    flex-flow: row nowrap;
    color: #333
}

.favorite-block-heart {
    width: 100%;
}

.favorite-block-amount {
    display: flex;
    align-items: flex-end;

    svg {
        margin-left: 24px;
        height: 72px;
    }
}

</style>