import Physics from "@/model/physics"
import Matter from "matter-js"
import { Router } from 'vue-router';
import { BlockType } from "./../components/layout/layout-types"

interface MutationRecordWithAttributes extends MutationRecord {
    attributeName: string;
}

const PhysicsService = {
    physics: undefined as undefined | Physics,
    timeout: undefined as NodeJS.Timeout | undefined,
    observer: undefined as MutationObserver | undefined,
    start: (router: Router) => {
        // Fix for multiple appenditions of the canvas cause of Vite hot reload
        document.getElementById("physics")?.remove()
        
        
        if (PhysicsService.physics) {
            return 
        }
        
        // Listen to router events
        router.beforeEach((to, from, next) => {
            // Clean up blocks before navigating
            PhysicsService.observer?.disconnect()
            PhysicsService.physics?.clearBlocks()
            
            next();
        });
        
        router.afterEach(() => {
            // Recreate blocks after navigation
            PhysicsService.observeChanges();
        });
        
        
        PhysicsService.physics = new Physics()
        PhysicsService.observeChanges()
        PhysicsService.animationFrame()
        
        window.addEventListener("scroll", PhysicsService.onScroll)
    },
    observeChanges: () => {

        // Select the target node to observe
        const targetNode = document.body;

        // Options for the observer (which mutations to observe)
        const config = {
            childList: true, // Observe additions or removals of child nodes
            attributes: false, // Observe attribute changes
            subtree: true, // Observe the entire subtree (descendants)
        };

        // Callback function to execute when mutations are observed
        const callback: MutationCallback = (mutationsList: MutationRecord[], observer: MutationObserver) => {
            clearTimeout(PhysicsService.timeout)
            PhysicsService.timeout = setTimeout(() => {
                document.body.querySelectorAll(".block").forEach((element: HTMLElement) => {
                    const blockType = element.querySelector("[data-blocktype]")?.getAttribute("data-blocktype")

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

                    PhysicsService.physics?.addBlock(element)
                })
            }, 500)
        };

        // Create an instance of MutationObserver with the callback
        PhysicsService.observer = new MutationObserver(callback);

        // Start observing the target node with the specified configuration
        PhysicsService.observer.observe(targetNode, config);
    },
    onScroll: () => {
        if (PhysicsService.physics?.blocks.length === 0) {
            return
        }

        PhysicsService.physics?.blocks.forEach(block => {
            if (block.composite) {
                const pointLeft = block.composite.bodies.find(body => body.label === "pointLeft") as Matter.Body
                const pointRight = block.composite.bodies.find(body => body.label === "pointRight") as Matter.Body
                
                Matter.Body.setPosition(pointLeft, { x: pointLeft.position.x, y: block.y - window.scrollY });
                Matter.Body.setPosition(pointRight, { x: pointRight.position.x, y: block.y - window.scrollY });

            }
        })
    },
    animationFrame: () => {
        if (PhysicsService.physics) {
            PhysicsService.physics.blocks.forEach(block => {

                if (!block.composite || !block.domEl) {
                    return
                } 
                
                
                const body = block.composite.bodies.find(body => body.label === "body") as Matter.Body
                // console.log(body.position.y, block.y)
                if (body) {
                    block.domEl.style.transform = `translate(${body.position.x -  (block.x - window.scrollX) - block.width/2}px, ${body.position.y - (block.y - window.scrollY) - block.height/2}px) rotate(${body.angle}rad)`   
                }
            })
        }
        window.requestAnimationFrame(PhysicsService.animationFrame)
    }
}
export { PhysicsService }
export default PhysicsService