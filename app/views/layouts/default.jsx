import React from 'react';

export default class DefaultLayout extends React.Component {
    render() {
        return (
            <html>
                <head>
                    <title>{this.props.title}</title>
                    <link rel='stylesheet' type='text/css' href='/public/css/style.css' />
                </head>
                <body>{this.props.children}</body>
            </html>
        )
    }
}
