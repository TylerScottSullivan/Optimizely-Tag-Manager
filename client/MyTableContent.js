var React = require('react');
var MyTableRow = require('./MyTableRow');
var SearchBar = require('./SearchBar');

var MyTableContent = React.createClass({

  componentDidMount: function() {
    //jquery function for sorting the table
  	this.tableSort();
  },

  componentDidUpdate: function() {
  	//jquery function for sorting the table
    this.tableSort();
  },

  //also jquery function for sorting the table
  tableSort: function() {
  	$(this.refs.myTable).tablesorter();
  },

  render: function() {
    return (
     	<div className="flex--1 soft-double--sides scroll">
        {/*passes App props into Search Bar component*/}
       	<SearchBar value={this.props.splicedArray} {...this.props}/>
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
            {/*displays each table row*/}
            {this.props.splicedArray.map((rowinfo, item) => {
              return <MyTableRow 
                      onSelect={() => this.props.onSelect(item, rowinfo)} 
                      key={item} 
                      rowinfo={rowinfo}
                      />
              })
            }
          </tbody>
        </table>

        {/* displays welcome message if no tags have been added to my tags*/}
        {(this.props.splicedArray.length ===0) ? 
          <div className='welcome'>Welcome! Go to Available Tags to add your first tag.</div> 
        : 
          null 
        }
      </div>
    )
  // below brace closes render function
  }
})

module.exports = MyTableContent;
