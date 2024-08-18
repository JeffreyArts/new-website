import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    ssgOptions: {
        script: "async",
    },
    resolve: {
        "alias": [
            { find: "esmBundler", replacement: "vue/dist/vue.esm-bundler.js" },
            { find: "@", replacement: path.resolve(__dirname, "src") }
        ]
    },
})