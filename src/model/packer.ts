import _ from "lodash"

export type Block = {
    width: number;
    height: number;
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
        const resultPositions = [] as Position[]
        const inputBlocks = [...this.blocks] as Block[]
        let done = false

        const fitRight = (target: Position, inputBlocks: Block[]) => {
            return _.without(_.map(inputBlocks, inputBlock => {
                const newBlock = {
                    x: target.x + target.width, 
                    y: target.y,
                    width: inputBlock.width,
                    height: inputBlock.height,
                    position: "right",
                    sourceId: target.id,
                    id: inputBlock.id
                } as Position
                
                // Validate if inputBlock is within canvas
                if (newBlock.x + newBlock.width > this.layoutWidth) {
                    return
                }

                // Check if it is exceeding the height
                if ((this.autoResize != "height") && newBlock.y + newBlock.height > this.layoutHeight
                ) {
                    return
                }
            
                
                return newBlock
            }), undefined) as Position[]
        }
        
        const fitBottom = (target: Position, inputBlocks: Block[]) => {
            // Check bottom 
            return _.without(_.map(inputBlocks, inputBlock => {
                const newBlock =  {
                    x: target.x ,
                    y: target.y + target.height,
                    width: inputBlock.width,
                    height: inputBlock.height,
                    position: "bottom",
                    sourceId: target.id,
                    id: inputBlock.id
                } as Position

                // Validate if inputBlock is within canvas
                if (newBlock.x + newBlock.width > this.layoutWidth) {
                    return
                }
                
                // Check if it is exceeding the height
                if ((this.autoResize != "height") && newBlock.y + newBlock.height > this.layoutHeight
                ) {
                    return
                }
                    
                return newBlock
            }), undefined) as Position[]
        }
        
        const fitLeft = (target: Position, inputBlocks: Block[]) => {
            return _.without(_.map(inputBlocks, inputBlock => {
                const newBlock =  {
                    x: target.x ,
                    y: target.y,
                    width: inputBlock.width,
                    height: inputBlock.height,
                    position: "left",
                    sourceId: target.id,
                    id: inputBlock.id
                } as Position

                // Validate if inputBlock is within canvas
                if ((target.x - inputBlock.width < 0 || newBlock.x + newBlock.width > this.layoutWidth)) {
                    return
                }

                // Check if it is exceeding the height
                if ((this.autoResize != "height") && newBlock.y + newBlock.height > this.layoutHeight
                ) {
                    return
                }
                
                return newBlock
            }), undefined) as Position[]
        }
        

        const getOptions = (targetBlock: Position, resultPositions: Position[], inputBlocks: Block[]) => {
            const optionsRight = fitRight(targetBlock, inputBlocks)
            const optionsLeft = fitLeft(targetBlock, inputBlocks)
            const optionsBottom = fitBottom(targetBlock, inputBlocks)

            return [
                ...optionsRight,
                ...optionsLeft,
                ...optionsBottom
            ]   
        }

        const getNextBlock = (resultPositions: Position[]) => {
            const positionOrder = {
                right: 1,
                bottom: 2,
                left: 3
            }
            
            const options = _.filter(_.map(resultPositions, resBlock => {
                const data = getOptions(resBlock, resultPositions, inputBlocks) as Array<Position | undefined>
                const temp  =  _.chain(data)
                    .orderBy(
                        ["y", item => positionOrder[item?.position || "right"]],
                        ["asc", "asc"]
                    )
                    .without(undefined)
                    .value()

                return _.map(temp, tempPos => {
                    const sortedResPos = _.sortBy(resultPositions, "y", "asc")
                    _.each(sortedResPos, pos => {
                        if (rectanglesOverlap(tempPos, pos)) {
                            if (tempPos) {
                                tempPos.y = pos.y + pos.height
                            }
                        }
                    })
                    return tempPos
                })
            }), res => res.length > 0)
            
            const nextBlocks = _.chain(_.flatten(options))
                .orderBy(
                    ["y", item => positionOrder[item?.position || "right"]],
                    ["asc", "asc"]
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
            if (resultPositions.length === 0) {
                const firstBlock = inputBlocks[0] // Get and remove the first block
                if (!firstBlock.width) {
                    // Skip when block doesn't have a width
                    done = true
                    continue
                }
                if (firstBlock) {
                    resultPositions.push({
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
            
            let nextBlock = getNextBlock(resultPositions)

            if (!nextBlock) {
                const lowestBlock = _.reverse(_.sortBy(resultPositions, block => block.y + block.height))[0]
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
            
            resultPositions.push({
                x: nextBlock.x,
                y: nextBlock.y,
                width: nextBlock.width,
                height: nextBlock.height,
                id: nextBlock.id
            })
            _.remove(inputBlocks, { id: nextBlock.id })
            continue
        }
        
        this.output = resultPositions
        return resultPositions
    }
}

