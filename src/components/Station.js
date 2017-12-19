import { h } from 'hyperapp';

export default (_result, { name, sells, buys }) => {
  const sellItems = sells.map(item => <li>{item}</li>);
  const buyItems = buys.map(item => <li>{item}</li>);

  return (
    <section class="stations">
      <h1>{name}</h1>
      <h4>Sells:</h4>
      {(sellItems.length > 0) ? <ul>{sellItems}</ul> : 'N/A'}

      <h4>Buys</h4>
      {(buyItems.length > 0) ? <ul>{buyItems}</ul> : 'N/A'}
    </section>
  );
};
