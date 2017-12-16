// Example API response

/**
 * {
        "Name": "Acid",
        "Volume": "1",
        "Avg. Price": "402",
        "Sold By": "Chemicals Factory, Rubber Factory",
        "Bought By": "Explosive Charge Factory, Paint Manufacturer",
        "Illegal?": "no",
        "Dangerous?": "no"
    },
 */

export default {
  search: ({ target }) => ({ goods }) => {
    const searchTerm = target.value.trim().toLowerCase();

    const results = goods
      .filter(good => good.Name.toLowerCase().includes(searchTerm));

    return { results };
  },
};
