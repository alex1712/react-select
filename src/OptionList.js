var React = require('react'),
    classes = require('classnames');

var Option = require('./Option'),
	Action = require('./Action');

var OptionList = React.createClass({
	propTypes: {
        actions         	: React.PropTypes.array.isRequired,            // array of actions
        options         	: React.PropTypes.array.isRequired,            // array of options
		onFocusChange   	: React.PropTypes.func.isRequired,
		onActionSelected   	: React.PropTypes.func,
		onActionFocus   	: React.PropTypes.func,
        onChange        	: React.PropTypes.func.isRequired,
		focusedOption   	: React.PropTypes.object
    },

    getDefaultProps: function() {
        return {
			focusedOption: {},
			onActionSelected: function(){}
        };
    },

	renderActions: function() {
		return this.props.actions ? this.props.actions.map(function(action) {
			var hasFocus = !this.props.focusedOption.value;
			var ref = hasFocus ? 'focused' : null;
			return (
				<Action action={action} key={'action-' + action.value} ref={ref} hasFocus={hasFocus}
						onFocus={this.props.onFocusChange} onSelected={this.props.onActionSelected} />
			)
		}.bind(this)) : null;
	},

	renderOptions: function() {
        return this.props.options.map(function(op) {
			var hasFocus = op.value === this.props.focusedOption.value;
            var ref = hasFocus ? 'focused' : null;
            return (
                <Option option={op} key={'option-' + op.value} ref={ref} hasFocus={hasFocus}
                     onFocus={this.props.onFocusChange} onSelected={this.props.onChange} >
                    {op.label}
                </Option>
            )
        }.bind(this));
	},

	renderEmptyList: function() {
		return (
			<div className="select--menu__no-results">
				{
					this.props.asyncOptions && !this.state.inputValue ?
						this.props.searchPromptText :
						this.props.noResultsText
				}
			</div>
		);		
	},
	
	render: function() {
		if (this.props.options.length === 0 && this.props.actions === 0) {
			return this.renderEmptyList();
		} 
		return (
			<div className="select--menu">
				{this.renderActions()}
				{this.renderOptions()}
			</div>
		);
    }

});

module.exports = OptionList;
