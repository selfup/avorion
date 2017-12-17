import { h } from 'hyperapp';
import Good from './Good';
import Station from './Station';

const resultsLoader = Comp =>
  (results, data) =>
    results.map(result => Comp(result, data));

const goodInput = handler => (
  <input
    onkeyup={handler}
    placeholder="type stuff here"
  />
);

const stationInput = handler => (
  <input
    onkeyup={handler}
    placeholder="type stuff here"
  />
);

export default ({
  state: {
    goodSearch,
    results,
    sells,
    buys,
    name,
  },
  actions: {
    searchGoods,
    searchStations,
    bitFlip,
  },
}) =>
  <div class="counter">
    <h3>Filter {goodSearch ? 'Goods' : 'Stations'}</h3>

    <br />
    <button onclick={bitFlip}>
      {
        goodSearch
          ? 'Switch to Station Search by name'
          : 'Switch to Good search by name'
      }
    </button>
    <br />
    <br />

    {goodSearch ? goodInput(searchGoods) : stationInput(searchStations)}

    <section>
      {
        goodSearch
          ? resultsLoader(Good)(results, null)
          : resultsLoader(Station)([null], { name, sells, buys })
      }
    </section>
  </div>;
