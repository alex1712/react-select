'use strict';

var React = require('react');

var OptionList = React.createClass({
    displayName: 'OptionList',

    propTypes: {
        options: React.PropTypes.array.isRequired // array of options
    },

    renderOptions: function renderOptions() {
        return this.props.options.map((function (op) {
            //var isFocused = focusedValue === op.value;
            //
            //var optionClass = classes({
            //    'Select-option': true,
            //    'is-focused': isFocused
            //});
            //
            //var ref = isFocused ? 'focused' : null;

            var mouseEnter = this.focusOption.bind(this, op),
                mouseLeave = this.unfocusOption.bind(this, op),
                mouseDown = this.selectValue.bind(this, op);

            //return (
            //    <div ref={ref} key={'option-' + op.value} className={optionClass} onMouseEnter={mouseEnter} onMouseLeave={mouseLeave} onMouseDown={mouseDown} onClick={mouseDown}>{op.label}</div>
            //);
            return React.createElement(
                'div',
                { key: 'option-' + op.value, onMouseEnter: mouseEnter, onMouseLeave: mouseLeave, onMouseDown: mouseDown, onClick: mouseDown },
                op.label
            );
        }).bind(this));
    },

    render: function render() {
        //var focusedValue = this.state.focusedOption ? this.state.focusedOption.value : null;
        //
        //if(this.state.filteredOptions.length > 0 && focusedValue == null) {
        //var focusedOption = this.getAutomaticFocusedOption(this.state.filteredOptions);
        //focusedValue = focusedOption ? focusedOption.value : null;
        //}

        var ops = this.renderOptions();

        //var taggingOption = this.addNewTagAction();
        //var isTagAlreadyAnOption = this.state.filteredOptions.some(op => op.value === this.state.inputValue);
        //
        //if(taggingOption && !isTagAlreadyAnOption && !_.isEmpty(this.state.inputValue)) {
        //var optionClass = classes({
        //	'Select-option': true,
        //	'placeholder': true,
        //	'is-focused': !this.state.focusedOption
        //});
        //var mouseDown = this.createAsNewTag;
        //ops.unshift(<div ref={null} key={'new-tag'} onMouseDown={mouseDown} className={optionClass}>{taggingOption.label}</div>);
        //}

        return ops.length ? ops : React.createElement(
            'div',
            { className: 'Select-noresults' },
            this.props.asyncOptions && !this.state.inputValue ? this.props.searchPromptText : this.props.noResultsText
        );
    }

});

module.exports = OptionList;
