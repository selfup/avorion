import { h } from 'hyperapp';

export default (str) => {
  if (str === 'No One') {
    return str;
  }

  const items = str.split(',');

  const list = items.map(item => <li>{item}</li>);

  return (
    <ul>
      {list}
    </ul>
  );
};
