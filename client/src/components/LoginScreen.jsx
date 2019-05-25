import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';

import Firebase from '../Firebase.js';

class LoginScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: 'acmbloomsburg@gmail.com',
      password: 'Thisisapassword',
    };

    this.onEmailInputChange = this.onEmailInputChange.bind(this);
    this.onPasswordInputChange = this.onPasswordInputChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onEmailInputChange(event) {
    this.setState({ email: event.target.value });
  }

  onPasswordInputChange(event) {
    this.setState({ password: event.target.value });
  }

  async onSubmit(event) {
    try {
      await Firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password);
      this.props.history.push('/admin-dashboard');
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    return (
      <Fragment>
        <h1>I'm a login screen.</h1>
        <input type="text" value={this.state.email} onChange={this.onEmailInputChange} />
        <input type="password" value={this.state.password} onChange={this.onPasswordInputChange} />
        <button type="submit" onClick={this.onSubmit}>Submit</button>
      </Fragment>
    );
  }
}

export default withRouter(LoginScreen);
