import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Redirect } from "react-router-dom";

import "./App.css";
import Home from "./pages/Home";
import SetSections from "./pages/SetSections";
import SetVideoId from "./pages/SetVideoId";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      duration: null,
      videoId: null,
      sections: null,
    };
    this.setDuration = this.setDuration.bind(this);
    this.setVideoId = this.setVideoId.bind(this);
    this.resetVideoId = this.resetVideoId.bind(this);
    this.setSections = this.setSections.bind(this);
    this.resetSections = this.resetSections.bind(this);
  }

  setDuration(duration) {
    this.setState({
      duration: duration,
    });
  }

  setVideoId(videoId) {
    this.setState({
      videoId: videoId,
    });
  }

  resetVideoId() {
    this.setState({
      videoId: null,
      sections: null,
    });
  }

  setSections(sections) {
    this.setState({
      sections: sections,
    });
  }

  resetSections() {
    this.setState({
      sections: null,
    });
  }

  render() {
    return (
      <div className="App">
        <Router>
          <div className="container">
            <Switch>
              <Route exact path="/">
                {!!this.state.videoId && !!this.state.sections ? (
                  <Home
                    videoId={this.state.videoId}
                    duration={this.state.duration}
                    sections={this.state.sections}
                    resetVideoId={this.resetVideoId}
                    resetSections={this.resetSections}
                  />
                ) : (
                  <Redirect to="/video" />
                )}
              </Route>
              <Route exact path="/video">
                {!this.state.videoId ? (
                  <SetVideoId
                    setVideoId={this.setVideoId}
                    setDuration={this.setDuration}
                  />
                ) : (
                  <Redirect to="/sections" />
                )}
              </Route>
              <Route exact path="/sections">
                {!!this.state.videoId ? (
                  !this.state.sections ? (
                    <SetSections
                      videoId={this.state.videoId}
                      duration={this.state.duration}
                      setSections={this.setSections}
                      resetVideoId={this.resetVideoId}
                    />
                  ) : (
                    <Redirect to="/" />
                  )
                ) : (
                  <Redirect to="/video" />
                )}
              </Route>
            </Switch>
          </div>
        </Router>
      </div>
    );
  }
}

export default App;
