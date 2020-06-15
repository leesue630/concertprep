import YouTube from "react-youtube";
import React, { Component } from "react";
import TextField from "@material-ui/core/TextField";

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
    this._onReady = this._onReady.bind(this);
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

  _onReady(e) {
    this.setState({
      duration: e.target.getDuration(),
      loading: false,
      sync: true,
    });
  }

  _onError(e) {
    console.log(e.data);
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
        origin: "http://localhost:3000/",
      },
    };

    return (
      <div className="centered">
        {this.state.preview ? (
          <YouTube
            videoId={this.state.videoId}
            opts={opts}
            onReady={this._onReady}
            onError={this._onError}
          />
        ) : (
            <div className="YTPlaceHolder">Video preview will appear here</div>
        )}
        <div>
          Video ID{" "}
          <TextField
            id="videoid"
            name="videoid"
            type="text"
            helperText={this.state.error}
            error={!!this.state.error}
            defaultValue={this.state.videoIdTemp}
            onChange={this.handleVideoId}
          />
          <button onClick={this.handlePreview} disabled={this.state.loading}>
            Preview
          </button>
          <br />
          <button onClick={this.handleNext} disabled={!this.state.sync}>
            Next
          </button>
        </div>
      </div>
    );
  }
}

export default SetVideoId;
