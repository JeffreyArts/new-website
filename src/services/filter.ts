import qs from "qs"
import axios from "axios"
import { eq, map, sortBy } from "lodash"

type TargetCollections = "projects" | "pieces"

interface PaginationData {
    docs: Array<any>;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
    nextPage: number;
    page: number;
    pagingCounter: number;
    prevPage: null | number;
    totalDocs: number;
    totalPages: number;
}

interface FilterOptions {
    limit: number,
    page: number,
    project?: string,
    year?: Array<string>,
    series?: Array<string>,
    categories?: Array<string>
}

interface FilterQuery {
    where: {
        project: {equals: string}
        series?: { in: string[] }
        categories?: { in: string[] }
        "year"?: { in: string[] }
        "year.from"?: { in: string[] }
        "year.to"?: { in: string[]  }
    }
}

interface FilterOptionValue {
    value: string | number,
    label: string | number,
    available: boolean, 
    selected: boolean
}


const Filter = {
    query: (targetCollection: TargetCollections | TargetCollections[], options?: FilterOptions) => new Promise<PaginationData>(async (resolve, reject) => {
        // Prep options
        if (!options) {
            options = {
                limit: 16,
                page: 1
            }
        }

        if (!options.limit) {
            options.limit = 16
        }

        if (!options.page) {
            options.page = 1
        }

        // Define query
        const query = { where: {}} as FilterQuery

        if (options.series && options.series.length > 0) {
            query.where.series = {
                in: options.series 
            }
        }
        
        if (options.categories && options.categories.length > 0) {
            query.where.categories = {
                in: options.categories 
            }
        }
        
        if (options.project) {
            query.where.project = {
                equals: options.project 
            }
        }

        if (options.year && options.year.length > 0) {
            if (targetCollection === "pieces") {
                query.where["year"] = { in: [] }
                options.year.forEach(year => {
                    if (query.where["year"]) {
                        query.where["year"].in.push(year)
                    }
                })
            } else {

                query.where["year.from"] = { in: [] }
                query.where["year.to"] = { in: [] }
                options.year.forEach(year => {
                    if (query && query.where && query.where["year.to"] && query.where["year.from"]) {
                        if (year == new Date().getFullYear().toString()) {
                            query.where["year.to"].in.push("-")
                        } else {
                            query.where["year.from"].in.push(year)
                        }
                        query.where["year.to"].in.push(year)
                    }
                })
            }
        }

        // Stringify query
        const stringifiedQuery = qs.stringify(
            {
                depth:1,
                limit: options.limit,
                page: options.page,
                sort: targetCollection === "projects" ? "-year.from" : "-year",
                ...query, 
            },
            { addQueryPrefix: true },
        )
        
        try {
            const req = await axios.get(`${import.meta.env.VITE_PAYLOAD_REST_ENDPOINT}/${targetCollection}${stringifiedQuery}`)
            if (req.data?.docs.length < 1) {
                throw new Error(`Can not retrieve ${targetCollection}`)
            }
            const data = req.data as PaginationData
            resolve(data)
        } catch(err) {
            reject(err)
        }
    }),

    getCategories() {
        return new Promise<FilterOptionValue[]> (async (resolve, reject) => {
            try {
                const req = await axios.get(`${import.meta.env.VITE_PAYLOAD_REST_ENDPOINT}/categories/?depth=1&limit=128`)
                if (req.data?.docs.length < 1) {
                    throw new Error("Can not retrieve categories")
                }
                const data = req.data as PaginationData
                const res = sortBy(map(data.docs, doc => {
                    return {
                        value: doc.id,
                        label: doc.title,
                        available: true, 
                        selected: false
                    }
                }), "label", "desc")
                resolve(res)

            } catch(err) {
                reject(err)
            }
        })
    },

    getSeries() {
        return new Promise<FilterOptionValue[]> (async (resolve, reject) => {
            try {
                const req = await axios.get(`${import.meta.env.VITE_PAYLOAD_REST_ENDPOINT}/series/?depth=1&limit=128`)
                if (req.data?.docs.length < 1) {
                    throw new Error("Can not retrieve series")
                }
                const data = req.data as PaginationData
                const res = sortBy(map(data.docs, doc => {
                    return {
                        value: doc.id,
                        label: doc.title,
                        available: true, 
                        selected: false
                    }
                }), "label", "desc")
                resolve(res)

            } catch(err) {
                reject(err)
            }
        })
    },

    getYears(range: "all" | { min: number, max: number }) {
        return new Promise<FilterOptionValue[]> ((resolve) => {

            const maxYear = new Date().getFullYear()
            const res = []
            if (range == "all") {
                for (let index = 2008; index <= maxYear; index++) {
                    res.push({
                        value: index,
                        label: index,
                        available: true, 
                        selected: false
                    })
                }
            } else {
                for (let index = range.min; index <= range.max; index++) {
                    res.push({
                        value: index,
                        label: index,
                        available: true, 
                        selected: false
                    })
                }
            }
            resolve(res)
        })
    },
    
}
export { Filter }
export default Filter