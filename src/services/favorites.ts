import Payload from '@/stores/payload'

interface FavoriteRequest {
    payload_collection: string
    project_id?: string
    piece_id?: string
    page_id?: string
}

export class FavoritesService {
    private static buildRequest(pageType: string, pageId: string): FavoriteRequest {
        const request: FavoriteRequest = {
            payload_collection: pageType,
        }

        switch (pageType) {
            case 'projects':
                request.project_id = pageId
                break
            case 'pieces':
                request.piece_id = pageId
                break
            case 'pages':
                request.page_id = pageId
                break
        }

        return request
    }

    private static buildQuery(request: FavoriteRequest & { user: string }): string {
        let query = '?'
        for (const [key, value] of Object.entries(request)) {
            if (value) {
                query += `where[${key}][equals]=${value}&`
            }
        }
        return query
    }

    static async setSelfLove(pageId: string, pageType: string): Promise<boolean> {
        const payload = Payload()
        if (!payload.auth?.self) return false

        const request = {
            ...this.buildRequest(pageType, pageId),
            user: payload.auth.self.id.toString()
        }
        const query = this.buildQuery(request)

        try {
            const response = await payload.GET('favorites' + query)
            return response.data?.docs.length !== 0
        } catch (error) {
            console.error('Error checking self love:', error)
            return false
        }
    }

    static async loadFavs(pageId: string, pageType: string): Promise<number> {
        const payload = Payload()
        const query = this.buildRequest(pageType, pageId)

        try {
            const response = await payload.POST('favorites/totaldocs', query)
            return response.data.favs
        } catch (error) {
            console.error('Error loading favs:', error)
            return 0
        }
    }

    static async toggleLike(pageId: string, pageType: string): Promise<boolean> {
        const payload = Payload()
        if (!payload.auth?.self) return false

        const request = {
            ...this.buildRequest(pageType, pageId),
            user: payload.auth.self.id.toString()
        }
        const query = this.buildQuery(request)

        try {
            const response = await payload.GET('favorites' + query)
            
            if (response.data?.docs.length === 0) {
                await payload.POST('favorites', request)
                return true
            } else {
                for (const doc of response.data.docs) {
                    await payload.DELETE(`favorites/${doc.id}`)
                }
                return false
            }
        } catch (error) {
            console.error('Error toggling like:', error)
            throw error
        }
    }
} 