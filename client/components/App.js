import React from 'react';

import NavBar from '../components/NavBar/NavBar';
import '../styles/main.css';

const App = props => (
  <div>
    <NavBar location={props.location} />
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
