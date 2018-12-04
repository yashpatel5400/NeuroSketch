import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { Provider } from 'react-redux';
import { store } from './store';
import { App } from './App';

window.onload = () => {
  const rootEl = document.getElementById('root');
  const render = Component => {
    ReactDOM.render(
      <Provider store={store}>
        <AppContainer>
          <Component />
        </AppContainer>
      </Provider>,
      rootEl
    );
  };

  render(App);
  if (module.hot) module.hot.accept('./App', () => render(App));
};
