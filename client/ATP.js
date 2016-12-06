var React = require('react');
var ATR = require('./ATR');

var ATP = React.createClass({
	getInitialState: function () {
		return {
			projectDoneLoading: false
		}
	},

	componentWillReceiveProps: function(nextProps) {
		console.log("HIT WILL RECEIVE PROPS")
		this.setState({
			projectDoneLoading: true
		})
	},

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
		              <th>Name</th>
		              <th>Category</th>
		              {/*&nbsp: forces space next to Status*/}
		              <th className="cell-collapse">&nbsp;&nbsp;Status</th>
		            </tr>
		          </thead>
		        </table>
		     </div>
			)

		if (!this.state.projectDoneLoading) {
			return (
				<div> 
					{tableHeaders}
					<div className='welcome'> Loading... </div> 
				</div>
				)
		} else {

			var completeTags = this.props.completeTags;
			var nonCustomTags = this._filterForCustomTags(completeTags);
			if (this.props.searchInput.length !== 0) {
				nonCustomTags = this.props._filterForSearchInput(this.props.searchInput, nonCustomTags)
			}

			if (this.props.searchInput.length!==0 && nonCustomTags.length === 0) {
				return (
					<div>
						{tableHeaders}
						<div className='welcome'> No tags match your search. </div> 
					</div>
				)
			}

			return (
				<div> 
					<h1 className='header1'> Available Tags </h1>
			        <table className="table table--rule table--hover myTable" ref='AvTable'>
			          <thead>
			            <tr>
			              <th className = "cell-collapse"> Logo </th>
			              <th>Name</th>
			              <th>Category</th>
			              {/*&nbsp: forces space next to Status*/}
			              <th className="cell-collapse">&nbsp;&nbsp;Status</th>
			            </tr>
			          </thead>
			          <tbody>
		              {nonCustomTags.map((tag, i) => {
		                return <ATR nonCustomTag={tag} key={i} handleRowClick={() => this.props.handleRowClick(tag, i)}/>
		                })
		              }
			          </tbody>
			        </table>
				</div>
				)
		}
	}
})

module.exports = ATP;