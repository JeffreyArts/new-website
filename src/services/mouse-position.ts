
export default {
    xy(e:MouseEvent | TouchEvent) {
        let x = 0
        let y = 0
            
        if (!e.currentTarget) {
            throw new Error("Missing currentTarget property")
        }
        const target = e.currentTarget as HTMLElement
        const rect = target.getBoundingClientRect()

        if (e instanceof MouseEvent) {
            x = e.clientX - rect.x
            y = e.clientY - rect.y
        } else if (e instanceof TouchEvent) {
            x = e.touches[0].clientX - rect.x
            y = e.touches[0].clientY - rect.y
        }   

        y -= window.scrollY
        
        // if (e instanceof TouchEvent) {
        //     x = e.touches[0].clientX - rect.x
        //     y = e.touches[0].clientY - rect.y
        // }   

        return {x,y}
    },
    x(e:MouseEvent) {
        let x = 0
        
        if (!e.currentTarget) {
            throw new Error("Missing currentTarget property")
        }
        const target = e.currentTarget as HTMLElement
        const rect = target.getBoundingClientRect()
        

        if (e instanceof MouseEvent) {
            x = e.clientX - rect.x
        }
        
        if (e instanceof TouchEvent) {
            x = e.touches[0].clientX - rect.x
        }   

        return x
    },
    y(e:MouseEvent) {
        let y = 0
            
        if (!e.currentTarget) {
            throw new Error("Missing currentTarget property")
        }
        const target = e.currentTarget as HTMLElement
        const rect = target.getBoundingClientRect()

        if (e instanceof MouseEvent) {
            y = e.clientY - rect.y
        }
        
        if (e instanceof TouchEvent) {
            y = e.touches[0].clientY - rect.y
        }   

        y -= window.scrollY
        return y
    },
}