var React = require('react');
var AvailableTableRows = require('./AvailableTableRows');

var AvailableTagsPage = React.createClass({
	getInitialState: function () {
		return {
			projectDoneLoading: false
		}
	},

	componentWillMount: function() {
	    if (this.props.completeTags.length !== 0) {
			this.setState({
				projectDoneLoading: true
			})
		}  
	},
	
	// if next props is a tag, sets projectDoneLoading to true
	componentWillReceiveProps: function(nextProps) {
	  if (nextProps.completeTags.length !== 0) {
			this.setState({
				projectDoneLoading: true
			})
		} 
	},

	// returns all tags that aren't custom tags
	_filterForCustomTags: function(completeTags) {
		var nonCustomTags = [];

		for (var i = 0; i < completeTags.length; i++) {
			if (completeTags[i].category !== "Custom") {
				nonCustomTags.push(completeTags[i])
			}
		}

		return nonCustomTags;

	},

	render: function () {

		var tableHeaders = (
			<div> 
				<h1 className='header1'> Available Tags </h1>
		        <table className="table table--rule table--hover myTable" ref='AvTable'>
		          <thead>
		            <tr>
		              <th className = "cell-collapse"> Logo </th>
		              <th id="availtablerow-name-width">Name</th>
		              <th id="availtablerow-cat-width">Category</th>
		              <th className="cell-collapse" id="availtablerow-status-width">Status</th>
		            </tr>
		          </thead>
		        </table>
		     </div>
			)

		// displays loading page
		if (!this.state.projectDoneLoading ) {
			return (
				<div> 
					{tableHeaders}
					<div className='welcome'> Loading... </div> 
				</div>
				)
		} else {

			// readies tags to be displayed
			var completeTags = this.props.completeTags;
			var nonCustomTags = this._filterForCustomTags(completeTags);
			if (this.props.searchInput.length !== 0) {
				nonCustomTags = this.props._filterForSearchInput(this.props.searchInput, nonCustomTags)
			}

			// displays no tags matching search message
			if (this.props.searchInput.length!==0 && nonCustomTags.length === 0) {
				return (
					<div>
						{tableHeaders}
						<div className='welcome'> No tags match your search. </div> 
					</div>
				)
			}

			// renders headers and maps tags in table in Available Tags tab
			return (
				<div> 
					<h1 className='header1'> Available Tags </h1>
	        <table className="table table--rule table--hover myTable" ref='AvTable'>
	          <thead>
	            <tr>
	              <th className = "cell-collapse"> Logo </th>
              	<th id="availtablerow-name-width">Name</th>
	              <th id="availtablerow-cat-width">Category</th>
	              <th className="cell-collapse" id="availtablerow-status-width">Status</th>
	            </tr>
	          </thead>
	          <tbody>
              {nonCustomTags.map((tag, i) => {
                return <AvailableTableRows nonCustomTag={tag} key={i} handleRowClick={() => this.props.handleRowClick(tag, i)}/>
                })
              }
	          </tbody>
	        </table>
				</div>
				)
		}
	}
})

module.exports = AvailableTagsPage;

//&nbsp;&nbsp;