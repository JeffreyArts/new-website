import Home from "@/routes/home.vue"
import defaultTemplate from "@/routes/templates/default.vue"
import ResetPassword from "@/routes/auth/password-reset.vue"
import { createWebHistory, createRouter } from "vue-router"
import generatedRoutes from "./generated-routes.json"

const routes = [
    {
        path: "/",
        name: "Home",
        component: Home,
    },
    {
        path: "/reset-password",
        name: "Reset password",
        component: ResetPassword,
    }
]

if (generatedRoutes) {
    generatedRoutes.forEach(route => {
        let component
        if (route.template === "default") {
            component = defaultTemplate
        }

        if (!component) {
            console.error(`Invalid template (${route.template}) for route ${route.path}`)
            return
        }
        
        routes.push({
            path: route.path,
            name: route.name,
            component
        })
    })
}


const router = createRouter({
    history: createWebHistory(),
    routes,
})


const routerOptions = {
    routes,
}

////////////////////////////////////////////////////////////////////////
// IMPORTANT NOTICE
// The code above will be updated via the `yarn add-route` command
// Be cautious when you make custom modifications (it should just work, 
// but just pay extra attention during your commits)
//
// - Jeffrey Arts, August 2024
////////////////////////////////////////////////////////////////////////

export { routerOptions }
export default router
