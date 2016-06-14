import React from 'react';

import Navbar from './Navbar';

import '../styles/main.css';

const App = (props) => (
  <div>
    <Navbar location={props.location} />
    <main styleName="main">
      {props.children}
    </main>
  </div>
);

App.propTypes = {
  children: React.PropTypes.element,
  location: React.PropTypes.object.isRequired,
};

export default App;
