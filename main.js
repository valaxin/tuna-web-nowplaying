(async () => {

    // get data ?

    'use strict'
    
    const nowplaying = async (port) => {

        const populate = async (data) => {
            const stage = document.body
            stage.innerHTML = `<div class="tuna visible"><span class="tuna-title">${data.title}</span></br><span class="tuna-artist">${data.artists[0]}</span></div>`
            return stage
        }

        try {
            const endpoint = `http://127.0.0.1:${!port ? '1609' : port}/`
            const req = await fetch (endpoint, { method: 'GET' })
            const data = await req.json()
            const markup = await populate(data)
            return { data, markup }
        } catch (err) {
            return err
        }
        
    }

    
    let np = await nowplaying(5858)
    let pollrate = 2000
    let timeout = 100000
    let current = { title: np.data.title }

    await setInterval(async () => {
        np = await nowplaying(5858)
        
        if (np.data.title != current.title) {
            current = { title: np.data.title }
            console.log('song changed')
        }

    }, pollrate)

})()