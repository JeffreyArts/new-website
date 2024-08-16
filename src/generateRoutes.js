import axios from "axios"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"
import { fileURLToPath } from "url"

// Load environment variables from the .env file
dotenv.config()

const result = []

// Fetch the API URL from the environment variable
const apiUrl = process.env.VITE_PAYLOAD_REST_ENDPOINT
const clientUrl = process.env.VITE_CLIENT_URL
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const generateRoutes = async (url) => {
    try {
        const response = await axios.get(url)

        if (!response.data?.docs) {
            throw new Error("No documents found for", url)
        }
        response.data.docs.forEach(data => {
            const meta = {}
            if (typeof data.metaDescription == "string") {
                meta.description = data.metaDescription
            }
            if (data.metaTags.length > 0) {
                meta.keywords = data.metaTags.join(", ")
            }
            if (typeof data.redirect === "string" && data.redirect.length > 0) {
                if (data.redirect[0] == "/") {
                    data.redirect = clientUrl + data.redirect
                }
                meta.redirect = `${data.redirect}`
            }

            result.push({
                path: data.path,
                name: data.title,
                meta,
                template: "default"
            })
        })

        const filePath = path.join(__dirname, "routes/generated-routes.json")
        fs.writeFileSync(filePath, JSON.stringify(result, null, 2), "utf8")

        console.log(`${result.length} routes found and added to '${filePath}'`)
    } catch (error) {
        console.error("Error fetching data:", error.message)
    }
}

// Call the function with the API URL
if (apiUrl) {
    generateRoutes(`${apiUrl}/pages`)
} else {
    console.error("API URL is not defined in the .env file.")
}
