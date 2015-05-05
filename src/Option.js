var React = require('react'),
    classes = require('classnames');

var Option = React.createClass({
	propTypes: {
		option         	: React.PropTypes.object.isRequired,            // array of options
		onFocus         : React.PropTypes.func.isRequired,
		onSelected      : React.PropTypes.func.isRequired,
		isFocus        : React.PropTypes.bool.isRequired
	},

	getDefaultProps: function() {
		return {
			hasFocus: false
		};
	},
	render: function() {
        var classNames = classes({
            'select--option': true,
            'select--option__is-focused': this.props.hasFocus
        });

        var mouseEnter = function() { this.props.onFocus(this.props.option) }.bind(this),
			mouseDown = function() { this.props.onSelected(this.props.option) }.bind(this);
		return (
			<div className={classNames} key={'option-' + this.props.option.value}
				 onMouseEnter={mouseEnter} onMouseDown={mouseDown} onClick={mouseDown} >
				{this.props.option.label}
			</div>
		);
	}

});

module.exports = Option;
