import { expect } from 'chai';
import { parseGoodsPage, parseStationPage } from '../fetchGoods';

const goodsTable = `
== List of Trading Goods ==
{| class="wikitable sortable"
! Good
! Price per 1 Volume
! Price
! Volume
! Level
! Importance
! Illegal
! Dangerous
|-
| [[File:oxygen.png|x16px]] [[Oxygen]]
| align="right" | 80
| align="right" | 80
| align="right" | 1
| align="right" | 0
| align="right" | 6
| <span style="color:#FF0000">No</span>
| <span style="color:#FF0000">No</span>
|-
| [[File:gun.png|x16px]] <span style="color:#FFFF00">Gun</span>
| align="right" | 2464
| align="right" | 1232
| align="right" | 0.5
| align="right" | 6
| align="right" | 1
| <span style="color:#FF0000">No</span>
| <span style="color:#00FF00">Yes</span>
|}
`;

describe('parseGoodsPage', () => {
  it('reads name, volume, price and legality from the goods table', () => {
    const goods = parseGoodsPage(goodsTable);

    expect(goods).to.deep.equal([
      {
        Name: 'Oxygen',
        Volume: '1',
        'Avg. Price': '80',
        'Illegal?': 'no',
        'Dangerous?': 'no',
      },
      {
        Name: 'Gun',
        Volume: '0.5',
        'Avg. Price': '1232',
        'Illegal?': 'no',
        'Dangerous?': 'yes',
      },
    ]);
  });
});

const production = `
== Production ==
This factory produces the following resources per cycle: <br />
{| class="wikitable"
! style="text-align:left;"| Name
! Quantity
! Volume
! Avg. Price
! Illegal?
! Dangerous?
|-
|Steel
|6
|1
|277
|No
|No
|}
`;

const materials = `
== Production Materials ==
These factories require the following resources to complete a cycle:<br />
{| class="wikitable"
! style="text-align:left;"| Name
! Quantity
! Volume
! Avg. Price
! Sold By
! Illegal?
! Dangerous?
|-
|Coal
|4
|2
|200
|[[Coal Mine]]
|No
|No
|}
`;

describe('parseStationPage', () => {
  it('treats a table without a supplier column as production', () => {
    const { produces, consumes } = parseStationPage(production);

    expect([...produces]).to.deep.equal(['Steel']);
    expect([...consumes]).to.deep.equal([]);
  });

  it('treats a table with a Sold By column as consumed materials', () => {
    const { produces, consumes } = parseStationPage(materials);

    expect([...produces]).to.deep.equal([]);
    expect([...consumes]).to.deep.equal(['Coal']);
  });

  it('reads mine Goods Used bullets as consumed goods', () => {
    const wt = `
== Ore Mine ==

== Goods Used ==
This mine uses the following goods which can be sold to the mine:

* Acid, Drills, Medical Supplies, Solvent
`;

    const { produces, consumes } = parseStationPage(wt);

    expect([...produces]).to.deep.equal([]);
    expect([...consumes]).to.deep.equal([
      'Acid',
      'Drills',
      'Medical Supplies',
      'Solvent',
    ]);
  });

  it('reads consumer-station Goods bullets as consumed goods', () => {
    const wt = `
== Casino ==

== Goods ==

This station will purchase the following goods:

:*[[Brewery|Beer]]
:*[[Wine_Factory|Wine]]
:*[[Food_Factory|Food]]
`;

    const { consumes } = parseStationPage(wt);

    expect([...consumes]).to.deep.equal(['Beer', 'Wine', 'Food']);
  });

  it('does not treat a Manufacturing Process bullet list as a purchase', () => {
    const wt = `
== Coal Mine ==

===Station Manufacturing Process===
Goods produced at this type of station are used in the following applications:

:[[Steel Factory]], [[Biotope]]
`;

    const { produces, consumes } = parseStationPage(wt);

    expect([...produces]).to.deep.equal([]);
    expect([...consumes]).to.deep.equal([]);
  });

  it('reads nested Type subsections under Production', () => {
    const wt = `
==Production==
====Type 1====
{| class="wikitable"
! Name
! Quantity
! Volume
! Avg. Price
! Illegal?
! Dangerous?
|-
|Helium
|1
|1
|50
|No
|No
|}
====Type 2====
{| class="wikitable"
! Name
! Quantity
! Volume
! Avg. Price
! Illegal?
! Dangerous?
|-
|Oxygen
|8
|1
|80
|No
|No
|}
`;

    const { produces } = parseStationPage(wt);

    expect([...produces]).to.deep.equal(['Helium', 'Oxygen']);
  });
});