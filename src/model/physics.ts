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
    
    constructor(options?: { 
        
    }) {
        this.layoutWidth = window.innerWidth
        this.layoutHeight = window.innerHeight
        this.blocks = []
        this.catterpillars = []

        const domEl = document.createElement("canvas")
        domEl.id = "physics"
        
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

        this.layoutWidth = window.innerWidth
        this.layoutHeight = window.innerHeight
        Matter.Render.setSize(this.render, this.layoutWidth, this.layoutHeight)
    }

    addBlock(block: PhysicsBlock) {
        
        // console.log("Add block:",block)
        if (this.blocks.find(b => b.id.toString() === block.id)) {
            return
        }
        
        if (!block.width || !block.height) {
            return
        }
        
        const blockComposite = Matter.Composite.create()

        const x = block.x 
        const y = block.y 
        const width = block.width
        const height = block.height

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
            stiffness: 0.032
        })

        const constraintRight = Matter.Constraint.create({
            bodyA: body,
            bodyB: pointRight,
            pointA: { x: +width/2, y: -height/2 },
            length: 1,
            stiffness: 0.032
        })
            
        Matter.Composite.add(blockComposite, [body, pointLeft, pointRight, constraintLeft, constraintRight])

        this.blocks.push({
            ...block,
            composite: blockComposite
        })
        Matter.World.add(this.engine.world, blockComposite)
    }

}

