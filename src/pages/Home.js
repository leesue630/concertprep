import YouTube from "react-youtube";
import React, { Component } from "react";

// main functions to use: onStateChange
// seekTo(seconds, allowSeekAhead)
// playVideo()
// getDuration()
/*
-1 – unstarted
0 – ended
1 – playing
2 – paused
3 – buffering
5 – video cued
*/

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      start: 0,
      end: this.props.duration,
      section: 0,
      sectionCount: this.props.sections.length - 1,
    };

    this.handlePrevSection = this.handlePrevSection.bind(this);
    this.handleNextSection = this.handleNextSection.bind(this);
    this._onStateChange = this._onStateChange.bind(this);
  }

  componentDidMount() {
    if (this.props.sections.length > 1) {
      this.setState({
        start: this.props.sections[0],
        end: this.props.sections[1],
      });
    }
  }

  handlePrevSection() {
    const i = this.state.section - 1;
    const start = this.props.sections[i];
    let end;
    if (i === this.state.sectionCount - 1) {
      end = this.props.duration;
    } else {
      end = this.props.sections[i + 1];
    }
    this.setState({
      start: start,
      end: end,
      section: i,
    });
    // console.log("Prev section");
  }

  handleNextSection() {
    const i = this.state.section + 1;
    const start = this.props.sections[i];
    let end;
    if (i === this.state.sectionCount - 1) {
      end = this.props.duration;
    } else {
      end = this.props.sections[i + 1];
    }
    this.setState({
      start: start,
      end: end,
      section: i,
    });
    // console.log("Next section");
  }

  _onReady(e) {
    //   this.setState({})
  }

  _onStateChange(e) {
    if (e.data === YouTube.PlayerState.ENDED) {
      e.target.seekTo(+this.state.start);
      e.target.playVideo();
    }
  }

  secToTimestamp(s) {
    return new Date(s * 1000).toISOString().substr(11, 8);
  }

  render() {
    const opts = {
      height: "390",
      width: "640",
      playerVars: {
        // https://developers.google.com/youtube/player_parameters
        autoplay: 1,
        start: this.state.start,
        end: this.state.end,
      },
    };

    return (
      <div>
        <YouTube
          videoId={this.props.videoId}
          opts={opts}
          onReady={this._onReady}
          onStateChange={this._onStateChange}
        />
        <p>
          <b>Section: </b>{this.state.section + 1}/{this.state.sectionCount}
          <br />
          <b>Interval: </b>[{this.secToTimestamp(this.state.start)} - {this.secToTimestamp(this.state.end)}]
          <br />
        </p>
        <button
          onClick={this.handlePrevSection}
          disabled={this.state.section <= 0}
        >
          Prev Section
        </button>
        <button
          onClick={this.handleNextSection}
          disabled={this.state.section + 1 >= this.state.sectionCount}
        >
          Next Section
        </button>
        <br />
        <button onClick={this.props.resetVideoId}>
          Choose different video
        </button>
        <button onClick={this.props.resetSections}>Change sections</button>
      </div>
    );
  }
}

export default Home;
