// import type { DefineComponent } from "vue"
import defaultTemplate from "@/routes/templates/default.vue"
import ResetPassword from "@/routes/auth/password-reset.vue"
import Error404 from "@/routes/error-404.vue"
import Error301 from "@/routes/error-301.vue"
import LivePreview from "@/routes/live-preview.vue"
import pageRoutes from "./pages.json"
import projectRoutes from "./projects.json"
import pieceRoutes from "./pieces.json"

const routes = [
    {
        path: "/:pathMatch(.*)*",
        name: "404 | Not found",
        component: Error404,
    },
    {
        path: "/live-preview",
        name: "Live preview",
        component: LivePreview,
    },
    {
        path: "/reset-password",
        name: "Reset password",
        component: ResetPassword,
    }
]

const addRoutes = (route:  {
    path: string,
    name:  string
    meta: {
        description?: string,
        keywords?: string
        redirect?: string
    },
    template: string
}) => {
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
}

if (pageRoutes) { pageRoutes.forEach(addRoutes) }
if (projectRoutes) { projectRoutes.forEach(addRoutes) }
if (pieceRoutes) { pieceRoutes.forEach(addRoutes) }


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
