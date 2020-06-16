import YouTube from "react-youtube";
import React, { Component } from "react";
import TextField from "@material-ui/core/TextField";

const YT_SEARCH_URL =
  "https://www.youtube.com/results?search_query=music&sp=EgIoAQ%253D%253D";

class SetVideoId extends Component {
  constructor(props) {
    super(props);
    this.state = {
      preview: false,
      sync: false,
      videoId: "",
      videoIdTemp: "KNn1qaRJsXs",
      duration: null,
      error: null,
      loading: false,
    };
    this.handleVideoId = this.handleVideoId.bind(this);
    this.handlePreview = this.handlePreview.bind(this);
    this.handleNext = this.handleNext.bind(this);
    // this._onReady = this._onReady.bind(this);
    this._onStateChange = this._onStateChange.bind(this);
    this._onError = this._onError.bind(this);
  }

  handlePreview() {
    if (this.state.videoIdTemp !== this.state.videoId) {
      this.setState({
        preview: true,
        loading: true,
        videoId: this.state.videoIdTemp,
      });
    } else {
      this.setState({
        sync: true,
      });
    }
  }

  handleNext() {
    this.props.setDuration(this.state.duration);
    this.props.setVideoId(this.state.videoId);
  }

  handleVideoId(e) {
    this.setState({
      videoIdTemp: e.target.value,
      sync: false,
    });
    if (e.target.value === "") {
      this.setState({
        error: "Cannot be empty",
      });
    } else if (e.target.value.length !== 11) {
      this.setState({
        error: "Video ID must be 11 characters",
      });
    } else {
      this.setState({
        error: null,
      });
    }
  }

  // _onReady(e) {
  //   console.log("onReady");
  //   this.setState({
  //     duration: e.target.getDuration(),
  //     loading: false,
  //     sync: true,
  //   });
  // }

  _onStateChange(e) {
    // console.log(e.data);
    if (this.state.loading) {
      this.setState({
        duration: e.target.getDuration(),
        loading: false,
        sync: true,
      });
    }
  }

  _onError(e) {
    // console.log(e.data);
    this.setState({
      loading: false,
    });
    if (e.data !== 5) {
      this.setState({
        error: "Invalid Video ID",
      });
    } else {
      this.setState({
        error: "Something went wrong",
      });
    }
  }

  render() {
    const opts = {
      height: "390",
      width: "640",
      playerVars: {
        autoplay: 1,
      },
    };

    return (
      <div>
        <h2>
          <b>YouTube Concert Prep Tool</b>
        </h2>
        {this.state.preview ? (
          <YouTube
            videoId={this.state.videoId}
            opts={opts}
            // onReady={this._onReady}
            onStateChange={this._onStateChange}
            onError={this._onError}
          />
        ) : (
          <div className="YTPlaceHolder">
            Video preview will appear here <br />
            (default: Yummy - Justin Bieber)
          </div>
        )}
        <div>
          www.youtube.com/watch?v={" "}
          <TextField
            id="videoid"
            name="videoid"
            type="text"
            helperText={this.state.error}
            error={!!this.state.error}
            defaultValue={this.state.videoIdTemp}
            onChange={this.handleVideoId}
          />
          {"\xa0\xa0\xa0"}
          <button onClick={this.handlePreview} disabled={this.state.loading}>
            Preview
          </button>
          <br />
          <button onClick={this.handleNext} disabled={!this.state.sync}>
            Next
          </button>
        </div>
        <p>
          This tool splits YouTube videos into looped sections by lyrics. Use it
          to help you memorize songs before your next concert (whether it's
          virtual, or in person, haha)!
        </p>
        <div className="instructions">
          <b>Instructions:</b>
          <br />
          1.{" "}
          <a href={YT_SEARCH_URL} target="_blank">
            Find a YouTube video with closed captions
          </a>
          <br />
          2. Paste the 11-character Video ID above (e.g.
          https://www.youtube.com/watch?v=
          <u>8EJ3zbKTWQ8</u>)
          <br />
          3. Preview the video
          <br />
          4. Press "Next" to begin sectioning the video
        </div>
      </div>
    );
  }
}

export default SetVideoId;
