import React from 'react';

import Navbar from './Navbar';

import '../styles/main';

const App = (props) => (
  <div>
    <Navbar />
    <main styleName="main">
      {props.children}
    </main>
  </div>
);

App.propTypes = {
  children: React.PropTypes.element,
};

export default App;
