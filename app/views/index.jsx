import React from 'react';
import DefaultLayout from "./layouts/default";

export default class Main extends React.Component {
  render() {
    return (
      <DefaultLayout title="Lets Meet">
        <h1>Hello Twitch</h1>
      </DefaultLayout>
    );
  }
}
