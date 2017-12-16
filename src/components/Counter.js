import { h } from 'hyperapp';

/**
 * first object in the store is 'state' (an object - {})
 * second object in the store is 'actions' (an object - {})
 * here we destructure what is needed
 * 'num' from 'state' and 'add'/'sub' from 'actions'
 */
const resultsLoader = results =>
  results.map((result) => {
    const legal = result['Illegal?'] === 'no' ? 'LEGAL' : 'ILLEGAL';
    const dangerous = result['Dangerous?'] === 'no' ? 'SAFE' : 'NOT SAFE - DANGEROUS';
    const soldBy = result['Sold By'] ? result['Sold By'] : 'No One'; 

    return (
      <article>
        <h1>{result.Name}</h1>
        <p>Volume: {result.Volume}</p>
        <p>Avg Price: {result['Avg. Price']}</p>
        <h4>Sold By: {soldBy}</h4>
        <h4>Bought By: {result['Bought By']}</h4>
        <h4 class={legal === 'LEGAL' ? 'add' : 'sub'}>{legal}</h4>
        <h4 class={dangerous === 'SAFE' ? 'add' : 'sub'}>{dangerous}</h4>
      </article>
    );
  });

export default ({
  state: { results },
  actions: { search },
}) => {
  if (results.length > 0) {
    return (
      <div class="counter">
        <h3>Search for Good</h3>
        <input onkeyup={search} />
        <br />
        <hr />
        <section>
         {resultsLoader(results)}
        </section>
      </div>
    );
  }

  return (
    <div class="counter">
      <h3>Search for Good</h3>
      <input onkeyup={search} />
      <br />
      <hr />
    </div>
  );
};

