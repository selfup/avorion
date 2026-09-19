import { expect } from 'chai';
import Good from '../src/components/Good';
import { findChild, findChildren } from './helpers';

const legalGood = {
  Name: 'Acid',
  Volume: '1',
  'Avg. Price': '402',
  'Sold By': 'Chemical Factory',
  'Bought By': 'Paint Manufacturer',
  'Illegal?': 'no',
  'Dangerous?': 'no',
};

const illegalDangerousGood = {
  Name: 'Slave',
  Volume: '1',
  'Avg. Price': '15000',
  'Sold By': '',
  'Bought By': '',
  'Illegal?': 'yes',
  'Dangerous?': 'yes',
};

describe('Good', () => {
  it('renders the name, volume and average price', () => {
    const vnode = Good(legalGood);

    expect(vnode.name).to.equal('article');
    expect(vnode.props.class).to.equal('card');
    expect(findChild(vnode, 'h1').children).to.deep.equal(['Acid']);
    expect(findChild(vnode, 'p').children).to.deep.equal(['Volume: ', '1']);
    expect(findChildren(vnode, 'p')[1].children).to.deep.equal([
      'Avg Price: ',
      '402',
    ]);
  });

  it('renders sold by and bought by as trader lists', () => {
    const vnode = Good(legalGood);
    const lists = findChildren(vnode, 'ul');

    expect(lists).to.have.length(2);
    expect(lists[0].children.map(li => li.children[0])).to.deep.equal([
      'Chemical Factory',
    ]);
    expect(lists[1].children.map(li => li.children[0])).to.deep.equal([
      'Paint Manufacturer',
    ]);
  });

  it('falls back to "No One" when a trader field is empty', () => {
    const vnode = Good(illegalDangerousGood);
    const lists = findChildren(vnode, 'ul');

    expect(lists[0].children.map(li => li.children[0])).to.deep.equal(['No One']);
    expect(lists[1].children.map(li => li.children[0])).to.deep.equal(['No One']);
  });

  it('labels a legal, safe good as LEGAL and SAFE', () => {
    const vnode = Good(legalGood);
    const labels = findChildren(vnode, 'h5');

    expect(labels.map(h5 => h5.children[0])).to.deep.equal(['LEGAL', 'SAFE']);
    expect(labels.map(h5 => h5.props.class)).to.deep.equal(['bad', 'bad']);
  });

  it('labels an illegal, dangerous good as ILLEGAL and NOT SAFE - DANGEROUS', () => {
    const vnode = Good(illegalDangerousGood);
    const labels = findChildren(vnode, 'h5');

    expect(labels.map(h5 => h5.children[0])).to.deep.equal([
      'ILLEGAL',
      'NOT SAFE - DANGEROUS',
    ]);
    expect(labels.map(h5 => h5.props.class)).to.deep.equal(['good', 'good']);
  });
});