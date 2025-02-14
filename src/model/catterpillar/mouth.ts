import _ from "lodash"
import Paper from "paper"
import gsap from "gsap"

export type MouthOptions = {
    size?: number,
    scale?: number
}

export type MouthState = "😮" | "🙂" | "😐" | "🙁" | "😚" | "😙" | "😗"

export type MouthPoints = {
    topLip: {
        left: {
            x: number,
            y: number
        },
        center: {
            x: number,
            y: number
        },
        right: {
            x: number,
            y: number
        },
    },
    bottomLip: {
        left: {
            x: number,
            y: number
        },
        center: {
            x: number,
            y: number
        },
        right: {
            x: number,
            y: number
        },
    }
}

interface Mouth {
    x: number
    y: number
    offset: {
        x: number
        y: number
    }
    paper: paper.Path
    topLip: {
        left: paper.Point,
        center: paper.Point,
        right: paper.Point,
    }
    bottomLip: {
        left: paper.Point,
        center: paper.Point,
        right: paper.Point,
    }
    animation: null | gsap.TweenTarget
    inTransition: boolean
    scale: number
    size: number
    state: MouthState
}

class Mouth  {
    constructor (
        options: MouthOptions
    ) {
        this.x = 0
        this.y = 0
        this.size = options.size ? options.size : 16
        this.scale = options.scale ? options.scale : 1
        this.inTransition = false

        this.state = "🙂"

        this.paper = new Paper.Path([
            new Paper.Point(this.size / 2,  0),
            new Paper.Point(0 ,  0),
            new Paper.Point(-this.size / 2,  0),
            new Paper.Point(-this.size / 2,  0),
            new Paper.Point(0,  0),
            new Paper.Point(this.size / 2,  0),
            new Paper.Point(this.size / 2,  0),// This is going to be removed by calling the closePath method
        ])
        this.paper.closePath()
        this.animation = null

        this.bottomLip = {
            left:  this.paper.segments[0].point,
            center:  this.paper.segments[1].point,
            right:  this.paper.segments[2].point,
        }
        this.topLip = {
            left:  this.paper.segments[5].point,
            center:  this.paper.segments[4].point,
            right:  this.paper.segments[3].point,
        }

        this.paper.fillColor = new Paper.Color("#222")

        return new Proxy(this, {
            set: function (target:any, key, value) {
                if (key === "x" || key === "y") {
                    target[key] = value
                    target.updatePosition()
                }
                
                if (typeof target[key] !== "undefined") {
                    target[key] = value
                }
                return true
            }
        })
    }

    updatePosition() {
        if (this.inTransition) {
            return
        }

        if (this.state === "🙂") {
            this.updateState(this.getSmilePosition())
        }
        
        if (this.state === "😮") {
            this.updateState(this.getOpenPosition())
        }

        if (this.state === "😐") {
            this.updateState(this.getShockedPosition())
        }

        if (this.state === "🙁") {
            this.updateState(this.getSadPosition())
        }
        if (this.state === "😚" || this.state === "😙" || this.state === "😗") {
            this.updateState(this.getKissPosition())
        }
    }

    updateState(newState: {
        topLip: {
            left: {x: number, y: number},
            center: {x: number, y: number},
            right: {x: number, y: number}
        },
        bottomLip: {
            left: {x: number, y: number},
            center: {x: number, y: number},
            right: {x: number, y: number}
        }
    }) {
        
        // Top lip
        this.topLip.left.x      = this.x + (newState.topLip.left.x * this.scale)
        this.topLip.left.y      = this.y + (newState.topLip.left.y * this.scale)

        this.topLip.center.x    = this.x + (newState.topLip.center.x * this.scale)
        this.topLip.center.y    = this.y + (newState.topLip.center.y * this.scale)
        
        this.topLip.right.x     = this.x + (newState.topLip.right.x * this.scale)
        this.topLip.right.y     = this.y + (newState.topLip.right.y * this.scale)

        // Bottom lip
        this.bottomLip.left.x   = this.x + (newState.bottomLip.left.x * this.scale)
        this.bottomLip.left.y   = this.y + (newState.bottomLip.left.y * this.scale)

        this.bottomLip.center.x = this.x + (newState.bottomLip.center.x * this.scale)
        this.bottomLip.center.y = this.y + (newState.bottomLip.center.y * this.scale)
        
        this.bottomLip.right.x  = this.x + (newState.bottomLip.right.x * this.scale)
        this.bottomLip.right.y  = this.y + (newState.bottomLip.right.y * this.scale)

        this.paper.smooth({ type: "continuous"})
    }

    switchState(state: MouthState | MouthPoints, duration = .64 as number) {
        // duration = amount of seconds that the switch take
        // Don't switch state if it is the same state
        
        if (this.inTransition && this.animation) {
            gsap.killTweensOf(this.animation)
        }

        if (state == this.state) {
            return
        }
        this.inTransition = true
        const progress = { perc: 0 }
        let ease = "sine.inOut"
        if (state === "😮") {
            ease = "elastic.out(1,0.5)"
        }

        const from = this.getPosition(this.state)
        
        let to = state as MouthPoints
        if (typeof state === "string") {
            to = this.getPosition(state)
        } 

        
        // Some data re-arranging so GSAP can process it correctly
        const gsapFrom = {
            "topLip.left.x": from.topLip.left.x,
            "topLip.left.y": from.topLip.left.y,
            "topLip.center.x": from.topLip.center.x,
            "topLip.center.y": from.topLip.center.y,
            "topLip.right.x": from.topLip.right.x,
            "topLip.right.y": from.topLip.right.y,
            "bottomLip.left.x": from.bottomLip.left.x,
            "bottomLip.left.y": from.bottomLip.left.y,
            "bottomLip.center.x": from.bottomLip.center.x,
            "bottomLip.center.y": from.bottomLip.center.y,
            "bottomLip.right.x": from.bottomLip.right.x,
            "bottomLip.right.y": from.bottomLip.right.y,
        }
        
        this.animation = gsap.to(gsapFrom
            , {
                "topLip.left.x": to.topLip.left.x,
                "topLip.left.y": to.topLip.left.y,
                "topLip.center.x": to.topLip.center.x,
                "topLip.center.y": to.topLip.center.y,
                "topLip.right.x": to.topLip.right.x,
                "topLip.right.y": to.topLip.right.y,
                "bottomLip.left.x": to.bottomLip.left.x,
                "bottomLip.left.y": to.bottomLip.left.y,
                "bottomLip.center.x": to.bottomLip.center.x,
                "bottomLip.center.y": to.bottomLip.center.y,
                "bottomLip.right.x": to.bottomLip.right.x,
                "bottomLip.right.y": to.bottomLip.right.y,
                duration,
                ease,
                onUpdate: () => { 
                    if (!this.animation) {
                        return
                    }
                    this.updateState({
                        topLip: {
                            left: {
                                x: gsapFrom["topLip.left.x"],
                                y: gsapFrom["topLip.left.y"],
                            },
                            center: {
                                x: gsapFrom["topLip.center.x"],
                                y: gsapFrom["topLip.center.y"],
                            },
                            right: {
                                x: gsapFrom["topLip.right.x"],
                                y: gsapFrom["topLip.right.y"],
                            }
                        },
                        bottomLip: {
                            left: {
                                x: gsapFrom["bottomLip.left.x"],
                                y: gsapFrom["bottomLip.left.y"],
                            },
                            center: {
                                x: gsapFrom["bottomLip.center.x"],
                                y: gsapFrom["bottomLip.center.y"],
                            },
                            right: {
                                x: gsapFrom["bottomLip.right.x"],
                                y: gsapFrom["bottomLip.right.y"],
                            }
                        }
                    })
                    this.paper.smooth({ type: "continuous"})
                },
                onComplete: () => {
                    if (typeof state === "string") {
                        this.state = state
                        if (state === "😚" || state === "😙" || state === "😗")  {
                            this.switchState("🙂", .4)
                        }
                    }
                    this.inTransition = false
                }
            })
    }

    animateState(
        finalState: MouthPoints, 
        perc: number
    ) {
        if (!this.inTransition) {
            return
        }

        // Top lip
        this.topLip.left.x = this.x + (finalState.topLip.left.x * perc)
        this.topLip.left.y = this.y + (finalState.topLip.left.y * perc)
        
        this.topLip.center.x = this.x + (finalState.topLip.center.x * perc)
        this.topLip.center.y = this.y + (finalState.topLip.center.y * perc)

        this.topLip.right.x = this.x + (finalState.topLip.right.x * perc)
        this.topLip.right.y = this.y + (finalState.topLip.right.y * perc)

        // Bottom lip
        this.bottomLip.left.x = this.x + (finalState.bottomLip.left.x * perc)
        this.bottomLip.left.y = this.y + (finalState.bottomLip.left.y * perc)
        
        this.bottomLip.center.x = this.x + (finalState.bottomLip.center.x * perc)
        this.bottomLip.center.y = this.y + (finalState.bottomLip.center.y * perc)

        this.bottomLip.right.x = this.x + (finalState.bottomLip.right.x * perc)
        this.bottomLip.right.y = this.y + (finalState.bottomLip.right.y * perc)
                
        this.paper.smooth({ type: "continuous"})
    }

    remove() {
        this.paper.remove()
    }
    
    getPosition(state?: MouthState) : MouthPoints{
        if (!state) {
            state = this.state
        }
        if (state === "😮") {
            return this.getOpenPosition()
        } else if (state === "😐") {
            return this.getShockedPosition()
        } else if (state === "🙂") {
            return this.getSmilePosition()
        } else if (state === "🙁") {
            return this.getSadPosition()
        } else if (state === "😚") {
            return this.getKissPosition()
        } else if (state === "😙") {
            return this.getKissPosition()
        } else if (state === "😗") {
            return this.getKissPosition()
        }  else {
            throw new Error("Invalid state input")
        }
    }

    getOpenPosition() {
        return {
            topLip: {
                left: {
                    x: - 4,
                    y: - 0.5
                },
                center: {
                    x: 0,
                    y: - 2
                },
                right: {
                    x: 4,
                    y: - 0.5
                }
            },
            bottomLip: {
                left: {
                    x: -4,
                    y: 5
                },
                center: {
                    x: 0,
                    y: 6
                },
                right: {
                    x: 4, 
                    y: 5
                }
            }
        }
    }

    getSmilePosition() {
        return {
            topLip: {
                left: {
                    x: -4.5,
                    y: -.25
                },
                center: {
                    x: 0,
                    y: 1
                },
                right: {
                    x: 4.5,
                    y: -0.25
                }
            },
            bottomLip: {
                left: {
                    x: -6,
                    y: 0
                },
                center: {
                    x: 0, 
                    y: 2.5
                },
                right: {
                    x: 6,
                    y: 0
                }
            }
        }
    }
    
    getSadPosition() {
        return {
            topLip: {
                left: {
                    x: -5,
                    y: 1.5
                },
                center: {
                    x: 0,
                    y: -0.5
                },
                right: {
                    x: 5,
                    y: 1.5
                }
            },
            bottomLip: {
                left: {
                    x: -5,
                    y: 2.5
                },
                center: {
                    x: 0,
                    y: 1
                },
                right: {
                    x: 5,
                    y: 2.5
                }
            },
        }
    }
    getExtremeSadPosition() {
        return {
            topLip: {
                left: {
                    x: -5,
                    y: 2
                },
                center: {
                    x: 0,
                    y: -1
                },
                right: {
                    x: 5,
                    y: 2
                }
            },
            bottomLip: {
                left: {
                    x: - 4,
                    y: 2.5
                },
                center: {
                    x: 0, 
                    y: 1
                },
                right: {
                    x: 4,
                    y: 2.5
                }
            }
        }
    }

    getShockedPosition() {
        return {
            topLip: {
                left: {
                    x: -5,
                    y: 1.5
                },
                center: {
                    x: 0,
                    y: 1
                },
                right: {
                    x: 5,
                    y: 1.5
                }
            },
            bottomLip: {
                left: {
                    x: -5,
                    y: 2.75
                },
                center: {
                    x: 0,
                    y: 3
                },
                right: {
                    x: 5,
                    y: 2.75
                }
            },
        }
    }

    getKissPosition() {
        return {
            topLip: {
                left: {
                    x: -3,
                    y: -0.5
                },
                center: {
                    x: 0,
                    y: -3
                },
                right: {
                    x: 3,
                    y: -0.5
                }
            },
            bottomLip: {
                left: {
                    x: -3,
                    y: 1
                },
                center: {
                    x: 0,
                    y: 3
                },
                right: {
                    x: 3,
                    y: 1
                }
            },
        }
    }
}

export default Mouth