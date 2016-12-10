var React = require('react');

function ActiveTab(props) {
  console.log(props, "ActiveTab")
  return (
	<li className="tabs-nav__item is-active" data-oui-tabs-nav-item onClick={props.onClick}> {props.name} </li> 
  )
}

module.exports = ActiveTab;