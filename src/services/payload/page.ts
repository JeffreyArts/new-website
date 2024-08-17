import axios from "axios"
import { LayoutBlock } from "@/components/layout/index.vue"
export type PageType =  {
    createdAt: string
    id: string
    layout: { 
        size_xs: number,
        size_s: number,
        size_m: number,
        size_l: number,
        size_xl: number,
        blocks: LayoutBlock[]
    }
    metaDescription: string
    metaTags: string[]
    pageTitle: string
    path: string
    title: string
    updatedAt: string
}

const payloadPage = {
    collectionName: "pages",
    getPageByPath: (path: string) => axios.get(`${import.meta.env.VITE_PAYLOAD_REST_ENDPOINT}/${payloadPage.collectionName}?where[path][equals]=${path}`)
}

export default payloadPage