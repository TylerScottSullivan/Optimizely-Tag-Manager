module.exports = function(fields, trigger, callbacks) {
  var TRACKING_ID = fields[0]['value']
  var ret = "(function(i, s, o, g, r, a, m) { i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function() { (i[r].q = i[r].q || []).push(arguments); }; i[r].l = 1 * new Date(); a = s.createElement(o); console.log('hello');m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m); })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga'); ga('create', '"+TRACKING_ID+"', 'auto'); ga('send', 'pageview');"
  if (!callbacks) {
    ret += 'ga('+ callbacks +')'
  }
  return ret;
}
