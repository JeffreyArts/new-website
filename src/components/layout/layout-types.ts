
import { YearBlock } from "./blocks/year.vue"
import { TitleBlock } from "./blocks/title.vue"
import { NoteBlock } from "./blocks/note.vue"

export interface LayoutOptions {
    id: string
    layoutGap: number
    layoutSize: number
    blocks: Array<BlockType>
}

export type BlockTypeData = TitleBlock | YearBlock  | NoteBlock 
export type BlockType = {
    size: number
    id: string
    ratio?:number
    x?:number
    y?:number
    width?:number
    height?:number
    data: BlockTypeData
}