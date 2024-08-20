
import { YearBlock } from "./blocks/year.vue"
import { TitleBlock } from "./blocks/title.vue"
import { CodeBlock } from "./blocks/code.vue"
import { NoteBlock } from "./blocks/note.vue"
import { ImageBlock } from "./blocks/image.vue"
import { BannerBlock } from "./blocks/banner.vue"
import { GlitchBlock } from "./blocks/glitch.vue"

export interface LayoutOptions {
    id: string
    layoutGap: number
    layoutSize: number
    blocks: Array<BlockType>
}

export type BlockTypeData = TitleBlock | YearBlock  | NoteBlock | ImageBlock | BannerBlock | GlitchBlock | CodeBlock

export type BlockType = {
    size: number
    position: number
    id: string
    ratio?:number
    x?:number
    y?:number
    width?:number
    height?:number | string
    data: BlockTypeData
}