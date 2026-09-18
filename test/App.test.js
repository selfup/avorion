import { expect } from 'chai';
import App from '../src/components/App';
import { findChild, findChildren } from './helpers';

const actions = {
  searchGoods: () => {},
  searchStations: () => {},
  bitFlip: () => {},
};

const goodsState = {
  goodSearch: true,
  results: [
    { Name: 'Acid', 'Illegal?': 'no', 'Dangerous?': 'no' },
    { Name: 'Coal', 'Illegal?': 'no', 'Dangerous?': 'no' },
  ],
  sells: [],
  buys: [],
  name: '',
};

const stationsState = {
  goodSearch: false,
  results: [],
  sells: ['Acid'],
  buys: ['Fabric'],
  name: 'Chemical Factory',
};

describe('App', () => {
  it('defaults to goods mode and renders a Good card per result', () => {
    const vnode = App(goodsState, actions);

    expect(findChild(vnode, 'h3').children).to.deep.equal(['Filter ', 'Goods']);
    expect(
      findChild(vnode, 'button').children,
    ).to.deep.equal(['Switch to Station Search by name']);
    const section = findChild(vnode, 'section');
    expect(findChildren(section, 'article')).to.have.length(2);
  });

  it('wires the search input to searchGoods in goods mode', () => {
    const vnode = App(goodsState, actions);

    expect(findChild(vnode, 'input').props.onkeyup).to.equal(
      actions.searchGoods,
    );
  });

  it('renders stations mode with a Station section and searchStations input', () => {
    const vnode = App(stationsState, actions);

    expect(findChild(vnode, 'h3').children).to.deep.equal([
      'Filter ',
      'Stations',
    ]);
    expect(findChild(vnode, 'button').children).to.deep.equal([
      'Switch to Good Search by name',
    ]);
    expect(findChild(vnode, 'input').props.onkeyup).to.equal(
      actions.searchStations,
    );
    const section = findChild(vnode, 'section');
    expect(findChildren(section, 'article')).to.have.length(0);
    expect(findChild(section, 'section').props.class).to.equal('stations');
  });

  it('wires the toggle button to bitFlip', () => {
    const vnode = App(goodsState, actions);

    expect(findChild(vnode, 'button').props.onclick).to.equal(actions.bitFlip);
  });
});