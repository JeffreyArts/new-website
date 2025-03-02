import _ from "lodash"
import Matter from "matter-js"
import gsap from "gsap"
import Eye from "./eye"
import Mouth from "./mouth"
import BodyPart from "./bodypart"

import { BodyPartOptions } from "./bodypart"

export type CatterpillarOptions = {
    id?: string
    x?: number
    y?: number
    color?: string
    length?: number
    stiffness?: number 
    damping?: number
    maxVelocity?: number
    floppiness?: number 
    restitution?: number 
    autoBlink?: boolean
    bodyPart?: {
        slop?: number
        size?: number
        stiffness?: number 
        damping?: number 
        restitution?: number 
    }
} 

interface Catterpillar {
    world: Matter.World
    eye: {
        left: Eye,
        right: Eye,
    }
    id: string
    mouth: Mouth
    color: string
    blinkInterval?: number
    autoBlink: boolean
    x: number
    y: number
    head: Matter.Body
    belly: Matter.Body
    butt: Matter.Body
    body: Array<Matter.Body>
    bodyPart: BodyPartOptions
    bodyParts: Array<BodyPart>
    direction: "left" | "right" | ""
    stiffness: number
    bodyLength: number
    damping: number
    maxVelocity: number
    restitution: number
    floppiness: number
    composite: Matter.Composite
    spine: Matter.Constraint
    switchingPosition: boolean | ((value: boolean | PromiseLike<boolean>) => void)
    switchTimer: number 
    isMoving: boolean
    isMovable: undefined | Matter.Body
    mouthRecovering: boolean
    switchVelocity: number
    scared: number | NodeJS.Timeout
    scaredAction: number | NodeJS.Timeout
}

class Catterpillar  {
    #createBodyPart () {
        let section = "default"
        if (this.bodyParts.length == 0) {
            section = "head"
        }

        if (this.bodyParts.length === this.bodyLength) {
            section = "butt"
        }

        return new BodyPart({
            x: -128,
            y: -128,
            color: this.color,
            radius: this.bodyPart.size,
            restitution: this.bodyPart.restitution,
            slop: this.bodyPart.slop ? this.bodyPart.slop : this.bodyPart.size/5,
            section: section
        })
    }

    #createBodyParts () : {
        composite: Matter.Composite,
        eye: {
            left: Eye,
            right: Eye
        },
        head: Matter.Body,
        butt: Matter.Body
        } {

        const bodyParts = Matter.Composites.stack(this.x, this.y, this.bodyLength, 1, this.bodyPart.size + 2, 0, (x:number, y:number) => {
            const bodyPart = this.#createBodyPart()
            bodyPart.body.mass = 10

            this.bodyParts.unshift(bodyPart)
            return bodyPart.body
        })

        _.each(bodyParts.bodies, (body,i) => {
            const x =  this.x + (this.bodyPart.size * i) + this.bodyPart.size/2
            const y =  0.05 + (Math.abs(i - this.bodyLength/2) + (Math.abs(i - this.bodyLength/2)) / 2) *1
            Matter.Body.set(body, "position", {x, y})
        })
        
        // Matter
        const composite = Matter.Composite.create({
            bodies: bodyParts.bodies,
            label: "catterpillar",
        })
        
        let prev = null as null | Matter.Body
        _.each(composite.bodies, bodyPart => {
            if (prev) {
                Matter.Composite.add(composite, [
                    Matter.Constraint.create({
                        bodyA: bodyPart,
                        bodyB: prev,
                        pointA: {x: this.bodyPart.size/2, y:0},
                        pointB: {x: 0, y:0},
                        length: (this.bodyPart.size + 2) * this.floppiness,
                        stiffness: this.bodyPart.stiffness,
                        label: "bodyPartConnection",
                        render: {
                            strokeStyle: "#444",
                            type:"line",
                        }
                    }),
                ])
            }
            prev = bodyPart
        })

        composite.label = "catterpillar"

        return {
            composite,
            eye: this.eye,
            head: composite.bodies[0], 
            butt: composite.bodies[composite.bodies.length-1]
        }
    }
    
    #createBodyConstraint() : Matter.Constraint {
        return Matter.Constraint.create({
            bodyA: this.head,
            bodyB: this.butt,
            length: (this.bodyPart.size) * this.bodyLength,
            stiffness: this.stiffness,
            damping: this.damping,
            label: "catterpillarSpine",
            render: {
                visible: true,
                strokeStyle: "#4f0944",
                type: "spring",
            }
        })
    }

    #draw() {
        if (this.bodyLength < 0) {
            return
        }

        _.each(this.composite.bodies, (body, i) => {
            this.bodyParts[i].x = body.position.x
            this.bodyParts[i].y = body.position.y      
        })

        // Offset eyes
        const maxOffset = this.bodyPart.size
        const offsetPerc = (this.head.position.x - this.butt.position.x + this.bodyLength * this.bodyPart.size) / (this.bodyLength * this.bodyPart.size * 2)
        
        this.eye.left.offset.x = maxOffset/2 + maxOffset * offsetPerc - maxOffset
        this.eye.right.offset.x = maxOffset/2 + maxOffset * offsetPerc - maxOffset

        this.eye.left.x = this.head.position.x - this.eye["left"].width/2
        this.eye.left.y = this.head.position.y - this.eye["left"].height/2
        
        this.eye.right.x = this.head.position.x + this.eye["right"].width/2
        this.eye.right.y = this.head.position.y - this.eye["right"].height/2
           
        this.mouth.x = this.head.position.x + maxOffset/2 + maxOffset * offsetPerc - maxOffset
        this.mouth.y = this.head.position.y + this.bodyPart.size * .25 + this.mouth.offset.y
        
        requestAnimationFrame(() => this.#draw())
    }

    #loop(){
        if (this.bodyLength <= 0) {
            return
        }

        // update x & y position of the catterpillar
        
        this.x = (this.head.position.x + this.butt.position.x) / 2
        this.y = (this.head.position.y + this.butt.position.y) / 2
        
        const velocity = Math.abs(this.head.velocity.x) + Math.abs(this.head.velocity.y) 


        const solidObjects = [] as Array<Matter.Body>
        _.each (this.world.bodies, mBody => {
            if (mBody.label === "ground") {
                solidObjects.push(mBody)
            }
        })
        
        // _.each (this.world.composites, mComposite => {
        //     if (mComposite.label === "block") {
        //         const blockBody = mComposite.bodies.find(body => body.label === "block")
        //         if (blockBody) {
        //             solidObjects.push(blockBody)
        //         }
        //     }
        // })
        
        // Check if the catterpillar collides with the ground, and exit when it does not
        this.isMovable = undefined
        _.map(this.composite.bodies, body => {
            _.each(solidObjects, (solidObject) => {
                const bodyFilter = body.collisionFilter;
                const solidFilter = solidObject.collisionFilter;
            
                const canCollide = (bodyFilter.mask != undefined && solidFilter.category != undefined && bodyFilter.mask & solidFilter.category) !== 0 &&
                                   (solidFilter.mask != undefined && bodyFilter.category != undefined && solidFilter.mask & bodyFilter.category) !== 0;

                if (canCollide && Matter.Collision.collides(body, solidObject) !== null) {
                    this.isMovable = solidObject;
                }
            });
            
        })

        if (this.switchingPosition) {
            this.switchVelocity += 0.01
            const bellyConstraint = _.find(this.world.constraints, (constraint) => {
                return constraint.label === "bellyConstraint"
            })

            const buttConstraint = _.find(this.world.constraints, (constraint) => {
                return constraint.label === "buttConstraint"
            })

            // Cancel switching position after 3 seconds
            if (new Date().getTime() - this.switchTimer > 3000 && this.switchTimer > 0 && this.world && bellyConstraint && buttConstraint) {
                Matter.Composite.remove(this.world,[bellyConstraint, buttConstraint])
                this.isMoving = false
                if (typeof this.switchingPosition === "function") {
                    this.switchingPosition(false)
                }
                this.switchingPosition = false
                this.switchTimer = 0
            }
            
            // const xVelocity = 8 + this.switchVelocity
            // const centerPointY = (this.bodyLength * this.bodyPart.size)
            const centerPointX = (this.bodyLength * this.bodyPart.size)
            const angle = this.switchVelocity + 100
            const xVelocity = centerPointX + ( centerPointX * Math.cos(angle * Math.PI/180)) * 6.4
            const yVelocity = 4 + this.bodyPart.size * .5


            
            // const xVelocity = center.y + (radius * Math.sin(angle*i*Math.PI/180)) * this.options.size/100
            Matter.Body.setVelocity( this.head, {
                // x: (this.head.position.x - this.butt.position.x),
                x: this.direction === "right" ? -xVelocity : xVelocity ,
                y: -yVelocity,
            })
            if ((this.direction === "right" && this.head.position.x > this.belly.position.x + this.bodyPart.size * 3) ||
                this.direction === "left" && this.head.position.x < this.belly.position.x - this.bodyPart.size * 3) {
                
                

                if (this.world && bellyConstraint && buttConstraint) {
                    Matter.Composite.remove(this.world, bellyConstraint)
                    Matter.Body.setVelocity( this.head, {
                        x: this.direction === "right" ? - xVelocity * 1 : xVelocity * 1,
                        y: yVelocity * 2,
                    })
                    this.switchVelocity = 0

                    setTimeout(() => {
                        Matter.Composite.remove(this.world,[bellyConstraint, buttConstraint])
                        this.isMoving = false
                        if (typeof this.switchingPosition === "function") {
                            this.switchingPosition(true)
                        }
                        this.switchingPosition = false
                    },300)
                }
            }
        }        


        if (velocity > 20 && !this.isMoving && (Math.abs(this.head.position.y - this.butt.position.y) > this.bodyPart.size)) {
            if (this.scared) {
                clearTimeout(this.scared)
                clearTimeout(this.scaredAction)
            } else {
                this.eye.left.stopBlinking()
                this.eye.right.stopBlinking()
                this.mouth.switchState("😮", 1.28)
            }
            
            this.scared = setTimeout(() => {
                this.scared = 0
                this.scaredAction = setTimeout(() => {
                    this.eye.left.blink()
                    this.eye.right.blink()
                    this.mouth.switchState("🙂", 4)
                    this.mouthRecovering = false
                    this.eye.left.autoBlink = true
                    this.eye.right.autoBlink = true
                }, 2400)

            }, 200)
        }

        requestAnimationFrame(() => this.#loop())
    }

    #updateColor() {
        _.each(this.bodyParts, bodyPart => {
            bodyPart.color = this.color
        })
    }

    constructor (
        world: Matter.World,
        options = {
            x: 0,
            y: 0,
            color: "#58f208",
            length: 8,
            stiffness: .8, 
            damping: .8, 
            maxVelocity: 3,
            floppiness: .5,
            restitution: .8,
            autoBlink: true,
            id: undefined,
            bodyPart: {
                slop: 2,
                size: 8,
                stiffness: .16,
                damping: .2,
                restitution: .8
            }
        } as CatterpillarOptions) {
        this.bodyPart = {
            size: 8,
            stiffness: .16,
            damping: .2,
            restitution: .8
        }
        
        this.world = world
        this.bodyParts = []
        this.isMovable = undefined
        this.isMoving = false
        this.switchingPosition = false
        this.switchTimer = 0
        this.direction      = ""
        this.switchVelocity = 0
        this.x              = options.x             ? options.x : 0
        this.y              = options.y             ? options.y : 0
        this.id             = options.id            ? options.id : Math.random().toString(36).substring(7)
        this.color          = options.color         ? options.color : "#58f208"
        this.bodyLength     = options.length        ? options.length : 8
        this.stiffness      = options.stiffness     ? options.stiffness : .8
        this.maxVelocity    = options.maxVelocity   ? options.maxVelocity : 3
        this.floppiness     = options.floppiness    ? options.floppiness : .5
        this.damping        = options.damping       ? options.damping : .8
        this.restitution    = options.restitution   ? options.restitution : .8
        
        this.bodyPart.size          = options.bodyPart?.size ? options.bodyPart?.size : 8
        this.bodyPart.slop          = options.bodyPart?.slop
        this.bodyPart.stiffness     = options.bodyPart?.stiffness
        this.bodyPart.damping       = options.bodyPart?.damping
        this.bodyPart.restitution   = options.bodyPart?.restitution
        if (typeof options.autoBlink === "boolean") {
            this.autoBlink = options.autoBlink
        } else {
            this.autoBlink = true
        }

        const eyeOptions = {
            x: this.x,
            y: this.y,
            width: 8,
            height: 8,
            autoBlink: this.autoBlink
        }

        const mouthOptions = {
            size: this.bodyPart.size * 1.25,
            scale: 1,
            offset: {x: 0, y: 0},
        }

        if (window.innerWidth < 768) {
            this.bodyPart.size = this.bodyPart.size*.75
            eyeOptions.width = eyeOptions.width/2
            eyeOptions.height = eyeOptions.height/2
            mouthOptions.scale = .5
            mouthOptions.offset.y = 1
        }
        
        // All options set, now call the helper functions to create the catterpillar
        const t = this.#createBodyParts()
        this.composite = t.composite
        this.head = t.head
        this.belly = t.composite.bodies[Math.floor((this.bodyParts.length-1)/2)]
        this.butt = t.butt
        this.body = []
        
        for (let index = 1; index < this.composite.bodies.length-1; index++) {
            this.body.push(this.composite.bodies[index])
        }
        
        this.spine = this.#createBodyConstraint()
        Matter.Composite.add(this.composite, this.spine)

        
        this.eye = {
            left: new Eye(eyeOptions),
            right: new Eye(eyeOptions)
        }

        this.mouth = new Mouth(mouthOptions)
        
        this.#draw.bind(this)
        this.#draw()

        this.#loop.bind(this)
        this.#loop()

        return new Proxy(this, {
            set: function (target:any, key, value) {
                if (key === "color") {
                    target[key] = value
                    target.#updateColor()
                }
                
                if (typeof target[key] !== "undefined") {
                    target[key] = value
                }
                return true
            }
        })
    }
    
    relax(constraint: Matter.Constraint | Array<Matter.Constraint>) {
        return new Promise((resolve) => {
            const duration = 1
            gsap.to(this.spine, {
                length: (this.bodyLength * this.bodyPart.size) * .5,
                onComplete: () => {
                    gsap.to(this.spine, {
                        length: (this.bodyLength * this.bodyPart.size),
                        onComplete: () => {
                            setTimeout(() => {
                                if (this.world) {
                                    Matter.Composite.remove(this.world, constraint)
                                    this.isMoving = false
                                    resolve(true)
                                }
                            }, 320)
                        },
                        ease: "back.out",
                        duration: duration/2
                    })
                },
                ease: "back.out",
                duration: duration
            })
        })
    }

    move(direction: "left" | "right") : Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.direction = direction
            this.switchTimer = new Date().getTime()
            if (!this.world) {
                return reject(new Error("Missing required variables mWorld | ground | catterPillar.composite"))
            }
            
            
            if (!this.isMovable) {
                this.isMoving = false
                return resolve(false)
            }
            
            const head = this.head
            const butt = this.butt
            const collision = this.isMovable as Matter.Body

            const duration = .8
            const newLength = (this.bodyLength * this.bodyPart.size)*.8
            const yOffset = (collision.bounds.max.y - collision.bounds.min.y) / 2
            let headConstaint = null as null | Matter.Constraint
            this.isMoving = true

            // Fix butt to ground
            const buttConstraint = Matter.Constraint.create({
                bodyA: butt,
                pointA: { x: 0, y: this.bodyPart.size/2 },
                pointB: { x: butt.position.x - collision.bounds.max.x/2, y: -yOffset },
                bodyB: collision,
                length: 1,
                stiffness: .8,
                label: "buttConstraint",
                render: {
                    strokeStyle: "#9f0",
                    type:"line",
                }
            })
            Matter.Composite.add(this.world, buttConstraint)
        
        
            if ((direction == "left" && head.position.x > butt.position.x) ||
                (direction == "right" && head.position.x < butt.position.x)) {

                // Kick head to opposite side
                this.switchingPosition = resolve
                // Fix belly to ground
                if (this.belly) {
                    const bellyConstaint = Matter.Constraint.create({
                        bodyA: this.belly,
                        pointA: { x: 0, y: this.bodyPart.size/2 },
                        pointB: { x: this.belly.position.x - collision.bounds.max.x/2, y: -yOffset },
                        bodyB: collision,
                        length: 1,
                        stiffness: .8,
                        label: "bellyConstraint",
                        render: {
                            strokeStyle: "#9f0",
                            type:"line",
                        }
                    })
                    Matter.Composite.add(this.world, bellyConstaint)
                }
            } else {
            // Fix head to ground
                headConstaint = Matter.Constraint.create({
                    bodyA: head,
                    pointA: { x: 0, y: this.bodyPart.size/2 },
                    pointB: { x: head.position.x - collision.bounds.max.x/2, y: -yOffset },
                    bodyB: collision,
                    length: 0.5,
                    stiffness: .8,
                    label: "bodyPartConnection",
                    render: {
                        strokeStyle: "#9f0",
                        type:"line",
                    }
                })
                Matter.Composite.add(this.world, headConstaint)

                // Actually move, when head is pointing in the right direction
                if (this.spine) {
                    // Slide butt forward ( to the left )
                    let newPosX = 0
                    if (direction === "left") {
                        newPosX = (butt.position.x - collision.bounds.max.x/2) - newLength/2
                    } else if (direction === "right") {
                        newPosX = (butt.position.x - collision.bounds.max.x/2) + newLength/2
                    }
            
                    gsap.to(buttConstraint.pointB, {
                        x: newPosX,
                        onComplete:() => {
                            if (!this.world) {
                                return
                            }
                            if (headConstaint) {
                                Matter.Composite.remove(this.world, headConstaint)
                            }
                        },
                        // ease: "power2.out",
                        ease: "back.out",
                        duration: duration*.777,
                    })

                    // Animate body
                    gsap.to(this.spine, {
                        length: newLength,
                        ease: "back.out",
                        duration: duration/2,
                        onComplete:() => {
                            gsap.to(this.spine, {
                                length: (this.bodyPart.size) * this.bodyLength,
                                onComplete: () => {
                                    setTimeout(() => {
                                        if (this.world) {
                                            Matter.Composite.remove(this.world,buttConstraint)
                                            this.isMoving = false
                                            resolve(true)
                                        }
                                    }, 320)
                                },
                                ease: "power2.in",
                                duration: duration/2
                            })
                        }
                    })
                }

                // Make body curl
                const centerIndex = Math.floor(this.bodyParts.length/2)
                const maxVelocity  = this.maxVelocity
            
                _.each(this.bodyParts, (bodyPart,index) => {
                    if (index != 0 && index != this.bodyParts.length-1) {
                        const velocity = centerIndex === index ? maxVelocity : maxVelocity - maxVelocity / index
                        Matter.Body.setVelocity( bodyPart.body, {
                            x: 0,
                            y: -velocity * (centerIndex - Math.abs(index - centerIndex))/2,
                        })
                    } else {
                        bodyPart.body.friction = 1
                        Matter.Body.setVelocity( bodyPart.body, {
                            x: 0,
                            y: 10
                        })
                    }
                })

            }
        })
    }

    blink() {
        this.eye.left.blink()
        this.eye.right.blink()
    }

    remove() {
        this.bodyLength = -1
        this.eye.left.remove()
        this.eye.right.remove()
        this.mouth.remove()
        _.each(this.bodyParts, bodyPart => {
            bodyPart.remove()
        })
        this.isMoving = false
    }
    
    moveLeft() {
        return this.move("left")
    }

    moveRight() {
        return this.move("right")
    }

}

export default Catterpillar