var React = require('react');
var MyTableRows = require('./MyTableRows');

var MyTagsPage = React.createClass({

	getInitialState: function () {
		return {
			projectDoneLoading: false,
			projectHasTags: null
		}
	},

	componentWillMount: function () {
		// if tags have not been loaded yet
   	if (this.props.projectTags.length !== 0) {
			this.setState({
				projectDoneLoading: true,
				projectHasTags: true
			})
		} else {
			this.setState({
				projectDoneLoadng: true, 
				projectHasTags: false
			})
		}
	},

	componentWillReceiveProps: function(nextProps) {
		// if tags have been loaded
    if (nextProps.projectTags.length !== 0) {
			this.setState({
				projectDoneLoading: true,
				projectHasTags: true
			})
		} else {
			this.setState({
				projectDoneLoadng: true, 
				projectHasTags: false
			})
		}
	},

	// returns only added tags
	_filterForAddedTags: function(completeTags) {
		var addedTags = [];

		for (var i = 0; i < completeTags.length; i++) {
			if (completeTags[i].added) {
				addedTags.push(completeTags[i])
			}
		}

		return addedTags;
	},

	// given project tags, creates an object to be used to check if all calls set to "On Trigger" are valid in MyTableRows
	_createCallBackCheck: function(projectTags) {
		var callBackCheck = {};
		for (var i = 0; i < projectTags.length; i++) {
			if (projectTags[i].callbacks.length > 0) {
				callBackCheck[projectTags[i].name] = projectTags[i].callbacks
			}
		}

		return callBackCheck;
	},

	render: function() {

		var tableHeaders = (
				<div> 
					<h1 className='header1'> My Tags </h1>
		    		<table className="table table--rule table--hover myTable" ref='myTable'>
			          <thead>
			            <tr>
			              <th className = "cell-collapse">Logo</th>
			              <th id ="mytablerow-dn-width" >Name</th>
			              <th id="mytablerow-cat-width">Category</th>
			              <th id="mytablerow-tt-width">Called</th>
			              <th className="cell-collapse" id="mytablerow-status-width">Status</th>
			            </tr>
			          </thead>
			        </table>
		        </div>
			)

		// displays loading message
		if (!this.state.projectDoneLoading) {
			return (
				<div>
					{tableHeaders}
					<div className='welcome'> Loading... </div>
					
				</div> 
			)
		} else if (this.state.projectDoneLoading && !this.state.projectHasTags) {
			// if no tags have been added, displays welcome message
			return (
				<div>
					{tableHeaders}
					<div className='welcome'> Welcome! Go to Available Tags to add your first tag.</div> 
				</div>
				)
		} else {
			// readies tags to be displayed
			var completeTags = this.props.completeTags;
			var addedTags = this._filterForAddedTags(completeTags);
			if (this.props.searchInput.length !== 0) {
				addedTags = this.props._filterForSearchInput(this.props.searchInput, addedTags)
			}
			var callBackCheck = this._createCallBackCheck(this.props.projectTags)

			// displays no tags matching search message
			if (this.props.searchInput.length!==0 && addedTags.length === 0) {
				return (
					<div>
						{tableHeaders}
						<div className='welcome'> No tags match your search. </div> 
					</div>
				)
			}

			// renders headers and maps tags in table in the My Tags tab
			return (
				<div> 
					<h1 className='header1'> My Tags </h1>
		    		<table className="table table--rule table--hover myTable" ref='myTable'>
			          <thead>
			            <tr>
			              <th className = "cell-collapse">Logo</th>
			              <th id ="mytablerow-dn-width" >Name</th>
			              <th id="mytablerow-cat-width">Category</th>
			              <th id="mytablerow-tt-width">Called</th>
			              <th className="cell-collapse" id="mytablerow-status-width">Status</th>
			            </tr>
			          </thead>
			          <tbody>
			          {addedTags.map((tag, i) => {
			          	return <MyTableRows addedTag={tag} key={i} callBackCheck={callBackCheck} options={this.props.options} handleRowClick={() => this.props.handleRowClick(tag, i)}/> 
			          	})
			      	  }
			          </tbody>
			        </table>
		        </div>
				)
		}
	}

})

module.exports = MyTagsPage;

