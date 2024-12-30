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
                
                const body = block.composite.bodies.find(body => body.label === "body") as Matter.Body
                const pointLeft = block.composite.bodies.find(body => body.label === "pointLeft") as Matter.Body
                const pointRight = block.composite.bodies.find(body => body.label === "pointRight") as Matter.Body
                if (block.id == "block-66d0c8016c0f5e30f361dda2") {
                    console.log("Resize", block.x, block.domEl.getBoundingClientRect().x, block.id)
                }
                const dimensions = this.extractDimensionsFromElement(block.domEl)

                this.updateBlock(block.id, {...dimensions})
                // Matter.Body.setPosition(body, )
            })


            Matter.Render.setSize(this.render, this.layoutWidth, this.layoutHeight)
        }, 1000)
    }

    extractDimensionsFromElement(el: HTMLElement) {
        const dimension = el.getBoundingClientRect();
        const style = window.getComputedStyle(el)

            if (el.parentElement) {
                const parentOffsetY = el.parentElement.offsetTop
                const offsetTop = el.offsetTop
                const offsetY = parentOffsetY + offsetTop //+ window.scrollY
                console.log(el.id, )
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
            const pointLeft = block.composite.bodies.find(body => body.label === "pointLeft") as Matter.Body
            const pointRight = block.composite.bodies.find(body => body.label === "pointRight") as Matter.Body

            // Replace old body with new body
            const constraintLeft = block.composite.constraints.find(constraint => constraint.label === "constraintLeft") as Matter.Constraint
            const constraintRight = block.composite.constraints.find(constraint => constraint.label === "constraintRight") as Matter.Constraint
            
            const oldBody = block.composite.bodies.find(body => body.label === "body") as Matter.Body
            const newBody = Matter.Bodies.rectangle(block.x + block.width/2, block.y + block.height/2, block.width, block.height, {
                label: "body",
                mass: block.width * block.height / 10000,
                collisionFilter: {
                    group: 1,
                    category: 1
                }
            })

            Matter.Composite.remove(block.composite, oldBody);
            Matter.Composite.add(block.composite, newBody);

            constraintLeft.bodyA = newBody
            constraintRight.bodyA = newBody
            constraintLeft.pointA =  { x: -block.width/2, y: -block.height/2 }
            constraintRight.pointA = { x: block.width/2, y: -block.height/2 },
            

            Matter.Body.setPosition(pointLeft, { x: block.x, y: block.y })
            Matter.Body.setPosition(pointRight, { x: block.x + block.width, y: block.y })
        }
    }

    addBlock(el: HTMLElement) {
        
        const id = el.id.toString()
        // console.log("Add block:",block)
        if (this.blocks.find(b => b.id.toString() === id)) {
            const newDimensions = this.extractDimensionsFromElement(el)
            if (newDimensions) {
                this.updateBlock(id, newDimensions)
            }
            return
        }

        const newDimensions = this.extractDimensionsFromElement(el)
        if (!newDimensions) {
            return
        }
        
        const {x,y,width,height} = newDimensions
        
        const blockComposite = Matter.Composite.create()

        const body = Matter.Bodies.rectangle(x + width/2, y+height/2, width, height,{
            label: "body",
            mass: width * height / 1000,
            collisionFilter: {
                group: 1,
                category: 1
            }
        })

        const pointLeft = Matter.Bodies.circle(x , y, 4, { 
            isStatic: true,
            label: "pointLeft",
            collisionFilter: {
                group: 0,
                category: 0
            }
        })
        const pointRight = Matter.Bodies.circle(x + width, y, 4, {
            isStatic: true,
            label: "pointRight",
            collisionFilter: {
                group: 0,
                category: 0
            }
        })

        
        const constraintLeft = Matter.Constraint.create({
            bodyA: body,
            bodyB: pointLeft,
            pointA: { x: -width/2, y: -height/2 },
            length: 1,
            // stiffness: 0.032,
            stiffness: .2,
            label: "constraintLeft"
        })
        
        const constraintRight = Matter.Constraint.create({
            bodyA: body,
            bodyB: pointRight,
            pointA: { x: +width/2, y: -height/2 },
            length: 1,
            // stiffness: 0.032,
            stiffness: 0.2,
            label: "constraintRight"
        })
            
        Matter.Composite.add(blockComposite, [body, pointLeft, pointRight, constraintLeft, constraintRight])

        this.blocks.push({
            x,
            y,
            width,
            height,
            id,
            domEl: el,
            composite: blockComposite
        })
        Matter.World.add(this.engine.world, blockComposite)
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

