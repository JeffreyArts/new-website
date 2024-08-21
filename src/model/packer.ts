import _ from "lodash"

type Block = {
    width: number;
    height?: number;
    id: string | number;
}

type Position = {
    x: number;
    y: number;
    width: number;
    height: number;
    sourceId?: string | number;
    position?: "right" | "left" | "bottom"
    id?: string | number;
}


export default class Packer {
    private layoutWidth: number
    private layoutHeight: number
    private blocks: Block[]
    private output: Position[]
    private autoResize?: "width" | "height"
    
    constructor(layoutWidth: number, layoutHeight: number, options?: { autoResize?: "width" | "height" }) {
        this.layoutWidth = layoutWidth
        this.layoutHeight = layoutHeight
        this.blocks = []
        this.output = []
        this.autoResize = options?.autoResize
    }

    public setDimensions(width: number, height: number) {
        this.layoutWidth = width
        this.layoutHeight = height
        this.updateLayout()
    }

    public setBlocks(blocks: Block[]) {
        this.blocks = _.map(blocks, (block, index) => {
            if (!block.id) {
                block.id = index
            }
            return block
        })
        this.updateLayout()
    }

    public getOutput(): Position[] {
        return this.output
    }

    public addBlock(block: Block) {
        this.blocks.push(block)
        this.updateLayout()
    }

    private updateLayout() {
        const resultBlocks = [] as Position[]
        const inputBlocks = [...this.blocks] as Block[]
        let done = false

        const fitRight = (target: Position, inputBlocks: Block[]) => {
            return _.without(_.map(inputBlocks, inputBlock => {
                const newBlock = {
                    y: target.y,
                    x: target.x + target.width, 
                    width: inputBlock.width,
                    height: inputBlock.height,
                    position: "right",
                    sourceId: target.id,
                    id: inputBlock.id
                } as Position
                
                if (newBlock.x < target.x + target.width) {
                    return
                }
                
                // Check if it is exceeding the height
                if ((this.autoResize != "height")
                    && newBlock.y + newBlock.height > this.layoutHeight
                ) {
                    return
                }
            
                if (rectanglesOverlap(newBlock,target )) {
                    newBlock.y = target.y + target.height
                }
                // Validate if inputBlock is within canvas
                if (newBlock.x + newBlock.width > this.layoutWidth) {
                    return
                }
                
                return newBlock
            }), undefined) as Position[]
        }
        

        const getOptions = (targetBlock: Position, resultBlocks: Position[], inputBlocks: Block[]) => {
            const optionsRight = fitRight(targetBlock, inputBlocks)


            // Check left 
            const optionsLeft = _.without(_.map(inputBlocks,inputBlock => {
                const possibleOptions = _.without(_.map(resultBlocks, resBlock => {
                    if (resBlock.x  > targetBlock.x) {
                        return
                    }
                    
                    // Validate if inputBlock is within canvas
                    if (targetBlock.x - resBlock.width < 0) {
                        return
                    }
                    
                    if (targetBlock.y  < resBlock.y + resBlock.height) {
                        return
                    }
                    
                    // Check if it is exceeding the height
                    if ((this.autoResize != "height")
                        && resBlock.y + resBlock.height + targetBlock.height > this.layoutHeight
                    ) {
                        return
                    }
                    
                    return {
                        y: resBlock.y,
                        x: resBlock.x ,
                        width: inputBlock.width,
                        height: inputBlock.height,
                        position: "left",
                        sourceId: targetBlock.id,
                        id: inputBlock.id
                    }
                }), undefined) as Position[]

                if (possibleOptions.length > 0) {
                    return _.sortBy(possibleOptions, "y")[0]
                }
            }), undefined) as Position[]

            // Check bottom 
            const optionsBottom = _.without(_.map(inputBlocks, inputBlock => {
                const possibleOptions = _.without(_.map(resultBlocks, resBlock => {
                    // Check if block fits within layout width
                    if (inputBlock.width + resBlock.x > this.layoutWidth) {
                        return
                    }
                    if (targetBlock.y >= resBlock.y + resBlock.height) {
                        return
                    }

                    // Check if it is exceeding the height
                    if ((this.autoResize != "height")
                        && resBlock.y + resBlock.height + targetBlock.height > this.layoutHeight
                    ) {
                        return
                    }
                    
                    return {
                        x: resBlock.x,
                        y: resBlock.y + resBlock.height,
                        width: inputBlock.width,
                        height: inputBlock.height,
                        position: "bottom",
                        sourceId: resBlock.id,
                        id: inputBlock.id,
                    }
                }), undefined) as Position[]

                if (possibleOptions.length > 0) {
                    return _.sortBy(possibleOptions, "y")[0]
                }
            }), undefined) as Position[]

            return {
                id: targetBlock.id,
                optionsRight,
                optionsLeft,
                optionsBottom
            }
        }

        const getNextBlock = (resultBlocks: Position[]) => {
            const positionOrder = {
                right: 1,
                bottom: 2,
                left: 3
            }
            // console.log(resultBlocks)
            const options = _.map(resultBlocks, resBlock => {
                const data = getOptions(resBlock, resultBlocks, inputBlocks)
                const temp  =  _.chain([...data.optionsBottom, ...data.optionsLeft, ...data.optionsRight] as Array<Position | undefined>)
                    .orderBy(
                        ["y", item => positionOrder[item?.position || "right"]],
                        ["asc", "desc"]
                    )
                    .without(undefined)
                    .filter(dataRect =>
                        !_.some(resultBlocks, resultRect => rectanglesOverlap(dataRect, resultRect))
                    )
                    .without(undefined)
                    .value()
                    
                return temp
            })
            

            const nextBlocks = _.chain(_.flatten(options))
                .orderBy(
                    ["y", item => positionOrder[item?.position || "right"]],
                    ["asc", "desc"]
                )
                .without(undefined)
                .take(1)
                .value() as  Array<Position>

            if (nextBlocks.length === 1)  {
                return nextBlocks[0]
            } 
            return undefined
        }
        
        const rectanglesOverlap = (r1:Position | undefined, r2:Position | undefined) => {
            if (r1 === undefined || r2 === undefined) {
                return undefined
            }
            return !(r2.x >= r1.x + r1.width ||
                     r2.x + r2.width <= r1.x ||
                     r2.y >= r1.y + r1.height ||
                     r2.y + r2.height <= r1.y)
        }
        
        while (!done) {
            if (resultBlocks.length === 0) {
                const firstBlock = inputBlocks[0] // Get and remove the first block
                if (!firstBlock.width) {
                    // Skip when block doesn't have a width
                    done = true
                    continue
                }
                if (firstBlock) {
                    resultBlocks.push({
                        width: firstBlock.width,
                        height: firstBlock.height,
                        x: 0,
                        y: 0,
                        id: firstBlock.id
                    })

                    _.remove(inputBlocks, { id: firstBlock.id })
                }
                continue // Restart loop to process the next block
            }
            
            let nextBlock = getNextBlock(resultBlocks)
            if (!nextBlock) {
                const lowestBlock = _.reverse(_.sortBy(resultBlocks, block => block.y + block.height))[0]
                const lastBlock = inputBlocks[0]
                
                if (!lastBlock) {
                    done = true
                    continue
                }

                // Safety check to prevent infinite loops
                if (lastBlock.width <= 0) {
                    done = true
                    continue
                }

                nextBlock = {
                    width: lastBlock.width,
                    height: lastBlock.height,
                    x: 0,
                    y: lowestBlock.y + lowestBlock.height,
                    id: lastBlock.id,
                    sourceId: "none"
                }
            }
            
            // Quit method if layout isn't allowed to be stretched
            if (this.autoResize != "height" && nextBlock.height + nextBlock.y > this.layoutHeight) {
                done = true
                continue
            }
            
            resultBlocks.push({
                x: nextBlock.x,
                y: nextBlock.y,
                width: nextBlock.width,
                height: nextBlock.height,
                id: nextBlock.id
            })
            _.remove(inputBlocks, { id: nextBlock.id })
            continue
        }
        
        this.output = resultBlocks
        return resultBlocks
    }
}

