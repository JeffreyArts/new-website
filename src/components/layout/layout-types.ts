
import { BannerBlock } from "./blocks/banner.vue"
import { CodeBlock } from "./blocks/code.vue"
import { GlitchBlock } from "./blocks/glitch.vue"
import { IframeBlock } from "./blocks/iframe.vue"
import { ImageBlock } from "./blocks/image.vue"
import { LineBlock } from "./blocks/line.vue"
import { NewsletterBlock } from "./blocks/newsletter.vue"
import { NoteBlock } from "./blocks/note.vue"
import { ProjectThumbnailBlock } from "./blocks/project-thumbnail.vue"
import { ProjectArticleBlock } from "./blocks/project-article.vue"
import { PieceThumbnailBlock } from "./blocks/piece-thumbnail.vue"
import { TextBlock } from "./blocks/text.vue"
import { TitleBlock } from "./blocks/title.vue"
import { YearBlock } from "./blocks/year.vue"
import { YoutubeBlock } from "./blocks/youtube.vue"

export interface LayoutOptions {
    id: string
    layoutGap: number
    layoutSize: number
    blocks: Array<BlockType>
}

export type BlockTypeData = TitleBlock | TextBlock | PieceThumbnailBlock | ProjectThumbnailBlock | ProjectArticleBlock | YearBlock  | NoteBlock | ImageBlock | LineBlock | BannerBlock | GlitchBlock | CodeBlock | IframeBlock | YoutubeBlock | NewsletterBlock

export type BlockType = {
    size: number
    position: number
    id: string
    ratio?:number
    x?:number
    y?:number
    loaded?: boolean
    width?:number
    height?:number
    data: BlockTypeData
}
