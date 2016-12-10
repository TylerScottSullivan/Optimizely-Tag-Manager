var React = require('react');

//displays active tab
function ActiveTab(props) {
  return (
		<li className="tabs-nav__item is-active" data-oui-tabs-nav-item onClick={props.onClick}> {props.name} </li> 
  )
}

module.exports = ActiveTab;