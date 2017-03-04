import React from 'react';

import ToolBar from '../components/ToolBar';
import '../styles/main.css';

const App = props => (
  <div>
    <ToolBar location={props.location} />
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
