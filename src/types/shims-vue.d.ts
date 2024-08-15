/* eslint-disable @typescript-eslint/no-explicit-any */

declare module "*.vue" {
    import type { DefineComponent } from "vue"
    const component: DefineComponent<object, object, any>
    export default component
}
  
declare module "*.vue" {
    import Vue from "vue"
    export default Vue
}