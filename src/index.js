import { app } from 'hyperapp';
import view from './components/App';
import goodsData from './../goods';

const findAlikes = (searchTerm) => {
  const match = good => term => good.Name.toLowerCase().includes(term);
  return good => match(good)(searchTerm);
};

const model = {
  state: {
    goods: goodsData,
    results: goodsData.map(e => e),
    goodSearch: true,
    sells: [],
    buys: [],
    name: '',
  },
  actions: {
    searchGoods: ({ target }) => ({ goods }) => {
      const searchTerm = target.value.trim().toLowerCase();
      const results = goods.filter(findAlikes(searchTerm));

      return { results };
    },
    searchStations: ({ target }) => ({ goods }) => {
      const searchTerm = target.value.trim().toLowerCase();

      if (searchTerm === '') {
        return {
          name: '',
          sells: [],
          buys: [],
        };
      }

      const sells = [];
      const buys = [];
      const names = [];

      goods.forEach((good) => {
        const soldByStations = good['Sold By'].toLowerCase();
        const boughtByStations = good['Bought By'].toLowerCase();

        if (soldByStations.includes(searchTerm)) {
          sells.push(good.Name);

          soldByStations.split(',')
            .forEach((station) => {
              if (station.includes(searchTerm)) {
                if (!names.includes(station)) names.push(station);
              }
            });
        }

        if (boughtByStations.split(',').includes(searchTerm)) {
          buys.push(good.Name);

          boughtByStations.split(',')
            .forEach((station) => {
              if (station.includes(searchTerm)) {
                if (!names.includes(station)) names.push(station);
              }
            });
        }
      });

      return { name: names.join(', '), sells, buys };
    },
    bitFlip: () => ({ goodSearch }) => ({ goodSearch: !goodSearch }),
  },
};

const {
  actions: dispatch,
} = app(
  model,
  view,
  document.body,
);
