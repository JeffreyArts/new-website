import { parseInline } from "marked"

const escapeHtml = function(unsafe: string) {
    return unsafe
        .replace(/&/g, "\\\&")
        .replace(/</g, "\\\<")
        .replace(/>/g, "\\\>")
        .replace(/"/g, "\\\"")
        .replace(/'/g, "\\\'")
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const unescapeHtml = function(unsafe: string) {
    return unsafe
        .replace(/\&amp;/g, "&")
        .replace(/\&lt;/g, "<")
        .replace(/\&gt;/g, ">")
        .replace(/\&quot;/g, "\"")
        .replace(/\&\#039;/g, "\'")
        .replace(/\&\#39;/g, "\'")
}
 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const $text  = function(this: any, key: string, options?: object):string {
    
    const translatedText = escapeHtml(this.$t(key, options))
    // return this.$t(translatedText, options)

    const result = parseInline(translatedText, {
        gfm: true
    })

    if (typeof result === "string" ) {
        return result
    }

    return "❌"
}

export default $text