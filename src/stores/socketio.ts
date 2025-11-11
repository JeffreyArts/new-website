import { defineStore } from "pinia"
import { io } from "socket.io-client"
import * as SocketIOClient from "socket.io-client"


export const socketIO = defineStore("socketIO", {
    state: () => ({
        socket: null as null | SocketIOClient.Socket,
        URL: import.meta.env.VITE_PAYLOAD_SOCKET_ENDPOINT
    }),
    actions: {
        emit(event:string, data: object | string) {
            if (!this.socket) {
                // Init socket and try again
                this.init()
                this.emit(event, data)
                return
            }
            
            this.socket.emit(event, data)
        },        
        init() {
            this.socket = io(this.URL)
        }
    },
    getters: {
    }
})

export default socketIO