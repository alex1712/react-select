var React = require('react'),
    classes = require('classnames');

var Option = require('./Option');

var OptionList = React.createClass({
	propTypes: {
        options         : React.PropTypes.array.isRequired,            // array of options
        onFocusChange   : React.PropTypes.func.isRequired,
        onChange        : React.PropTypes.func.isRequired
    },

    getDefaultProps: function() {
        return {
            hasFocus        : false
        };
    },

	renderOptions: function() {
        return this.props.options.map(function(op) {
            //var ref = isFocused ? 'focused' : null;
            return (
                <Option option={op} key={'option-' + op.value}
                     onFocus={this.props.onFocusChange} onSelected={this.props.onChange} >
                    {op.label}
                </Option>
            )
        }.bind(this));
	},

	render: function() {
        var ops = this.renderOptions();

		return ops.length ?
            <div className="select--menu">
                {ops}
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
