import Physics, {PhysicsBlock} from "@/model/physics"
import Matter from "matter-js"
import { Router } from 'vue-router';
import Catterpillar, { CatterpillarOptions } from "@/model/catterpillar"
import mousePosition from "@/services/mouse-position"

type CatterpillarOptionsWithId = CatterpillarOptions & { id: string }


const PhysicsService = {
    mouseDown: false,
    mousePos: { x: 0, y: 0},
    mouseTarget: undefined as Matter.Body | undefined,
    activeCatterpillar: undefined as Catterpillar | undefined,
    physics: undefined as undefined | Physics,
    timeout: undefined as NodeJS.Timeout | undefined,
    observer: undefined as MutationObserver | undefined,
    cache: [] as CatterpillarOptionsWithId[],
    catterpillars: [] as Catterpillar[],
    removedBlocks: new Set(),
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
    
        window.addEventListener("addCatterpillar", PhysicsService.addCatterpillarEvent as EventListener)
        window.addEventListener("layoutHasChanged", PhysicsService.layoutHasChangedEvent)
        // window.addEventListener("scroll", PhysicsService.onScroll, { passive: true })
        window.addEventListener("mouseup", PhysicsService.cancelMouseDown)
        document.body.addEventListener("mousedown", PhysicsService.mouseDownEvent);
        document.body.addEventListener("touchstart", PhysicsService.mouseDownEvent);
        document.body.addEventListener("touchend", PhysicsService.touchEndEvent);
        // document.body.addEventListener("click", PhysicsService.mouseClickEvent);
        document.body.addEventListener("mousemove", PhysicsService.mouseMoveEvent);
        document.body.addEventListener("touchmove", PhysicsService.mouseMoveEvent, { passive: false });        
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
                    if (!PhysicsService.catterpillars.find(catterpillar => catterpillar.id === catterpillarOptions.id)) {
                        // Add catterpillar if it is not already there
                        const catterpillar = PhysicsService.addCatterpillar(catterpillarOptions)   
                        PhysicsService.catterpillars.push(catterpillar)
                    }
                }
            })
            // Empty catterpillars from cache
            PhysicsService.cache = []
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
                    // "projectArticle",
                    "image",
                    "code",
                    "iframe",
                    "favorite",
                    "banner",
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
    // Throttle Scroll Event using requestAnimationFrame

    // onScroll: () => {
    //     if (PhysicsService.physics?.blocks.length === 0) {
    //         return
    //     }

    //     PhysicsService.physics?.blocks.forEach(block => {
          
    //     })
    // },
    addCatterpillar: (catterpillarOptions: CatterpillarOptions) => {
        if (!PhysicsService.physics)  {
            throw new Error("Missing physics")
        }

        const catterpillar = new Catterpillar(PhysicsService.physics.engine.world, catterpillarOptions)
        Matter.Composite.add(PhysicsService.physics.engine.world, [catterpillar.composite])
        return catterpillar
    },
    resetCatterpillar(catterpillar: Catterpillar) {
        if (!PhysicsService.physics) {
            return
        }
        const world = PhysicsService.physics.engine.world

        // Reset position existing catterpillar
        if (catterpillar) {
            catterpillar.composite.bodies.forEach(body => {
                Matter.Body.setPosition(body, { x: window.innerWidth/2, y: 8})
                // Change velocity direction
                Matter.Body.setVelocity(body, { x: 0, y: 0})
            })
        } else {
            console.error("No catterpillar set to be removed")
            return
        }
    },
    mouseDownEvent(e:MouseEvent | TouchEvent) {
        e.stopPropagation() 
        if (!PhysicsService.physics) {
            return
        }

        PhysicsService.catterpillars.forEach(catterpillar => {
            let range = catterpillar.bodyPart.size

            if (!range) {
                console.error("Missing bodypart.size")
                return
            }
            
            PhysicsService.mouseDown = true
            PhysicsService.mousePos = mousePosition.xy(e)
            catterpillar.composite.bodies.forEach(body => {
                if (!range) {
                    return
                }
                if ((PhysicsService.mousePos.x > (body.position.x - range) - range / 2) &&
                (PhysicsService.mousePos.x < (body.position.x + range) + range / 2) &&
                (PhysicsService.mousePos.y > (body.position.y - range) - range / 2) &&
                (PhysicsService.mousePos.y < (body.position.y + range) + range / 2)) {
                    PhysicsService.mouseTarget = body
                }
            })
            
            if (PhysicsService.mouseTarget) {
                PhysicsService.activeCatterpillar = catterpillar
                catterpillar.isMoving = false
                e.preventDefault()
            }
        })
    },
    cancelMouseDown() {
        if (!PhysicsService.activeCatterpillar) {
            return
        }
        
        PhysicsService.mouseDown = false
        PhysicsService.mouseTarget = undefined
        PhysicsService.activeCatterpillar.isMoving = false

        PhysicsService.activeCatterpillar.composite.bodies.forEach( body => {
            Matter.Body.setAngularSpeed(body, 0)
            Matter.Body.setAngularVelocity(body, 0)
        })
        PhysicsService.activeCatterpillar = undefined
    },
    touchEndEvent(e: TouchEvent) {
        PhysicsService.mouseDown = false
        PhysicsService.mouseTarget = undefined
        PhysicsService.activeCatterpillar = undefined
    },
    mouseMoveEvent(e:MouseEvent | TouchEvent) {
        if (PhysicsService.activeCatterpillar) {
            e.preventDefault()
        }

        if (!PhysicsService.mouseDown) {
            return
        }
        PhysicsService.mousePos = mousePosition.xy(e)
    },
    animationFrame: () => {
        if (PhysicsService.physics) {
            PhysicsService.physics.blocks.forEach(block => {

                if (!block.composite || !block.domEl) {
                    return
                }   

                const isAboveScreen = block.y + block.height < window.scrollY;
                const isBelowScreen = block.y > window.scrollY + window.innerHeight + 200;
                const isOffscreen = isAboveScreen || isBelowScreen;
                const bodyBlock = block.composite.bodies.find(bodyBlock => bodyBlock.label === "block") as Matter.Body
                
                if (bodyBlock) {
                    const x = bodyBlock.position.x -  (block.x - window.scrollX) - block.width/2
                    const y = bodyBlock.position.y - (block.y - window.scrollY) - block.height/2
                    block.domEl.style.transform = `translate(${x}px, ${y}px)` 


                    // Update block position
                    if (block.composite && PhysicsService.physics) {
                        if (isOffscreen) {
                            // Remove block only if it hasn't been removed already
                            if (!PhysicsService.removedBlocks.has(block)) {
                                Matter.World.remove(PhysicsService.physics.engine.world, block.composite);
                                PhysicsService.removedBlocks.add(block); // Track removed block
                            }
                        } else {
                            // Re-add block only if it was previously removed
                            if (PhysicsService.removedBlocks.has(block)) {
                                Matter.World.add(PhysicsService.physics.engine.world, block.composite);
                                PhysicsService.removedBlocks.delete(block); // Mark as active again
                            }
                        }
        
                        const bodyBlock = block.composite.bodies.find(bodyBlock => bodyBlock.label === "block") as Matter.Body
                        Matter.Body.setPosition(bodyBlock, { x: bodyBlock.position.x, y: block.y - window.scrollY + block.height/2 });

                        if (block.y < window.scrollY) {
                            bodyBlock.render.fillStyle = "#000000FF"
                            bodyBlock.collisionFilter.mask = 0x0001
                        } else {
                            bodyBlock.collisionFilter.mask = 0x0001 | 0x0002
                            bodyBlock.render.fillStyle = "#FF0000FF"
                        }
                    }
                }
            })

            // Reset catterpillar when it is off screen
            PhysicsService.catterpillars.forEach(catterpillar => {
                const head = catterpillar.head
                const butt = catterpillar.butt
                
                if ((head.position.x > window.innerWidth && butt.position.x > window.innerWidth) ||
                (head.position.x <= 0 && butt.position.x < 0) ||
                (head.position.y > window.innerHeight + 100 && butt.position.y > window.innerHeight + 100) ||
                (head.position.y <= -400 && butt.position.y < -400)
                ) {
                    PhysicsService.resetCatterpillar(catterpillar)
                } 
            })

            // Make catterpillar dragable
            if (PhysicsService.mouseDown && PhysicsService.mouseTarget) {
                Matter.Body.setVelocity( PhysicsService.mouseTarget, {
                    x: PhysicsService.mousePos.x - PhysicsService.mouseTarget.position.x,
                    y: PhysicsService.mousePos.y - PhysicsService.mouseTarget.position.y,
                })
            }
        }
        window.requestAnimationFrame(PhysicsService.animationFrame)
    }
}
export { PhysicsService }
export default PhysicsService