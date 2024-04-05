(async () => {
  "use strict";

  /* states: 0 = uninitalized, 1 = initalized, 2 = error */

  const config = {
    rtic: 0,
    port: "9002",
    host: "127.0.0.1",
    rate: 2000,
    tmot: 90000,
    selc: [".stage", ".information-container", ".song-title", ".song-artists"],
  };

  const state = [0, { history: [] }];

  // send request to address with passed or default options
  // expects a json response that is returned on promise resolve.
  async function CurrentSong(address, options) {
    let defaultOptions = {
      cache: "no-cache",
      redirect: "error",
      method: "GET",
      mode: "cors",
    };
    try {
      let response = await fetch(address, options || defaultOptions);
      let jsondata = await response.json();
      return jsondata;
    } catch (error) {
      throw error;
    }
  }

  //
  async function SimpleStateManagement(state, updates, timeout) {
    let history = state[1].history;

    try {
      // create first entry into history array should it not exist
      if (typeof history[0] === "undefined") {
        history.splice(0, 0, updates);
        state[0] = 1;
      }

      // if the current data and the last saved song don't match
      if (SpotifyTrackUUID(history[0]) !== SpotifyTrackUUID(updates)) {
        history[0].finished = true;
        history.splice(0, 0, updates);

        console.info(
          `[Song Changed] - "${history[0].title}" - "${
            history[0].artists[0]
          }" \nVisit: ${history[0].url} \n Information displayed will hide in ${
            timeout / 1000
          } seconds.`, 
          state
        );
      }

      // when the song progress has supassed or not
      // the timeout value (ms) set the flag accordingly
      if (updates.progress > timeout) {
        history[0].visible = false;
      } else {
        history[0].visible = true;
      }

      if (history[0].progress === updates.progress) {
        console.log('[Paused?]')
      }

    } catch (error) {
      state[0] = 2;
      throw error;
    }
    return history;
  }

  // parse the Spotify track url from data source returning ONLY the track ID.
  const SpotifyTrackUUID = (source) => {
    try {
      return source.url.split("/")[source.url.split("/").length - 1];
    } catch (error) {
      return error;
    }
  };

  // using a provided selector, insert provided data into elements then into the DOM.
  const InsertPopulatedElements = (selector, data) => {
    if (typeof selector === "string" && selector.length > 0) {
      // console.log("selector exists", selector, selector.length);
    }
    let hook = document.querySelector(selector);
    hook.innerHTML = `
      <div class="information-container ${data.visible === false ? "hidden" : ""}">
        <span class="animated-text wave song-title">${data.title}</span>
        </br>
        <span class="animated-text wave song-artist">${ConcatenateArtistsNames(data.artists)}</span>
        </br>
        <!-- <span class="animated-text wave song-album">${data.album}, (${data.release_year})</span> -->
      </div>
    `;
    return hook.children[0];
  };

  const ConcatenateArtistsNames = (artists) => {
    return artists.join(', ')
  }

  async function RequestQRCode (size, data) {
    let url = `api.qrserver.com/v1/create-qr-code`
    let address = `https://${uri}?size=${size}x${size}&data="${encodeURI(data)}"`
    let response = await fetch (address, { method: 'GET' })
    return await response.blob()
  }
  
  // call these functions on rated interval, incriment on completetion
  const ExecuteOnInterval = setInterval(async () => {
    const fresh = await CurrentSong(`http://${config.host}:${config.port}`)
    const smtmp = await SimpleStateManagement(state, fresh, config.tmot)
    const elems = await InsertPopulatedElements(config.selc[0], state[1].history[0])
    config.rtic++
  }, config.rate)

})();