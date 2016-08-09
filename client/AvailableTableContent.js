var React = require('react');
var AvailableTableRow = require('./AvailableTableRow');
var SearchBar = require('./SearchBar');

var AvailableTableContent = React.createClass({

  componentDidMount: function() {
  	  	// console.log('availabletablecontent mounted')
  	  	// console.log(this.props, "props for availabltable content")
  	this.tableSort();
  },

  componentDidUpdate: function() {
  	this.tableSort();
  },

  tableSort: function() {
  	  	$(this.refs.AvTable).tablesorter();
  },

  render: function() {
  	// console.log("[AvailableTableContent props]", this.props.splicedArray);
    return (
     	<div className="flex--1 soft-double--sides">
     	<SearchBar/>
        <h1 className='header1'> Available Tags </h1>
        <table className="table table--rule table--hover myTable" ref='AvTable'>
          <thead>
            <tr>
              <th className = "cell-collapse">Logo</th>
              <th>Name</th>
              <th>Category</th>
              <th>Called On</th>
              <th className="cell-collapse">Status</th>
            </tr>
          </thead>
          <tbody>
            {//key is for adjacent elements in react to distinguish
              this.props.splicedArray.map((rowinfo, item) => {
                return <AvailableTableRow onSelect={() => this.props.onSelect(item, rowinfo)} key={item} rowinfo={rowinfo}/>
              })
            }
          </tbody>
        </table>
      </div>
    )
  }
})

module.exports = AvailableTableContent;
