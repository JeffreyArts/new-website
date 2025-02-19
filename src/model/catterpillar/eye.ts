import _ from "lodash"
import Paper from "paper"
import gsap from "gsap"

export type EyeOptions = {
    x?: number,
    y?: number,
    width?: number,
    height?: number,
    autoBlink?: boolean,
    blinkInterval?: number 
}

interface Eye {
    x: number
    y: number
    offset: {
        x: number
        y: number
    }
    width: number
    height: number
    sclera: paper.Path
    lid: paper.Path
    pupil: paper.Path
    pupilOffset: {x: number, y:number}
    isBlinking: boolean
    blinkInterval: number
    blinked: number
    autoBlink: undefined | number | boolean | NodeJS.Timeout
}

class Eye  {
    #updateBlinkInterval() {
        if (!this.autoBlink || this.autoBlink === undefined) {
            if (typeof this.autoBlink != "boolean") {
                clearTimeout(this.autoBlink)
                return
            } 
            
            if (this.autoBlink === false) {
                return
            }
        }
        this.autoBlink = setTimeout(() => {
            this.blink()
            setTimeout(() => {
                if (this.blinked % 3 == 0) {
                    this.blink()
                }
            }, 572) // Every three blinks, it blinks twice, this timeout is the delay between the double blinking
            this.#updateBlinkInterval()
        }, this.blinkInterval)
    }

    #blinkUpdate(progress: {perc: number}) {

        if (this.lid && this.sclera) {
            this.lid.segments[1].point.y = this.lid.position.y - (5 - progress.perc * 5)
            this.lid.segments[3].point.y = this.lid.position.y + (5 - progress.perc * 5)
            this.lid.smooth({ type: "continuous"})
            
            this.sclera.segments[1].point.y = this.lid.segments[1].point.y 
            this.sclera.segments[3].point.y = this.lid.segments[3].point.y 
            this.sclera.smooth({ type: "continuous"})
        }
    }

    #setSize(){
        if (!this.lid) {
            return
        }
        this.lid.segments[0].point.x = this.width * 0
        this.lid.segments[0].point.y = this.height * 0.5

        this.lid.segments[1].point.x = this.width * 0.5
        this.lid.segments[1].point.y = this.height * 0

        this.lid.segments[2].point.x = this.width * 1
        this.lid.segments[2].point.y = this.height * 0.5

        this.lid.segments[3].point.x = this.width * 0.5
        this.lid.segments[3].point.y = this.height * 1

        this.lid.closePath()
        this.lid.smooth({ type: "continuous"})

        this.sclera.segments[0].point.x = this.width * 0
        this.sclera.segments[0].point.y = this.height * 0.5

        this.sclera.segments[1].point.x = this.width * 0.5
        this.sclera.segments[1].point.y = this.height * 0

        this.sclera.segments[2].point.x = this.width * 1
        this.sclera.segments[2].point.y = this.height * 0.5

        this.sclera.segments[3].point.x = this.width * 0.5
        this.sclera.segments[3].point.y = this.height * 1

        this.sclera.closePath()
        this.sclera.smooth({ type: "continuous"})
    }
    
    constructor (
        options: EyeOptions
    ) {
        this.blinked = 0
        this.isBlinking = false
        this.blinkInterval = options.blinkInterval ? options.blinkInterval : 4000
        this.x = options.x ? options.x : 0
        this.y = options.y ? options.y : 0
        this.width = options.width ? options.width : 8
        this.height = options.height ? options.height : 8
        this.pupilOffset = {x: 0, y:0}
        this.offset = {x: 0,y: 0}

        this.lid = new Paper.Path([
            new Paper.Point(this.width * 0,   this.height * 0.5),
            new Paper.Point(this.width * 0.5, this.height * 0),
            new Paper.Point(this.width * 1,   this.height * 0.5),
            new Paper.Point(this.width * 0.5, this.height * 1),
        ])

        this.lid.closePath()
        this.lid.smooth({ type: "continuous"})
        this.sclera = this.lid.clone()
        this.pupil = new Paper.Path.Ellipse({x: 0, y:0, width: Math.min(this.width,this.height)/2, height: Math.min(this.width,this.height)/2})

        //// Set colors
        this.pupil.fillColor    = new Paper.Color("#222")
        this.sclera.fillColor   = new Paper.Color("#fff")
        this.sclera.strokeColor = new Paper.Color("#222")

        //// Set lid mask
        const lidGroup = new Paper.Group([this.lid, this.pupil])
        lidGroup.clipped = true

        if (options.autoBlink) {
            this.autoBlink = true
            this.startBlinking()
        }

        this.updatePosition()

        return new Proxy(this, {
            set: function (target, key, value) {
                if (key === "x" || key === "y") {
                    target[key] = value
                    target.updatePosition()
                }

                if (key === "width" || key === "height") {
                    target[key] = value
                    target.#setSize()
                }

                if (key === "autoBlink") {
                    target[key] = value
                    if (value) {
                        target.startBlinking()
                    } else {
                        target.stopBlinking()
                    }
                }

                return true
            }
        })
    }

    startBlinking() {
        this.#updateBlinkInterval()
    }
    
    stopBlinking() {
        if (this.autoBlink === true) {
            this.autoBlink = false
        } else {
            this.autoBlink = undefined
        }
    }

    blink(delay = 0) {
        if (this.isBlinking) {
            return
        }
        this.isBlinking = true
        this.blinked ++

        if (!this.lid ) {
            return console.error("Lid is not defined")
        }

        const start = {
            perc: 0
        }
        // const startPos = this.lid.position.y
        // const startPosTop = this.lid.segments[1].point.y
        // const startPosBottom = this.lid.segments[3].point.y
        // const topLidOffset = this.lid.segments[1].point.y - startPos
        gsap.to(start, {
            perc: 1,
            duration: .24,
            ease: "power3.in",
            onUpdate: () => { this.blinkClosing(start) },
            onComplete: () => {
                if (!this.lid ) {
                    return console.error("Lid is not defined")
                }
                const end = {
                    perc: 0
                }

                gsap.to(end, {
                    perc: 1,
                    delay,
                    duration: .32,
                    ease: "power3.out",
                    onUpdate: () => { this.blinkOpening(end.perc) },
                    onComplete: () => {
                        if (this.lid) {
                            this.lid.segments[0].point.y = this.lid.position.y
                            this.lid.segments[1].point.y = this.lid.position.y - this.height / 2
                            this.lid.segments[2].point.y = this.lid.position.y
                            this.lid.segments[3].point.y = this.lid.position.y + this.height / 2
                            
                            _.each(this.lid.segments, (v,i) => {
                                if (!this.sclera || !this.lid) {
                                    return
                                }
                                this.sclera.segments[i].point.y = this.lid.segments[i].point.y  
                                this.sclera.smooth({ type: "continuous"})
                            })
                        }
                        this.isBlinking = false
                    },
                })
            },
        })
    }

    // blinkClosing is a private function
    blinkClosing(progress: {perc: number}) {
        if (this.lid && this.sclera) {
            this.lid.segments[1].point.y = this.lid.position.y - (5 - progress.perc * 5)
            this.lid.segments[3].point.y = this.lid.position.y + (5 - progress.perc * 5)
            this.lid.smooth({ type: "continuous"})
            
            this.sclera.segments[1].point.y = this.lid.segments[1].point.y 
            this.sclera.segments[3].point.y = this.lid.segments[3].point.y 
            this.sclera.smooth({ type: "continuous"})
        }
    }

    // blinkOpening is a private function
    blinkOpening(perc: number) {
        if (this.lid && this.sclera) {
            this.lid.segments[1].point.y = this.lid.position.y - (perc * 5)
            this.lid.segments[3].point.y = this.lid.position.y + (perc * 5)
            this.lid.smooth({ type: "continuous"})

            this.sclera.segments[1].point.y = this.lid.segments[1].point.y 
            this.sclera.segments[3].point.y = this.lid.segments[3].point.y 
            // this.sclera.smooth({ type: "continuous"}) // Seems obsolete
        }
    }            

    updatePosition(x?:number,y?:number) {
        if (!this.pupil) {
            return console.error("Missing pupil")
        }
        if (!this.lid) {
            return console.error("Missing lid")
        }
        if (!this.sclera) {
            return console.error("Missing sclera")
        }
        
        this.lid.position.y = this.y + this.offset.y
        this.lid.position.x = this.x + this.offset.x

        this.pupil.position.y = this.y + this.pupilOffset.y + this.offset.y
        this.pupil.position.x = this.x + this.pupilOffset.x + this.offset.x

        this.sclera.position.y = this.y + this.offset.y
        this.sclera.position.x = this.x + this.offset.x
    }

    movePupil(offset:{x: number, y: number}) {
        if (!offset || !offset.x) {
            return console.error("Invalid value for movePupil")
        }

        this.pupilOffset.x = offset.x
        this.pupilOffset.y = offset.y
    }
    
    remove() {
        this.stopBlinking()
        this.lid.remove()
        this.sclera.remove()
        this.pupil.remove()
    }
}

export default Eye