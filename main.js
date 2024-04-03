(async () => {
  "use strict";

  /* states: 0 = uninitalized, 1 = initalized, 2 = error  */

  const PORT = `5858`;
  const ENDPOINT = `http://localhost:${PORT}/`;
  const CACHE = { ENDPOINT, STATE: 0, LOG: [] };
  const RATE = 2000;
  const TIMEOUT = 60000; // 1 minute
  const SELECTORS = [
    ".stage",
    ".information-container",
    ".song-title",
    ".song-artist",
  ];

  let tick = 0;

  const getCurrentTrackInfo = async (url, options) => {
    try {
      let response = await fetch(url, options || { Method: "GET" });
      let jsondata = await response.json();
      return jsondata;
    } catch (error) {
      throw error;
    }
  };

  const getSpotifyTrackID = (source) => {
    try {
      return source.url.split("/")[source.url.split("/").length - 1];
    } catch (error) {
      return error;
    }
  };

  const simpleCacheChecking = async (saved, incoming) => {
    if (typeof saved.LOG[0] === "undefined") {
      saved.LOG.splice(0, 0, incoming);
      saved.LOG[0].timeout = saved.LOG[0].duration - TIMEOUT;
      saved.STATE = 1;
    } else {
      if (getSpotifyTrackID(saved.LOG[0]) !== getSpotifyTrackID(incoming)) {
        saved.LOG[0].finished = true;
        saved.LOG.splice(0, 0, incoming);
        saved.LOG[0].timeout = saved.LOG[0].duration - TIMEOUT;
        console.info(
          `Song Changed "${incoming.title}" - "${incoming.artists[0]}" \nVisit: ${incoming.url}`,
          `\n Information hiding in about ${Math.floor(
            saved.LOG[0].timeout / 1000
          )}Seconds`
        );
      }
      if (incoming.progress > saved.LOG[0].timeout) {
        saved.LOG[0].hide = true;
      } else {
        saved.LOG[0].hide = false;
      }
    }
    return saved;
  };

  const insertIntoDOM = async (selector, data) => {
    let hook = document.querySelector(selector);
    hook.innerHTML = `
      <div class="information-container ${data.hide === true ? "hidden" : ""}">
        <span class="animated-text wave song-title">${data.title}</span>
        </br>
        <span class="animated-text wave song-artist">${data.artists[0]}</span>
      </div>
    `;
    return hook.children[0];
  };

  async function init() {
    setInterval(async () => {
      const DATA = await getCurrentTrackInfo(ENDPOINT);
      const TEMP = await simpleCacheChecking(CACHE, DATA);
      const ELEM = await insertIntoDOM(SELECTORS[0], CACHE.LOG[0]);
      console.log(
        `elapsed over remaining before hidden class is added :: ${DATA.progress} / ${CACHE.LOG[0].timeout}`
      );
    }, RATE);
  }

  await init();
})();
