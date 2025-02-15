import Physics from "@/model/physics"
import Matter from "matter-js"
import { Router } from 'vue-router';
import Catterpillar, { CatterpillarOptions } from "@/model/catterpillar"

type CatterpillarWithId = Catterpillar & { id: string }
type CatterpillarOptionsWithId = CatterpillarOptions & { id: string }


const PhysicsService = {
    physics: undefined as undefined | Physics,
    timeout: undefined as NodeJS.Timeout | undefined,
    observer: undefined as MutationObserver | undefined,
    cache: [] as CatterpillarOptionsWithId[],
    catterpillars: [] as CatterpillarWithId[],
    prevScrollY: 0,
    start: (router: Router) => {
        // Fix for multiple appenditions of the canvas cause of Vite hot reload
        document.getElementById("physics")?.remove()

        
        if (PhysicsService.physics) {
            return 
        }
        
        // Listen to router events
        router.beforeEach((to, from, next) => {
            // Clean up blocks before navigating
            PhysicsService.physics?.clearBlocks()
            
            next();
        });        
        
        PhysicsService.physics = new Physics()
        PhysicsService.animationFrame()        
    
        window.addEventListener("addCatterpillar", PhysicsService.addCatterpillarEvent)
        window.addEventListener("layoutHasChanged", PhysicsService.layoutHasChangedEvent)
        window.addEventListener("scroll", PhysicsService.onScroll)
    },
    addCatterpillarEvent: (event: CustomEvent) => {
        if (event.detail) {
            const id = event.detail.id
            if (!id) {
                throw new Error("Catterpillar is missing `id`")
            }

            
            if (!PhysicsService.cache.find(catterpillar => catterpillar.id === id)) {
                PhysicsService.cache.push(event.detail)
            }
        }
    },
    layoutHasChangedEvent: () => {

        if (PhysicsService.cache.length > 0) {
            PhysicsService.cache.forEach(catterpillarOptions => {
                if (PhysicsService.physics) {
                    // Add catterpillar to the world    
                    const catterpillar = new Catterpillar(PhysicsService.physics.engine.world, catterpillarOptions) as CatterpillarWithId
                    Matter.Composite.add(PhysicsService.physics.engine.world, [catterpillar.composite])
                    // Remove catterpillar from cache
                    PhysicsService.cache = PhysicsService.cache.filter(c => c.id !== catterpillarOptions.id)
                    // Add catterpillar to the list
                    catterpillar.id = catterpillarOptions.id
                    PhysicsService.catterpillars.push(catterpillar)
                }
            })
        }

        PhysicsService.updateBlocks()
    },
    updateBlocks: () => {
        clearTimeout(PhysicsService.timeout)
        PhysicsService.timeout = setTimeout(() => {
            document.body.querySelectorAll(".block:not(.hasMatter)").forEach((element: Element) => {
                const el = element as HTMLElement
                const blockType = element.querySelector("[data-blocktype]")?.getAttribute("data-blocktype")
                el.classList.add("hasMatter")

                const blockTypeList = [
                    "projectArticle",
                    "image",
                    "code",
                    "title",
                    "iframe",
                    "pieceThumbnail",
                    "projectThumbnail",
                ]

                if (!blockType) {
                    return
                }

                // Do not add blocks that are not in the list
                if (!blockTypeList.includes(blockType)) {
                    return
                }

                PhysicsService.physics?.addBlock(el)
            })
        }, 500)
    },
    onScroll: () => {
        if (PhysicsService.physics?.blocks.length === 0) {
            return
        }
        let scrollOffset = 0

        if (PhysicsService.prevScrollY !== 0) {
            scrollOffset = PhysicsService.prevScrollY - window.scrollY
        }
        
        const anchorOffset = 8

        PhysicsService.physics?.blocks.forEach(block => {
            if (block.composite) {
                const bodyBlock = block.composite.bodies.find(bodyBlock => bodyBlock.label === "block") as Matter.Body
                const pointTopLeft = block.composite.bodies.find(bodyBlock => bodyBlock.label === "pointTopLeft") as Matter.Body
                const pointTopRight = block.composite.bodies.find(bodyBlock => bodyBlock.label === "pointTopRight") as Matter.Body
                const pointBottomLeft = block.composite.bodies.find(bodyBlock => bodyBlock.label === "pointBottomLeft") as Matter.Body
                const pointBottomRight = block.composite.bodies.find(bodyBlock => bodyBlock.label === "pointBottomRight") as Matter.Body
                
                if (scrollOffset > 128) {
                    Matter.Body.setPosition(bodyBlock, { x: bodyBlock.position.x, y: block.y - window.scrollY + block.height/2 + 128 });
                } else if (scrollOffset < -128) {
                    Matter.Body.setPosition(bodyBlock, { x: bodyBlock.position.x, y: block.y - window.scrollY + block.height/2 - 128 });
                }
                
                // Update points
                Matter.Body.setPosition(pointTopLeft, { x: block.x - anchorOffset, y: block.y - window.scrollY - anchorOffset});
                Matter.Body.setPosition(pointTopRight, { x: block.x + block.width + anchorOffset, y: block.y - window.scrollY - anchorOffset});
                Matter.Body.setPosition(pointBottomLeft, { x: block.x - anchorOffset, y: block.y - window.scrollY + block.height + anchorOffset });
                Matter.Body.setPosition(pointBottomRight, { x: block.x + block.width + anchorOffset, y: block.y - window.scrollY + block.height + anchorOffset});

            }
        })

        PhysicsService.prevScrollY = window.scrollY
    },
    animationFrame: () => {
        if (PhysicsService.physics) {
            PhysicsService.physics.blocks.forEach(block => {

                if (!block.composite || !block.domEl) {
                    return
                } 
                
                
                const bodyBlock = block.composite.bodies.find(bodyBlock => bodyBlock.label === "block") as Matter.Body
                if (bodyBlock) {
                    // Decrease decimals for improved performance (in Firefox)
                    const x = Math.round((bodyBlock.position.x -  (block.x - window.scrollX) - block.width/2) * 1000) / 1000
                    const y = Math.round((bodyBlock.position.y - (block.y - window.scrollY) - block.height/2) * 1000) / 1000
                    const angle = Math.round((bodyBlock.angle) * 1000) / 1000
                    block.domEl.style.transform = `translate(${x}px, ${y}px) rotate(${angle}rad)`   
                }
            })
        }
        window.requestAnimationFrame(PhysicsService.animationFrame)
    }
}
export { PhysicsService }
export default PhysicsService