import React, { Component } from 'react';
import Navbar from './component/layout/Navbar';
import Footer from './component/layout/Footer';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Navbar />
        <h1>Hello...tesing the react app!!</h1>
        <Footer />
      </div>
    );
  }
}

export default App;
