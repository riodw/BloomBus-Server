import React, { Component } from 'react';

import Firebase from '../Firebase';

const defaultFirebaseContext = {
  authStatusReported: false,
  isUserSignedIn: false,
};

export const FirebaseAuthContext = React.createContext(defaultFirebaseContext);

export default class FirebaseAuthProvider extends Component {
  constructor(props) {
    super(props);
    this.state = defaultFirebaseContext;
  }

  componentDidMount() {
    Firebase.auth().onAuthStateChanged(user => this.setState({
      authStatusReported: true,
      isUserSignedIn: !!user,
    }));
  }

  render() {
    const { children } = this.props;
    const { authStatusReported, isUserSignedIn } = this.state;
    return (
      <FirebaseAuthContext.Provider value={{ isUserSignedIn, authStatusReported }}>
        {authStatusReported && children}
      </FirebaseAuthContext.Provider>
    );
  }
}
