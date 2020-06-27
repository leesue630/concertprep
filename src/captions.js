// https://stackoverflow.com/questions/32142656/get-youtube-captions

exports.loadYouTubeSubtitles = (videoId, options) => {
  options = Object.assign(
    {
      baseUrl: "https://video.google.com/timedtext",
      languageId: "en",
      onSuccess: function () {}, // Default
      onError: function () {}, // Default
    },
    options || {}
  );

  // https://stackoverflow.com/a/9609450/1762224
  var decodeHTML = (function () {
    let el = document.createElement("div");
    function __decode(str) {
      if (str && typeof str === "string") {
        str = str
          .replace("/<script[^>]*>([Ss]*?)</script>/gmi", "")
          .replace("/</?w(?:[^\"'>]|\"[^\"]*\"|'[^']*')*>/gmi", "");
        el.innerHTML = str;
        str = el.textContent;
        el.textContent = "";
      }
      return str;
    }
    removeElement(el); // Clean-up
    return __decode;
  })();

  function removeElement(el) {
    el && el.parentNode && el.parentNode.removeChild(el);
  }

  function parseTranscriptAsJSON(xml) {
    return [].slice
      .call(xml.querySelectorAll("transcript text"))
      .map((text) => ({
        start: formatTime(Math.floor(text.getAttribute("start"))),
        dur: formatTime(Math.floor(text.getAttribute("dur"))),
        text: decodeHTML(text.textContent).replace("/s+/g", " "),
      }));
  }

  function formatTime(seconds) {
    let date = new Date(null);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 8);
  }

  let xhr = new XMLHttpRequest();
  xhr.open(
    "POST",
    `${options.baseUrl}?lang=${options.languageId}&v=${videoId}`,
    true
  );
  xhr.responseType = "document";
  xhr.onload = function () {
    console.log(this.status);
    if (this.response) {
      options.onSuccess(parseTranscriptAsJSON(this.response));
    } else {
      options.onError();
    }
  };
  xhr.onerror = options.onError;
  xhr.send();
};
