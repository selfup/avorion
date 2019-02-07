import { h } from 'hyperapp';
import Traders from './Traders';

export default result => {
  const legal = result['Illegal?'] === 'no' ? 'LEGAL' : 'ILLEGAL';

  const dangerous =
    result['Dangerous?'] === 'no' ? 'SAFE' : 'NOT SAFE - DANGEROUS';

  const soldBy = result['Sold By'] ? result['Sold By'] : 'No One';

  const boughtBy = result['Bought By'] ? result['Bought By'] : 'No One';

  return (
    <article class="card">
      <h1>{result.Name}</h1>
      <p>Volume: {result.Volume}</p>
      <p>Avg Price: {result['Avg. Price']}</p>

      <h4>Sold By</h4>
      {Traders(soldBy)}

      <h4>Bought By</h4>
      {Traders(boughtBy)}

      <h5 class={legal === 'LEGAL' ? 'bad' : 'good'}>{legal}</h5>
      <h5 class={dangerous === 'SAFE' ? 'bad' : 'good'}>{dangerous}</h5>
    </article>
  );
};
