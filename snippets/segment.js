module.exports = function(fields, callback) {
  var mappedFields = {};
  for (var i = 0; i < fields.length; i++) {
    mappedFields[fields[i].tokenName] = fields[i].tokenValue;
  };
  var ret = 'console.log("My token is:" + mappedFields[A_TOKEN] );console.log("And my callbacks go:" + callback);';
  return ret;
};
