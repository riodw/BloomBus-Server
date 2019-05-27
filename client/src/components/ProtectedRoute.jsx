import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import { FirebaseAuthContext } from './FirebaseAuthContext';

class ProtectedRoute extends Component {
  render() {
    const { component: Component, ...props } = this.props;
    return (
      <FirebaseAuthContext.Consumer>
        {
          ({ isUserSignedIn }) => {
            if (isUserSignedIn) {
              return <Component {...props} />;
            }
            return <Redirect to="/login" />;
          }
        }
      </FirebaseAuthContext.Consumer>
    );
  }
}

export default ProtectedRoute;
