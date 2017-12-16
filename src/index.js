import { app } from 'hyperapp';
import view from './components/Counter';
import goodsData from './../goods';

const findAlikes = (searchTerm) => {
  const match = good => term => good.Name.toLowerCase().includes(term);
  return good => match(good)(searchTerm);
};

const model = {
  state: {
    goods: goodsData,
    results: goodsData.map(e => e),
  },
  actions: {
    search: ({ target }) => ({ goods }) => {
      const searchTerm = target.value.trim().toLowerCase();

      const results = goods.filter(findAlikes(searchTerm));

      return { results };
    },
  },
};

const {
  actions: dispatch,
} = app(
  model,
  view,
  document.body,
);
