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
    console.log('toggleFilterPastEventsTo no App', value);
    this.setState({ showPastEvents: value });
  }

  render() {
    const { showPastEvents } = this.state;
    const childrenWithProps = React.Children.map(this.props.children,
      (child) => {
         console.log('no clone do App', this.props.children);
        if (this.props.children.type.name === 'Dashboard') {
          console.log('no clone do App com achei o Dashboard');
          return cloneElement(child, { showPastEvents });
        }
        return child;
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
