import { defineStore } from "pinia"
import AuthModel from "@/model/payload/auth"
import { AxiosRequestConfig, AxiosResponse } from "axios"
import axios from "axios"

export interface PayloadHTTPHeader {
    "Content-Type": string;
    "Authorization"?: string;
}

export const Payload = defineStore({
    id: "Payload",
    state: () => ({
        baseUrl: "",
        auth: undefined as AuthModel | undefined 
    }),
    actions: {
        init() {

            // Set url
            let url = import.meta.env.VITE_PAYLOAD_REST_ENDPOINT
            // if last char is a slash, remove it
            if (url[url.length - 1] === "/") {
                url = url.slice(0, -1)
            }

            this.baseUrl = url
            this.auth = new AuthModel(this.baseUrl)
        },
        GET(path: string) {
            return this.REST("GET", path)
        },
        DELETE(path: string) {
            return this.REST("DELETE", path)
        },
        POST(path: string, data?: object | string) {
            return this.REST("POST", path, data)
        },
        PUT(path: string, data?: object | string) {
            if (typeof data === "object") {
                data = JSON.stringify(data)
            }
            return this.REST("PUT", path, data)
        },
        REST(method: string, path: string, data?: object | string) : Promise<AxiosResponse> {
            
            const headers = {
                "Content-Type": "application/json",
            } as PayloadHTTPHeader
            
            path = this.baseUrl + path
             
            if (this.auth && this.auth.self) {
                headers["Authorization"] = `Bearer ${localStorage.getItem("authToken")}`
            }

            const request = {
                method: method,
                headers: headers,
                withCredentials: true
            } as AxiosRequestConfig
            
            if (typeof data !== "string" && typeof data !== "undefined") {
                request.data = JSON.stringify(data, null, 2)
            } else if (typeof data === "string") {
                request.data = data
            }
            
            
            return axios(path, request)
        },
        authenticateUser(email: string, password: string) {
            if (!this.auth) {
                throw new Error("Missing auth")
            }

            return this.auth.authenticate({
                email,
                password
            })
        },
        registerUser(email: string, password:string, options?: { [key: string]: string }) {
            if (!this.auth) {
                throw new Error("Missing auth")
            }
            const request = {
                email,
                password
            } as { email:string, password: string, [key: string]: string }

            if (options) {
                for (const key in options) {
                    request[key] = options[key]
                }
            }
    
            return this.auth.register(request)
            
        },
    },
    getters: {
    }
})

export default Payload