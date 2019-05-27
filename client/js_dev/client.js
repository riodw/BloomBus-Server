import React from "react";
import ReactDOM from "react-dom";
import { Router, Route, IndexRoute, hashHistory} from "react-router";

import Layout from "./pages/Layout";
import AllBusses from "./pages/AllBusses";

const app = document.getElementById('app');

ReactDOM.render(
   <Router history={hashHistory}>
      <Route path="/" component={Layout}>
         <IndexRoute component={AllBusses}></IndexRoute>
         
      </Route>
      
   </Router>,
app);