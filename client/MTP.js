var React = require('react');

var MTP = React.createClass({
	render: function () {
		return (
			<div>
				<h1 className='header1'> My Tags </h1>
	    		<table className="table table--rule table--hover myTable" ref='myTable'>
		          <thead>
		            <tr>
		              <th className = "cell-collapse">Logo</th>
		              <th id ="mytablerow-dn-width" >Name</th>
		              <th id="mytablerow-cat-width">Category</th>
		              <th id="mytablerow-tt-width">Called On</th>
		              <th className="cell-collapse">Status</th>
		            </tr>
		          </thead>
		          <tbody>
		          </tbody>
		        </table>
	        </div>
	        )
	}
})

module.exports = MTP;