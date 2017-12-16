import { app } from 'hyperapp';
import actions from './actions';
import state from './state';
import view from './components/Counter';
import goods from './../goods';

const model = {
  state: Object.assign({}, state, { goods }),
  actions,
};

const {
  actions: dispatch,
} = app(
  model,
  view,
  document.body,
);
