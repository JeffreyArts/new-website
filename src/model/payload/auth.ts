import { jwtDecode } from "jwt-decode"
import axios, { AxiosError, AxiosResponse, AxiosRequestConfig, AxiosInstance } from "axios"
import UserModel from "./user"
import _ from "lodash"


export class AuthModel {
    self: UserModel | undefined
    baseUrl: string
    refreshTimeout: number |  NodeJS.Timeout
    refreshToken: string
    authToken: string
    axios: AxiosInstance

    constructor (baseUrl: string) {
        this.baseUrl = baseUrl
        this.refreshTimeout = 0
        this.refreshToken = localStorage.getItem("refreshToken") || ""
        this.authToken = localStorage.getItem("authToken") || ""
        this.axios = axios.create({
            withCredentials: true,
            baseURL: baseUrl
        })

        let userAccount = undefined

        if (localStorage.getItem("userAccount")) {
            userAccount = JSON.parse(localStorage.getItem("userAccount") || "")
            if (!userAccount) {
                userAccount = undefined
            }    
        }

        if (!userAccount) {
            this.createAnonymousAccount().then(() => {
                userAccount = JSON.parse(localStorage.getItem("userAccount") || "")
                if (!userAccount) {
                    userAccount = undefined
                }
                
                if (this.self) {
                    this.self = new UserModel({...userAccount, self: true })
                }
            })
        } else {
            if (localStorage.getItem("userAccount")) {
                this.self = new UserModel({ ...userAccount, self: true })
            }
        }
        
    }
    
    
    validateAuthToken(token:string) : boolean {
        if (token) {
            const authData = jwtDecode(token) as {
                exp: number,
                iat: number,
                id: number
            }
            
            if (authData) {
                // get difference in minutes
                const expiration = authData.exp -  Math.floor(Date.now() / 1000)
                return expiration > 0
            }
        }
        return false
    }
    
    authenticate(options: { email:string, password: string }) : Promise<AxiosResponse> {
        return new Promise(async (resolve, reject) => {
            try {
                const credentials = { email: options.email, password: options.password }
                const response = await this.axios.post(`/${import.meta.env.VITE_PAYLOAD_AUTH_COLLECTION}/login`, credentials)                
                
                if (response.data) {
                    localStorage.setItem("userAccount", JSON.stringify(_.pick(response.data.user, ["id", "username", "email"])))
                    localStorage.setItem("authToken", response.data.token)
                    
                    this.self = new UserModel({
                        id: response.data.user.id,
                        username: response.data.user.username,
                        email:response.data.user.email,
                        self: true
                    })
                    return resolve(response)
                }

                reject(response)
                
            } catch (err) {
                
                if (err instanceof AxiosError && err.response && err.response.data && err.response.data.error) {
                    return reject(err)
                }

                reject(err)
            }
        })
        
    }
    
    createAnonymousAccount() : Promise<AxiosResponse> {        
        return new Promise(async (resolve, reject) => {
            try {
                const request = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    }
                } as AxiosRequestConfig

                // request.data = JSON.stringify(request.data, null, 2)

                const response = await this.axios(`/${import.meta.env.VITE_PAYLOAD_AUTH_COLLECTION}`, request)
                const self = _.pick(response.data.doc, ["id", "username", "email", "defaultPassword"])
                localStorage.setItem("userAccount", JSON.stringify(self))
                
                this.self = new UserModel({
                    ...self,
                    self: true
                })
                
                resolve(response)
                
            } catch (err: unknown | AxiosError) {
                reject(err)
            }
        })
    }
    
    register(options: { email: string, password:string, [key:string]: string }) : Promise<AxiosResponse> {
        if (!options) {
            throw new Error("Missing options parameter")
        }
        const query = {
            email: options.email,
            password: options.password,
        } as { [key:string]: string }

        for (const key in options) {
            query[key] = options[key]
        }

        return new Promise(async (resolve, reject) => {
            try {
                const request = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    data: query
                } as AxiosRequestConfig

                // request.data = JSON.stringify(request.data, null, 2)

                const response = await this.axios(`/${import.meta.env.VITE_PAYLOAD_AUTH_COLLECTION}`, request)
                const self = _.pick(response.data.doc, ["id", "username", "email"])
                localStorage.setItem("self", JSON.stringify(self))
                
                this.self = new UserModel({
                    ...self,
                    self: true
                })
                
                resolve(response)
                
            } catch (err: unknown | AxiosError) {
                reject(err)
            }
        })
    }

    forgotPassword(options: { email?:string, username?: string }) : Promise<AxiosResponse> {
        return new Promise(async (resolve, reject) => {
            try {
                const credentials =  { 
                } as { email?:string, username?:string }

                if (options.email) {
                    credentials.email = options.email
                } else if (options.username) {
                    credentials.username = options.username
                }
                
                const response = await this.axios.post(`/${import.meta.env.VITE_PAYLOAD_AUTH_COLLECTION}/forgot-password`, credentials)                
                
                if (response.data) {
                    return resolve(response)
                }

                reject(response)
            } catch (err) {
                if (err instanceof AxiosError && err.response) {
                    // const serverError = err.response.data.error
                    return reject(err)
                }
                reject(err)
            }
        })
    }

    resetPassword(options: { paswordForgotCode:string, newPassword: string }) : Promise<AxiosResponse> {
        return new Promise(async (resolve, reject) => {
            try {
                const requestBody =  { 
                    token: options.paswordForgotCode,
                    password: options.newPassword
                }

                
                const response = await this.axios.post(`/${import.meta.env.VITE_PAYLOAD_AUTH_COLLECTION}/reset-password`, requestBody)
                
                if (response.data) {
                    return resolve(response)
                }

                reject(response)
            } catch (err) {
                if (err instanceof AxiosError && err.response) {
                    // const serverError = err.response.data.error
                    return reject(err)
                }
                reject(err)
            }
        })
    }
    
    logout() {
        localStorage.removeItem("authToken")
        localStorage.removeItem("userAccount")
        this.self = undefined
    }
}

export default AuthModel