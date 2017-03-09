import React, { Component, cloneElement } from 'react';
import autobind from 'autobind-decorator';

import NavBar from '../components/NavBar/NavBar';

import '../styles/main.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPastEvents: false,
    };
  }

  @autobind
  toggleFilterPastEventsTo(value) {
    this.setState({ showPastEvents: value });
  }

  render() {
    const { showPastEvents } = this.state;
    const childrenWithProps = React.Children.map(this.props.children,
      (child) => {
        if (this.props.children.type.name === 'Dashboard') {
          console.log('no clone');
          return cloneElement(child, { showPastEvents });
        }
        return cloneElement(child);
      });

    return (
      <div>
        <NavBar location={this.props.location} cbFilter={this.toggleFilterPastEventsTo} />
        <main styleName="main">
          {childrenWithProps}
        </main>
      </div>
    );
  }
}

App.propTypes = {
  children: React.PropTypes.element,
  location: React.PropTypes.object.isRequired,
};

export default App;
