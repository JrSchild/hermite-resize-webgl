var r_removeComments = /\s+\/\/.*$/mg;
var r_removeWhiteSpace = /^\s+/mg;
var r_trimOperators = /\s*([\/=\+<>\*&\-\(\);,{}]+)\s*/g;

// Floats currently need to have a number on both sides of the period to be matched.
var r_trimFloats = /([0-9]+)\.([0-9]+)/g;
var r_onlyZero = /^0*$/g;

function fn_trimFloats(_, p1, p2) {
  var p1OnlyZero = !!p1.match(r_onlyZero);
  var p2OnlyZero = !!p2.match(r_onlyZero);

  // Trim zero's
  if (p1OnlyZero) p1 = '0';
  if (p2OnlyZero) p2 = '0';

  if (p2OnlyZero) return p1 + '.';
  if (p1OnlyZero) return '.' + p2;

  return p1 + '.' + p2;
}

function minify(file) {
  return file
    .replace(r_removeComments, '')
    .replace(r_removeWhiteSpace, '')
    .replace(r_trimOperators, '\$1')
    .replace(r_trimFloats, fn_trimFloats)
}

module.exports = minify;