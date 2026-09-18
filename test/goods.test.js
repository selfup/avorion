import { expect } from 'chai';
import goods from '../goods';

const FIELDS = [
  'Name',
  'Volume',
  'Avg. Price',
  'Sold By',
  'Bought By',
  'Illegal?',
  'Dangerous?',
];

describe('goods data', () => {
  it('exposes a non-empty list of goods', () => {
    expect(goods).to.be.an('array');
    expect(goods).to.have.length.greaterThan(0);
  });

  it('gives every good the full set of fields', () => {
    goods.forEach(good => {
      expect(good, good.Name).to.have.all.keys(FIELDS);
    });
  });

  it('gives every good a non-empty name', () => {
    goods.forEach(good => {
      expect(good.Name, 'every good needs a name').to.be.a('string').and.not.be
        .empty;
    });
  });

  it('has a unique name per good', () => {
    const names = goods.map(good => good.Name);

    expect(new Set(names).size).to.equal(names.length);
  });

  it('records illegal and dangerous flags as yes/no', () => {
    goods.forEach(good => {
      expect(good['Illegal?'], `${good.Name} Illegal?`).to.be.oneOf(['yes', 'no']);
      expect(good['Dangerous?'], `${good.Name} Dangerous?`).to.be.oneOf([
        'yes',
        'no',
      ]);
    });
  });
});