import { app } from 'hyperapp';
import view from './components/App';
import goodsData from './../goods';

const findAlikes = searchTerm => {
  const match = good => term => good.Name.toLowerCase().includes(term);
  return good => match(good)(searchTerm);
};

const state = {
  goods: goodsData,
  results: goodsData.map(e => e),
  goodSearch: true,
  sells: [],
  buys: [],
  name: '',
};

const actions = {
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

    goods.forEach(good => {
      const soldByStations = good['Sold By'].toLowerCase();
      const boughtByStations = good['Bought By'].toLowerCase();

      if (soldByStations.includes(searchTerm)) {
        sells.push(good.Name);

        soldByStations.split(', ').forEach(station => {
          if (station.includes(searchTerm)) {
            names.push(station);
          }
        });
      }

      if (boughtByStations.includes(searchTerm)) {
        buys.push(good.Name);

        boughtByStations.split(', ').forEach(station => {
          if (station.includes(searchTerm)) {
            names.push(station);
          }
        });
      }
    });

    const uniqueNames = Array.from(new Set(names));

    return {
      name: uniqueNames.join(', '),
      sells,
      buys,
    };
  },
  bitFlip() {
    return ({ goodSearch }) => ({ goodSearch: !goodSearch });
  },
};

app(state, actions, view, document.body);
