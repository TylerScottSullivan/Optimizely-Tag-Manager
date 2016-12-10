var React = require('react');

// displays non-active tabs
function NonActiveTabs(props) {
  return (
		<li className="tabs-nav__item" data-oui-tabs-nav-item onClick={props.onClick}> {props.name} </li> 
  )
}

module.exports = NonActiveTabs;