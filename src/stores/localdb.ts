import { defineStore } from "pinia"
import _ from "lodash"
let db: PouchDB.Database | null = null

if (typeof window !== "undefined") {
    (async () => {
        const PouchDB = await import("pouchdb-browser")
        db = new PouchDB.default("local-db")
    })()
}


export const localDB = defineStore({
    id: "localDB",
    state: () => ({
        updated: 0,
        document: {
            _id: "main",
            _rev: ""
        }
    }),
    actions: {
        update() {
            return new Promise((resolve, reject) => {
                if (!db){ 
                    return
                }
                
                const doc = _.merge({},_.pick( this.document, ["_id", "_rev"]))
                db.put(doc).then((res) => {
                    this.document._rev = res.rev
                    resolve(this.document)
                    this.updated++
                }).catch(reject)
            })
        },
        load() {
            return new Promise((resolve, reject) => {
                if (!db){ 
                    return
                }

                db.allDocs({
                    include_docs: true,
                    attachments: true
                }).then((result) => {
                    if (result.rows.length >= 1) {
                        _.merge(this.document,_.pick( result.rows[0].doc, ["_id", "_rev"]))
                    }
                    return resolve(this.document)
                }).catch(reject)

            })
        },
    },
    getters: {
    }
}) 

export default localDB