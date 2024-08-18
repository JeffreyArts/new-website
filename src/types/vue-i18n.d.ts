/* eslint-disable @typescript-eslint/no-unused-vars */

import { ComponentCustomProperties } from "vue"
import { I18n } from "vue-i18n"
import $text from "@/services/vue-i18n-markdown" // Adjust the import path as needed

// Define the type for `$text`
type TextFunction = (key: string, options?: object) => string

declare module "@vue/runtime-core" {
    interface ComponentCustomProperties {
        $t: I18n["t"]; // Extend ComponentCustomProperties to include `$t`
        $tc: I18n["tc"];
        $te: I18n["te"];
        $n: I18n["n"];
        $d: I18n["d"];
        $text: TextFunction; // Use the defined type for `$text`
    }
}

// Extend Vue’s component instance type to include `$t` and other properties
declare module "vue" {
    interface ComponentInternalInstance {
        $t: I18n["t"];
        $tc: I18n["tc"];
        $te: I18n["te"];
        $n: I18n["n"];
        $d: I18n["d"];
        $text: TextFunction; // Use the defined type for `$text`
    }
}

declare module "@vue/runtime-core" {
    interface ComponentCustomProperties {
        $i18n: I18n["global"];
    }
}
