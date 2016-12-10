var React = require('react');

var Search = React.createClass({

	handleSearchInputChange: function(e) {
		var newSearchInput = e.target.value;
		this.props.onChange(newSearchInput);
	},

	// renders search input in SearchAndCustom
	render: function() {
		return(
      <li className="push-triple--right">
        <div className="button-group">
          <div className="search">
            <input type="text" 
            	className="text-input text-input--search width--200" 
            	placeholder="Search Tags by Name"
            	onChange={this.handleSearchInputChange}
            	value={this.props.searchInput}/>
          </div>
        </div>
      </li>
	    )
	}
})

module.exports = Search;