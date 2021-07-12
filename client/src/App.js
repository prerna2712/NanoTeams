import React from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import CreateRoom from "./routes/CreateRoom";
import Room from "./routes/Room";
// adding for auth
import { AuthProvider } from './contexts/AuthContext'
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import Signup from './components/Signup';
import Home from './components/Home'
// ends for auth
import './App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
        <Switch>
          {/* added for auth */}
          <Route path="/" exact component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          {/* ends for auth */}
          <PrivateRoute exact path="/create" component={CreateRoom} />
          <PrivateRoute path="/room/:roomID" component={Room} />
        </Switch>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
