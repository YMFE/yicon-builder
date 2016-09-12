import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Router, browserHistory } from 'react-router';
import routes from './routes';
import { Provider, connect } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';
import createStore from './reducer';

import DevTools from './containers/DevTools/DevTools';
import './helpers/polyfill';

const initialState = window.__INITIAL_STATE__;
const store = createStore(initialState);
const container = document.getElementById('app');
const history = syncHistoryWithStore(browserHistory, store);

@connect(
  state => ({ devTools: state.setting.devTools })
)
class DevToolsContainer extends Component {
  render() {
    return (
      <div>
        {this.props.devTools && <DevTools />}
      </div>
    );
  }
}

DevToolsContainer.propTypes = {
  devTools: PropTypes.bool,
};

if (process.env.NODE_ENV === 'development') {
  window.React = React; // enable debugger
}

const createElement = ({ dispatch }) => (Comp, props) => {
  const fetchHandler = Comp.fetchServerData;
  if (typeof fetchHandler === 'function') {
    fetchHandler(dispatch, props);
  }

  return <Comp {...props} />;
};

ReactDOM.render(
  <Provider store={store} key="provider">
    <div>
      <Router
        createElement={createElement(store)}
        history={history}
      >
        {routes(store)}
      </Router>
      <DevToolsContainer />
    </div>
  </Provider>,
  container
);
