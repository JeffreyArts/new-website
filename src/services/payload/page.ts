import axios from "axios"
import _ from "lodash"

import { BlockType } from "@/components/layout/layout-types"
import { ProjectType } from "@/routes/projects.vue"
export type PageType =  {
    id: string
    createdAt: string
    updatedAt: string
    title: string
    path: string
    layout?: { 
        size_xs: number,
        size_s: number,
        size_m: number,
        size_l: number,
        size_xl: number,
    }
    blocks: Array<BlockType>
    metaDescription: string
    metaTags: string[]
    pageTitle: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    custom?: any
}

const payloadPage = {
    collectionName: "pages",
    getPageByPath: (path: string) => new Promise(async (resolve, reject) => {

        let collection = payloadPage.collectionName
        
        if (path.startsWith("/project/")) {
            collection = "projects"
            path = path.replace("/project", "")
        }
        
        if (path.startsWith("/piece/")) {
            collection = "pieces"
            path = path.replace("/piece", "")
        }
        
        try {
            const req = await axios.get(`${import.meta.env.VITE_PAYLOAD_REST_ENDPOINT}/${collection}?where[path][equals]=${path}`)
            if (req.data?.docs.length != 1) {
                throw new Error("Page not found")
            }
            
            if (req.data.docs[0].blocks.length > 0){
                req.data.docs[0].blocks = _.map(req.data.docs[0].blocks, (block, index) => {
                    return {
                        size: block.size,
                        position: parseInt(index) + 1,
                        id: block.id,
                        data: _.omit(block, ["size", "id"]),
                    } as BlockType
                })
            }
            
            resolve(req.data.docs[0])

        } catch(err) {
            reject(err)
        }
    }),
    getProjectsPage: () => new Promise(async (resolve, reject) => {

        const collection = "project-positions"
        
        try {
            const req = await axios.get(`${import.meta.env.VITE_PAYLOAD_REST_ENDPOINT}/${collection}?sort=position&depth=2`)
            if (req.data?.docs.length < 1) {
                throw new Error("Can not retrieve projects")
            }
            
            const projects = _.map(req.data.docs, doc => {
                const project = doc.project
                
                // Convert year to string
                if (Number(project.year.from) === Number(project.year.to)) {
                    project.year = project.year.from.toString()
                } else if (isNaN(Number(project.year.to))) {
                    project.year = `${project.year.from} - present`
                } else {
                    project.year = `${project.year.from} - ${project.year.to}`
                }

                // Prefix path
                if (!project.path.startsWith("/project")) {
                    project.path = "/project" + project.path
                }

                return _.pick(project, ["id", "title", "year", "thumbnail", "path", "description"])
            }) as Array<ProjectType>
            

            resolve(projects)

        } catch(err) {
            reject(err)
        }
    }),
    convertBlockToBlocktype(block: { [key: string] : unknown }) {
        if (!block.size && !block.id) {
            throw new Error(`Invalid block ${JSON.stringify(block, null, 2)}`)
        }
        return {
            size: block.size,
            id: block.id,
            data: _.omit(block, ["size", "id"])

        } as BlockType
    }
}

export default payloadPage