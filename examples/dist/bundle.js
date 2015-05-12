require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var React = require('react'),
    classes = require('classnames');

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

},{"classnames":undefined,"react":undefined}],2:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react'),
    _ = require('lodash'),
    Input = require('react-input-autosize'),
    classes = require('classnames');

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

},{"./Value":5,"classnames":undefined,"lodash":undefined,"react":undefined,"react-input-autosize":undefined}],3:[function(require,module,exports){
'use strict';

var React = require('react'),
    classes = require('classnames');

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

},{"classnames":undefined,"react":undefined}],4:[function(require,module,exports){
'use strict';

var React = require('react'),
    classes = require('classnames');

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

},{"./Action":1,"./Option":3,"classnames":undefined,"react":undefined}],5:[function(require,module,exports){
'use strict';

var React = require('react');

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

},{"react":undefined}],"mnq-react-select":[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _ = require('lodash'),
    React = require('react'),
    Input = require('react-input-autosize'),
    classes = require('classnames');

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

},{"./Control":2,"./OptionList":4,"classnames":undefined,"lodash":undefined,"react":undefined,"react-input-autosize":undefined}]},{},[])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9yZWFjdC1jb21wb25lbnQtZ3VscC10YXNrcy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL0FsZXgvV29ya3NwYWNlL25wbS1wcm9qZWN0cy9yZWFjdC1zZWxlY3Qvc3JjL0FjdGlvbi5qcyIsIi9Vc2Vycy9BbGV4L1dvcmtzcGFjZS9ucG0tcHJvamVjdHMvcmVhY3Qtc2VsZWN0L3NyYy9Db250cm9sLmpzIiwiL1VzZXJzL0FsZXgvV29ya3NwYWNlL25wbS1wcm9qZWN0cy9yZWFjdC1zZWxlY3Qvc3JjL09wdGlvbi5qcyIsIi9Vc2Vycy9BbGV4L1dvcmtzcGFjZS9ucG0tcHJvamVjdHMvcmVhY3Qtc2VsZWN0L3NyYy9PcHRpb25MaXN0LmpzIiwiL1VzZXJzL0FsZXgvV29ya3NwYWNlL25wbS1wcm9qZWN0cy9yZWFjdC1zZWxlY3Qvc3JjL1ZhbHVlLmpzIiwiL1VzZXJzL0FsZXgvV29ya3NwYWNlL25wbS1wcm9qZWN0cy9yZWFjdC1zZWxlY3Qvc3JjL1NlbGVjdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQztJQUMzQixPQUFPLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDOztBQUVqQyxJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOzs7QUFDOUIsVUFBUyxFQUFFO0FBQ1YsUUFBTSxFQUFZLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7QUFDbkQsU0FBTyxFQUFXLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDakQsWUFBVSxFQUFRLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDakQsVUFBUSxFQUFVLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSTtFQUN0Qzs7QUFFRCxnQkFBZSxF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Q0FBQyxlQUFlLEFBQUMsRUFBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGVBQWUsQUFBQyxHQUFHO0dBRXpFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUVmOztNQUFLLEdBQUcsRUFBQyxxQkFBcUIsRUFBQyxTQUFTLEVBQUMscUJBQXFCO0lBQzdELG9CQUFDLFVBQVUsZUFBSyxTQUFTLElBQUUsR0FBRyxFQUFDLE1BQU0sRUFBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFdBQVcsQUFBQyxFQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsV0FBVyxBQUFDO0FBQy9GLGtCQUFhLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEFBQUMsRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLEFBQUM7QUFDN0UsWUFBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxBQUFDLElBQUc7SUFDN0IsR0FFUCxJQUFJO0dBRUQsQ0FDTDtFQUNGOztDQUVELENBQUMsQ0FBQzs7QUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpLFxuXHRjbGFzc2VzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG52YXIgQWN0aW9uID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRwcm9wVHlwZXM6IHtcblx0XHRhY3Rpb24gICAgICAgICBcdDogUmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLCAgICAgICAgICAgIFxuXHRcdG9uRm9jdXMgICAgICAgICA6IFJlYWN0LlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG5cdFx0b25TZWxlY3RlZCAgICAgIDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcblx0XHRoYXNGb2N1cyAgICAgICAgOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbFxuXHR9LFxuXG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGhhc0ZvY3VzOiBmYWxzZVxuXHRcdH07XG5cdH0sXG5cblx0aGFuZGxlTW91c2VFbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5wcm9wcy5vbkZvY3VzKHRoaXMucHJvcHMuYWN0aW9uKVxuXHR9LFxuXHRoYW5kbGVNb3VzZURvd246IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMucHJvcHMuYWN0aW9uLnJ1bigpO1xuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGNsYXNzTmFtZXMgPSBjbGFzc2VzKHtcblx0XHRcdCdzZWxlY3QtLW9wdGlvbic6IHRydWUsXG5cdFx0XHQnc2VsZWN0LS1vcHRpb25fX2lzLWZvY3VzZWQnOiB0aGlzLnByb3BzLmhhc0ZvY3VzXG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9e2NsYXNzTmFtZXN9IGtleT17J2FjdGlvbi0nICsgdGhpcy5wcm9wcy5hY3Rpb24udmFsdWV9XG5cdFx0XHRcdCBvbk1vdXNlRW50ZXI9e3RoaXMuaGFuZGxlTW91c2VFbnRlcn0gb25Nb3VzZURvd249e3RoaXMuaGFuZGxlTW91c2VEb3dufSBvbkNsaWNrPXt0aGlzLmhhbmRsZU1vdXNlRG93bn0gPlxuXHRcdFx0XHR7dGhpcy5wcm9wcy5hY3Rpb24uZ2V0VGV4dCgpfVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBY3Rpb247XG4iLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpLFxuXHRfID0gcmVxdWlyZSgnbG9kYXNoJyksXG5cdElucHV0ID0gcmVxdWlyZSgncmVhY3QtaW5wdXQtYXV0b3NpemUnKSxcblx0Y2xhc3NlcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxudmFyIFZhbHVlID0gcmVxdWlyZSgnLi9WYWx1ZScpO1xuXG52YXIgQ29udHJvbCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0cHJvcFR5cGVzOiB7XG5cdFx0aW5wdXRWYWx1ZVx0XHQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG5cdFx0aW5wdXRQcm9wc1x0XHQ6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcblx0XHR2YWx1ZXNcdFx0XHQ6IFJlYWN0LlByb3BUeXBlcy5hcnJheSxcblx0XHRtdWx0aVx0XHRcdDogUmVhY3QuUHJvcFR5cGVzLmJvb2wsXG5cdFx0b25SZW1vdmVWYWx1ZSAgIDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG5cdFx0b25DbGlja1ZhbHVlICAgIDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG5cdFx0b25DbGlja0NsZWFyICAgIDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG5cdFx0b25LZXlEb3duXHRcdDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcblx0XHRvbk1vdXNlRG93blx0XHQ6IFJlYWN0LlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG5cdFx0b25Ub3VjaEVuZFx0XHQ6IFJlYWN0LlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG5cdFx0b25JbnB1dENoYW5nZVx0OiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuXHRcdGNsZWFyVGV4dCBcdFx0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nXG5cdH0sXG5cblx0Z2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge1xuXHRcdH07XG5cdH0sXG5cblx0aGFuZGxlSW5wdXRDaGFuZ2U6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0dGhpcy5wcm9wcy5vbklucHV0Q2hhbmdlKGV2ZW50LnRhcmdldC52YWx1ZSk7XG5cdH0sXG5cblx0cmVuZGVyVmFsdWVzOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgdmFsdWUgPSBbXTtcblxuXHRcdGlmICh0aGlzLnByb3BzLm11bHRpKSB7XG5cdFx0XHR2YWx1ZSA9IHRoaXMucHJvcHMudmFsdWVzLm1hcChmdW5jdGlvbih2YWwpIHtcblx0XHRcdFx0cmV0dXJuIDxWYWx1ZSBrZXk9e3ZhbC52YWx1ZX0gey4uLnZhbH0gb3B0aW9uTGFiZWxDbGljaz17ISF0aGlzLnByb3BzLm9uQ2xpY2tWYWx1ZX1cblx0XHRcdFx0XHRvbk9wdGlvbkxhYmVsQ2xpY2s9e3RoaXMub25DbGlja1ZhbHVlfSBvblJlbW92ZT17dGhpcy5wcm9wcy5vblJlbW92ZVZhbHVlfSAvPjtcblx0XHRcdH0uYmluZCh0aGlzKSk7XG5cdFx0fVxuXG5cdFx0aWYgKCF0aGlzLnByb3BzLmlucHV0VmFsdWUgJiYgKCF0aGlzLnByb3BzLm11bHRpIHx8ICF2YWx1ZS5sZW5ndGgpKSB7XG5cdFx0XHR2YWx1ZS5wdXNoKDxkaXYgY2xhc3NOYW1lPVwiU2VsZWN0LXBsYWNlaG9sZGVyXCIga2V5PVwicGxhY2Vob2xkZXJcIj57dGhpcy5wcm9wcy5wbGFjZWhvbGRlcn08L2Rpdj4pO1xuXHRcdH0gXG5cdFx0XG5cdFx0cmV0dXJuIHZhbHVlO1xuXHR9LFxuXG5cdGNsZWFyVmFsdWU6IGZ1bmN0aW9uKGV2KSB7XG5cdFx0Ly8gaWYgdGhlIGV2ZW50IHdhcyB0cmlnZ2VyZWQgYnkgYSBtb3VzZWRvd24gYW5kIG5vdCB0aGUgcHJpbWFyeVxuXHRcdC8vIGJ1dHRvbiwgaWdub3JlIGl0LlxuXHRcdGlmIChldmVudCAmJiBldmVudC50eXBlID09PSAnbW91c2Vkb3duJyAmJiBldmVudC5idXR0b24gIT09IDApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYgKHRoaXMucHJvcHMub25DbGlja0NsZWFyKSB0aGlzLnByb3BzLm9uQ2xpY2tDbGVhcihldik7XHRcblx0fSxcblx0XG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGxvYWRpbmcgPSB0aGlzLnByb3BzLmlzTG9hZGluZyA/IDxzcGFuIGNsYXNzTmFtZT1cInNlbGVjdC0tbG9hZGluZ1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+IDogbnVsbDtcblx0XHR2YXIgY2xlYXIgPSB0aGlzLnByb3BzLmNsZWFyYWJsZSAmJiB0aGlzLnByb3BzLnZhbHVlICYmICF0aGlzLnByb3BzLmRpc2FibGVkID8gXG5cdFx0XHQ8c3BhbiBjbGFzc05hbWU9XCJzZWxlY3QtLWNsZWFyXCIgXG5cdFx0XHRcdCAgdGl0bGU9e3RoaXMucHJvcHMuY2xlYXJUZXh0fSBcblx0XHRcdFx0ICBhcmlhLWxhYmVsPXt0aGlzLnByb3BzLmNsZWFyVGV4dH0gXG5cdFx0XHRcdCAgb25Nb3VzZURvd249e3RoaXMuY2xlYXJWYWx1ZX0gb25DbGljaz17dGhpcy5jbGVhclZhbHVlfSBkYW5nZXJvdXNseVNldElubmVySFRNTD17eyBfX2h0bWw6ICcmdGltZXM7JyB9fSBcblx0XHRcdFx0Lz4gOiBcblx0XHRcdG51bGw7XG5cdFx0XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPXt0aGlzLnByb3BzLmNsYXNzTmFtZX0gb25LZXlEb3duPXt0aGlzLnByb3BzLm9uS2V5RG93bn0gXG5cdFx0XHRcdCBvbk1vdXNlRG93bj17dGhpcy5wcm9wcy5vbk1vdXNlRG93bn0gb25Ub3VjaEVuZD17dGhpcy5wcm9wcy5vblRvdWNoRW5kfT5cblx0XHRcdFx0e3RoaXMucmVuZGVyVmFsdWVzKCl9XG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0aGlzLnByb3BzLnNlYXJjaGFibGUgJiYgIXRoaXMucHJvcHMuZGlzYWJsZWQgP1xuXHRcdFx0XHRcdFx0PElucHV0IHZhbHVlPXt0aGlzLnByb3BzLmlucHV0VmFsdWV9IG9uQ2hhbmdlPXt0aGlzLmhhbmRsZUlucHV0Q2hhbmdlfSBtaW5XaWR0aD1cIjVcIiB7Li4udGhpcy5wcm9wcy5pbnB1dFByb3BzfSAvPiA6XG5cdFx0XHRcdFx0XHQ8ZGl2IHsuLi50aGlzLnByb3BzLmlucHV0UHJvcHN9PnsgdGhpcy5wcm9wcy5pbnB1dFZhbHVlID8gdGhpcy5wcm9wcy5pbnB1dFZhbHVlIDogU3RyaW5nLmZyb21DaGFyQ29kZSgxNjApIH08L2Rpdj5cblx0XHRcdFx0fVxuXHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9XCJzZWxlY3QtLWFycm93XCIgLz5cblx0XHRcdFx0e2xvYWRpbmd9XG5cdFx0XHRcdHtjbGVhcn1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbi8ve2xvYWRpbmd9XG4vL3tjbGVhcn1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbDtcbiIsInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0JyksXG4gICAgY2xhc3NlcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxudmFyIE9wdGlvbiA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0cHJvcFR5cGVzOiB7XG5cdFx0b3B0aW9uICAgICAgICAgXHQ6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCwgICAgICAgICAgICAvLyBhcnJheSBvZiBvcHRpb25zXG5cdFx0b25Gb2N1cyAgICAgICAgIDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcblx0XHRvblNlbGVjdGVkICAgICAgOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuXHRcdGhhc0ZvY3VzICAgICAgICA6IFJlYWN0LlByb3BUeXBlcy5ib29sXG5cdH0sXG5cblx0Z2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0aGFzRm9jdXM6IGZhbHNlXG5cdFx0fTtcblx0fSxcblx0XG5cdGhhbmRsZU1vdXNlRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMucHJvcHMub25Gb2N1cyh0aGlzLnByb3BzLm9wdGlvbilcblx0fSxcblx0aGFuZGxlTW91c2VEb3duOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnByb3BzLm9uU2VsZWN0ZWQodGhpcy5wcm9wcy5vcHRpb24pXG5cdH0sXG5cdFxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2xhc3NOYW1lcyA9IGNsYXNzZXMoe1xuICAgICAgICAgICAgJ3NlbGVjdC0tb3B0aW9uJzogdHJ1ZSxcbiAgICAgICAgICAgICdzZWxlY3QtLW9wdGlvbl9faXMtZm9jdXNlZCc6IHRoaXMucHJvcHMuaGFzRm9jdXNcbiAgICAgICAgfSk7XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9e2NsYXNzTmFtZXN9IGtleT17J29wdGlvbi0nICsgdGhpcy5wcm9wcy5vcHRpb24udmFsdWV9XG5cdFx0XHRcdCBvbk1vdXNlRW50ZXI9e3RoaXMuaGFuZGxlTW91c2VFbnRlcn0gb25Nb3VzZURvd249e3RoaXMuaGFuZGxlTW91c2VEb3dufSBvbkNsaWNrPXt0aGlzLmhhbmRsZU1vdXNlRG93bn0gPlxuXHRcdFx0XHR7dGhpcy5wcm9wcy5vcHRpb24ubGFiZWx9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9wdGlvbjtcbiIsInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0JyksXG4gICAgY2xhc3NlcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxudmFyIE9wdGlvbiA9IHJlcXVpcmUoJy4vT3B0aW9uJyksXG5cdEFjdGlvbiA9IHJlcXVpcmUoJy4vQWN0aW9uJyk7XG5cbnZhciBPcHRpb25MaXN0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRwcm9wVHlwZXM6IHtcbiAgICAgICAgYWN0aW9ucyAgICAgICAgIFx0OiBSZWFjdC5Qcm9wVHlwZXMuYXJyYXkuaXNSZXF1aXJlZCwgICAgICAgICAgICAvLyBhcnJheSBvZiBhY3Rpb25zXG4gICAgICAgIG9wdGlvbnMgICAgICAgICBcdDogUmVhY3QuUHJvcFR5cGVzLmFycmF5LmlzUmVxdWlyZWQsICAgICAgICAgICAgLy8gYXJyYXkgb2Ygb3B0aW9uc1xuXHRcdG9uRm9jdXNDaGFuZ2UgICBcdDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcblx0XHRvbkFjdGlvblNlbGVjdGVkICAgXHQ6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxuXHRcdG9uQWN0aW9uRm9jdXMgICBcdDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIG9uQ2hhbmdlICAgICAgICBcdDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcblx0XHRmb2N1c2VkT3B0aW9uICAgXHQ6IFJlYWN0LlByb3BUeXBlcy5vYmplY3RcbiAgICB9LFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHtcblx0XHRcdGZvY3VzZWRPcHRpb246IHt9LFxuXHRcdFx0b25BY3Rpb25TZWxlY3RlZDogZnVuY3Rpb24oKXt9XG4gICAgICAgIH07XG4gICAgfSxcblxuXHRyZW5kZXJBY3Rpb25zOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5wcm9wcy5hY3Rpb25zID8gdGhpcy5wcm9wcy5hY3Rpb25zLm1hcChmdW5jdGlvbihhY3Rpb24pIHtcblx0XHRcdHZhciBoYXNGb2N1cyA9ICF0aGlzLnByb3BzLmZvY3VzZWRPcHRpb24udmFsdWU7XG5cdFx0XHR2YXIgcmVmID0gaGFzRm9jdXMgPyAnZm9jdXNlZCcgOiBudWxsO1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PEFjdGlvbiBhY3Rpb249e2FjdGlvbn0ga2V5PXsnYWN0aW9uLScgKyBhY3Rpb24udmFsdWV9IHJlZj17cmVmfSBoYXNGb2N1cz17aGFzRm9jdXN9XG5cdFx0XHRcdFx0XHRvbkZvY3VzPXt0aGlzLnByb3BzLm9uRm9jdXNDaGFuZ2V9IG9uU2VsZWN0ZWQ9e3RoaXMucHJvcHMub25BY3Rpb25TZWxlY3RlZH0gLz5cblx0XHRcdClcblx0XHR9LmJpbmQodGhpcykpIDogbnVsbDtcblx0fSxcblxuXHRyZW5kZXJPcHRpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMub3B0aW9ucy5tYXAoZnVuY3Rpb24ob3ApIHtcblx0XHRcdHZhciBoYXNGb2N1cyA9IG9wLnZhbHVlID09PSB0aGlzLnByb3BzLmZvY3VzZWRPcHRpb24udmFsdWU7XG4gICAgICAgICAgICB2YXIgcmVmID0gaGFzRm9jdXMgPyAnZm9jdXNlZCcgOiBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8T3B0aW9uIG9wdGlvbj17b3B9IGtleT17J29wdGlvbi0nICsgb3AudmFsdWV9IHJlZj17cmVmfSBoYXNGb2N1cz17aGFzRm9jdXN9XG4gICAgICAgICAgICAgICAgICAgICBvbkZvY3VzPXt0aGlzLnByb3BzLm9uRm9jdXNDaGFuZ2V9IG9uU2VsZWN0ZWQ9e3RoaXMucHJvcHMub25DaGFuZ2V9ID5cbiAgICAgICAgICAgICAgICAgICAge29wLmxhYmVsfVxuICAgICAgICAgICAgICAgIDwvT3B0aW9uPlxuICAgICAgICAgICAgKVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuXHR9LFxuXG5cdHJlbmRlckVtcHR5TGlzdDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwic2VsZWN0LS1tZW51X19uby1yZXN1bHRzXCI+XG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0aGlzLnByb3BzLmFzeW5jT3B0aW9ucyAmJiAhdGhpcy5zdGF0ZS5pbnB1dFZhbHVlID9cblx0XHRcdFx0XHRcdHRoaXMucHJvcHMuc2VhcmNoUHJvbXB0VGV4dCA6XG5cdFx0XHRcdFx0XHR0aGlzLnByb3BzLm5vUmVzdWx0c1RleHRcblx0XHRcdFx0fVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcdFx0XG5cdH0sXG5cdFxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICh0aGlzLnByb3BzLm9wdGlvbnMubGVuZ3RoID09PSAwICYmIHRoaXMucHJvcHMuYWN0aW9ucyA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIHRoaXMucmVuZGVyRW1wdHlMaXN0KCk7XG5cdFx0fSBcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJzZWxlY3QtLW1lbnVcIj5cblx0XHRcdFx0e3RoaXMucmVuZGVyQWN0aW9ucygpfVxuXHRcdFx0XHR7dGhpcy5yZW5kZXJPcHRpb25zKCl9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuICAgIH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gT3B0aW9uTGlzdDtcbiIsInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBPcHRpb24gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cblx0ZGlzcGxheU5hbWU6ICdWYWx1ZScsXG5cblx0cHJvcFR5cGVzOiB7XG5cdFx0bGFiZWw6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZFxuXHR9LFxuXG5cdGJsb2NrRXZlbnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgbGFiZWwgPSB0aGlzLnByb3BzLmxhYmVsO1xuXG5cdFx0aWYgKHRoaXMucHJvcHMub3B0aW9uTGFiZWxDbGljaykge1xuXHRcdFx0bGFiZWwgPSAoXG5cdFx0XHRcdDxhIGNsYXNzTmFtZT1cIlNlbGVjdC1pdGVtLWxhYmVsX19hXCJcblx0XHRcdFx0XHRvbk1vdXNlRG93bj17dGhpcy5ibG9ja0V2ZW50fVxuXHRcdFx0XHRcdG9uVG91Y2hFbmQ9e3RoaXMucHJvcHMub25PcHRpb25MYWJlbENsaWNrfVxuXHRcdFx0XHRcdG9uQ2xpY2s9e3RoaXMucHJvcHMub25PcHRpb25MYWJlbENsaWNrfT5cblx0XHRcdFx0XHR7bGFiZWx9XG5cdFx0XHRcdDwvYT5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiU2VsZWN0LWl0ZW1cIj5cblx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPVwiU2VsZWN0LWl0ZW0taWNvblwiXG5cdFx0XHRcdFx0b25Nb3VzZURvd249e3RoaXMuYmxvY2tFdmVudH1cblx0XHRcdFx0XHRvbkNsaWNrPXt0aGlzLnByb3BzLm9uUmVtb3ZlfVxuXHRcdFx0XHRcdG9uVG91Y2hFbmQ9e3RoaXMucHJvcHMub25SZW1vdmV9PiZ0aW1lczs8L3NwYW4+XG5cdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cIlNlbGVjdC1pdGVtLWxhYmVsXCI+e2xhYmVsfTwvc3Bhbj5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gT3B0aW9uO1xuIiwidmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKSxcblx0UmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpLFxuXHRJbnB1dCA9IHJlcXVpcmUoJ3JlYWN0LWlucHV0LWF1dG9zaXplJyksXG5cdGNsYXNzZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbnZhciBDb250cm9sID0gcmVxdWlyZSgnLi9Db250cm9sJyksXG5cdE9wdGlvbkxpc3QgPSByZXF1aXJlKCcuL09wdGlvbkxpc3QnKTtcblxudmFyIHJlcXVlc3RJZCA9IDA7XG5cbnZhciBTZWxlY3QgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cblx0ZGlzcGxheU5hbWU6ICdTZWxlY3QnLFxuXG5cdHByb3BUeXBlczoge1xuXHRcdHZhbHVlOiBSZWFjdC5Qcm9wVHlwZXMuYW55LCAgICAgICAgICAgICAgICAvLyBpbml0aWFsIGZpZWxkIHZhbHVlXG5cdFx0bXVsdGk6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAgICAgIC8vIG11bHRpLXZhbHVlIGlucHV0XG5cdFx0ZGlzYWJsZWQ6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAgIC8vIHdoZXRoZXIgdGhlIFNlbGVjdCBpcyBkaXNhYmxlZCBvciBub3Rcblx0XHRvcHRpb25zOiBSZWFjdC5Qcm9wVHlwZXMuYXJyYXksICAgICAgICAgICAgLy8gYXJyYXkgb2Ygb3B0aW9uc1xuXHRcdGRlbGltaXRlcjogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgICAvLyBkZWxpbWl0ZXIgdG8gdXNlIHRvIGpvaW4gbXVsdGlwbGUgdmFsdWVzXG5cdFx0YXN5bmNPcHRpb25zOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgIC8vIGZ1bmN0aW9uIHRvIGNhbGwgdG8gZ2V0IG9wdGlvbnNcblx0XHRhdXRvbG9hZDogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgICAgLy8gd2hldGhlciB0byBhdXRvLWxvYWQgdGhlIGRlZmF1bHQgYXN5bmMgb3B0aW9ucyBzZXRcblx0XHRwbGFjZWhvbGRlcjogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgLy8gZmllbGQgcGxhY2Vob2xkZXIsIGRpc3BsYXllZCB3aGVuIHRoZXJlJ3Mgbm8gdmFsdWVcblx0XHRub1Jlc3VsdHNUZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgLy8gcGxhY2Vob2xkZXIgZGlzcGxheWVkIHdoZW4gdGhlcmUgYXJlIG5vIG1hdGNoaW5nIHNlYXJjaCByZXN1bHRzXG5cdFx0Y2xlYXJhYmxlOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgIC8vIHNob3VsZCBpdCBiZSBwb3NzaWJsZSB0byByZXNldCB2YWx1ZVxuXHRcdGNsZWFyVmFsdWVUZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAvLyB0aXRsZSBmb3IgdGhlIFwiY2xlYXJcIiBjb250cm9sXG5cdFx0Y2xlYXJBbGxUZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgIC8vIHRpdGxlIGZvciB0aGUgXCJjbGVhclwiIGNvbnRyb2wgd2hlbiBtdWx0aTogdHJ1ZVxuXHRcdHNlYXJjaGFibGU6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAvLyB3aGV0aGVyIHRvIGVuYWJsZSBzZWFyY2hpbmcgZmVhdHVyZSBvciBub3Rcblx0XHRzZWFyY2hQcm9tcHRUZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgLy8gbGFiZWwgdG8gcHJvbXB0IGZvciBzZWFyY2ggaW5wdXRcblx0XHRuYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgICAgICAgLy8gZmllbGQgbmFtZSwgZm9yIGhpZGRlbiA8aW5wdXQgLz4gdGFnXG5cdFx0b25DaGFuZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgICAgIC8vIG9uQ2hhbmdlIGhhbmRsZXI6IGZ1bmN0aW9uKG5ld1ZhbHVlKSB7fVxuXHRcdG9uRm9jdXM6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgICAgICAvLyBvbkZvY3VzIGhhbmRsZXI6IGZ1bmN0aW9uKGV2ZW50KSB7fVxuXHRcdG9uQmx1cjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgICAgICAvLyBvbkJsdXIgaGFuZGxlcjogZnVuY3Rpb24oZXZlbnQpIHt9XG5cdFx0Y2xhc3NOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgIC8vIGNsYXNzTmFtZSBmb3IgdGhlIG91dGVyIGVsZW1lbnRcblx0XHRmaWx0ZXJPcHRpb246IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgLy8gbWV0aG9kIHRvIGZpbHRlciBhIHNpbmdsZSBvcHRpb246IGZ1bmN0aW9uKG9wdGlvbiwgZmlsdGVyU3RyaW5nKVxuXHRcdGZpbHRlck9wdGlvbnM6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAvLyBtZXRob2QgdG8gZmlsdGVyIHRoZSBvcHRpb25zIGFycmF5OiBmdW5jdGlvbihbb3B0aW9uc10sIGZpbHRlclN0cmluZywgW3ZhbHVlc10pXG5cdFx0bWF0Y2hQb3M6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgICAgIC8vIChhbnl8c3RhcnQpIG1hdGNoIHRoZSBzdGFydCBvciBlbnRpcmUgc3RyaW5nIHdoZW4gZmlsdGVyaW5nXG5cdFx0bWF0Y2hQcm9wOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgIC8vIChhbnl8bGFiZWx8dmFsdWUpIHdoaWNoIG9wdGlvbiBwcm9wZXJ0eSB0byBmaWx0ZXIgb25cblx0XHRpbnB1dFByb3BzOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LCAgICAgICAgLy8gY3VzdG9tIGF0dHJpYnV0ZXMgZm9yIHRoZSBJbnB1dCAoaW4gdGhlIFNlbGVjdC1jb250cm9sKSBlLmc6IHsnZGF0YS1mb28nOiAnYmFyJ31cblx0XHR0YWdnaW5nOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgICAgLy8gd2hldGhlciBhIG5ldyBvcHRpb24gY2FuIGJlIGNyZWF0ZWQgYnkgZ2l2aW5nIGEgbmFtZVxuXHRcdHRhZ2dpbmdQbGFjZWhvbGRlcjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAvLyByZXR1cm5zIHRoZSB0ZXh0IHRvIGJlIGRpc3BsYXllZCBhZnRlciB0aGUgbmV3IG9wdGlvblxuXG5cdFx0Lypcblx0XHQqIEFsbG93IHVzZXIgdG8gbWFrZSBvcHRpb24gbGFiZWwgY2xpY2thYmxlLiBXaGVuIHRoaXMgaGFuZGxlciBpcyBkZWZpbmVkIHdlIHNob3VsZFxuXHRcdCogd3JhcCBsYWJlbCBpbnRvIDxhPmxhYmVsPC9hPiB0YWcuXG5cdFx0KlxuXHRcdCogb25PcHRpb25MYWJlbENsaWNrIGhhbmRsZXI6IGZ1bmN0aW9uICh2YWx1ZSwgZXZlbnQpIHt9XG5cdFx0KlxuXHRcdCovXG5cdFx0b25PcHRpb25MYWJlbENsaWNrOiBSZWFjdC5Qcm9wVHlwZXMuZnVuY1xuXHR9LFxuXG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHZhbHVlOiB1bmRlZmluZWQsXG5cdFx0XHRvcHRpb25zOiBbXSxcblx0XHRcdGRpc2FibGVkOiBmYWxzZSxcblx0XHRcdGRlbGltaXRlcjogJywnLFxuXHRcdFx0YXN5bmNPcHRpb25zOiB1bmRlZmluZWQsXG5cdFx0XHRhdXRvbG9hZDogdHJ1ZSxcblx0XHRcdHBsYWNlaG9sZGVyOiAnU2VsZWN0Li4uJyxcblx0XHRcdG5vUmVzdWx0c1RleHQ6ICdObyByZXN1bHRzIGZvdW5kJyxcblx0XHRcdGNsZWFyYWJsZTogdHJ1ZSxcblx0XHRcdGNsZWFyVmFsdWVUZXh0OiAnQ2xlYXIgdmFsdWUnLFxuXHRcdFx0Y2xlYXJBbGxUZXh0OiAnQ2xlYXIgYWxsJyxcblx0XHRcdHNlYXJjaGFibGU6IHRydWUsXG5cdFx0XHRzZWFyY2hQcm9tcHRUZXh0OiAnVHlwZSB0byBzZWFyY2gnLFxuXHRcdFx0bmFtZTogdW5kZWZpbmVkLFxuXHRcdFx0b25DaGFuZ2U6IHVuZGVmaW5lZCxcblx0XHRcdGNsYXNzTmFtZTogdW5kZWZpbmVkLFxuXHRcdFx0bWF0Y2hQb3M6ICdhbnknLFxuXHRcdFx0bWF0Y2hQcm9wOiAnYW55Jyxcblx0XHRcdGlucHV0UHJvcHM6IHt9LFxuXHRcdFx0dGFnZ2luZzogZmFsc2UsXG5cdFx0XHR0YWdnaW5nUGxhY2Vob2xkZXI6IGZ1bmN0aW9uKGN1cnJlbnRWYWx1ZSkge1xuXHRcdFx0XHRyZXR1cm4gJ1ByZXNzIGVudGVyIG9yIGNsaWNrIHRvIGNyZWF0ZSBcXCcnICsgY3VycmVudFZhbHVlICsgJ1xcJyBhcyBhIG5ldyB0YWcuLi4nXG5cdFx0XHR9LFxuXHRcdFx0b25PcHRpb25MYWJlbENsaWNrOiB1bmRlZmluZWRcblx0XHR9O1xuXHR9LFxuXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdC8qXG5cdFx0XHQgKiBzZXQgYnkgZ2V0U3RhdGVGcm9tVmFsdWUgb24gY29tcG9uZW50V2lsbE1vdW50OlxuXHRcdFx0ICogLSB2YWx1ZVxuXHRcdFx0ICogLSB2YWx1ZXNcblx0XHRcdCAqIC0gZmlsdGVyZWRPcHRpb25zXG5cdFx0XHQgKiAtIGlucHV0VmFsdWVcblx0XHRcdCAqIC0gcGxhY2Vob2xkZXJcblx0XHRcdCAqIC0gZm9jdXNlZE9wdGlvblxuXHRcdFx0Ki9cblx0XHRcdGFjdGlvbnM6IFtdLFxuXHRcdFx0b3B0aW9uczogdGhpcy5wcm9wcy5vcHRpb25zLFxuXHRcdFx0aXNGb2N1c2VkOiBmYWxzZSxcblx0XHRcdGlzT3BlbjogZmFsc2UsXG5cdFx0XHRpc0xvYWRpbmc6IGZhbHNlXG5cdFx0fTtcblx0fSxcblxuXHRjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuX29wdGlvbnNDYWNoZSA9IHt9O1xuXHRcdHRoaXMuX29wdGlvbnNGaWx0ZXJTdHJpbmcgPSAnJztcblx0XHR0aGlzLnNldFN0YXRlKHRoaXMuZ2V0U3RhdGVGcm9tVmFsdWUodGhpcy5wcm9wcy52YWx1ZSkpO1xuXG5cdFx0aWYgKHRoaXMucHJvcHMuYXN5bmNPcHRpb25zICYmIHRoaXMucHJvcHMuYXV0b2xvYWQpIHtcblx0XHRcdHRoaXMuYXV0b2xvYWRBc3luY09wdGlvbnMoKTtcblx0XHR9XG5cblx0XHR0aGlzLl9jbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGlmICghdGhpcy5zdGF0ZS5pc09wZW4pIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIG1lbnVFbGVtID0gdGhpcy5yZWZzLnNlbGVjdE1lbnVDb250YWluZXIuZ2V0RE9NTm9kZSgpO1xuXHRcdFx0dmFyIGNvbnRyb2xFbGVtID0gdGhpcy5yZWZzLmNvbnRyb2wuZ2V0RE9NTm9kZSgpO1xuXG5cdFx0XHR2YXIgZXZlbnRPY2N1cmVkT3V0c2lkZU1lbnUgPSB0aGlzLmNsaWNrZWRPdXRzaWRlRWxlbWVudChtZW51RWxlbSwgZXZlbnQpO1xuXHRcdFx0dmFyIGV2ZW50T2NjdXJlZE91dHNpZGVDb250cm9sID0gdGhpcy5jbGlja2VkT3V0c2lkZUVsZW1lbnQoY29udHJvbEVsZW0sIGV2ZW50KTtcblxuXHRcdFx0Ly8gSGlkZSBkcm9wZG93biBtZW51IGlmIGNsaWNrIG9jY3VycmVkIG91dHNpZGUgb2YgbWVudVxuXHRcdFx0aWYgKGV2ZW50T2NjdXJlZE91dHNpZGVNZW51ICYmIGV2ZW50T2NjdXJlZE91dHNpZGVDb250cm9sKSB7XG5cdFx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRcdGlzT3BlbjogZmFsc2Vcblx0XHRcdFx0fSwgdGhpcy5fdW5iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSk7XG5cdFx0XHR9XG5cdFx0fS5iaW5kKHRoaXMpO1xuXG5cdFx0dGhpcy5fYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fY2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSk7XG5cdFx0fTtcblxuXHRcdHRoaXMuX3VuYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fY2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSk7XG5cdFx0fTtcblx0fSxcblxuXHRjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG5cdFx0Y2xlYXJUaW1lb3V0KHRoaXMuX2JsdXJUaW1lb3V0KTtcblx0XHRjbGVhclRpbWVvdXQodGhpcy5fZm9jdXNUaW1lb3V0KTtcblxuXHRcdGlmKHRoaXMuc3RhdGUuaXNPcGVuKSB7XG5cdFx0XHR0aGlzLl91bmJpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKCk7XG5cdFx0fVxuXHR9LFxuXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKG5ld1Byb3BzKSB7XG5cdFx0aWYgKEpTT04uc3RyaW5naWZ5KG5ld1Byb3BzLm9wdGlvbnMpICE9PSBKU09OLnN0cmluZ2lmeSh0aGlzLnByb3BzLm9wdGlvbnMpKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0b3B0aW9uczogbmV3UHJvcHMub3B0aW9ucyxcblx0XHRcdFx0ZmlsdGVyZWRPcHRpb25zOiB0aGlzLmZpbHRlck9wdGlvbnMobmV3UHJvcHMub3B0aW9ucylcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRpZiAodGhpcy5wcm9wcy52YWx1ZSAhPT0gbmV3UHJvcHMudmFsdWUgJiYgbmV3UHJvcHMudmFsdWUgIT09IHRoaXMuc3RhdGUudmFsdWUpIHtcblx0XHRcdHRoaXMuc2V0U3RhdGUodGhpcy5nZXRTdGF0ZUZyb21WYWx1ZShuZXdQcm9wcy52YWx1ZSwgbmV3UHJvcHMub3B0aW9ucykpO1xuXHRcdH1cblx0fSxcblxuXHRjb21wb25lbnREaWRVcGRhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICh0aGlzLl9mb2N1c0FmdGVyVXBkYXRlKSB7XG5cdFx0XHRjbGVhclRpbWVvdXQodGhpcy5fYmx1clRpbWVvdXQpO1xuXHRcdFx0dGhpcy5fZm9jdXNUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0dGhpcy5nZXRJbnB1dE5vZGUoKS5mb2N1cygpO1xuXHRcdFx0XHR0aGlzLl9mb2N1c0FmdGVyVXBkYXRlID0gZmFsc2U7XG5cdFx0XHR9LmJpbmQodGhpcyksIDUwKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5fZm9jdXNlZE9wdGlvblJldmVhbCkge1xuXHRcdFx0aWYgKHRoaXMucmVmcy5tZW51ICYmIHRoaXMucmVmcy5tZW51LnJlZnMuZm9jdXNlZCkge1xuXHRcdFx0XHR2YXIgZm9jdXNlZERPTSA9IHRoaXMucmVmcy5tZW51LnJlZnMuZm9jdXNlZC5nZXRET01Ob2RlKCk7XG5cdFx0XHRcdHZhciBtZW51RE9NID0gdGhpcy5yZWZzLm1lbnUuZ2V0RE9NTm9kZSgpO1xuXHRcdFx0XHR2YXIgZm9jdXNlZFJlY3QgPSBmb2N1c2VkRE9NLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0XHR2YXIgbWVudVJlY3QgPSBtZW51RE9NLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG5cdFx0XHRcdGlmIChmb2N1c2VkUmVjdC5ib3R0b20gPiBtZW51UmVjdC5ib3R0b20gfHxcblx0XHRcdFx0XHRmb2N1c2VkUmVjdC50b3AgPCBtZW51UmVjdC50b3ApIHtcblx0XHRcdFx0XHRtZW51RE9NLnNjcm9sbFRvcCA9IChmb2N1c2VkRE9NLm9mZnNldFRvcCArIGZvY3VzZWRET00uY2xpZW50SGVpZ2h0IC0gbWVudURPTS5vZmZzZXRIZWlnaHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuX2ZvY3VzZWRPcHRpb25SZXZlYWwgPSBmYWxzZTtcblx0XHR9XG5cdH0sXG5cblx0Y2xpY2tlZE91dHNpZGVFbGVtZW50OiBmdW5jdGlvbihlbGVtZW50LCBldmVudCkge1xuXHRcdHZhciBldmVudFRhcmdldCA9IChldmVudC50YXJnZXQpID8gZXZlbnQudGFyZ2V0IDogZXZlbnQuc3JjRWxlbWVudDtcblx0XHR3aGlsZSAoZXZlbnRUYXJnZXQgIT0gbnVsbCkge1xuXHRcdFx0aWYgKGV2ZW50VGFyZ2V0ID09PSBlbGVtZW50KSByZXR1cm4gZmFsc2U7XG5cdFx0XHRldmVudFRhcmdldCA9IGV2ZW50VGFyZ2V0Lm9mZnNldFBhcmVudDtcblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0sXG5cblx0Z2V0U3RhdGVGcm9tVmFsdWU6IGZ1bmN0aW9uKHZhbHVlLCBvcHRpb25zKSB7XG5cdFx0aWYgKCFvcHRpb25zKSB7XG5cdFx0XHRvcHRpb25zID0gdGhpcy5zdGF0ZS5vcHRpb25zO1xuXHRcdH1cblxuXHRcdC8vIHJlc2V0IGludGVybmFsIGZpbHRlciBzdHJpbmdcblx0XHR0aGlzLl9vcHRpb25zRmlsdGVyU3RyaW5nID0gJyc7XG5cblx0XHR2YXIgdmFsdWVzID0gdGhpcy5pbml0VmFsdWVzQXJyYXkodmFsdWUsIG9wdGlvbnMpLFxuXHRcdFx0ZmlsdGVyZWRPcHRpb25zID0gdGhpcy5maWx0ZXJPcHRpb25zKG9wdGlvbnMsIHZhbHVlcyk7XG5cdFx0XG5cdFx0cmV0dXJuIHtcblx0XHRcdHZhbHVlOiB2YWx1ZXMubWFwKGZ1bmN0aW9uKHYpIHsgcmV0dXJuIHYudmFsdWU7IH0pLmpvaW4odGhpcy5wcm9wcy5kZWxpbWl0ZXIpLFxuXHRcdFx0dmFsdWVzOiB2YWx1ZXMsXG5cdFx0XHRpbnB1dFZhbHVlOiAnJyxcblx0XHRcdGZpbHRlcmVkT3B0aW9uczogZmlsdGVyZWRPcHRpb25zLFxuXHRcdFx0cGxhY2Vob2xkZXI6ICF0aGlzLnByb3BzLm11bHRpICYmIHZhbHVlcy5sZW5ndGggPyB2YWx1ZXNbMF0ubGFiZWwgOiB0aGlzLnByb3BzLnBsYWNlaG9sZGVyLFxuXHRcdFx0Zm9jdXNlZE9wdGlvbjogIXRoaXMucHJvcHMubXVsdGkgJiYgdmFsdWVzLmxlbmd0aCA/IHZhbHVlc1swXSA6IHRoaXMuZ2V0QXV0b21hdGljRm9jdXNlZE9wdGlvbihmaWx0ZXJlZE9wdGlvbnMsICcnKVxuXHRcdH07XG5cdH0sXG5cblx0aW5pdFZhbHVlc0FycmF5OiBmdW5jdGlvbih2YWx1ZXMsIG9wdGlvbnMpIHtcblx0XHRpZiAoIUFycmF5LmlzQXJyYXkodmFsdWVzKSkge1xuXHRcdFx0aWYgKHR5cGVvZiB2YWx1ZXMgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdHZhbHVlcyA9IHZhbHVlcy5zcGxpdCh0aGlzLnByb3BzLmRlbGltaXRlcik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YWx1ZXMgPSB2YWx1ZXMgPyBbdmFsdWVzXSA6IFtdO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB2YWx1ZXMubWFwKGZ1bmN0aW9uKHZhbCkge1xuXHRcdFx0cmV0dXJuICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJykgPyB2YWwgPSBfLmZpbmRXaGVyZShvcHRpb25zLCB7IHZhbHVlOiB2YWwgfSkgfHwgeyB2YWx1ZTogdmFsLCBsYWJlbDogdmFsIH0gOiB2YWw7XG5cdFx0fSk7XG5cdH0sXG5cblx0c2V0VmFsdWU6IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0dGhpcy5fZm9jdXNBZnRlclVwZGF0ZSA9IHRydWU7XG5cdFx0dmFyIG5ld1N0YXRlID0gdGhpcy5nZXRTdGF0ZUZyb21WYWx1ZSh2YWx1ZSk7XG5cdFx0bmV3U3RhdGUuaXNPcGVuID0gZmFsc2U7XG5cdFx0dGhpcy5maXJlQ2hhbmdlRXZlbnQobmV3U3RhdGUpO1xuXHRcdHRoaXMuc2V0U3RhdGUobmV3U3RhdGUpO1xuXHR9LFxuXG5cdHNlbGVjdFZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdGlmICghdGhpcy5wcm9wcy5tdWx0aSkge1xuXHRcdFx0dGhpcy5zZXRWYWx1ZSh2YWx1ZSk7XG5cdFx0fSBlbHNlIGlmICh2YWx1ZSkge1xuXHRcdFx0dGhpcy5hZGRWYWx1ZSh2YWx1ZSk7XG5cdFx0fVxuXHRcdHRoaXMuX3VuYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUoKTtcblx0fSxcblxuXHRhZGRWYWx1ZTogZnVuY3Rpb24odmFsdWUpIHtcblx0XHR0aGlzLnNldFZhbHVlKHRoaXMuc3RhdGUudmFsdWVzLmNvbmNhdCh2YWx1ZSkpO1xuXHR9LFxuXG5cdHBvcFZhbHVlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnNldFZhbHVlKF8uaW5pdGlhbCh0aGlzLnN0YXRlLnZhbHVlcykpO1xuXHR9LFxuXG5cdHJlbW92ZVZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdHRoaXMuc2V0VmFsdWUoXy53aXRob3V0KHRoaXMuc3RhdGUudmFsdWVzLCB2YWx1ZSkpO1xuXHR9LFxuXG5cdGNsZWFyVmFsdWU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc2V0VmFsdWUobnVsbCk7XG5cdH0sXG5cblx0cmVzZXRWYWx1ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zZXRWYWx1ZSh0aGlzLnN0YXRlLnZhbHVlKTtcblx0fSxcblxuXHRnZXRJbnB1dE5vZGU6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgaW5wdXQgPSB0aGlzLnJlZnMuY29udHJvbC5yZWZzLmlucHV0O1xuXHRcdHJldHVybiB0aGlzLnByb3BzLnNlYXJjaGFibGUgPyBpbnB1dCA6IGlucHV0LmdldERPTU5vZGUoKTtcblx0fSxcblxuXHRmaXJlQ2hhbmdlRXZlbnQ6IGZ1bmN0aW9uKG5ld1N0YXRlKSB7XG5cdFx0aWYgKG5ld1N0YXRlLnZhbHVlICE9PSB0aGlzLnN0YXRlLnZhbHVlICYmIHRoaXMucHJvcHMub25DaGFuZ2UpIHtcblx0XHRcdHRoaXMucHJvcHMub25DaGFuZ2UobmV3U3RhdGUudmFsdWUsIG5ld1N0YXRlLnZhbHVlcyk7XG5cdFx0fVxuXHR9LFxuXG5cdGhhbmRsZU1vdXNlRG93bjogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHQvLyBpZiB0aGUgZXZlbnQgd2FzIHRyaWdnZXJlZCBieSBhIG1vdXNlZG93biBhbmQgbm90IHRoZSBwcmltYXJ5XG5cdFx0Ly8gYnV0dG9uLCBvciBpZiB0aGUgY29tcG9uZW50IGlzIGRpc2FibGVkLCBpZ25vcmUgaXQuXG5cdFx0aWYgKHRoaXMucHJvcHMuZGlzYWJsZWQgfHwgKGV2ZW50LnR5cGUgPT09ICdtb3VzZWRvd24nICYmIGV2ZW50LmJ1dHRvbiAhPT0gMCkpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGlmICh0aGlzLnN0YXRlLmlzRm9jdXNlZCkge1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGlzT3BlbjogdHJ1ZVxuXHRcdFx0fSwgdGhpcy5fYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9vcGVuQWZ0ZXJGb2N1cyA9IHRydWU7XG5cdFx0XHR0aGlzLmdldElucHV0Tm9kZSgpLmZvY3VzKCk7XG5cdFx0fVxuXHR9LFxuXG5cdGhhbmRsZUlucHV0Rm9jdXM6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0dmFyIG5ld0lzT3BlbiA9IHRoaXMuc3RhdGUuaXNPcGVuIHx8IHRoaXMuX29wZW5BZnRlckZvY3VzO1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0aXNGb2N1c2VkOiB0cnVlLFxuXHRcdFx0aXNPcGVuOiBuZXdJc09wZW5cblx0XHR9LCBmdW5jdGlvbigpIHtcblx0XHRcdGlmKG5ld0lzT3Blbikge1xuXHRcdFx0XHR0aGlzLl9iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSgpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHRoaXMuX3VuYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLl9vcGVuQWZ0ZXJGb2N1cyA9IGZhbHNlO1xuXG5cdFx0aWYgKHRoaXMucHJvcHMub25Gb2N1cykge1xuXHRcdFx0dGhpcy5wcm9wcy5vbkZvY3VzKGV2ZW50KTtcblx0XHR9XG5cdH0sXG5cblx0aGFuZGxlSW5wdXRCbHVyOiBmdW5jdGlvbihldmVudCkge1xuXHRcdHRoaXMuX2JsdXJUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdGlmICh0aGlzLl9mb2N1c0FmdGVyVXBkYXRlKSByZXR1cm47XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0aXNGb2N1c2VkOiBmYWxzZVxuXHRcdFx0fSk7XG5cdFx0fS5iaW5kKHRoaXMpLCA1MCk7XG5cblx0XHRpZiAodGhpcy5wcm9wcy5vbkJsdXIpIHtcblx0XHRcdHRoaXMucHJvcHMub25CbHVyKGV2ZW50KTtcblx0XHR9XG5cdH0sXG5cblx0aGFuZGxlS2V5RG93bjogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRpZiAodGhpcy5zdGF0ZS5kaXNhYmxlZCkgcmV0dXJuO1xuXG5cdFx0c3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG5cblx0XHRcdGNhc2UgODogLy8gYmFja3NwYWNlXG5cdFx0XHRcdGlmICghdGhpcy5zdGF0ZS5pbnB1dFZhbHVlKSB7XG5cdFx0XHRcdFx0dGhpcy5wb3BWYWx1ZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHRyZXR1cm47XG5cblx0XHRcdGNhc2UgOTogLy8gdGFiXG5cdFx0XHRcdGlmIChldmVudC5zaGlmdEtleSB8fCAhdGhpcy5zdGF0ZS5pc09wZW4gfHwgIXRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbikge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnNlbGVjdEZvY3VzZWRPcHRpb24oKTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIDEzOiAvLyBlbnRlclxuXHRcdFx0XHR0aGlzLnNlbGVjdEZvY3VzZWRPcHRpb24oKTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIDI3OiAvLyBlc2NhcGVcblx0XHRcdFx0aWYgKHRoaXMuc3RhdGUuaXNPcGVuKSB7XG5cdFx0XHRcdFx0dGhpcy5yZXNldFZhbHVlKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy5jbGVhclZhbHVlKCk7XG5cdFx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIDM4OiAvLyB1cFxuXHRcdFx0XHR0aGlzLmZvY3VzUHJldmlvdXNPcHRpb24oKTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIDQwOiAvLyBkb3duXG5cdFx0XHRcdHRoaXMuZm9jdXNOZXh0T3B0aW9uKCk7XG5cdFx0XHRicmVhaztcblxuXHRcdFx0ZGVmYXVsdDogcmV0dXJuO1xuXHRcdH1cblxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdH0sXG5cblx0aGFuZGxlSW5wdXRDaGFuZ2U6IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0Ly8gYXNzaWduIGFuIGludGVybmFsIHZhcmlhYmxlIGJlY2F1c2Ugd2UgbmVlZCB0byB1c2Vcblx0XHQvLyB0aGUgbGF0ZXN0IHZhbHVlIGJlZm9yZSBzZXRTdGF0ZSgpIGhhcyBjb21wbGV0ZWQuXG5cdFx0dGhpcy5fb3B0aW9uc0ZpbHRlclN0cmluZyA9IHZhbHVlO1xuXG5cdFx0aWYgKHRoaXMucHJvcHMuYXN5bmNPcHRpb25zKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0aXNMb2FkaW5nOiB0cnVlLFxuXHRcdFx0XHRpbnB1dFZhbHVlOiB2YWx1ZVxuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLmxvYWRBc3luY09wdGlvbnModmFsdWUsIHtcblx0XHRcdFx0aXNMb2FkaW5nOiBmYWxzZSxcblx0XHRcdFx0aXNPcGVuOiB0cnVlXG5cdFx0XHR9LCB0aGlzLl9iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBmaWx0ZXJlZE9wdGlvbnMgPSB0aGlzLmZpbHRlck9wdGlvbnModGhpcy5zdGF0ZS5vcHRpb25zKTtcblx0XHRcdHZhciBjdXJyZW50QWN0aW9ucyA9IHRoaXMuZ2V0QWN0aW9ucygpO1xuXG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0aXNPcGVuOiB0cnVlLFxuXHRcdFx0XHRpbnB1dFZhbHVlOiB2YWx1ZSxcblx0XHRcdFx0ZmlsdGVyZWRPcHRpb25zOiBmaWx0ZXJlZE9wdGlvbnMsXG5cdFx0XHRcdGFjdGlvbnM6IGN1cnJlbnRBY3Rpb25zLFxuXHRcdFx0XHRmb2N1c2VkT3B0aW9uOiB0aGlzLmdldEF1dG9tYXRpY0ZvY3VzZWRPcHRpb24oZmlsdGVyZWRPcHRpb25zLCB2YWx1ZSlcblx0XHRcdH0sIHRoaXMuX2JpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcblx0XHR9XG5cdH0sXG5cblx0Z2V0QXV0b21hdGljRm9jdXNlZE9wdGlvbjogZnVuY3Rpb24ob3B0aW9ucywgY3VycmVudElucHV0KSB7XG5cdFx0dmFyIGlucHV0ID0gY3VycmVudElucHV0IHx8IHRoaXMuc3RhdGUuaW5wdXRWYWx1ZTtcblx0XHRpZiAodGhpcy5wcm9wcy50YWdnaW5nKSB7XG5cdFx0XHRpZihvcHRpb25zICYmIG9wdGlvbnMubGVuZ3RoICYmIChfLmlzRW1wdHkoaW5wdXQpIHx8ICBpbnB1dCA9PT0gb3B0aW9uc1swXS5sYWJlbCkpIHtcblx0XHRcdFx0cmV0dXJuIG9wdGlvbnNbMF07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gb3B0aW9ucyA/IG9wdGlvbnNbMF0gOiB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9LFxuXG5cdGF1dG9sb2FkQXN5bmNPcHRpb25zOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmxvYWRBc3luY09wdGlvbnMoJycsIHt9LCBmdW5jdGlvbigpIHt9KTtcblx0fSxcblx0XG5cdGxvYWRBc3luY09wdGlvbnM6IGZ1bmN0aW9uKGlucHV0LCBzdGF0ZSkge1xuXHRcdHZhciB0aGlzUmVxdWVzdElkID0gdGhpcy5fY3VycmVudFJlcXVlc3RJZCA9IHJlcXVlc3RJZCsrO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPD0gaW5wdXQubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBjYWNoZUtleSA9IGlucHV0LnNsaWNlKDAsIGkpO1xuXHRcdFx0aWYgKHRoaXMuX29wdGlvbnNDYWNoZVtjYWNoZUtleV0gJiYgKGlucHV0ID09PSBjYWNoZUtleSB8fCB0aGlzLl9vcHRpb25zQ2FjaGVbY2FjaGVLZXldLmNvbXBsZXRlKSkge1xuXHRcdFx0XHR2YXIgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnNDYWNoZVtjYWNoZUtleV0ub3B0aW9ucztcblx0XHRcdFx0dmFyIGZpbHRlcmVkT3B0aW9ucyA9IHRoaXMuZmlsdGVyT3B0aW9ucyhvcHRpb25zKTtcblxuXHRcdFx0XHR0aGlzLnNldFN0YXRlKF8uZXh0ZW5kKHtcblx0XHRcdFx0XHRvcHRpb25zOiBvcHRpb25zLFxuXHRcdFx0XHRcdGZpbHRlcmVkT3B0aW9uczogZmlsdGVyZWRPcHRpb25zLFxuXHRcdFx0XHRcdGZvY3VzZWRPcHRpb246IF8uY29udGFpbnMoZmlsdGVyZWRPcHRpb25zLCB0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24pID8gdGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uIDogdGhpcy5nZXRBdXRvbWF0aWNGb2N1c2VkT3B0aW9uKGZpbHRlcmVkT3B0aW9ucywgaW5wdXQpXG5cdFx0XHRcdH0sIHN0YXRlKSk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLnByb3BzLmFzeW5jT3B0aW9ucyhpbnB1dCwgZnVuY3Rpb24oZXJyLCBkYXRhKSB7XG5cblx0XHRcdGlmIChlcnIpIHRocm93IGVycjtcblxuXHRcdFx0dGhpcy5fb3B0aW9uc0NhY2hlW2lucHV0XSA9IGRhdGE7XG5cblx0XHRcdGlmICh0aGlzUmVxdWVzdElkICE9PSB0aGlzLl9jdXJyZW50UmVxdWVzdElkKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHZhciBmaWx0ZXJlZE9wdGlvbnMgPSB0aGlzLmZpbHRlck9wdGlvbnMoZGF0YS5vcHRpb25zKTtcblxuXHRcdFx0dGhpcy5zZXRTdGF0ZShfLmV4dGVuZCh7XG5cdFx0XHRcdG9wdGlvbnM6IGRhdGEub3B0aW9ucyxcblx0XHRcdFx0ZmlsdGVyZWRPcHRpb25zOiBmaWx0ZXJlZE9wdGlvbnMsXG5cdFx0XHRcdGZvY3VzZWRPcHRpb246IF8uY29udGFpbnMoZmlsdGVyZWRPcHRpb25zLCB0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24pID8gdGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uIDogdGhpcy5nZXRBdXRvbWF0aWNGb2N1c2VkT3B0aW9uKGZpbHRlcmVkT3B0aW9ucywgaW5wdXQpXG5cdFx0XHR9LCBzdGF0ZSkpO1xuXG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0fSxcblxuXHRmaWx0ZXJPcHRpb25zOiBmdW5jdGlvbihvcHRpb25zLCB2YWx1ZXMpIHtcblx0XHRpZiAoIXRoaXMucHJvcHMuc2VhcmNoYWJsZSkge1xuXHRcdFx0cmV0dXJuIG9wdGlvbnM7XG5cdFx0fVxuXG5cdFx0dmFyIGZpbHRlclZhbHVlID0gdGhpcy5fb3B0aW9uc0ZpbHRlclN0cmluZztcblx0XHR2YXIgZXhjbHVkZSA9ICh2YWx1ZXMgfHwgdGhpcy5zdGF0ZS52YWx1ZXMpLm1hcChmdW5jdGlvbihpKSB7XG5cdFx0XHRyZXR1cm4gaS52YWx1ZTtcblx0XHR9KTtcblx0XHRpZiAodGhpcy5wcm9wcy5maWx0ZXJPcHRpb25zKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5wcm9wcy5maWx0ZXJPcHRpb25zLmNhbGwodGhpcywgb3B0aW9ucywgZmlsdGVyVmFsdWUsIGV4Y2x1ZGUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgZmlsdGVyT3B0aW9uID0gZnVuY3Rpb24ob3ApIHtcblx0XHRcdFx0aWYgKHRoaXMucHJvcHMubXVsdGkgJiYgXy5jb250YWlucyhleGNsdWRlLCBvcC52YWx1ZSkpIHJldHVybiBmYWxzZTtcblx0XHRcdFx0aWYgKHRoaXMucHJvcHMuZmlsdGVyT3B0aW9uKSByZXR1cm4gdGhpcy5wcm9wcy5maWx0ZXJPcHRpb24uY2FsbCh0aGlzLCBvcCwgZmlsdGVyVmFsdWUpO1xuXHRcdFx0XHR2YXIgdmFsdWVUZXN0ID0gU3RyaW5nKG9wLnZhbHVlKSwgbGFiZWxUZXN0ID0gU3RyaW5nKG9wLmxhYmVsKTtcblx0XHRcdFx0cmV0dXJuICFmaWx0ZXJWYWx1ZSB8fCAodGhpcy5wcm9wcy5tYXRjaFBvcyA9PT0gJ3N0YXJ0JykgPyAoXG5cdFx0XHRcdFx0KHRoaXMucHJvcHMubWF0Y2hQcm9wICE9PSAnbGFiZWwnICYmIHZhbHVlVGVzdC50b0xvd2VyQ2FzZSgpLnN1YnN0cigwLCBmaWx0ZXJWYWx1ZS5sZW5ndGgpID09PSBmaWx0ZXJWYWx1ZSkgfHxcblx0XHRcdFx0XHQodGhpcy5wcm9wcy5tYXRjaFByb3AgIT09ICd2YWx1ZScgJiYgbGFiZWxUZXN0LnRvTG93ZXJDYXNlKCkuc3Vic3RyKDAsIGZpbHRlclZhbHVlLmxlbmd0aCkgPT09IGZpbHRlclZhbHVlKVxuXHRcdFx0XHQpIDogKFxuXHRcdFx0XHRcdCh0aGlzLnByb3BzLm1hdGNoUHJvcCAhPT0gJ2xhYmVsJyAmJiB2YWx1ZVRlc3QudG9Mb3dlckNhc2UoKS5pbmRleE9mKGZpbHRlclZhbHVlLnRvTG93ZXJDYXNlKCkpID49IDApIHx8XG5cdFx0XHRcdFx0KHRoaXMucHJvcHMubWF0Y2hQcm9wICE9PSAndmFsdWUnICYmIGxhYmVsVGVzdC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoZmlsdGVyVmFsdWUudG9Mb3dlckNhc2UoKSkgPj0gMClcblx0XHRcdFx0KTtcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gXy5maWx0ZXIob3B0aW9ucywgZmlsdGVyT3B0aW9uLCB0aGlzKTtcblx0XHR9XG5cdH0sXG5cblx0c2VsZWN0Rm9jdXNlZE9wdGlvbjogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCF0aGlzLnN0YXRlLmlzT3BlbikgcmV0dXJuO1xuXHRcdGlmICh0aGlzLnByb3BzLnRhZ2dpbmcgJiYgIXRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbiAmJiAhXy5pc0VtcHR5KHRoaXMuc3RhdGUuaW5wdXRWYWx1ZSkpIHtcblx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZUFzTmV3VGFnKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLnNlbGVjdFZhbHVlKHRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbik7XG5cdFx0fVxuXHR9LFxuXG5cdGNyZWF0ZUFzTmV3VGFnOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmFkZFZhbHVlKHRoaXMuc3RhdGUuaW5wdXRWYWx1ZSk7XG5cdH0sXG5cdGdldEFjdGlvbnM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLnByb3BzLnRhZ2dpbmcgPyBbe1xuXHRcdFx0Z2V0VGV4dDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLnByb3BzLnRhZ2dpbmdQbGFjZWhvbGRlcih0aGlzLnN0YXRlLmlucHV0VmFsdWUpO1xuXHRcdFx0fS5iaW5kKHRoaXMpLFxuXHRcdFx0cnVuOiB0aGlzLmNyZWF0ZUFzTmV3VGFnXG5cdFx0fV0gOiBudWxsO1xuXHR9LFxuXHRcblx0Zm9jdXNPcHRpb246IGZ1bmN0aW9uKG9wKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRmb2N1c2VkT3B0aW9uOiBvcFxuXHRcdH0pO1xuXHR9LFxuXG5cdGZvY3VzTmV4dE9wdGlvbjogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5mb2N1c0FkamFjZW50T3B0aW9uKCduZXh0Jyk7XG5cdH0sXG5cblx0Zm9jdXNQcmV2aW91c09wdGlvbjogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5mb2N1c0FkamFjZW50T3B0aW9uKCdwcmV2aW91cycpO1xuXHR9LFxuXG5cdGZvY3VzQWRqYWNlbnRPcHRpb246IGZ1bmN0aW9uKGRpcikge1xuXHRcdHRoaXMuX2ZvY3VzZWRPcHRpb25SZXZlYWwgPSB0cnVlO1xuXG5cdFx0dmFyIG9wcyA9IHRoaXMuc3RhdGUuZmlsdGVyZWRPcHRpb25zO1xuXG5cdFx0aWYgKCF0aGlzLnN0YXRlLmlzT3Blbikge1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGlzT3BlbjogdHJ1ZSxcblx0XHRcdFx0aW5wdXRWYWx1ZTogJycsXG5cdFx0XHRcdGZvY3VzZWRPcHRpb246IHRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbiB8fCBvcHNbZGlyID09PSAnbmV4dCcgPyAwIDogb3BzLmxlbmd0aCAtIDFdXG5cdFx0XHR9LCB0aGlzLl9iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCFvcHMubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmFyIGZvY3VzZWRJbmRleCA9IC0xO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBvcHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmICh0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24gPT09IG9wc1tpXSkge1xuXHRcdFx0XHRmb2N1c2VkSW5kZXggPSBpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cblx0XHR2YXIgZm9jdXNlZE9wdGlvbiA9IG9wc1swXTtcblxuXHRcdGlmIChkaXIgPT09ICduZXh0JyAmJiBmb2N1c2VkSW5kZXggPiAtMSAmJiBmb2N1c2VkSW5kZXggPCBvcHMubGVuZ3RoIC0gMSkge1xuXHRcdFx0Zm9jdXNlZE9wdGlvbiA9IG9wc1tmb2N1c2VkSW5kZXggKyAxXTtcblx0XHR9IGVsc2UgaWYgKGRpciA9PT0gJ3ByZXZpb3VzJykge1xuXHRcdFx0aWYgKGZvY3VzZWRJbmRleCA+IDApIHtcblx0XHRcdFx0Zm9jdXNlZE9wdGlvbiA9IG9wc1tmb2N1c2VkSW5kZXggLSAxXTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZvY3VzZWRPcHRpb24gPSBvcHNbb3BzLmxlbmd0aCAtIDFdO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0Zm9jdXNlZE9wdGlvbjogZm9jdXNlZE9wdGlvblxuXHRcdH0pO1xuXG5cdH0sXG5cblx0dW5mb2N1c09wdGlvbjogZnVuY3Rpb24ob3ApIHtcblx0XHRpZiAodGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uID09PSBvcCkge1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGZvY3VzZWRPcHRpb246IG51bGxcblx0XHRcdH0pO1xuXHRcdH1cblx0fSxcblxuXHRoYW5kbGVPcHRpb25MYWJlbENsaWNrOiBmdW5jdGlvbiAodmFsdWUsIGV2ZW50KSB7XG5cdFx0dmFyIGhhbmRsZXIgPSB0aGlzLnByb3BzLm9uT3B0aW9uTGFiZWxDbGljaztcblxuXHRcdGlmIChoYW5kbGVyKSB7XG5cdFx0XHRoYW5kbGVyKHZhbHVlLCBldmVudCk7XG5cdFx0fVxuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNlbGVjdENsYXNzID0gY2xhc3NlcygnU2VsZWN0JywgdGhpcy5wcm9wcy5jbGFzc05hbWUsIHtcblx0XHRcdCdpcy1tdWx0aSc6IHRoaXMucHJvcHMubXVsdGksXG5cdFx0XHQnaXMtc2VhcmNoYWJsZSc6IHRoaXMucHJvcHMuc2VhcmNoYWJsZSxcblx0XHRcdCdpcy1vcGVuJzogdGhpcy5zdGF0ZS5pc09wZW4sXG5cdFx0XHQnaXMtZm9jdXNlZCc6IHRoaXMuc3RhdGUuaXNGb2N1c2VkLFxuXHRcdFx0J2lzLWxvYWRpbmcnOiB0aGlzLnN0YXRlLmlzTG9hZGluZyxcblx0XHRcdCdpcy1kaXNhYmxlZCc6IHRoaXMucHJvcHMuZGlzYWJsZWQsXG5cdFx0XHQnaGFzLXZhbHVlJzogdGhpcy5zdGF0ZS52YWx1ZVxuXHRcdH0pO1xuXG5cdFx0dmFyIG1lbnVQcm9wcyA9IHt9O1xuXHRcdGlmICh0aGlzLnByb3BzLm11bHRpKSB7XG5cdFx0XHRtZW51UHJvcHMub25Nb3VzZURvd24gPSB0aGlzLmhhbmRsZU1vdXNlRG93bjtcblx0XHR9XG5cblx0XHR2YXIgaW5wdXRQcm9wcyA9IF8uZXh0ZW5kKHtcblx0XHRcdHJlZjogJ2lucHV0Jyxcblx0XHRcdGNsYXNzTmFtZTogJ3NlbGVjdC0taW5wdXQnLFxuXHRcdFx0dGFiSW5kZXg6IHRoaXMucHJvcHMudGFiSW5kZXggfHwgMCxcblx0XHRcdG9uRm9jdXM6IHRoaXMuaGFuZGxlSW5wdXRGb2N1cyxcblx0XHRcdG9uQmx1cjogdGhpcy5oYW5kbGVJbnB1dEJsdXJcblx0XHR9LCB0aGlzLnByb3BzLmlucHV0UHJvcHMpO1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IHJlZj1cIndyYXBwZXJcIiBjbGFzc05hbWU9e3NlbGVjdENsYXNzfT5cblx0XHRcdFx0PGlucHV0IHR5cGU9XCJoaWRkZW5cIiByZWY9XCJ2YWx1ZVwiIG5hbWU9e3RoaXMucHJvcHMubmFtZX0gdmFsdWU9e3RoaXMuc3RhdGUudmFsdWV9IC8+XG5cblx0XHRcdFx0PENvbnRyb2wgY2xhc3NOYW1lPVwic2VsZWN0LS1jb250cm9sXCIgcmVmPVwiY29udHJvbFwiIGlucHV0UHJvcHM9e2lucHV0UHJvcHN9IG11bHRpPXt0aGlzLnByb3BzLm11bHRpfVxuXHRcdFx0XHRcdFx0IHNlYXJjaGFibGU9e3RoaXMucHJvcHMuc2VhcmNoYWJsZX0gcGxhY2Vob2xkZXI9e3RoaXMuc3RhdGUucGxhY2Vob2xkZXJ9XG5cdFx0XHRcdFx0XHQgY2xlYXJhYmxlPXt0aGlzLnByb3BzLmNsZWFyYWJsZX0gXG5cdFx0XHRcdFx0XHQgY2xlYXJUZXh0PXt0aGlzLnByb3BzLm11bHRpID8gdGhpcy5wcm9wcy5jbGVhckFsbFRleHQgOiB0aGlzLnByb3BzLmNsZWFyVmFsdWVUZXh0fVxuXHRcdFx0XHRcdFx0IGlucHV0VmFsdWU9e3RoaXMuc3RhdGUuaW5wdXRWYWx1ZX0gZGlzYWJsZWQ9e3RoaXMucHJvcHMuZGlzYWJsZWR9XG5cdFx0XHRcdFx0XHQgdmFsdWU9e3RoaXMuc3RhdGUudmFsdWV9IHZhbHVlcz17dGhpcy5zdGF0ZS52YWx1ZXN9XG5cdFx0XHRcdFx0XHQgb25DbGlja0NsZWFyPXt0aGlzLmNsZWFyVmFsdWV9XG5cdFx0XHRcdFx0XHQgb25JbnB1dENoYW5nZT17dGhpcy5oYW5kbGVJbnB1dENoYW5nZX0gb25LZXlEb3duPXt0aGlzLmhhbmRsZUtleURvd259IFxuXHRcdFx0XHRcdFx0IG9uTW91c2VEb3duPXt0aGlzLmhhbmRsZU1vdXNlRG93bn0gb25Ub3VjaEVuZD17dGhpcy5oYW5kbGVNb3VzZURvd259IC8+XG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0aGlzLnN0YXRlLmlzT3BlbiA/XG5cdFx0XHRcdFx0XHQoXG5cdFx0XHRcdFx0XHRcdDxkaXYgcmVmPVwic2VsZWN0TWVudUNvbnRhaW5lclwiIGNsYXNzTmFtZT1cInNlbGVjdC0tbWVudS0tb3V0ZXJcIj5cblx0XHRcdFx0XHRcdFx0XHQ8T3B0aW9uTGlzdCB7Li4ubWVudVByb3BzfSByZWY9XCJtZW51XCIgb25DaGFuZ2U9e3RoaXMuc2VsZWN0VmFsdWV9IG9uRm9jdXNDaGFuZ2U9e3RoaXMuZm9jdXNPcHRpb259XG5cdFx0XHRcdFx0XHRcdFx0ICAgZm9jdXNlZE9wdGlvbj17dGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9ufSBvcHRpb25zPXt0aGlzLnN0YXRlLmZpbHRlcmVkT3B0aW9uc30gXG5cdFx0XHRcdFx0XHRcdFx0ICAgYWN0aW9ucz17dGhpcy5zdGF0ZS5hY3Rpb25zfSAvPlxuXHRcdFx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHRcdCkgOiBcblx0XHRcdFx0XHRcdG51bGxcblx0XHRcdFx0fVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3Q7XG4iXX0=
