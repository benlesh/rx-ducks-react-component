import { Component } from 'react';
import { rxDucksMiddleware } from 'rx-ducks-middleware';
import { Subscription } from 'rxjs/Subscription';
import { createStore, applyMiddleware } from 'redux';

export class RxDucksComponent extends Component {
  constructor(props) {
    super(props);
    this._rxducks = rxDucksMiddleware();
  }

  get store() {
    if (!this._store) {
      this._store = createStore(this.stateReducer, applyMiddleware(this._rxducks.middleware));
    }
    return this._store;
  }

  componentDidMount() {
    const { actions, send } = this._rxducks;
    const { store } = this;
    const subscription = new Subscription();
    subscription.add(this.interactions()
      .subscribe(action => store.dispatch(action)));
    subscription.add(this.sideEffects(actions)
      .subscribe(send));
    this._rxducks_sub = subscription;
  }

  componentDidUnmount() {
    this._rxducks_sub.unsubscribe();
  }
}
