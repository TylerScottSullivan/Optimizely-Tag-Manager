var React = require('react');
var Search = require('./Search');
var CustomTag = require('./CustomTag');


function SearchAndCustom(props) {
  return (
    <div>
	  <ul className="flex no-bottom-margin push-double--ends">
		<Search searchInput={props.searchInput} onChange={props.changeSearchInput}/>
		<CustomTag options={props.options}/>
	  </ul>
	</div>
  )
}

module.exports = SearchAndCustom;