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
		onClickClear    : React.PropTypes.func,
		onKeyDown		: React.PropTypes.func.isRequired,
		onMouseDown		: React.PropTypes.func.isRequired,
		onTouchEnd		: React.PropTypes.func.isRequired,
		onInputChange	: React.PropTypes.func.isRequired,
		clearText 		: React.PropTypes.string
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

	clearValue: function(ev) {
		// if the event was triggered by a mousedown and not the primary
		// button, ignore it.
		if (event && event.type === 'mousedown' && event.button !== 0) {
			return;
		}
		if (this.props.onClickClear) this.props.onClickClear(ev);	
	},
	
	render: function() {
		var loading = this.props.isLoading ? <span className="select--loading" aria-hidden="true" /> : null;
		var clear = this.props.clearable && this.props.value && !this.props.disabled ? 
			<span className="select--clear" 
				  title={this.props.clearText} 
				  aria-label={this.props.clearText} 
				  onMouseDown={this.clearValue} onClick={this.clearValue} dangerouslySetInnerHTML={{ __html: '&times;' }} 
				/> : 
			null;
		
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
				{loading}
				{clear}
			</div>
		);
	}
//{loading}
//{clear}

});

module.exports = Control;
