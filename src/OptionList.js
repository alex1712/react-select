var React = require('react'),
    classes = require('classnames');

var Option = require('./Option');

var OptionList = React.createClass({
	propTypes: {
        options         : React.PropTypes.array.isRequired,            // array of options
        onFocusChange   : React.PropTypes.func.isRequired,
        onChange        : React.PropTypes.func.isRequired,
		focusedOption   : React.PropTypes.object
    },

    getDefaultProps: function() {
        return {
			focusedOption: {}
        };
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

	render: function() {
		return this.props.options.length > 0 ?
            <div className="select--menu">
                {this.renderOptions()}
            </div> :
            (
                <div className="select--menu__no-results">
                    {
                        this.props.asyncOptions && !this.state.inputValue ?
                            this.props.searchPromptText :
                            this.props.noResultsText
                    }
                </div>
	    	);
    }

});

module.exports = OptionList;
