import React, { Component } from "react";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";
import captions from "../captions";

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
    this.parseJson = this.parseJson.bind(this);
  }

  handleToggleIncludeBeginning(e) {
    let checked = e.target.checked;
    if (this.state.includeBeginning !== checked) {
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

  handleNext() {
    // section start times
    let sections = this.state.times.filter(
      (v, i) => i % this.state.linesPer === 0
    );
    if (((this.state.times.length - 1) % this.state.linesPer) !== 0) {
      sections[sections.length] = this.state.times[this.state.times.length - 1];
    }
    this.props.setSections(sections, this.state.linesPer);
  }

  componentDidMount() {
    this.setState({
      error: null,
    });
    captions.loadYouTubeSubtitles(this.props.videoId, {
      onSuccess: (json) => {
        const lyrics = this.parseJson(json);
        // console.log("lyrics", lyrics);
        this.setState({
          loaded: true,
          lyrics: lyrics,
        });
      },
      onError: () => {
        this.setState({
          error:
            "Something went wrong :( Make sure the video has human-generated captions.",
        });
      },
    });
  }

  handleLinesPer(e) {
    this.setState({
      linesPer: +e.target.value,
    });
  }

  parseJson(json) {
    // sort lyrics by start key
    json = json.sort(function (a, b) {
      return a.start - b.start;
    });

    // extract times from captions
    let times = json.map((entry) => {
      // convert HH:MM:SS to seconds
      var a = entry.start.split(":");
      var seconds = +a[0] * 60 * 60 + +a[1] * 60 + +a[2];
      return seconds;
    });

    // add final timestamp to times
    times[times.length] = this.props.duration;

    this.setState({
      times: times,
      includesZero: times[0] === 0,
    });

    return json.map((entry) => entry.text.replace("\n", ", "));
  }

  lyricToP(lyric, i) {
    let spacedI =
      i + 1 < 10 ? i + 1 + ":\xa0\xa0\xa0\xa0\xa0" : i + 1 + ":\xa0\xa0\xa0";
    return (
      <p className="lyric" key={"lyric" + i}>
        {spacedI}
        {lyric}
      </p>
    );
  }

  render() {
    let splits;
    if (this.state.linesPer > 0) {
      splits = this.state.lyrics
        .map((line, i) => i)
        .filter((i) => !(i % this.state.linesPer));
    } else {
      splits = [0];
    }
    // console.log("splits", splits);

    let verses = [];
    for (let i = 0; i < splits.length; i++) {
      let bound =
        i === splits.length - 1 ? this.state.lyrics.length : splits[i + 1];
      // console.log("bound", bound);
      let verse = [];
      for (let j = splits[i]; j < bound; j++) {
        verse.push(this.lyricToP(this.state.lyrics[j], j));
      }
      // console.log("verse", verse);
      verses.push(
        <div className="verse" key={"verse" + i}>
          {verse}
        </div>
      );
    }
    // console.log("verses", verses);

    return (
      <div>
        {this.state.loaded ? (
          <div>
            Total Line Count: {this.state.lyrics.length}
            <br />
            Lines per section:{" "}
            <TextField
              id="linesPer"
              name="linesPer"
              type="number"
              defaultValue={this.state.linesPer}
              onChange={this.handleLinesPer}
              className="small"
            />
            <h2 id="lyrics-header">Lyrics:</h2>
            {verses}
            <br />
            {!this.state.includesZero && (
              <span>
                Include Song Beginning
                <Checkbox
                  checked={this.state.includeBeginning}
                  onChange={this.handleToggleIncludeBeginning}
                  inputProps={{ "aria-label": "primary checkbox" }}
                />
              </span>
            )}
            <br />
            <button
              onClick={this.handleNext}
              disabled={
                !this.state.loaded ||
                this.state.linesPer <= 0 ||
                this.state.linesPer > this.state.lyrics.length
              }
            >
              Memorize!
            </button>
          </div>
        ) : (
          this.state.error || "Loading lyrics..."
        )}
        <br />
        <button onClick={this.props.resetVideoId}>
          Choose different video
        </button>
      </div>
    );
  }
}

export default SetSections;
