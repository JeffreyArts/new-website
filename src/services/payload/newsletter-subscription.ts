import axios from "axios"
const payloadNewsletterSubscription = {
    collectionName: "newsletter-subscription",
    add: (email: string) => axios.post(`${import.meta.env.VITE_PAYLOAD_REST_ENDPOINT}/newsletter-subscriptions`, { email, source: "Website" })
}

export default payloadNewsletterSubscription