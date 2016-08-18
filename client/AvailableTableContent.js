var React = require('react');
var AvailableTableRow = require('./AvailableTableRow');
var SearchBar = require('./SearchBar');

var AvailableTableContent = React.createClass({

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
        $(this.refs.AvTable).tablesorter();
  },

  render: function() {
    return (
      <div className="flex--1 soft-double--sides scroll">
        {/*passes App props into Search Bar component*/}
        <SearchBar {...this.props}/>
        <h1 className='header1'> Available Tags </h1>
        <table className="table table--rule table--hover myTable" ref='AvTable'>
          <thead>
            <tr>
              <th className = "cell-collapse">Logo</th>
              <th>Name</th>
              <th>Category</th>
              {/*&nbsp: forces space next to Status*/}
              <th className="cell-collapse">&nbsp;&nbsp;Status</th>
            </tr>
          </thead>
          <tbody>
            {/*displays each table row*/}
            {this.props.splicedArray.map((rowinfo, item) => {
                return <AvailableTableRow onSelect={() => this.props.onSelect(item, rowinfo)} key={item} rowinfo={rowinfo}/>
              })
            }
          </tbody>
        </table>
      </div>
    )
  // below brace closes render function
  }

})


module.exports = AvailableTableContent;
