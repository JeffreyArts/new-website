import Matter from "matter-js"
import Paper from "paper"

export type PhysicsBlock = {
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
    private ceiling: Matter.Body
    private ground: Matter.Body
    private catterpillars: Array<Matter.Composite>
    public engine: Matter.Engine
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

        const paperEl = document.createElement("canvas")
        paperEl.id = "paper"
        paperEl.width = window.innerWidth
        paperEl.height = window.innerHeight

        // Paper.view.viewSize.width = width
        Paper.setup(paperEl)

        // Parse the query string
        const urlParams = new URLSearchParams(window.location.search);

        if (!urlParams.has("dev")) {
            domEl.style.display = "none"
        }

        document.body.appendChild(domEl)
        document.body.appendChild(paperEl)
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
     
        // Add ground
        this.ground = Matter.Bodies.rectangle(this.layoutWidth/2, this.layoutHeight + 192, this.layoutWidth, 400, {
            isStatic: true,
            label: "ground",
            collisionFilter: {
                category: 0x0003,
                mask: 0x0002
            }
        })
        // Add ceiling
        this.ceiling = Matter.Bodies.rectangle(this.layoutWidth/2, -600, this.layoutWidth, 400, {
            isStatic: true,
            label: "ceilng",
            collisionFilter: {
                category: 0x0003,
                mask: 0x0002
            }
        })
        Matter.World.add(this.engine.world, [this.ground, this.ceiling])
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

            Paper.view.viewSize.width = window.innerWidth
            Paper.view.viewSize.height = window.innerHeight
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
            const oldBody = block.composite.bodies.find(body => body.label === "block") as Matter.Body
            const newBody = Matter.Bodies.rectangle(block.x + block.width/2, block.y + block.height/2 - window.scrollY, block.width, block.height, {
                label: "block",
                isStatic: true,
                mass: block.width * block.height / 1000,
                collisionFilter: {
                    category: 0x0001,
                    mask: 0x0001
                }
            })

            Matter.Composite.remove(block.composite, oldBody);
            Matter.Composite.add(block.composite, newBody);
            // Update anchor points
            block.composite.bodies.forEach(bodyBlock => {
                switch (bodyBlock.label) {
                    case "pointTopLeft":
                        Matter.Body.setPosition(bodyBlock, { x: block.x - this.anchorOffset, y: block.y - window.scrollY - this.anchorOffset })
                        break
                    case "pointTopRight":
                        Matter.Body.setPosition(bodyBlock, { x: block.x + block.width + this.anchorOffset, y: block.y - window.scrollY - this.anchorOffset})
                        break
                    case "pointBottomLeft":
                        Matter.Body.setPosition(bodyBlock, { x: block.x, y: block.y - window.scrollY + block.height })
                        break
                    case "pointBottomRight":
                        Matter.Body.setPosition(bodyBlock, { x: block.x + block.width, y: block.y - window.scrollY + block.height })
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

        // Create block
        const block = Matter.Bodies.rectangle(x + width/2, y+height/2 - window.scrollY, width, height,{
            label: "block",
            mass: width * height / 1000,
            isStatic: true,
            collisionFilter: {
                category: 0x0001,
                mask: 0x0001 | 0x0002
            }
        })

        // // Create anchor points
        // const pointTopLeft = Matter.Bodies.circle(x - this.anchorOffset, y - window.scrollY - this.anchorOffset, this.anchorOffset, { 
        //     isStatic: true,
        //     label: "pointTopLeft",
        //     collisionFilter: {
        //         category: 0x0010,
        //         mask: 0x0010
        //     }
        // })
        // const pointBottomLeft = Matter.Bodies.circle(x - this.anchorOffset , y + height - window.scrollY + this.anchorOffset, this.anchorOffset, { 
        //     isStatic: true,
        //     label: "pointBottomLeft",
        //     collisionFilter: {
        //         category: 0x0010,
        //         mask: 0x0010
        //     }
        // })
        // const pointTopRight = Matter.Bodies.circle(x + width + this.anchorOffset, y - window.scrollY - this.anchorOffset, this.anchorOffset, {
        //     isStatic: true,
        //     label: "pointTopRight",
        //     collisionFilter: {
        //         category: 0x0010,
        //         mask: 0x0010
        //     }
        // })
        // const pointBottomRight = Matter.Bodies.circle(x + width + this.anchorOffset, y + height - window.scrollY + this.anchorOffset, this.anchorOffset, {
        //     isStatic: true,
        //     label: "pointBottomRight",
        //     collisionFilter: {
        //         category: 0x0010,
        //         mask: 0x0010
        //     }
        // })

        // const constraintLength = Math.sqrt( Math.pow(this.anchorOffset, 2) + Math.pow(this.anchorOffset, 2));

        // // Create contstaints between block and anchor points
        // const constraintTopLeft = Matter.Constraint.create({
        //     bodyA: block,
        //     bodyB: pointTopLeft,
        //     pointA: { x: -width/2, y: -height/2 },
        //     length: constraintLength,
        //     stiffness: 1,
        //     damping: 0.01,
        //     label: "constraintTopLeft"
        // })
        // const constraintBottomLeft = Matter.Constraint.create({
        //     bodyA: block,
        //     bodyB: pointBottomLeft,
        //     pointA: { x: -width/2, y: +height/2 },
        //     length: constraintLength,
        //     stiffness: 1, //+ Math.random() * .01,
        //     damping: 1,
        //     label: "constraintBottomLeft"
        // })
        
        // const constraintTopRight = Matter.Constraint.create({
        //     bodyA: block,
        //     bodyB: pointTopRight,
        //     pointA: { x: +width/2, y: -height/2 },
        //     length: constraintLength,
        //     stiffness: 1,
        //     damping: 0.01,
        //     label: "constraintTopRight"
        // })
        // const constraintBottomRight = Matter.Constraint.create({
        //     bodyA: block,
        //     bodyB: pointBottomRight,
        //     pointA: { x: +width/2, y: +height/2 },
        //     length: constraintLength,
        //     stiffness: 1, //+ Math.random() * .01,
        //     damping: 1,
        //     label: "constraintBottomRight"
        // })

        
        // Compose the composite
        const blockComposite = Matter.Composite.create({label: "block"})
        Matter.Composite.add(blockComposite, [block])
        // Matter.Composite.add(blockComposite, [block, pointTopLeft, pointTopRight, constraintTopLeft, constraintTopRight, pointBottomLeft, pointBottomRight])
        // Matter.Composite.add(blockComposite, [block, pointTopLeft, pointTopRight, constraintTopLeft, constraintTopRight, pointBottomLeft, pointBottomRight, constraintBottomLeft, constraintBottomRight])

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

                bodies.forEach(bodyBlock => {
                    if (!block.composite) {
                        return
                    }

                    Matter.Composite.remove(block.composite, bodyBlock)
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

