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

const formatToTags = (str, hidden = false) => {
  // Split by spaces and commas, convert to lower case.
  return uniqueArrayByKey(str.split(/[\s,]+/).map(tag => {
    return {
      name: tag.trim().toLowerCase(),
      hidden: hidden
    }
  }), 'name');
}

const formatToTagNames = (str) => {
  // Split by spaces and commas, convert to lower case.
  return uniqueArray(str.split(/[\s,]+/).map(tag => {
    return tag.trim().toLowerCase();
  }));
}

module.exports = { uniqueArray, uniqueArrayByKey, formatToTags, formatToTagNames };
