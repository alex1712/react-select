var React = require('react'),
    classes = require('classnames');

var Option = React.createClass({
	propTypes: {
		option         	: React.PropTypes.object.isRequired,            // array of options
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
		this.props.onFocus(this.props.option)
	},
	handleMouseDown: function() {
		this.props.onSelected(this.props.option)
	},
	
	render: function() {
        var classNames = classes({
            'select--option': true,
            'select--option__is-focused': this.props.hasFocus
        });

		return (
			<div className={classNames} key={'option-' + this.props.option.value}
				 onMouseEnter={this.handleMouseEnter} onMouseDown={this.handleMouseDown} onClick={this.handleMouseDown} >
				{this.props.option.label}
			</div>
		);
	}

});

module.exports = Option;
