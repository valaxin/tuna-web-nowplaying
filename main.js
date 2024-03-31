(async () => {

    // get data ?

    'use strict'
    
    const nowplaying = async (port) => {

        const populate = async (data) => {
            const stage = document.body.querySelector('div.stage')
            stage.innerHTML = `<div class="tuna-wrapper"><span class="tuna-title">${data.title}</span></br><span class="tuna-artist">${data.artists[0]}</span></div>`
            return stage
        }

        try {
            const endpoint = `http://127.0.0.1:${!port ? '1609' : port}/`
            const req = await fetch (endpoint, { method: 'GET' })
            const data = await req.json()
            const markup = await populate(data)
            return { data, markup}
        } catch (err) {
            throw err
        }
        
    }

    // call the titles in onces, initalize them if you will...
    // 
    
    const pollrate = 2000
    let np = await nowplaying(5858) // look for now playing w/ tuna port
    
    let current = { title: np.data.title, timeout: Number(Math.floor(np.data.duration / 4)) } // set
    
    np.markup.classList.add('visible')

    await setInterval(async () => {
        
        np = await nowplaying(5858)
        
        if (np.data.title != current.title) {
            
            console.log(`${current.title} => ${np.data.title}`)

            current = { title: np.data.title, timeout: Number(Math.floor(np.data.duration / 3)) } // update
            np.markup.classList.add('visible') // give class back
            
            console.log(`${current.timeout}ms until elements hide`)

            setTimeout(() => {
                np.markup.classList.remove('visible')
            }, current.timeout)
        }
    }, pollrate)

})()