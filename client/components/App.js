import React from 'react';

import NavbarContainer from './NavbarContainer';

import '../styles/main.css';

const App = props => (
  <div>
    <NavbarContainer location={props.location} />
    <main styleName="main">
      {props.children}
    </main>
  </div>
);

App.propTypes = {
  children: React.PropTypes.element,
  location: React.PropTypes.shape({
    pathname: React.PropTypes.string.isRequired,
  }),
};

export default App;

