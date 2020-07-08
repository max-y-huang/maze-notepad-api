const uniqueArray = (arr) => {
  return [ ... new Set(arr) ];
}

const uniqueArrayByKey = (arr, key) => {
  let foundKeys = [];
  let ret = [];
  arr.forEach(element => {
    if (!foundKeys.includes(element[key])) {
      ret.push(element);
      foundKeys.push(element[key]);
    }
  });
  return ret;
}

const formatToTags = (str, params = { hidden: false }) => {
  // Split by spaces and commas, convert to lower case.
  return uniqueArrayByKey(str.split(/[\s,]+/).map(tag => {
    return { 
      ...params,
      ...{ name: tag.trim().toLowerCase() }
    };
  }), 'name');
}

const formatToTagNames = (str) => {
  // Split by spaces and commas, convert to lower case.
  return uniqueArray(str.split(/[\s,]+/).map(tag => {
    return tag.trim().toLowerCase();
  }));
}

const mergeTags = (list1, list2) => {
  return uniqueArrayByKey([ ...list1, ...list2 ], 'name');
}

module.exports = { uniqueArray, formatToTags, formatToTagNames, mergeTags };
