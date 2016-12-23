// Generated by CoffeeScript 1.11.1
module.exports = {
  compare: function(array1, array2) {
    var i, j, ref;
    if (array1.length !== array2.length) {
      return false;
    }
    for (i = j = 0, ref = array1.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      if (Array.isArray(array1[i]) && Array.isArray(array2[i])) {
        if (!array1[i].equals(array2[i])) {
          return false;
        }
      } else if (array1[i] !== array2[i]) {
        return false;
      }
    }
    return true;
  }
};