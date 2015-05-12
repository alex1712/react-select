(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Select = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null),
    React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null),
    Input = (typeof window !== "undefined" ? window.AutosizeInput : typeof global !== "undefined" ? global.AutosizeInput : null),
    classes = (typeof window !== "undefined" ? window.classNames : typeof global !== "undefined" ? global.classNames : null);

var Control = require('./Control'),
    OptionList = require('./OptionList');

var requestId = 0;

var Select = React.createClass({

	displayName: 'Select',

	propTypes: {
		value: React.PropTypes.any, // initial field value
		multi: React.PropTypes.bool, // multi-value input
		disabled: React.PropTypes.bool, // whether the Select is disabled or not
		options: React.PropTypes.array, // array of options
		delimiter: React.PropTypes.string, // delimiter to use to join multiple values
		asyncOptions: React.PropTypes.func, // function to call to get options
		autoload: React.PropTypes.bool, // whether to auto-load the default async options set
		placeholder: React.PropTypes.string, // field placeholder, displayed when there's no value
		noResultsText: React.PropTypes.string, // placeholder displayed when there are no matching search results
		clearable: React.PropTypes.bool, // should it be possible to reset value
		clearValueText: React.PropTypes.string, // title for the "clear" control
		clearAllText: React.PropTypes.string, // title for the "clear" control when multi: true
		searchable: React.PropTypes.bool, // whether to enable searching feature or not
		searchPromptText: React.PropTypes.string, // label to prompt for search input
		name: React.PropTypes.string, // field name, for hidden <input /> tag
		onChange: React.PropTypes.func, // onChange handler: function(newValue) {}
		onFocus: React.PropTypes.func, // onFocus handler: function(event) {}
		onBlur: React.PropTypes.func, // onBlur handler: function(event) {}
		className: React.PropTypes.string, // className for the outer element
		filterOption: React.PropTypes.func, // method to filter a single option: function(option, filterString)
		filterOptions: React.PropTypes.func, // method to filter the options array: function([options], filterString, [values])
		matchPos: React.PropTypes.string, // (any|start) match the start or entire string when filtering
		matchProp: React.PropTypes.string, // (any|label|value) which option property to filter on
		inputProps: React.PropTypes.object, // custom attributes for the Input (in the Select-control) e.g: {'data-foo': 'bar'}
		tagging: React.PropTypes.bool, // whether a new option can be created by giving a name
		taggingPlaceholder: React.PropTypes.func, // returns the text to be displayed after the new option

		/*
  * Allow user to make option label clickable. When this handler is defined we should
  * wrap label into <a>label</a> tag.
  *
  * onOptionLabelClick handler: function (value, event) {}
  *
  */
		onOptionLabelClick: React.PropTypes.func
	},

	getDefaultProps: function getDefaultProps() {
		return {
			value: undefined,
			options: [],
			disabled: false,
			delimiter: ',',
			asyncOptions: undefined,
			autoload: true,
			placeholder: 'Select...',
			noResultsText: 'No results found',
			clearable: true,
			clearValueText: 'Clear value',
			clearAllText: 'Clear all',
			searchable: true,
			searchPromptText: 'Type to search',
			name: undefined,
			onChange: undefined,
			className: undefined,
			matchPos: 'any',
			matchProp: 'any',
			inputProps: {},
			tagging: false,
			taggingPlaceholder: function taggingPlaceholder(currentValue) {
				return 'Press enter or click to create \'' + currentValue + '\' as a new tag...';
			},
			onOptionLabelClick: undefined
		};
	},

	getInitialState: function getInitialState() {
		return {
			/*
    * set by getStateFromValue on componentWillMount:
    * - value
    * - values
    * - filteredOptions
    * - inputValue
    * - placeholder
    * - focusedOption
   */
			actions: [],
			options: this.props.options,
			isFocused: false,
			isOpen: false,
			isLoading: false
		};
	},

	componentWillMount: function componentWillMount() {
		this._optionsCache = {};
		this._optionsFilterString = '';
		this.setState(this.getStateFromValue(this.props.value));

		if (this.props.asyncOptions && this.props.autoload) {
			this.autoloadAsyncOptions();
		}

		this._closeMenuIfClickedOutside = (function (event) {
			if (!this.state.isOpen) {
				return;
			}
			var menuElem = this.refs.selectMenuContainer.getDOMNode();
			var controlElem = this.refs.control.getDOMNode();

			var eventOccuredOutsideMenu = this.clickedOutsideElement(menuElem, event);
			var eventOccuredOutsideControl = this.clickedOutsideElement(controlElem, event);

			// Hide dropdown menu if click occurred outside of menu
			if (eventOccuredOutsideMenu && eventOccuredOutsideControl) {
				this.setState({
					isOpen: false
				}, this._unbindCloseMenuIfClickedOutside);
			}
		}).bind(this);

		this._bindCloseMenuIfClickedOutside = function () {
			document.addEventListener('click', this._closeMenuIfClickedOutside);
		};

		this._unbindCloseMenuIfClickedOutside = function () {
			document.removeEventListener('click', this._closeMenuIfClickedOutside);
		};
	},

	componentWillUnmount: function componentWillUnmount() {
		clearTimeout(this._blurTimeout);
		clearTimeout(this._focusTimeout);

		if (this.state.isOpen) {
			this._unbindCloseMenuIfClickedOutside();
		}
	},

	componentWillReceiveProps: function componentWillReceiveProps(newProps) {
		if (JSON.stringify(newProps.options) !== JSON.stringify(this.props.options)) {
			this.setState({
				options: newProps.options,
				filteredOptions: this.filterOptions(newProps.options)
			});
		}
		if (this.props.value !== newProps.value && newProps.value !== this.state.value) {
			this.setState(this.getStateFromValue(newProps.value, newProps.options));
		}
	},

	componentDidUpdate: function componentDidUpdate() {
		if (this._focusAfterUpdate) {
			clearTimeout(this._blurTimeout);
			this._focusTimeout = setTimeout((function () {
				this.getInputNode().focus();
				this._focusAfterUpdate = false;
			}).bind(this), 50);
		}

		if (this._focusedOptionReveal) {
			if (this.refs.menu && this.refs.menu.refs.focused) {
				var focusedDOM = this.refs.menu.refs.focused.getDOMNode();
				var menuDOM = this.refs.menu.getDOMNode();
				var focusedRect = focusedDOM.getBoundingClientRect();
				var menuRect = menuDOM.getBoundingClientRect();

				if (focusedRect.bottom > menuRect.bottom || focusedRect.top < menuRect.top) {
					menuDOM.scrollTop = focusedDOM.offsetTop + focusedDOM.clientHeight - menuDOM.offsetHeight;
				}
			}

			this._focusedOptionReveal = false;
		}
	},

	clickedOutsideElement: function clickedOutsideElement(element, event) {
		var eventTarget = event.target ? event.target : event.srcElement;
		while (eventTarget != null) {
			if (eventTarget === element) {
				return false;
			}eventTarget = eventTarget.offsetParent;
		}
		return true;
	},

	getStateFromValue: function getStateFromValue(value, options) {
		if (!options) {
			options = this.state.options;
		}

		// reset internal filter string
		this._optionsFilterString = '';

		var values = this.initValuesArray(value, options),
		    filteredOptions = this.filterOptions(options, values);

		return {
			value: values.map(function (v) {
				return v.value;
			}).join(this.props.delimiter),
			values: values,
			inputValue: '',
			filteredOptions: filteredOptions,
			placeholder: !this.props.multi && values.length ? values[0].label : this.props.placeholder,
			focusedOption: !this.props.multi && values.length ? values[0] : this.getAutomaticFocusedOption(filteredOptions, '')
		};
	},

	initValuesArray: function initValuesArray(values, options) {
		if (!Array.isArray(values)) {
			if (typeof values === 'string') {
				values = values.split(this.props.delimiter);
			} else {
				values = values ? [values] : [];
			}
		}

		return values.map(function (val) {
			return typeof val === 'string' ? val = _.findWhere(options, { value: val }) || { value: val, label: val } : val;
		});
	},

	setValue: function setValue(value) {
		this._focusAfterUpdate = true;
		var newState = this.getStateFromValue(value);
		newState.isOpen = false;
		this.fireChangeEvent(newState);
		this.setState(newState);
	},

	selectValue: function selectValue(value) {
		if (!this.props.multi) {
			this.setValue(value);
		} else if (value) {
			this.addValue(value);
		}
		this._unbindCloseMenuIfClickedOutside();
	},

	addValue: function addValue(value) {
		this.setValue(this.state.values.concat(value));
	},

	popValue: function popValue() {
		this.setValue(_.initial(this.state.values));
	},

	removeValue: function removeValue(value) {
		this.setValue(_.without(this.state.values, value));
	},

	clearValue: function clearValue() {
		this.setValue(null);
	},

	resetValue: function resetValue() {
		this.setValue(this.state.value);
	},

	getInputNode: function getInputNode() {
		var input = this.refs.control.refs.input;
		return this.props.searchable ? input : input.getDOMNode();
	},

	fireChangeEvent: function fireChangeEvent(newState) {
		if (newState.value !== this.state.value && this.props.onChange) {
			this.props.onChange(newState.value, newState.values);
		}
	},

	handleMouseDown: function handleMouseDown(event) {
		// if the event was triggered by a mousedown and not the primary
		// button, or if the component is disabled, ignore it.
		if (this.props.disabled || event.type === 'mousedown' && event.button !== 0) {
			return;
		}

		event.stopPropagation();
		event.preventDefault();
		if (this.state.isFocused) {
			this.setState({
				isOpen: true
			}, this._bindCloseMenuIfClickedOutside);
		} else {
			this._openAfterFocus = true;
			this.getInputNode().focus();
		}
	},

	handleInputFocus: function handleInputFocus(event) {
		var newIsOpen = this.state.isOpen || this._openAfterFocus;
		this.setState({
			isFocused: true,
			isOpen: newIsOpen
		}, function () {
			if (newIsOpen) {
				this._bindCloseMenuIfClickedOutside();
			} else {
				this._unbindCloseMenuIfClickedOutside();
			}
		});
		this._openAfterFocus = false;

		if (this.props.onFocus) {
			this.props.onFocus(event);
		}
	},

	handleInputBlur: function handleInputBlur(event) {
		this._blurTimeout = setTimeout((function () {
			if (this._focusAfterUpdate) return;
			this.setState({
				isFocused: false
			});
		}).bind(this), 50);

		if (this.props.onBlur) {
			this.props.onBlur(event);
		}
	},

	handleKeyDown: function handleKeyDown(event) {
		if (this.state.disabled) {
			return;
		}switch (event.keyCode) {

			case 8:
				// backspace
				if (!this.state.inputValue) {
					this.popValue();
				}
				return;

			case 9:
				// tab
				if (event.shiftKey || !this.state.isOpen || !this.state.focusedOption) {
					return;
				}
				this.selectFocusedOption();
				break;

			case 13:
				// enter
				this.selectFocusedOption();
				break;

			case 27:
				// escape
				if (this.state.isOpen) {
					this.resetValue();
				} else {
					this.clearValue();
				}
				break;

			case 38:
				// up
				this.focusPreviousOption();
				break;

			case 40:
				// down
				this.focusNextOption();
				break;

			default:
				return;
		}

		event.preventDefault();
	},

	handleInputChange: function handleInputChange(value) {
		// assign an internal variable because we need to use
		// the latest value before setState() has completed.
		this._optionsFilterString = value;

		if (this.props.asyncOptions) {
			this.setState({
				isLoading: true,
				inputValue: value
			});
			this.loadAsyncOptions(value, {
				isLoading: false,
				isOpen: true
			}, this._bindCloseMenuIfClickedOutside);
		} else {
			var filteredOptions = this.filterOptions(this.state.options);
			var currentActions = this.getActions();

			this.setState({
				isOpen: true,
				inputValue: value,
				filteredOptions: filteredOptions,
				actions: currentActions,
				focusedOption: this.getAutomaticFocusedOption(filteredOptions, value)
			}, this._bindCloseMenuIfClickedOutside);
		}
	},

	getAutomaticFocusedOption: function getAutomaticFocusedOption(options, currentInput) {
		var input = currentInput || this.state.inputValue;
		if (this.props.tagging) {
			if (options && options.length && (_.isEmpty(input) || input === options[0].label)) {
				return options[0];
			} else {
				return undefined;
			}
		} else {
			return options ? options[0] : undefined;
		}
	},

	autoloadAsyncOptions: function autoloadAsyncOptions() {
		this.loadAsyncOptions('', {}, function () {});
	},

	loadAsyncOptions: function loadAsyncOptions(input, state) {
		var thisRequestId = this._currentRequestId = requestId++;

		for (var i = 0; i <= input.length; i++) {
			var cacheKey = input.slice(0, i);
			if (this._optionsCache[cacheKey] && (input === cacheKey || this._optionsCache[cacheKey].complete)) {
				var options = this._optionsCache[cacheKey].options;
				var filteredOptions = this.filterOptions(options);

				this.setState(_.extend({
					options: options,
					filteredOptions: filteredOptions,
					focusedOption: _.contains(filteredOptions, this.state.focusedOption) ? this.state.focusedOption : this.getAutomaticFocusedOption(filteredOptions, input)
				}, state));
				return;
			}
		}

		this.props.asyncOptions(input, (function (err, data) {

			if (err) throw err;

			this._optionsCache[input] = data;

			if (thisRequestId !== this._currentRequestId) {
				return;
			}
			var filteredOptions = this.filterOptions(data.options);

			this.setState(_.extend({
				options: data.options,
				filteredOptions: filteredOptions,
				focusedOption: _.contains(filteredOptions, this.state.focusedOption) ? this.state.focusedOption : this.getAutomaticFocusedOption(filteredOptions, input)
			}, state));
		}).bind(this));
	},

	filterOptions: function filterOptions(options, values) {
		if (!this.props.searchable) {
			return options;
		}

		var filterValue = this._optionsFilterString;
		var exclude = (values || this.state.values).map(function (i) {
			return i.value;
		});
		if (this.props.filterOptions) {
			return this.props.filterOptions.call(this, options, filterValue, exclude);
		} else {
			var filterOption = function filterOption(op) {
				if (this.props.multi && _.contains(exclude, op.value)) {
					return false;
				}if (this.props.filterOption) {
					return this.props.filterOption.call(this, op, filterValue);
				}var valueTest = String(op.value),
				    labelTest = String(op.label);
				return !filterValue || this.props.matchPos === 'start' ? this.props.matchProp !== 'label' && valueTest.toLowerCase().substr(0, filterValue.length) === filterValue || this.props.matchProp !== 'value' && labelTest.toLowerCase().substr(0, filterValue.length) === filterValue : this.props.matchProp !== 'label' && valueTest.toLowerCase().indexOf(filterValue.toLowerCase()) >= 0 || this.props.matchProp !== 'value' && labelTest.toLowerCase().indexOf(filterValue.toLowerCase()) >= 0;
			};
			return _.filter(options, filterOption, this);
		}
	},

	selectFocusedOption: function selectFocusedOption() {
		if (!this.state.isOpen) {
			return;
		}if (this.props.tagging && !this.state.focusedOption && !_.isEmpty(this.state.inputValue)) {
			return this.createAsNewTag();
		} else {
			return this.selectValue(this.state.focusedOption);
		}
	},

	createAsNewTag: function createAsNewTag() {
		this.addValue(this.state.inputValue);
	},
	getActions: function getActions() {
		return this.props.tagging ? [{
			getText: (function () {
				return this.props.taggingPlaceholder(this.state.inputValue);
			}).bind(this),
			run: this.createAsNewTag
		}] : null;
	},

	focusOption: function focusOption(op) {
		this.setState({
			focusedOption: op
		});
	},

	focusNextOption: function focusNextOption() {
		this.focusAdjacentOption('next');
	},

	focusPreviousOption: function focusPreviousOption() {
		this.focusAdjacentOption('previous');
	},

	focusAdjacentOption: function focusAdjacentOption(dir) {
		this._focusedOptionReveal = true;

		var ops = this.state.filteredOptions;

		if (!this.state.isOpen) {
			this.setState({
				isOpen: true,
				inputValue: '',
				focusedOption: this.state.focusedOption || ops[dir === 'next' ? 0 : ops.length - 1]
			}, this._bindCloseMenuIfClickedOutside);
			return;
		}

		if (!ops.length) {
			return;
		}

		var focusedIndex = -1;

		for (var i = 0; i < ops.length; i++) {
			if (this.state.focusedOption === ops[i]) {
				focusedIndex = i;
				break;
			}
		}

		var focusedOption = ops[0];

		if (dir === 'next' && focusedIndex > -1 && focusedIndex < ops.length - 1) {
			focusedOption = ops[focusedIndex + 1];
		} else if (dir === 'previous') {
			if (focusedIndex > 0) {
				focusedOption = ops[focusedIndex - 1];
			} else {
				focusedOption = ops[ops.length - 1];
			}
		}

		this.setState({
			focusedOption: focusedOption
		});
	},

	unfocusOption: function unfocusOption(op) {
		if (this.state.focusedOption === op) {
			this.setState({
				focusedOption: null
			});
		}
	},

	handleOptionLabelClick: function handleOptionLabelClick(value, event) {
		var handler = this.props.onOptionLabelClick;

		if (handler) {
			handler(value, event);
		}
	},

	render: function render() {
		var selectClass = classes('Select', this.props.className, {
			'is-multi': this.props.multi,
			'is-searchable': this.props.searchable,
			'is-open': this.state.isOpen,
			'is-focused': this.state.isFocused,
			'is-loading': this.state.isLoading,
			'is-disabled': this.props.disabled,
			'has-value': this.state.value
		});

		var menuProps = {};
		if (this.props.multi) {
			menuProps.onMouseDown = this.handleMouseDown;
		}

		var inputProps = _.extend({
			ref: 'input',
			className: 'select--input',
			tabIndex: this.props.tabIndex || 0,
			onFocus: this.handleInputFocus,
			onBlur: this.handleInputBlur
		}, this.props.inputProps);
		return React.createElement(
			'div',
			{ ref: 'wrapper', className: selectClass },
			React.createElement('input', { type: 'hidden', ref: 'value', name: this.props.name, value: this.state.value }),
			React.createElement(Control, { className: 'select--control', ref: 'control', inputProps: inputProps, multi: this.props.multi,
				searchable: this.props.searchable, placeholder: this.state.placeholder,
				clearable: this.props.clearable,
				clearText: this.props.multi ? this.props.clearAllText : this.props.clearValueText,
				inputValue: this.state.inputValue, disabled: this.props.disabled,
				value: this.state.value, values: this.state.values,
				onClickClear: this.clearValue,
				onInputChange: this.handleInputChange, onKeyDown: this.handleKeyDown,
				onMouseDown: this.handleMouseDown, onTouchEnd: this.handleMouseDown }),
			this.state.isOpen ? React.createElement(
				'div',
				{ ref: 'selectMenuContainer', className: 'select--menu--outer' },
				React.createElement(OptionList, _extends({}, menuProps, { ref: 'menu', onChange: this.selectValue, onFocusChange: this.focusOption,
					focusedOption: this.state.focusedOption, options: this.state.filteredOptions,
					actions: this.state.actions }))
			) : null
		);
	}

});

module.exports = Select;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Control":3,"./OptionList":5}],2:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null),
    classes = (typeof window !== "undefined" ? window.classNames : typeof global !== "undefined" ? global.classNames : null);

var Action = React.createClass({
	displayName: 'Action',

	propTypes: {
		action: React.PropTypes.object.isRequired,
		onFocus: React.PropTypes.func.isRequired,
		onSelected: React.PropTypes.func.isRequired,
		hasFocus: React.PropTypes.bool
	},

	getDefaultProps: function getDefaultProps() {
		return {
			hasFocus: false
		};
	},

	handleMouseEnter: function handleMouseEnter() {
		this.props.onFocus(this.props.action);
	},
	handleMouseDown: function handleMouseDown() {
		this.props.action.run();
	},

	render: function render() {
		var classNames = classes({
			'select--option': true,
			'select--option__is-focused': this.props.hasFocus
		});

		return React.createElement(
			'div',
			{ className: classNames, key: 'action-' + this.props.action.value,
				onMouseEnter: this.handleMouseEnter, onMouseDown: this.handleMouseDown, onClick: this.handleMouseDown },
			this.props.action.getText()
		);
	}

});

module.exports = Action;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null),
    _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null),
    Input = (typeof window !== "undefined" ? window.AutosizeInput : typeof global !== "undefined" ? global.AutosizeInput : null),
    classes = (typeof window !== "undefined" ? window.classNames : typeof global !== "undefined" ? global.classNames : null);

var Value = require('./Value');

var Control = React.createClass({
	displayName: 'Control',

	propTypes: {
		inputValue: React.PropTypes.string,
		inputProps: React.PropTypes.object.isRequired,
		values: React.PropTypes.array,
		multi: React.PropTypes.bool,
		onRemoveValue: React.PropTypes.func,
		onClickValue: React.PropTypes.func,
		onClickClear: React.PropTypes.func,
		onKeyDown: React.PropTypes.func.isRequired,
		onMouseDown: React.PropTypes.func.isRequired,
		onTouchEnd: React.PropTypes.func.isRequired,
		onInputChange: React.PropTypes.func.isRequired,
		clearText: React.PropTypes.string
	},

	getDefaultProps: function getDefaultProps() {
		return {};
	},

	handleInputChange: function handleInputChange(event) {
		this.props.onInputChange(event.target.value);
	},

	renderValues: function renderValues() {
		var value = [];

		if (this.props.multi) {
			value = this.props.values.map((function (val) {
				return React.createElement(Value, _extends({ key: val.value }, val, { optionLabelClick: !!this.props.onClickValue,
					onOptionLabelClick: this.onClickValue, onRemove: this.props.onRemoveValue }));
			}).bind(this));
		}

		if (!this.props.inputValue && (!this.props.multi || !value.length)) {
			value.push(React.createElement(
				'div',
				{ className: 'Select-placeholder', key: 'placeholder' },
				this.props.placeholder
			));
		}

		return value;
	},

	clearValue: function clearValue(ev) {
		// if the event was triggered by a mousedown and not the primary
		// button, ignore it.
		if (event && event.type === 'mousedown' && event.button !== 0) {
			return;
		}
		if (this.props.onClickClear) this.props.onClickClear(ev);
	},

	render: function render() {
		var loading = this.props.isLoading ? React.createElement('span', { className: 'select--loading', 'aria-hidden': 'true' }) : null;
		var clear = this.props.clearable && this.props.value && !this.props.disabled ? React.createElement('span', { className: 'select--clear',
			title: this.props.clearText,
			'aria-label': this.props.clearText,
			onMouseDown: this.clearValue, onClick: this.clearValue, dangerouslySetInnerHTML: { __html: '&times;' }
		}) : null;

		return React.createElement(
			'div',
			{ className: this.props.className, onKeyDown: this.props.onKeyDown,
				onMouseDown: this.props.onMouseDown, onTouchEnd: this.props.onTouchEnd },
			this.renderValues(),
			this.props.searchable && !this.props.disabled ? React.createElement(Input, _extends({ value: this.props.inputValue, onChange: this.handleInputChange, minWidth: '5' }, this.props.inputProps)) : React.createElement(
				'div',
				this.props.inputProps,
				this.props.inputValue ? this.props.inputValue : String.fromCharCode(160)
			),
			React.createElement('span', { className: 'select--arrow' }),
			loading,
			clear
		);
	}
	//{loading}
	//{clear}

});

module.exports = Control;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Value":6}],4:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null),
    classes = (typeof window !== "undefined" ? window.classNames : typeof global !== "undefined" ? global.classNames : null);

var Option = React.createClass({
	displayName: 'Option',

	propTypes: {
		option: React.PropTypes.object.isRequired, // array of options
		onFocus: React.PropTypes.func.isRequired,
		onSelected: React.PropTypes.func.isRequired,
		hasFocus: React.PropTypes.bool
	},

	getDefaultProps: function getDefaultProps() {
		return {
			hasFocus: false
		};
	},

	handleMouseEnter: function handleMouseEnter() {
		this.props.onFocus(this.props.option);
	},
	handleMouseDown: function handleMouseDown() {
		this.props.onSelected(this.props.option);
	},

	render: function render() {
		var classNames = classes({
			'select--option': true,
			'select--option__is-focused': this.props.hasFocus
		});

		return React.createElement(
			'div',
			{ className: classNames, key: 'option-' + this.props.option.value,
				onMouseEnter: this.handleMouseEnter, onMouseDown: this.handleMouseDown, onClick: this.handleMouseDown },
			this.props.option.label
		);
	}

});

module.exports = Option;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null),
    classes = (typeof window !== "undefined" ? window.classNames : typeof global !== "undefined" ? global.classNames : null);

var Option = require('./Option'),
    Action = require('./Action');

var OptionList = React.createClass({
	displayName: 'OptionList',

	propTypes: {
		actions: React.PropTypes.array.isRequired, // array of actions
		options: React.PropTypes.array.isRequired, // array of options
		onFocusChange: React.PropTypes.func.isRequired,
		onActionSelected: React.PropTypes.func,
		onActionFocus: React.PropTypes.func,
		onChange: React.PropTypes.func.isRequired,
		focusedOption: React.PropTypes.object
	},

	getDefaultProps: function getDefaultProps() {
		return {
			focusedOption: {},
			onActionSelected: function onActionSelected() {}
		};
	},

	renderActions: function renderActions() {
		return this.props.actions ? this.props.actions.map((function (action) {
			var hasFocus = !this.props.focusedOption.value;
			var ref = hasFocus ? 'focused' : null;
			return React.createElement(Action, { action: action, key: 'action-' + action.value, ref: ref, hasFocus: hasFocus,
				onFocus: this.props.onFocusChange, onSelected: this.props.onActionSelected });
		}).bind(this)) : null;
	},

	renderOptions: function renderOptions() {
		return this.props.options.map((function (op) {
			var hasFocus = op.value === this.props.focusedOption.value;
			var ref = hasFocus ? 'focused' : null;
			return React.createElement(
				Option,
				{ option: op, key: 'option-' + op.value, ref: ref, hasFocus: hasFocus,
					onFocus: this.props.onFocusChange, onSelected: this.props.onChange },
				op.label
			);
		}).bind(this));
	},

	renderEmptyList: function renderEmptyList() {
		return React.createElement(
			'div',
			{ className: 'select--menu__no-results' },
			this.props.asyncOptions && !this.state.inputValue ? this.props.searchPromptText : this.props.noResultsText
		);
	},

	render: function render() {
		if (this.props.options.length === 0 && this.props.actions === 0) {
			return this.renderEmptyList();
		}
		return React.createElement(
			'div',
			{ className: 'select--menu' },
			this.renderActions(),
			this.renderOptions()
		);
	}

});

module.exports = OptionList;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Action":2,"./Option":4}],6:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

var Option = React.createClass({

	displayName: 'Value',

	propTypes: {
		label: React.PropTypes.string.isRequired
	},

	blockEvent: function blockEvent(event) {
		event.stopPropagation();
	},

	render: function render() {
		var label = this.props.label;

		if (this.props.optionLabelClick) {
			label = React.createElement(
				'a',
				{ className: 'Select-item-label__a',
					onMouseDown: this.blockEvent,
					onTouchEnd: this.props.onOptionLabelClick,
					onClick: this.props.onOptionLabelClick },
				label
			);
		}

		return React.createElement(
			'div',
			{ className: 'Select-item' },
			React.createElement(
				'span',
				{ className: 'Select-item-icon',
					onMouseDown: this.blockEvent,
					onClick: this.props.onRemove,
					onTouchEnd: this.props.onRemove },
				'×'
			),
			React.createElement(
				'span',
				{ className: 'Select-item-label' },
				label
			)
		);
	}

});

module.exports = Option;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});