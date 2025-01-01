export type ProjectType = {
    id: string
    path: string
    archived: boolean
    categories: Array<{
        id: string
        title: string
    }>
    series: Array<{
        id: string
        title: string
    }>
    year: {
        from: string | number
        to: string | number
    }
    title: string
    description: SlateNode
    thumbnail: {
        width: number
        height: number
        filename: string
        mimeType: string
        title: string
        description: string
        url: string
        sizes: {
            image_sm: {
                width: number
                height: number
                url: string
            }
            image_md: {
                width: number
                height: number
                url: string
            }
            image_lg: {
                width: number
                height: number
                url: string
            }
        }
    }
}
export default ProjectType