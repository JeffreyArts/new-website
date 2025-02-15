import Paper from "paper"
import Matter from "matter-js"
import Color from "color"

export type BodyPartOptions = {
    size: number,
    stiffness?: number,
    damping?: number,
    slop?: number,
    points?: number,
    restitution?: number,
}


interface BodyPart {
    x: number
    y: number
    radius: number
    body: Matter.Body
    color:string
    options: {
        restitution: number
        slop: number,
    }
    section: "bodyPart" | "head" | "butt"
    paper: paper.Path

}

class BodyPart {

    #generatePaperPath() {
        const newPath = new Paper.Path.Circle(new Paper.Point(this.x,this.y), this.radius) 
        const color = Color(this.color)
        newPath.fillColor = new Paper.Color(color.hex())
        newPath.strokeColor = new Paper.Color(color.darken(.5).hex())
        newPath.strokeColor.alpha = .4
        return newPath
    }

    #updatePosition() {
        this.paper.position.x = this.x
        this.paper.position.y = this.y
    }
    #updateColor() {
        const color = Color(this.color)
        this.paper.fillColor = new Paper.Color(color.hex())
        this.paper.strokeColor = new Paper.Color(color.darken(.5).hex())
        this.paper.strokeColor.alpha = .4
    }

    constructor (
        options: {
            radius: number,
            x?: number,
            y?: number,
            restitution?: number,
            slop?: number,
            color?: string,
            section?: string
        }
    ) {
        this.options = {
            restitution: 1,
            slop: 1,
        }

        this.section = "bodyPart"
        this.x = options?.x ? options.x : 0
        this.y = options?.y ? options.y : 0
        this.color = options?.color ? options.color : "#58f208"
        this.radius = options?.radius ? options.radius : 8

        if (options?.restitution) {
            this.options.restitution = options.restitution
        }

        if (options?.slop) {
            this.options.slop = options.slop
        }
        
        this.body = Matter.Bodies.circle(this.x, this.y, this.radius/2, { 
            collisionFilter: { 
                category: 0x0002,
            }, 
            mass: 1,
            density: .2,
            friction: .1,
            restitution: this.options.restitution,
            slop: this.options.slop ? this.options.slop : this.radius/5,
            label: this.section
        })

        this.paper = this.#generatePaperPath()

        return new Proxy(this, {
            set: function (target, key, value) {
                // console.log(`${String(key)} set to ${value}`)
                if (key === "x" || key === "y") {
                    target[key] = value
                    target.#updatePosition()
                }
                if (key === "color") {
                    target[key] = value
                    target.#updateColor()
                }
                return true
            }
        }) as BodyPart
    }

    remove() {
        this.paper.remove()
    }
}

export default BodyPart