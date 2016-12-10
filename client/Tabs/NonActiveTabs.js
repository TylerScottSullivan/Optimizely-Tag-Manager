var React = require('react');

function NonActiveTabs(props) {
  console.log(props, "NonActiveTab")
  return (
	<li className="tabs-nav__item" data-oui-tabs-nav-item onClick={props.onClick}> {props.name} </li> 
  )
}

module.exports = NonActiveTabs;