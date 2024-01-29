import React, { Component } from 'react';
import logo from './logo.svg';

import BubbleChart from './module/index';

import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <h1 className="App-intro">Example of 'react-bubble-chart-d3' Component.</h1>
        <br />
        <BubbleChart
          width={800}
          height={800}
          fontFamily="Arial"
          data={[
            {
              src: "/path.svg",
              label: "Kirby",
              value: 4000000,
            },
            {
              src: "",
              label: "API",
              value: 500000,
            },
            {
              src: " ",
              label: "Data",
              value: 1500000,
            },
            {
              src: " ",
              label: "Commerce",
              value: 30000,
            },
            {
              src: " ",
              label: "AI",
              value: 70000,
            },
            {
              src: " ",
              label: "Management",
              value: 500000,
            },
            {
              src: " ",
              label: "Mobile",
              value: 70000,
            },
            {
              src: " ",
              label: "Conversion",
              value: 70000,
            },
          ]}
        />
      </div>
    );
  }
}

export default App;
