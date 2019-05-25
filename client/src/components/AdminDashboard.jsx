import React, { Component } from 'react';
import {
  Route, Switch, NavLink, withRouter,
} from 'react-router-dom';

import logo from '../bloombus-text-logo.svg';

import Task from './Task.jsx';
import Index from './Index.jsx';
import EditGeometry from './EditGeometry.jsx';
import PostStatusAlert from './PostStatusAlert.jsx';

const tasks = [
  {
    path: '/edit-geometry',
    displayText: 'Edit Geometry',
    component: EditGeometry,
  },
  {
    path: '/post-status-alert',
    displayText: 'Post Status Alert',
    component: PostStatusAlert,
  },
];

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
            {tasks.map(task => (
              <li key={task.path}>
                <NavLink to={`/admin-dashboard${task.path}`} isActive={isActive.bind(this, task.path)}>
                  {task.displayText}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <Task>
          <Switch>
            <Route exact path="/admin-dashboard" component={Index} />
            {tasks.map(task => <Route key={task.path} path={`/admin-dashboard${task.path}`} component={task.component} />)}
          </Switch>
        </Task>
      </div>
    );
  }
}

export default withRouter(AdminDashboard);
