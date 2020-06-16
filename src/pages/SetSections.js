import React, { Component } from "react";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";

class SetSections extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      lyrics: [],
      times: [],
      includesZero: null,
      error: null,
      linesPer: 0,
      includeBeginning: false,
    };
    this.handleNext = this.handleNext.bind(this);
    this.handleLinesPer = this.handleLinesPer.bind(this);
    this.handleToggleIncludeBeginning = this.handleToggleIncludeBeginning.bind(
      this
    );
    this.loadYouTubeSubtitles = this.loadYouTubeSubtitles.bind(this);
    this.jsonToCsv = this.jsonToCsv.bind(this);
  }

  handleToggleIncludeBeginning(e) {
    let checked = e.target.checked;
    if (this.state.includeBeginning !== checked) {
      if (this.state.includesZero) {
        if (checked) {
          let newTimes = this.state.times.slice(0);
          // insert time 0 at beginning of list
          newTimes.splice(0, 0, 0);
          this.setState({
            includeBeginning: true,
            times: newTimes,
          });
        } else {
          let newTimes = this.state.times.slice(0);
          newTimes.shift();
          this.setState({
            includeBeginning: false,
            times: newTimes,
          });
        }
      }
    }
  }

  handleNext() {
    // section start times
    let sections = this.state.times.filter(
      (v, i) => i % this.state.linesPer === 0
    );
    if (this.state.times.length - (1 % this.state.linesPer) !== 0) {
      sections[sections.length] = this.state.times[this.state.times.length - 1];
    }
    this.props.setSections(sections);
  }

  // https://stackoverflow.com/questions/32142656/get-youtube-captions
  componentDidMount() {
    this.loadYouTubeSubtitles(this.props.videoId, {
      callbackFn: (json) => {
        const lyrics = this.jsonToCsv(json, {
          includeHeader: false,
          ignoreKeys: ["start", "dur"],
          delimiter: "\t",
        });
        // console.log(json);
        this.setState({
          loaded: true,
          lyrics: lyrics,
        });
      },
    });
  }

  handleLinesPer(e) {
    this.setState({
      linesPer: e.target.value,
    });
  }

  loadYouTubeSubtitles(videoId, options) {
    options = Object.assign(
      {
        baseUrl: "https://video.google.com/timedtext",
        languageId: "en",
        callbackFn: function (json) {
          // console.log(json);
        }, // Default
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
      if (this.status >= 200 && this.status < 400) {
        options.callbackFn(parseTranscriptAsJSON(this.response));
      } else {
        // console.log("Error: " + this.status);
      }
    };
    xhr.onerror = function () {
      // console.log("Error!");
    };
    xhr.send();
  }

  jsonToCsv(json, options) {
    options = Object.assign(
      {
        includeHeader: true,
        delimiter: ",",
        ignoreKeys: [],
      },
      options || {}
    );
    let keys = Object.keys(json[0]).filter(
      (key) => options.ignoreKeys.indexOf(key) === -1
    );
    let linesPer = [];
    if (options.includeHeader) {
      linesPer.push(keys.join(options.delimiter));
    }
    let times = json.map((entry) => {
      var a = entry.start.split(":"); // split it at the colons

      // minutes are worth 60 seconds. Hours are worth 60 minutes.
      var seconds = +a[0] * 60 * 60 + +a[1] * 60 + +a[2];
      return seconds;
    });
    times[times.length] = this.props.duration;
    times.sort(function(a, b) {
      return a - b;
    });
    this.setState({
      times: times,
      includesZero: times[0] !== 0
    });
    return linesPer.concat(
      json.map((entry) => keys.map((key) => entry[key]).join(options.delimiter))
    );
  }

  render() {

    return (
      <div>
        {this.state.loaded ? (
          <div>
            Lyrics:
            {this.state.lyrics.map((line, i) => {
              let spacedI =
                i + 1 < 10
                  ? i + 1 + ":\xa0\xa0\xa0\xa0\xa0"
                  : i + 1 + ":\xa0\xa0\xa0";
              return (
                <p className="lyric" key={i}>
                  {spacedI}
                  {line}
                </p>
              );
            })}
            <br />
            Total Line Count: {this.state.lyrics.length}
          </div>
        ) : (
          "Loading lyrics..."
        )}
        <br />
        Lines per section{" "}
        <TextField
          id="linesPer"
          name="linesPer"
          type="number"
          defaultValue={this.state.linesPer}
          onChange={this.handleLinesPer}
        />
        <br />
        Include Song Beginning
        <Checkbox
          checked={this.state.includeBeginning}
          onChange={this.handleToggleIncludeBeginning}
          inputProps={{ "aria-label": "primary checkbox" }}
        />
        <br />
        <button
          onClick={this.handleNext}
          disabled={
            !this.state.loaded ||
            +this.state.linesPer <= 0 ||
            +this.state.linesPer > this.state.lyrics.length
          }
        >
          Memorize!
        </button>
        <br />
        <button onClick={this.props.resetVideoId}>
          Choose different video
        </button>
      </div>
    );
  }
}

export default SetSections;
