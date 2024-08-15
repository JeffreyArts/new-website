import { io, Socket } from "socket.io-client"
import { UserModel } from "@/model/payload/user"

export interface SocketMessage {
    created: string,
    user: {
        id: number,
        name: string
    }
}

export class SocketModel {
    public connection: Socket

    constructor(user: UserModel, isDev = false) {

        this.connection = io(import.meta.env.VITE_PAYLOAD_SOCKET_ENDPOINT, {
            extraHeaders: {
                Authorization: "Bearer " + localStorage.getItem("authToken")
            },
            secure: false, // Mandatory for Chromium browsers?
            withCredentials: true
        })

        if (user) {
            this.connection.on("connect", () => {
                // this.connection.emit("authenticate", user)
                if (isDev) {
                    this.connection.onAny((type, data) => {
                        console.log(type, data)
                    })
                }

                this.connection.on("chat-message:create", (data) => {    
                    console.log(data)
                })
            })
        }
    }
}

export default SocketModel