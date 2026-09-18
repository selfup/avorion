import { expect } from 'chai';
import Station from '../src/components/Station';
import { findChild, findChildren } from './helpers';

const state = overrides => ({
  name: 'Chemical Factory',
  sells: ['Acid'],
  buys: ['Fabric'],
  ...overrides,
});

describe('Station', () => {
  it('renders the station name', () => {
    const vnode = Station(null, state());

    expect(vnode.name).to.equal('section');
    expect(vnode.props.class).to.equal('stations');
    expect(findChild(vnode, 'h1').children).to.deep.equal(['Chemical Factory']);
  });

  it('renders sells and buys as lists', () => {
    const vnode = Station(null, state({ sells: ['Acid', 'Water'] }));
    const lists = findChildren(vnode, 'ul');

    expect(lists).to.have.length(2);
    expect(lists[0].children.map(li => li.children[0])).to.deep.equal([
      'Acid',
      'Water',
    ]);
    expect(lists[1].children.map(li => li.children[0])).to.deep.equal(['Fabric']);
  });

  it('shows N/A when there are no sells', () => {
    const vnode = Station(null, state({ sells: [] }));

    expect(findChildren(vnode, 'ul')).to.have.length(1);
    expect(vnode.children).to.include('N/A');
  });

  it('shows N/A when there are no buys', () => {
    const vnode = Station(null, state({ buys: [] }));

    expect(findChildren(vnode, 'ul')).to.have.length(1);
    expect(vnode.children).to.include('N/A');
  });
});