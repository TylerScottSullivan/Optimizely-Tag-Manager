var React = require('react');

var Search = React.createClass({

	handleSearchInputChange: function(e) {
		var newSearchInput = e.target.value;
		this.props.onChange(newSearchInput);
	},


	render: function() {
		return(
	          <li className="push-triple--right">
	            <div className="button-group">
	              <div className="search">
	                <input 
	                	type="text" 
	                	className="text-input text-input--search width--200" 
	                	placeholder="Search Tags by Name"
	                	onChange={this.handleSearchInputChange}
	                	value={this.props.searchInput}/>
	              </div>
	              {/*<button className="button" type="button">Search</button>*/}
	            </div>
	          </li>
	    )
	}
})

module.exports = Search;