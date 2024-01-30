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
          width={1000}
          height={1000}
          fontFamily="Arial"
          data={[
            {
              src: "/icon.jpeg",
              label: "Kirby",
              value: 4000000,
            },
            // {
            //    src: "/icon.jpeg",
            //   label: "API",
            //   value: 500000,
            // },
            // {
            //    src: "/icon.jpeg",
            //   label: "Data",
            //   value: 1500000,
            // },
            // {
            //    src: "/icon.jpeg",
            //   label: "Commerce",
            //   value: 30000,
            // },
            // {
            //    src: "/icon.jpeg",
            //   label: "AI",
            //   value: 70000,
            // },
            // {
            //    src: "/icon.jpeg",
            //   label: "Management",
            //   value: 500000,
            // },
            // {
            //    src: "/icon.jpeg",
            //   label: "Mobile",
            //   value: 70000,
            // },
            // {
            //    src: "/icon.jpeg",
            //   label: "Conversion",
            //   value: 70000,
            // },
          ]}
        />
      </div>
    );
  }
}

export default App;
