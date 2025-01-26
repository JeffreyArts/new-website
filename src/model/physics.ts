import Matter from "matter-js"
import { BlockType } from "./../components/layout/layout-types"

type PhysicsBlock = {
    x: number,
    y: number,
    width: number,
    height: number,
    id: string,
    domEl?: HTMLElement,
    composite?: Matter.Composite
}

export default class Physics {
    private anchorOffset = 8
    private layoutWidth: number
    private layoutHeight: number
    public blocks: Array<PhysicsBlock>
    private floor: Matter.Body
    private catterpillars: Array<Matter.Composite>
    private engine: Matter.Engine
    private render: Matter.Render
    private runner: Matter.Runner
    private resizeTimeout: NodeJS.Timeout | null = null
    
    constructor(options?: { 
        
    }) {
        this.layoutWidth = window.innerWidth
        this.layoutHeight = window.innerHeight
        this.blocks = []
        this.catterpillars = []

        const domEl = document.createElement("canvas")
        domEl.id = "physics"
        
        // Parse the query string
        const urlParams = new URLSearchParams(window.location.search);
        if (!urlParams.has("dev")) {
            domEl.style.display = "none"
        }

        document.body.appendChild(domEl)
        // Set-up the physics enginge
        this.engine = Matter.Engine.create(),
        this.render = Matter.Render.create({
            canvas: domEl,
            engine: this.engine,
            options: {
                width: this.layoutWidth,
                height: this.layoutHeight,
                wireframes: false,
                showCollisions: true
            }
        })

        Matter.Render.run(this.render);

        // create runner
        this.runner = Matter.Runner.create();

        // run the engine
        Matter.Runner.run(this.runner, this.engine);
     
        // Add floor for test
        this.floor = Matter.Bodies.rectangle(this.layoutWidth/2, this.layoutHeight - 20, this.layoutWidth, 40, {isStatic: true})
        window.addEventListener("resize", this.onResize.bind(this))
    }

    onResize() {
        if (!this.render) {
            return
        }
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout)
        }
        
        this.resizeTimeout = setTimeout(() => {
            this.resizeTimeout = null

            this.layoutWidth = window.innerWidth
            this.layoutHeight = window.innerHeight

            this.blocks.forEach(block => {
                if (!block.composite || !block.domEl) {
                    return
                }
                
                const dimensions = this.extractDimensionsFromElement(block.domEl)

                if (dimensions)  {
                    this.updateBlock(block.id, {...dimensions})
                }
            })

            // @ts-ignore
            Matter.Render.setSize(this.render, this.layoutWidth, this.layoutHeight)
        },50)
    }

    extractDimensionsFromElement(el: HTMLElement) {
        const dimension = el.getBoundingClientRect();
        const style = window.getComputedStyle(el)

        if (el.parentElement) {
            const offsetY = el.parentElement.offsetTop + el.offsetTop
            const y = offsetY + parseInt(style.paddingTop)

            const x = (dimension.x + window.scrollX) + parseInt(style.paddingLeft)
            const width = dimension.width - parseInt(style.paddingLeft) - parseInt(style.paddingRight)
            const height = dimension.height - parseInt(style.paddingTop) - parseInt(style.paddingBottom)
            return { x, y, width, height }
        }
            
        return undefined
    }

    updateBlock(id: string, options: {x?: number, y?: number, width?: number, height?: number}) {
        const block = this.blocks.find(b => b.id === id)
        if (!block) {
            return
        }

        if (options.x) {
            block.x = options.x
        }
        if (options.y) {
            block.y = options.y
        }
        if (options.width) {
            block.width = options.width
        }
        if (options.height) {
            block.height = options.height
        }

        if (block.composite) {
            const oldBody = block.composite.bodies.find(body => body.label === "body") as Matter.Body
            const newBody = Matter.Bodies.rectangle(block.x + block.width/2, block.y + block.height/2 - window.scrollY, block.width, block.height, {
                label: "body",
                mass: block.width * block.height / 1000,
                collisionFilter: {
                    group: 1,
                    category: 1
                }
            })

            Matter.Composite.remove(block.composite, oldBody);
            Matter.Composite.add(block.composite, newBody);
            // Update anchor points
            block.composite.bodies.forEach(body => {
                switch (body.label) {
                    case "pointTopLeft":
                        Matter.Body.setPosition(body, { x: block.x - this.anchorOffset, y: block.y - window.scrollY - this.anchorOffset })
                        break
                    case "pointTopRight":
                        Matter.Body.setPosition(body, { x: block.x + block.width + this.anchorOffset, y: block.y - window.scrollY - this.anchorOffset})
                        break
                    case "pointBottomLeft":
                        Matter.Body.setPosition(body, { x: block.x, y: block.y - window.scrollY + block.height })
                        break
                    case "pointBottomRight":
                        Matter.Body.setPosition(body, { x: block.x + block.width, y: block.y - window.scrollY + block.height })
                        break
                }
            })
            
            // Update constraints
            block.composite.constraints.forEach(constraint => { 
                constraint.bodyA = newBody
                switch (constraint.label) {
                    case "constraintTopLeft":
                        constraint.pointA = { x: -block.width/2, y: -block.height/2 }
                        break
                    case "constraintTopRight":
                        constraint.pointA = { x: block.width/2, y: -block.height/2 }
                        break
                    case "constraintBottomLeft":
                        constraint.pointA = { x: -block.width/2, y: block.height/2 }
                        break
                    case "constraintBottomRight":
                        constraint.pointA = { x: block.width/2, y: block.height/2 }
                        break
                }
            })

        }
    }

    addBlock(el: HTMLElement) {
        const id = el.id.toString()
        
        if (this.blocks.find(b => b.id.toString() === id)) {
            const newDimensions = this.extractDimensionsFromElement(el)
            if (newDimensions) {
                this.updateBlock(id, newDimensions)
            }
            return
        }

        // Get the dimensions 
        const newDimensions = this.extractDimensionsFromElement(el)
        if (!newDimensions) {
            return
        }
        const {x,y,width,height} = newDimensions

        // Create body block
        const body = Matter.Bodies.rectangle(x + width/2, y+height/2 - window.scrollY, width, height,{
            label: "body",
            mass: width * height / 1000,
            collisionFilter: {
                group: 0,
                category: 0
            }
        })

        // Create anchor points
        const pointTopLeft = Matter.Bodies.circle(x - this.anchorOffset, y - window.scrollY - this.anchorOffset, this.anchorOffset, { 
            isStatic: true,
            label: "pointTopLeft",
            collisionFilter: {
                group: 0,
                category: 0
            }
        })
        const pointBottomLeft = Matter.Bodies.circle(x - this.anchorOffset , y + height - window.scrollY + this.anchorOffset, this.anchorOffset, { 
            isStatic: true,
            label: "pointBottomLeft",
            collisionFilter: {
                group: 0,
                category: 0
            }
        })
        const pointTopRight = Matter.Bodies.circle(x + width + this.anchorOffset, y - window.scrollY - this.anchorOffset, this.anchorOffset, {
            isStatic: true,
            label: "pointTopRight",
            collisionFilter: {
                group: 0,
                category: 0
            }
        })
        const pointBottomRight = Matter.Bodies.circle(x + width + this.anchorOffset, y + height - window.scrollY + this.anchorOffset, this.anchorOffset, {
            isStatic: true,
            label: "pointBottomRight",
            collisionFilter: {
                group: 0,
                category: 0
            }
        })

        const constraintLength = Math.sqrt( Math.pow(this.anchorOffset, 2) + Math.pow(this.anchorOffset, 2));

        // Create contstaints between body and anchor points
        const constraintTopLeft = Matter.Constraint.create({
            bodyA: body,
            bodyB: pointTopLeft,
            pointA: { x: -width/2, y: -height/2 },
            length: constraintLength,
            stiffness: .024,
            damping: 0.01,
            label: "constraintTopLeft"
        })
        const constraintBottomLeft = Matter.Constraint.create({
            bodyA: body,
            bodyB: pointBottomLeft,
            pointA: { x: -width/2, y: +height/2 },
            length: constraintLength,
            stiffness: .024 + Math.random() * .01,
            damping: 0.01,
            label: "constraintBottomLeft"
        })
        
        const constraintTopRight = Matter.Constraint.create({
            bodyA: body,
            bodyB: pointTopRight,
            pointA: { x: +width/2, y: -height/2 },
            length: constraintLength,
            stiffness: .024,
            damping: 0.01,
            label: "constraintTopRight"
        })
        const constraintBottomRight = Matter.Constraint.create({
            bodyA: body,
            bodyB: pointBottomRight,
            pointA: { x: +width/2, y: +height/2 },
            length: constraintLength,
            stiffness: .024 + Math.random() * .01,
            damping: 0.01,
            label: "constraintBottomRight"
        })

        
        // Compose the composite
        const blockComposite = Matter.Composite.create()
        // Matter.Composite.add(blockComposite, [body, pointTopLeft, pointTopRight, constraintTopLeft, constraintTopRight, pointBottomLeft, pointBottomRight])
        Matter.Composite.add(blockComposite, [body, pointTopLeft, pointTopRight, constraintTopLeft, constraintTopRight, pointBottomLeft, pointBottomRight, constraintBottomLeft, constraintBottomRight])

        // Add the composite to the world
        Matter.World.add(this.engine.world, blockComposite)

        // Add block to the list
        this.blocks.push({
            x,
            y,
            width,
            height,
            id,
            domEl: el,
            composite: blockComposite
        })
    }
    clearBlocks() {
        this.blocks.forEach(block => {
            if (block.composite) {
                const bodies = block.composite.bodies

                bodies.forEach(body => {
                    if (!block.composite) {
                        return
                    }

                    Matter.Composite.remove(block.composite, body)
                })

                const constraints = block.composite.constraints
                constraints.forEach(constraint => {
                    if (!block.composite) {
                        return
                    }

                    Matter.Composite.remove(block.composite, constraint)
                })
                Matter.World.remove(this.engine.world,block.composite)
                Matter.Composite.clear(block.composite, true)
            }
        })
        this.blocks = []
    }

}

