import React from 'react';
import PropTypes from 'prop-types';

const Task = props => <div className="Task">{props.children}</div>;
Task.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Task;
