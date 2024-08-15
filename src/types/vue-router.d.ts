/* eslint-disable @typescript-eslint/no-unused-vars */
import { ComponentCustomProperties } from "vue"

declare module "@vue/runtime-core" {
    interface ComponentCustomProperties {
        $route: RouteLocationNormalizedLoaded;
        $router: Router;
    }
}