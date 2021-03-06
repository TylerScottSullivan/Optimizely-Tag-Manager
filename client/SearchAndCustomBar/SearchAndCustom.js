var React = require('react');
var Search = require('./Search');
var CustomTag = require('./CustomTag');

// renders search input and custom tag
function SearchAndCustom(props) {
  return (
    <div>
	  <ul className="flex no-bottom-margin push-double--ends">
			<Search searchInput={props.searchInput} onChange={props.changeSearchInput}/>
			<CustomTag options={props.options} addTagToProjectTags={props.addTagToProjectTags}/>
	  </ul>
	</div>
  )
}

module.exports = SearchAndCustom;