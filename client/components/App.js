import React, { Component, cloneElement } from 'react';
import autobind from 'autobind-decorator';

import NavBar from '../components/NavBar/NavBar';

import '../styles/main.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterPastEvents: false,
    };
  }

  @autobind
  toggleFilterPastEventsTo(value) {
    console.log('toggleFilterPastEventsTo', value);
    this.setState({ filterPastEvents: value });
  }

  render() {
    const { filterPastEvents } = this.state;
    const childrenWithProps = React.Children.map(this.props.children,
      (child) => {
        if (this.props.children.type.name === 'Dashboard') {
          return cloneElement(child, { filterPastEvents });
        } else {
          return cloneElement(child);
        }
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
