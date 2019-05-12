import React from 'react';
import { Route, Switch } from 'react-router';
 
export default (
  <Switch>
    <Route path="/" exact />
    <Route path="/about" />
    <Route path="/cookie" />
    <Route path="/donations" />
    <Route path="/help" />
    <Route path="/privacy" />
    <Route path="/terms" />
    <Route path="/verify-email" />
    <Route path="/password-reset" />
    <Route path="/login" />
    <Route path="/signup" />
    <Route path="/author/:aid" />
    <Route path="/genres" />
    <Route path="/authors" />
    <Route path="/collection/:cid" />
    <Route path="/genre/:gid" />
    <Route path="/book/:bid" />
    <Route path="/dashboard/:uid" exact />
    <Route path="/dashboard/:uid/:tab" />
    <Route path="/icons" />
    <Route path="/books/add" />
    <Route path="/new-book" />
    <Route path="/notifications" />
    <Route path="/profile" exact />
    <Route path="/challenge" />
    <Route path="/challenges" />
  </Switch>
);