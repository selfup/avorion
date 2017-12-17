import { h } from 'hyperapp';
import Good from './Good';

const resultsLoader = results => results.map(Good);

export default ({
  state: { results },
  actions: { search },
}) =>
  <div class="counter">
    <h3>Filter Goods</h3>
    <input onkeyup={search} placeholder="type stuff here" />
    <section>
      {resultsLoader(results)}
    </section>
  </div>;
