/* globals describe, it */
import { RxDucksComponent } from '../';
import { expect } from 'chai';

import { Subject } from 'rxjs/Subject';
import { filter } from 'rxjs/operator/filter';
import { map } from 'rxjs/operator/map';

describe('RxDucksComponent', () => {
  it('should exist', () => {
    expect(RxDucksComponent).to.be.a('function');
  });

  it('should set up middleware', () => {
    class MyComponent extends RxDucksComponent {
    }

    let comp = new MyComponent();
    expect(comp._rxducks).to.be.a('object');
  });

  it('integration 1', () => {
    const reducedActions = [];

    class MyComponent extends RxDucksComponent {
      clicks = new Subject();

      interactions() {
        return this.clicks;
      }

      sideEffects(actions) {
        return actions::filter(({ type }) => type === 'CLICK')
          ::map((_, index) => ({ type: 'CLICKED', index }));
      }

      stateReducer(state, action) {
        reducedActions.push(action);
      }

      clickMe() {
        this.clicks.next({ type: 'CLICK' });
      }

      render() {
        return (<button onClick={this.clickMe.bind(this)}>click me</button>);
      }
    }

    let comp = new MyComponent();

    expect(comp._rxducks_sub).to.be.a('undefined');
    expect(comp._rxducks).to.be.a('object');

    comp.componentDidMount();
    expect(comp._rxducks_sub.unsubscribe).to.be.a('function');
    expect(comp._rxducks_sub.isUnsubscribed).to.equal(false);

    comp.clickMe();
    comp.clickMe();

    expect(reducedActions).to.deep.equal([{ type: '@@redux/INIT' }, { type: 'CLICKED', index: 0 }, { type: 'CLICKED', index: 1 }]);

    comp.componentDidUnmount();

    expect(comp._rxducks_sub.isUnsubscribed).to.equal(true);
  });
});
