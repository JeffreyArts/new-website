import axios from "axios"
const payloadNavigation = {
    collectionName: "navigation",
    getNav: (slug: string) => axios.get(`${import.meta.env.VITE_PAYLOAD_REST_ENDPOINT}/${payloadNavigation.collectionName}?where[slug][equals]=${slug}`)
}

export default payloadNavigation