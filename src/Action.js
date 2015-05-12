var React = require('react'),
	classes = require('classnames');

var Action = React.createClass({
	propTypes: {
		action         	: React.PropTypes.object.isRequired,            
		onFocus         : React.PropTypes.func.isRequired,
		onSelected      : React.PropTypes.func.isRequired,
		hasFocus        : React.PropTypes.bool
	},

	getDefaultProps: function() {
		return {
			hasFocus: false
		};
	},

	handleMouseEnter: function() {
		this.props.onFocus(this.props.action)
	},
	handleMouseDown: function() {
		this.props.action.run();
	},

	render: function() {
		var classNames = classes({
			'select--option': true,
			'select--option__is-focused': this.props.hasFocus
		});

		return (
			<div className={classNames} key={'action-' + this.props.action.value}
				 onMouseEnter={this.handleMouseEnter} onMouseDown={this.handleMouseDown} onClick={this.handleMouseDown} >
				{this.props.action.getText()}
			</div>
		);
	}

});

module.exports = Action;
