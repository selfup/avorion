const fs = require('fs');

const headers = fs.readFileSync('./raw_wiki_info/headers.txt', 'utf-8');

const goodKeys = {};

const parsedHeaders = headers
  .split('\n')
  .map(e => e.split('! ')[1])
  .filter(e => !!e);

parsedHeaders.forEach(e => (goodKeys[e] = {}));

const values = fs.readFileSync('./raw_wiki_info/values.txt', 'utf-8');

const parsedGoods = values.split('|-').map(e => {
  const extractValues = e
    .split('\n')
    .filter(f => !!f)
    .map(e => e.split('|')[1]);

  const object = { ...goodKeys };

  extractValues.forEach((value, idx) => {
    const cleanedValue =
      value.includes('[[') || value.includes(']]')
        ? value
            .split('[[')
            .join('')
            .split(']]')
            .join('')
        : value;

    switch (idx) {
      case 0:
        object.Name = cleanedValue;
        break;
      case 1:
        object.Volume = cleanedValue;
        break;
      case 2:
        object['Avg. Price'] = cleanedValue;
        break;
      case 3:
        object['Sold By'] = cleanedValue;
        break;
      case 4:
        object['Bought By'] = cleanedValue;
        break;
      case 5:
        object['Illegal?'] = cleanedValue;
        break;
      case 6:
        object['Dangerous?'] = cleanedValue;
        break;
      default:
        break;
    }
  });

  return object;
});

const jsFile = `export default ${JSON.stringify(parsedGoods)}`;

fs.writeFileSync('goods.js', jsFile, 'utf-8');
