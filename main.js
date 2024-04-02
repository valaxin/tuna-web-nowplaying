(async () => {
  /* states: 0 = uninitalized, 1 = initalized, 2 = error  */

  const PORT = `5858`;
  const ENDPOINT = `http://localhost:${PORT}/`;
  const CACHE = { ENDPOINT, STATE: 0, LOG: [] };
  const RATE = 3200;

  // request the data presented at defined address:port by tuna obs plugin
  // expected data type is json.
  async function requestCurrentSong(url, options) {
    try {
      let response = await fetch(url, options);
      let jsondata = await response.json();
      return jsondata;
    } catch (error) {
      throw error;
    }
  }

  // initlize "CACHE" object by setting data "as is" into the object.
  async function setIntoCache(object, data) {
    console.log([
      `Congrats! "object.STATE" exists and is set to 0=uninialized or 1=initalized state.`,
      (typeof object.STATE === "number" && object.STATE === 0) ||
        object.STATE === 1,
    ]);

    // proceed...
    if (
      (typeof object.STATE === "number" && object.STATE === 0) ||
      object.STATE === 1
    ) {
      // setup or we're already running... prepend via splice the current song to the "history" array returning the updated cache,
      // > preform .map() on array on invocation ensuring that index 0 isn't dupulicate to current song without a finished timestamp/tag appended.
      // timestamp is applied only when new data is present. (this might have issues when a song is repeated unsure tho.)
      // ---
      // if the data isn't the same as the current index 0 insert data into array

      // either there isn't a value at index 0 (undefined) or its some object notation. set or replcae the data

      console.log(`now playing "${data.title}" by "${data.artists[0]}"`);

      if (object.LOG[0] === undefined) {
        object.LOG.splice(0, 0, data);
        object.STATE = 1;
      }

      // let's harden this check, by making use of the provided track url from spotify
      const getSpotifyTrackID = (source) => {
        try {
          return source.url.split("/")[source.url.split("/").length - 1];
        } catch (error) {
          return error;
        }
      };

      // compare previouly mentioned ids, and prepend to log if change present.
      if (object.LOG[0].title) {
        if (getSpotifyTrackID(object.LOG[0]) !== getSpotifyTrackID(data)) {
          console.log(
            `Hey buddy! Data says the song changed, let's get this switched up!`
          );
          object.LOG[0].finished = true;
          object.LOG.splice(0, 0, data);
        }
      }
      return object;
    } else {
        // return error
      object.STATE = 2;
      return {
        object,
        errorMessage: `Uh-Oh! "object.STATE" doesn't exist check what you're passing into "setIntoCache()"`,
      };
    }
  }

  async function main() {
    setInterval(async () => {
      let jsondata = await requestCurrentSong(ENDPOINT, { Method: "GET" });
      let cache = await setIntoCache(CACHE, jsondata);
    }, RATE);
  }

  main();
})();
