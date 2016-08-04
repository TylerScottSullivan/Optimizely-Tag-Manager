module.exports = function(fields, loadedOnDocumentReady, callbacks) {
  var READ_TOKEN = fields[0]['value'];
  var WRITE_TOKEN = fields[1]['value'];
  var ret = 'console.log("'+ READ_TOKEN +'"); console.log('+ WRITE_TOKEN +');'
  if (callbacks) {
    ret += 'console.log("'+callbacks+'");'
  }
  return ret;
}
