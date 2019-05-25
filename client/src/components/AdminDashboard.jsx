import React, { Component } from 'react';
import { Route, NavLink, withRouter } from 'react-router-dom';

import logo from '../bloombus-text-logo.svg';

import Index from './Index';
import EditGeometry from './EditGeometry';
import PostStatusAlert from './PostStatusAlert';

class AdminDashboard extends Component {
  render() {
    const isActive = (path, match, location) => !!(match || path === location.pathname);
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <span className="App-header__title">Admin Dashboard</span>
        </header>
        <nav className="App-nav">
          <span className="App-nav__heading">Tasks</span>
          <ul>
            {/* https://github.com/ReactTraining/react-router/issues/6201 */}
            <li><NavLink to="/admin-dashboard/edit-geometry" isActive={isActive.bind(this, '/edit-geometry')}>Edit Geometry</NavLink></li>
            <li><NavLink to="/admin-dashboard/post-status-alert" isActive={isActive.bind(this, '/post-status-alert')}>Post Status Alert</NavLink></li>
          </ul>
        </nav>
        <Route exact path="/admin-dashboard" component={Index} />
        <Route path="/admin-dashboard/edit-geometry" component={EditGeometry} />
        <Route path="/admin-dashboard/post-status-alert" component={PostStatusAlert} />
      </div>
    );
  }
}

export default withRouter(AdminDashboard);
