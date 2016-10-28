var React = require('react');
var Search = require('./Search');
var CustomTag = require('./CustomTag');


function SearchAndCustom(props) {
  return (
    <div>
	  <ul className="flex push-double--ends">
		<Search/>
		<CustomTag/>
	  </ul>
	</div>
  )
}

module.exports = SearchAndCustom;