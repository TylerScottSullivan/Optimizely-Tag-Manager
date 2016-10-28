var React = require('react');

var Search = React.createClass({
	render: function() {
		return(
	          <li className="push-triple--right">
	            <div className="button-group">
	              <div className="search">
	                <input type="text" className="text-input text-input--search width--200" placeholder="Search Tags by Name"/>
	              </div>
	              {/*<button className="button" type="button">Search</button>*/}
	            </div>
	          </li>
	    )
	}
})

module.exports = Search;