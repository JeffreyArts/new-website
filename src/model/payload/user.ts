import type { CatterpillarOptions } from "../catterpillar"
export interface UserOptions {
    id: number
    username: string
    email: string
    provider?: string
}

export class UserModel {

    public self: boolean
    public id: number
    public email: string
    public username: string
    public defaultPassword?: string
    public verified?: boolean
    public catterpillar?: CatterpillarOptions

    constructor(properties: {
        id?: number,
        username?: string,
        email?: string,
        defaultPassword?: string,
        self?: boolean,
        catterpillar?: CatterpillarOptions,
        verified?: boolean
    }) {
        if (!properties) {
            throw new Error("Missing options for UserModel")
        }

        this.id = properties.id || 0
        this.username = properties.username || ""
        this.email = properties.email || ""
        this.catterpillar = properties.catterpillar || undefined
        this.verified = properties.verified || false
        this.self = (typeof properties.self !== "undefined") ? properties.self : false
        if (properties.defaultPassword) {
            this.defaultPassword = properties.defaultPassword
        }
        
        if (this.self && (!this.id && !this.email && !this.username)) {
            this.loadFromLocalStorage()
        }
    }

    loadFromLocalStorage() {
        const self = JSON.parse(localStorage.getItem("self") || "")
        if (!self) {
            throw new Error("No user found in localStorage")
        }

        this.id = self.id
        this.username = self.username
        this.email = self.email
        if (self.defaultPassword) {
            this.defaultPassword = self.defaultPassword
        }
        return self
    }
}

export default UserModel