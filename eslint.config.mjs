import vue from "eslint-plugin-vue"
import typescriptEslint from "@typescript-eslint/eslint-plugin"
import stylistic from "@stylistic/eslint-plugin-ts"
import globals from "globals"
import parser from "vue-eslint-parser"
import path from "node:path"
import { fileURLToPath } from "node:url"
import js from "@eslint/js"
import { FlatCompat } from "@eslint/eslintrc"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
})

export default [
    ...compat.extends("plugin:vue/vue3-essential", "plugin:@typescript-eslint/recommended"),
    {
        plugins: {
            vue,
            "@typescript-eslint": typescriptEslint,
            "@stylistic/ts": stylistic,
        },

        languageOptions: {
            globals: {
                ...globals.browser,
            },

            parser: parser,
            ecmaVersion: "latest",
            sourceType: "module",

            parserOptions: {
                parser: "@typescript-eslint/parser",
            },
        },

        rules: {
            "@stylistic/ts/indent": ["error", 4],
            "@stylistic/ts/quotes": ["error", "double"],
            "@stylistic/ts/semi": ["error", "never"],

            "@stylistic/ts/object-curly-spacing": ["error", "always", {
                objectsInObjects: false,
            }],

            "linebreak-style": ["error", "unix"],

            "vue/multi-word-component-names": ["error", {
                ignores: ["icon"],
            }],

            "vue/order-in-components": ["error", {
                order: [
                    "el",
                    "name",
                    "key",
                    "parent",
                    "functional",
                    ["delimiters", "comments"],
                    ["components", "directives", "filters"],
                    "extends",
                    "mixins",
                    ["provide", "inject"],
                    "ROUTER_GUARDS",
                    "layout",
                    "middleware",
                    "validate",
                    "scrollToTop",
                    "transition",
                    "loading",
                    "inheritAttrs",
                    "model",
                    ["props", "propsData"],
                    "emits",
                    "setup",
                    "asyncData",
                    "data",
                    "fetch",
                    "head",
                    "computed",
                    "watch",
                    "watchQuery",
                    "LIFECYCLE_HOOKS",
                    "methods",
                    ["template", "render"],
                    "renderError",
                ],
            }],
        },
    },
]