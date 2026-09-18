import { expect } from 'chai';
import Traders from '../src/components/Traders';
import { findChildren } from './helpers';

const itemTexts = vnode => findChildren(vnode, 'li').map(li => li.children[0]);

describe('Traders', () => {
  it('renders a ul with one li per comma-separated value', () => {
    const vnode = Traders('Chemical Factory, Rubber Factory');

    expect(vnode.name).to.equal('ul');
    expect(itemTexts(vnode)).to.deep.equal([
      'Chemical Factory',
      ' Rubber Factory',
    ]);
  });

  it('renders a single li for a single value', () => {
    const vnode = Traders('Steel Factory');

    expect(itemTexts(vnode)).to.deep.equal(['Steel Factory']);
  });

  it('renders a single empty li for an empty string', () => {
    const vnode = Traders('');

    expect(itemTexts(vnode)).to.deep.equal(['']);
  });
});