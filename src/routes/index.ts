// import type { DefineComponent } from "vue"
import defaultTemplate from "@/routes/templates/default.vue"
import ResetPassword from "@/routes/auth/password-reset.vue"
import Error404 from "@/routes/error-404.vue"
import Error301 from "@/routes/error-301.vue"
import generatedRoutes from "./generated-routes.json"

const routes = [
    // {
    //     path: "/",
    //     name: "Home",
    //     component: Home,
    // },
    {
        path: "/:pathMatch(.*)*",
        name: "404 | Not found",
        component: Error404,
    },
    {
        path: "/reset-password",
        name: "Reset password",
        component: ResetPassword,
    }
]

if (generatedRoutes) {
    generatedRoutes.forEach(route => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let component = undefined as any
        if (route.template === "default") {
            component = defaultTemplate
        }

        if (route.meta.redirect) {
            component = Error301
        }

        if (!component) {
            console.error(`Invalid template (${route.template}) for route ${route.path}`)
            return
        }

        const meta = route.meta as {
            description: string
            keywords: string
        }
        routes.push({
            path: route.path,
            name: route.name,
            meta: meta,
            component,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)
    })
}


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
export default routerOptions
