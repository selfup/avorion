import { h } from 'hyperapp';

export default (str) => {
  const items = str.split(',');

  const list = items.map(item => <li>{item}</li>);

  return (
    <ul>
      {list}
    </ul>
  );
};
