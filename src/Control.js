var React = require('react'),
	_ = require('lodash'),
	Input = require('react-input-autosize'),
	classes = require('classnames');

var Value = require('./Value');

var Control = React.createClass({
	propTypes: {
		inputValue		: React.PropTypes.string,
		inputProps		: React.PropTypes.object.isRequired,
		values			: React.PropTypes.array,
		multi			: React.PropTypes.bool,
		onRemoveValue   : React.PropTypes.func,
		onClickValue    : React.PropTypes.func,
		onKeyDown		: React.PropTypes.func.isRequired,
		onMouseDown		: React.PropTypes.func.isRequired,
		onTouchEnd		: React.PropTypes.func.isRequired,
		onInputChange	: React.PropTypes.func.isRequired
	},

	getDefaultProps: function() {
		return {
		};
	},

	handleInputChange: function(event) {
		this.props.onInputChange(event.target.value);
	},

	renderValues: function() {
		var value = [];

		if (this.props.multi) {
			value = this.props.values.map(function(val) {
				return <Value key={val.value} {...val} optionLabelClick={!!this.props.onClickValue}
					onOptionLabelClick={this.onClickValue} onRemove={this.props.onRemoveValue} />;
			}.bind(this));
		}

		if (!this.props.inputValue && (!this.props.multi || !value.length)) {
			value.push(<div className="Select-placeholder" key="placeholder">{this.props.placeholder}</div>);
		} 
		
		return value;
	},
	
	render: function() {


		
		return (
			<div className={this.props.className} onKeyDown={this.props.onKeyDown} 
				 onMouseDown={this.props.onMouseDown} onTouchEnd={this.props.onTouchEnd}>
				{this.renderValues()}
				{
					this.props.searchable && !this.props.disabled ?
						<Input value={this.props.inputValue} onChange={this.handleInputChange} minWidth="5" {...this.props.inputProps} /> :
						<div {...this.props.inputProps}>{ this.props.inputValue ? this.props.inputValue : String.fromCharCode(160) }</div>
				}
				<span className="select--arrow" />
			</div>
		);
	}
//{loading}
//{clear}

});

module.exports = Control;
