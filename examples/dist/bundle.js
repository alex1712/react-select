require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"react":undefined}],"react-select":[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _ = require('lodash'),
    React = require('react'),
    Input = require('react-input-autosize'),
    classes = require('classnames'),
    Value = require('./Value');

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
		if (newProps.value !== this.state.value) {
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
			if (this.refs.focused && this.refs.menu) {
				var focusedDOM = this.refs.focused.getDOMNode();
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

	clearValue: function clearValue(event) {
		// if the event was triggered by a mousedown and not the primary
		// button, ignore it.
		if (event && event.type === 'mousedown' && event.button !== 0) {
			return;
		}
		this.setValue(null);
	},

	resetValue: function resetValue() {
		this.setValue(this.state.value);
	},

	getInputNode: function getInputNode() {
		var input = this.refs.input;
		return this.props.searchable ? input : input.getDOMNode();
	},

	fireChangeEvent: function fireChangeEvent(newState) {
		if (newState.value !== this.state.value && this.props.onChange) {
			this.props.onChange(newState.value, newState.values);
		}
	},

	getNewTagOption: function getNewTagOption() {
		return this.props.tagging ? {
			label: this.props.taggingPlaceholder(this.state.inputValue),
			value: null,
			type: 'createTag'
		} : null;
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

	handleInputChange: function handleInputChange(event) {
		// assign an internal variable because we need to use
		// the latest value before setState() has completed.
		this._optionsFilterString = event.target.value;

		if (this.props.asyncOptions) {
			this.setState({
				isLoading: true,
				inputValue: event.target.value
			});
			this.loadAsyncOptions(event.target.value, {
				isLoading: false,
				isOpen: true
			}, this._bindCloseMenuIfClickedOutside);
		} else {
			var filteredOptions = this.filterOptions(this.state.options);

			this.setState({
				isOpen: true,
				inputValue: event.target.value,
				filteredOptions: filteredOptions,
				focusedOption: this.getAutomaticFocusedOption(filteredOptions, event.target.value)
			}, this._bindCloseMenuIfClickedOutside);
		}
	},

	createAsNewTag: function createAsNewTag() {
		this.addValue(this.state.inputValue);
	},

	getAutomaticFocusedOption: function getAutomaticFocusedOption(options, currentInput) {
		var input = currentInput || this.state.inputValue;
		if (this.props.tagging) {
			if (options && options.length && (_.isEmpty(input) || input === options[0].label)) {
				return options[0];
			} else {
				return null;
			}
		} else {
			return options ? options[0] : null;
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

	buildMenu: function buildMenu() {
		var _this = this;

		var focusedValue = this.state.focusedOption ? this.state.focusedOption.value : null;

		if (this.state.filteredOptions.length > 0 && focusedValue == null) {
			var focusedOption = this.getAutomaticFocusedOption(this.state.filteredOptions);
			focusedValue = focusedOption ? focusedOption.value : null;
		}

		var ops = _.map(this.state.filteredOptions, function (op) {
			var isFocused = focusedValue === op.value;

			var optionClass = classes({
				'Select-option': true,
				'is-focused': isFocused
			});

			var ref = isFocused ? 'focused' : null;

			var mouseEnter = this.focusOption.bind(this, op),
			    mouseLeave = this.unfocusOption.bind(this, op),
			    mouseDown = this.selectValue.bind(this, op);

			return React.createElement(
				'div',
				{ ref: ref, key: 'option-' + op.value, className: optionClass, onMouseEnter: mouseEnter, onMouseLeave: mouseLeave, onMouseDown: mouseDown, onClick: mouseDown },
				op.label
			);
		}, this);

		var taggingOption = this.getNewTagOption();
		var isTagAlreadyAnOption = this.state.filteredOptions.some(function (op) {
			return op.value === _this.state.inputValue;
		});

		if (taggingOption && !isTagAlreadyAnOption && !_.isEmpty(this.state.inputValue)) {
			var optionClass = classes({
				'Select-option': true,
				placeholder: true,
				'is-focused': !this.state.focusedOption
			});
			var mouseDown = this.createAsNewTag;
			ops.unshift(React.createElement(
				'div',
				{ ref: null, key: 'new-tag', onMouseDown: mouseDown, className: optionClass },
				taggingOption.label
			));
		}

		return ops.length ? ops : React.createElement(
			'div',
			{ className: 'Select-noresults' },
			this.props.asyncOptions && !this.state.inputValue ? this.props.searchPromptText : this.props.noResultsText
		);
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

		var value = [];

		if (this.props.multi) {
			this.state.values.forEach(function (val) {
				var props = _.extend({
					key: val.value,
					optionLabelClick: !!this.props.onOptionLabelClick,
					onOptionLabelClick: this.handleOptionLabelClick.bind(this, val),
					onRemove: this.removeValue.bind(this, val)
				}, val);
				value.push(React.createElement(Value, props));
			}, this);
		}

		if (this.props.disabled || !this.state.inputValue && (!this.props.multi || !value.length)) {
			value.push(React.createElement(
				'div',
				{ className: 'Select-placeholder', key: 'placeholder' },
				this.state.placeholder
			));
		}

		var loading = this.state.isLoading ? React.createElement('span', { className: 'Select-loading', 'aria-hidden': 'true' }) : null;
		var clear = this.props.clearable && this.state.value && !this.props.disabled ? React.createElement('span', { className: 'Select-clear', title: this.props.multi ? this.props.clearAllText : this.props.clearValueText, 'aria-label': this.props.multi ? this.props.clearAllText : this.props.clearValueText, onMouseDown: this.clearValue, onClick: this.clearValue, dangerouslySetInnerHTML: { __html: '&times;' } }) : null;

		var menu;
		var menuProps;
		if (this.state.isOpen) {
			menuProps = {
				ref: 'menu',
				className: 'Select-menu'
			};
			if (this.props.multi) {
				menuProps.onMouseDown = this.handleMouseDown;
			}
			menu = React.createElement(
				'div',
				{ ref: 'selectMenuContainer', className: 'Select-menu-outer' },
				React.createElement(
					'div',
					menuProps,
					this.buildMenu()
				)
			);
		}

		var input;
		var inputProps = _.extend({
			ref: 'input',
			className: 'Select-input',
			tabIndex: this.props.tabIndex || 0,
			onFocus: this.handleInputFocus,
			onBlur: this.handleInputBlur
		}, this.props.inputProps);

		if (this.props.searchable && !this.props.disabled) {
			input = React.createElement(Input, _extends({ value: this.state.inputValue, onChange: this.handleInputChange, minWidth: '5' }, inputProps));
		} else {
			input = React.createElement(
				'div',
				inputProps,
				' '
			);
		}

		return React.createElement(
			'div',
			{ ref: 'wrapper', className: selectClass },
			React.createElement('input', { type: 'hidden', ref: 'value', name: this.props.name, value: this.state.value, disabled: this.props.disabled }),
			React.createElement(
				'div',
				{ className: 'Select-control', ref: 'control', onKeyDown: this.handleKeyDown, onMouseDown: this.handleMouseDown, onTouchEnd: this.handleMouseDown },
				value,
				input,
				React.createElement('span', { className: 'Select-arrow' }),
				loading,
				clear
			),
			menu
		);
	}

});

module.exports = Select;

},{"./Value":1,"classnames":undefined,"lodash":undefined,"react":undefined,"react-input-autosize":undefined}]},{},[])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9yZWFjdC1jb21wb25lbnQtZ3VscC10YXNrcy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL0FsZXgvV29ya3NwYWNlL25wbS1wcm9qZWN0cy9yZWFjdC1zZWxlY3Qvc3JjL1ZhbHVlLmpzIiwiL1VzZXJzL0FsZXgvV29ya3NwYWNlL25wbS1wcm9qZWN0cy9yZWFjdC1zZWxlY3Qvc3JjL1NlbGVjdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUU3QixJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOztBQUU5QixZQUFXLEVBQUUsT0FBTzs7QUFFcEIsVUFBUyxFQUFFO0FBQ1YsT0FBSyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7RUFDeEM7O0FBRUQsV0FBVSxFQUFFLG9CQUFTLEtBQUssRUFBRTtBQUMzQixPQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7RUFDeEI7O0FBRUQsT0FBTSxFQUFFLGtCQUFXO0FBQ2xCLE1BQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDOztBQUU3QixNQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUU7QUFDaEMsUUFBSyxHQUNKOztNQUFHLFNBQVMsRUFBQyxzQkFBc0I7QUFDbEMsZ0JBQVcsRUFBRSxJQUFJLENBQUMsVUFBVSxBQUFDO0FBQzdCLGVBQVUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixBQUFDO0FBQzFDLFlBQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixBQUFDO0lBQ3RDLEtBQUs7SUFDSCxBQUNKLENBQUM7R0FDRjs7QUFFRCxTQUNDOztLQUFLLFNBQVMsRUFBQyxhQUFhO0dBQzNCOztNQUFNLFNBQVMsRUFBQyxrQkFBa0I7QUFDakMsZ0JBQVcsRUFBRSxJQUFJLENBQUMsVUFBVSxBQUFDO0FBQzdCLFlBQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQUFBQztBQUM3QixlQUFVLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEFBQUM7O0lBQWU7R0FDaEQ7O01BQU0sU0FBUyxFQUFDLG1CQUFtQjtJQUFFLEtBQUs7SUFBUTtHQUM3QyxDQUNMO0VBQ0Y7O0NBRUQsQ0FBQyxDQUFDOztBQUVILE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDOzs7Ozs7O0FDekN4QixJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO0lBQ3hCLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO0lBQ3hCLEtBQUssR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUM7SUFDdkMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUM7SUFDL0IsS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQzs7QUFFNUIsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDOztBQUVsQixJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOztBQUU5QixZQUFXLEVBQUUsUUFBUTs7QUFFckIsVUFBUyxFQUFFO0FBQ1YsT0FBSyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRztBQUMxQixPQUFLLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJO0FBQzNCLFVBQVEsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUk7QUFDOUIsU0FBTyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSztBQUM5QixXQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNO0FBQ2pDLGNBQVksRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUk7QUFDbEMsVUFBUSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSTtBQUM5QixhQUFXLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNO0FBQ25DLGVBQWEsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU07QUFDckMsV0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSTtBQUMvQixnQkFBYyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTTtBQUN0QyxjQUFZLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNO0FBQ3BDLFlBQVUsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUk7QUFDaEMsa0JBQWdCLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNO0FBQ3hDLE1BQUksRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU07QUFDNUIsVUFBUSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSTtBQUM5QixTQUFPLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJO0FBQzdCLFFBQU0sRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUk7QUFDNUIsV0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTTtBQUNqQyxjQUFZLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJO0FBQ2xDLGVBQWEsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUk7QUFDbkMsVUFBUSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTTtBQUNoQyxXQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNO0FBQ2pDLFlBQVUsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU07QUFDbEMsU0FBTyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSTtBQUM3QixvQkFBa0IsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUk7Ozs7Ozs7OztBQVN4QyxvQkFBa0IsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUk7RUFDeEM7O0FBRUQsZ0JBQWUsRUFBRSwyQkFBVztBQUMzQixTQUFPO0FBQ04sUUFBSyxFQUFFLFNBQVM7QUFDaEIsVUFBTyxFQUFFLEVBQUU7QUFDWCxXQUFRLEVBQUUsS0FBSztBQUNmLFlBQVMsRUFBRSxHQUFHO0FBQ2QsZUFBWSxFQUFFLFNBQVM7QUFDdkIsV0FBUSxFQUFFLElBQUk7QUFDZCxjQUFXLEVBQUUsV0FBVztBQUN4QixnQkFBYSxFQUFFLGtCQUFrQjtBQUNqQyxZQUFTLEVBQUUsSUFBSTtBQUNmLGlCQUFjLEVBQUUsYUFBYTtBQUM3QixlQUFZLEVBQUUsV0FBVztBQUN6QixhQUFVLEVBQUUsSUFBSTtBQUNoQixtQkFBZ0IsRUFBRSxnQkFBZ0I7QUFDbEMsT0FBSSxFQUFFLFNBQVM7QUFDZixXQUFRLEVBQUUsU0FBUztBQUNuQixZQUFTLEVBQUUsU0FBUztBQUNwQixXQUFRLEVBQUUsS0FBSztBQUNmLFlBQVMsRUFBRSxLQUFLO0FBQ2hCLGFBQVUsRUFBRSxFQUFFO0FBQ2QsVUFBTyxFQUFFLEtBQUs7QUFDZCxxQkFBa0IsRUFBRSw0QkFBUyxZQUFZLEVBQUU7QUFDMUMsV0FBTyxtQ0FBbUMsR0FBRyxZQUFZLEdBQUcsb0JBQW9CLENBQUE7SUFDaEY7QUFDRCxxQkFBa0IsRUFBRSxTQUFTO0dBQzdCLENBQUM7RUFDRjs7QUFFRCxnQkFBZSxFQUFFLDJCQUFXO0FBQzNCLFNBQU87Ozs7Ozs7Ozs7QUFVTixVQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPO0FBQzNCLFlBQVMsRUFBRSxLQUFLO0FBQ2hCLFNBQU0sRUFBRSxLQUFLO0FBQ2IsWUFBUyxFQUFFLEtBQUs7R0FDaEIsQ0FBQztFQUNGOztBQUVELG1CQUFrQixFQUFFLDhCQUFXO0FBQzlCLE1BQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO0FBQ3hCLE1BQUksQ0FBQyxvQkFBb0IsR0FBRyxFQUFFLENBQUM7QUFDL0IsTUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDOztBQUV4RCxNQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO0FBQ25ELE9BQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO0dBQzVCOztBQUVELE1BQUksQ0FBQywwQkFBMEIsR0FBRyxDQUFBLFVBQVMsS0FBSyxFQUFFO0FBQ2pELE9BQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTtBQUN2QixXQUFPO0lBQ1A7QUFDRCxPQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQzFELE9BQUksV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDOztBQUVqRCxPQUFJLHVCQUF1QixHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDMUUsT0FBSSwwQkFBMEIsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDOzs7QUFHaEYsT0FBSSx1QkFBdUIsSUFBSSwwQkFBMEIsRUFBRTtBQUMxRCxRQUFJLENBQUMsUUFBUSxDQUFDO0FBQ2IsV0FBTSxFQUFFLEtBQUs7S0FDYixFQUFFLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0lBQzFDO0dBQ0QsQ0FBQSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFYixNQUFJLENBQUMsOEJBQThCLEdBQUcsWUFBVztBQUNoRCxXQUFRLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0dBQ3BFLENBQUM7O0FBRUYsTUFBSSxDQUFDLGdDQUFnQyxHQUFHLFlBQVc7QUFDbEQsV0FBUSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQztHQUN2RSxDQUFDO0VBQ0Y7O0FBRUQscUJBQW9CLEVBQUUsZ0NBQVc7QUFDaEMsY0FBWSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNoQyxjQUFZLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDOztBQUVqQyxNQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO0FBQ3JCLE9BQUksQ0FBQyxnQ0FBZ0MsRUFBRSxDQUFDO0dBQ3hDO0VBQ0Q7O0FBRUQsMEJBQXlCLEVBQUUsbUNBQVMsUUFBUSxFQUFFO0FBQzdDLE1BQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQzVFLE9BQUksQ0FBQyxRQUFRLENBQUM7QUFDYixXQUFPLEVBQUUsUUFBUSxDQUFDLE9BQU87QUFDekIsbUJBQWUsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7SUFDckQsQ0FBQyxDQUFDO0dBQ0g7QUFDRCxNQUFJLFFBQVEsQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUU7QUFDeEMsT0FBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztHQUN4RTtFQUNEOztBQUVELG1CQUFrQixFQUFFLDhCQUFXO0FBQzlCLE1BQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFO0FBQzNCLGVBQVksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDaEMsT0FBSSxDQUFDLGFBQWEsR0FBRyxVQUFVLENBQUMsQ0FBQSxZQUFXO0FBQzFDLFFBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUM1QixRQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO0lBQy9CLENBQUEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7R0FDbEI7O0FBRUQsTUFBSSxJQUFJLENBQUMsb0JBQW9CLEVBQUU7QUFDOUIsT0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtBQUN4QyxRQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUNoRCxRQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUMxQyxRQUFJLFdBQVcsR0FBRyxVQUFVLENBQUMscUJBQXFCLEVBQUUsQ0FBQztBQUNyRCxRQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMscUJBQXFCLEVBQUUsQ0FBQzs7QUFFL0MsUUFBSSxXQUFXLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLElBQ3ZDLFdBQVcsQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLEdBQUcsRUFBRTtBQUNoQyxZQUFPLENBQUMsU0FBUyxHQUFJLFVBQVUsQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsWUFBWSxBQUFDLENBQUM7S0FDNUY7SUFDRDs7QUFFRCxPQUFJLENBQUMsb0JBQW9CLEdBQUcsS0FBSyxDQUFDO0dBQ2xDO0VBQ0Q7O0FBRUQsc0JBQXFCLEVBQUUsK0JBQVMsT0FBTyxFQUFFLEtBQUssRUFBRTtBQUMvQyxNQUFJLFdBQVcsR0FBRyxBQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDO0FBQ25FLFNBQU8sV0FBVyxJQUFJLElBQUksRUFBRTtBQUMzQixPQUFJLFdBQVcsS0FBSyxPQUFPO0FBQUUsV0FBTyxLQUFLLENBQUM7SUFBQSxBQUMxQyxXQUFXLEdBQUcsV0FBVyxDQUFDLFlBQVksQ0FBQztHQUN2QztBQUNELFNBQU8sSUFBSSxDQUFDO0VBQ1o7O0FBRUQsa0JBQWlCLEVBQUUsMkJBQVMsS0FBSyxFQUFFLE9BQU8sRUFBRTtBQUMzQyxNQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2IsVUFBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO0dBQzdCOzs7QUFHRCxNQUFJLENBQUMsb0JBQW9CLEdBQUcsRUFBRSxDQUFDOztBQUUvQixNQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUM7TUFDaEQsZUFBZSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDOztBQUV2RCxTQUFPO0FBQ04sUUFBSyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBUyxDQUFDLEVBQUU7QUFBRSxXQUFPLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDO0FBQzdFLFNBQU0sRUFBRSxNQUFNO0FBQ2QsYUFBVSxFQUFFLEVBQUU7QUFDZCxrQkFBZSxFQUFFLGVBQWU7QUFDaEMsY0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVztBQUMxRixnQkFBYSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUM7R0FDbkgsQ0FBQztFQUNGOztBQUVELGdCQUFlLEVBQUUseUJBQVMsTUFBTSxFQUFFLE9BQU8sRUFBRTtBQUMxQyxNQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUMzQixPQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsRUFBRTtBQUMvQixVQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzVDLE1BQU07QUFDTixVQUFNLEdBQUcsTUFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ2hDO0dBQ0Q7O0FBRUQsU0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVMsR0FBRyxFQUFFO0FBQy9CLFVBQU8sQUFBQyxPQUFPLEdBQUcsS0FBSyxRQUFRLEdBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUM7R0FDbEgsQ0FBQyxDQUFDO0VBQ0g7O0FBRUQsU0FBUSxFQUFFLGtCQUFTLEtBQUssRUFBRTtBQUN6QixNQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO0FBQzlCLE1BQUksUUFBUSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM3QyxVQUFRLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUN4QixNQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQy9CLE1BQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7RUFDeEI7O0FBRUQsWUFBVyxFQUFFLHFCQUFTLEtBQUssRUFBRTtBQUM1QixNQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUU7QUFDdEIsT0FBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUNyQixNQUFNLElBQUksS0FBSyxFQUFFO0FBQ2pCLE9BQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDckI7QUFDRCxNQUFJLENBQUMsZ0NBQWdDLEVBQUUsQ0FBQztFQUN4Qzs7QUFFRCxTQUFRLEVBQUUsa0JBQVMsS0FBSyxFQUFFO0FBQ3pCLE1BQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7RUFDL0M7O0FBRUQsU0FBUSxFQUFFLG9CQUFXO0FBQ3BCLE1BQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7RUFDNUM7O0FBRUQsWUFBVyxFQUFFLHFCQUFTLEtBQUssRUFBRTtBQUM1QixNQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztFQUNuRDs7QUFFRCxXQUFVLEVBQUUsb0JBQVMsS0FBSyxFQUFFOzs7QUFHM0IsTUFBSSxLQUFLLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxXQUFXLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDOUQsVUFBTztHQUNQO0FBQ0QsTUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUNwQjs7QUFFRCxXQUFVLEVBQUUsc0JBQVc7QUFDdEIsTUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0VBQ2hDOztBQUVELGFBQVksRUFBRSx3QkFBWTtBQUN6QixNQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUM1QixTQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLEtBQUssR0FBRyxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUM7RUFDMUQ7O0FBRUQsZ0JBQWUsRUFBRSx5QkFBUyxRQUFRLEVBQUU7QUFDbkMsTUFBSSxRQUFRLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO0FBQy9ELE9BQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0dBQ3JEO0VBQ0Q7O0FBRUQsZ0JBQWUsRUFBRSwyQkFBVztBQUMzQixTQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHO0FBQzNCLFFBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDO0FBQzNELFFBQUssRUFBRSxJQUFJO0FBQ1gsT0FBSSxFQUFFLFdBQVc7R0FDakIsR0FBRyxJQUFJLENBQUM7RUFDVDs7QUFFRCxnQkFBZSxFQUFFLHlCQUFTLEtBQUssRUFBRTs7O0FBR2hDLE1BQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLElBQUssS0FBSyxDQUFDLElBQUksS0FBSyxXQUFXLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEFBQUMsRUFBRTtBQUM5RSxVQUFPO0dBQ1A7O0FBRUQsT0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO0FBQ3hCLE9BQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUN2QixNQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFO0FBQ3pCLE9BQUksQ0FBQyxRQUFRLENBQUM7QUFDYixVQUFNLEVBQUUsSUFBSTtJQUNaLEVBQUUsSUFBSSxDQUFDLDhCQUE4QixDQUFDLENBQUM7R0FDeEMsTUFBTTtBQUNOLE9BQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO0FBQzVCLE9BQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztHQUM1QjtFQUNEOztBQUVELGlCQUFnQixFQUFFLDBCQUFTLEtBQUssRUFBRTtBQUNqQyxNQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDO0FBQzFELE1BQUksQ0FBQyxRQUFRLENBQUM7QUFDYixZQUFTLEVBQUUsSUFBSTtBQUNmLFNBQU0sRUFBRSxTQUFTO0dBQ2pCLEVBQUUsWUFBVztBQUNiLE9BQUcsU0FBUyxFQUFFO0FBQ2IsUUFBSSxDQUFDLDhCQUE4QixFQUFFLENBQUM7SUFDdEMsTUFDSTtBQUNKLFFBQUksQ0FBQyxnQ0FBZ0MsRUFBRSxDQUFDO0lBQ3hDO0dBQ0QsQ0FBQyxDQUFDO0FBQ0gsTUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7O0FBRTdCLE1BQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUU7QUFDdkIsT0FBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDMUI7RUFDRDs7QUFFRCxnQkFBZSxFQUFFLHlCQUFTLEtBQUssRUFBRTtBQUNoQyxNQUFJLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQyxDQUFBLFlBQVc7QUFDekMsT0FBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsT0FBTztBQUNuQyxPQUFJLENBQUMsUUFBUSxDQUFDO0FBQ2IsYUFBUyxFQUFFLEtBQUs7SUFDaEIsQ0FBQyxDQUFDO0dBQ0gsQ0FBQSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQzs7QUFFbEIsTUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTtBQUN0QixPQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUN6QjtFQUNEOztBQUVELGNBQWEsRUFBRSx1QkFBUyxLQUFLLEVBQUU7QUFDOUIsTUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVE7QUFBRSxVQUFPO0dBQUEsQUFFaEMsUUFBUSxLQUFLLENBQUMsT0FBTzs7QUFFcEIsUUFBSyxDQUFDOztBQUNMLFFBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRTtBQUMzQixTQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDaEI7QUFDRixXQUFPOztBQUFBLEFBRVAsUUFBSyxDQUFDOztBQUNMLFFBQUksS0FBSyxDQUFDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUU7QUFDdEUsWUFBTztLQUNQO0FBQ0QsUUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDNUIsVUFBTTs7QUFBQSxBQUVOLFFBQUssRUFBRTs7QUFDTixRQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztBQUM1QixVQUFNOztBQUFBLEFBRU4sUUFBSyxFQUFFOztBQUNOLFFBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7QUFDdEIsU0FBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0tBQ2xCLE1BQU07QUFDTixTQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7S0FDbEI7QUFDRixVQUFNOztBQUFBLEFBRU4sUUFBSyxFQUFFOztBQUNOLFFBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQzVCLFVBQU07O0FBQUEsQUFFTixRQUFLLEVBQUU7O0FBQ04sUUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0FBQ3hCLFVBQU07O0FBQUEsQUFFTjtBQUFTLFdBQU87QUFBQSxHQUNoQjs7QUFFRCxPQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7RUFDdkI7O0FBRUQsa0JBQWlCLEVBQUUsMkJBQVMsS0FBSyxFQUFFOzs7QUFHbEMsTUFBSSxDQUFDLG9CQUFvQixHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDOztBQUUvQyxNQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFO0FBQzVCLE9BQUksQ0FBQyxRQUFRLENBQUM7QUFDYixhQUFTLEVBQUUsSUFBSTtBQUNmLGNBQVUsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUs7SUFDOUIsQ0FBQyxDQUFDO0FBQ0gsT0FBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFO0FBQ3pDLGFBQVMsRUFBRSxLQUFLO0FBQ2hCLFVBQU0sRUFBRSxJQUFJO0lBQ1osRUFBRSxJQUFJLENBQUMsOEJBQThCLENBQUMsQ0FBQztHQUN4QyxNQUFNO0FBQ04sT0FBSSxlQUFlLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUU3RCxPQUFJLENBQUMsUUFBUSxDQUFDO0FBQ2IsVUFBTSxFQUFFLElBQUk7QUFDWixjQUFVLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLO0FBQzlCLG1CQUFlLEVBQUUsZUFBZTtBQUNoQyxpQkFBYSxFQUFFLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDbEYsRUFBRSxJQUFJLENBQUMsOEJBQThCLENBQUMsQ0FBQztHQUN4QztFQUNEOztBQUVELGVBQWMsRUFBRSwwQkFBVztBQUMxQixNQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7RUFDckM7O0FBRUQsMEJBQXlCLEVBQUUsbUNBQVMsT0FBTyxFQUFFLFlBQVksRUFBRTtBQUMxRCxNQUFJLEtBQUssR0FBRyxZQUFZLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUM7QUFDbEQsTUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRTtBQUN2QixPQUFHLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUssS0FBSyxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUEsQUFBQyxFQUFFO0FBQ2xGLFdBQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLE1BQU07QUFDTixXQUFPLElBQUksQ0FBQztJQUNaO0dBQ0QsTUFBTTtBQUNOLFVBQU8sT0FBTyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7R0FDbkM7RUFDRDs7QUFFRCxxQkFBb0IsRUFBRSxnQ0FBVztBQUNoQyxNQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxZQUFXLEVBQUUsQ0FBQyxDQUFDO0VBQzdDOztBQUVELGlCQUFnQixFQUFFLDBCQUFTLEtBQUssRUFBRSxLQUFLLEVBQUU7QUFDeEMsTUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixHQUFHLFNBQVMsRUFBRSxDQUFDOztBQUV6RCxPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN2QyxPQUFJLFFBQVEsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNqQyxPQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLEtBQUssS0FBSyxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQSxBQUFDLEVBQUU7QUFDbEcsUUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUM7QUFDbkQsUUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFbEQsUUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0FBQ3RCLFlBQU8sRUFBRSxPQUFPO0FBQ2hCLG9CQUFlLEVBQUUsZUFBZTtBQUNoQyxrQkFBYSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLGVBQWUsRUFBRSxLQUFLLENBQUM7S0FDeEosRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ1gsV0FBTztJQUNQO0dBQ0Q7O0FBRUQsTUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUEsVUFBUyxHQUFHLEVBQUUsSUFBSSxFQUFFOztBQUVsRCxPQUFJLEdBQUcsRUFBRSxNQUFNLEdBQUcsQ0FBQzs7QUFFbkIsT0FBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUM7O0FBRWpDLE9BQUksYUFBYSxLQUFLLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtBQUM3QyxXQUFPO0lBQ1A7QUFDRCxPQUFJLGVBQWUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFdkQsT0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0FBQ3RCLFdBQU8sRUFBRSxJQUFJLENBQUMsT0FBTztBQUNyQixtQkFBZSxFQUFFLGVBQWU7QUFDaEMsaUJBQWEsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDO0lBQ3hKLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztHQUVYLENBQUEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztFQUNkOztBQUVELGNBQWEsRUFBRSx1QkFBUyxPQUFPLEVBQUUsTUFBTSxFQUFFO0FBQ3hDLE1BQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRTtBQUMzQixVQUFPLE9BQU8sQ0FBQztHQUNmOztBQUVELE1BQUksV0FBVyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQztBQUM1QyxNQUFJLE9BQU8sR0FBRyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQSxDQUFFLEdBQUcsQ0FBQyxVQUFTLENBQUMsRUFBRTtBQUMzRCxVQUFPLENBQUMsQ0FBQyxLQUFLLENBQUM7R0FDZixDQUFDLENBQUM7QUFDSCxNQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFO0FBQzdCLFVBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0dBQzFFLE1BQU07QUFDTixPQUFJLFlBQVksR0FBRyxzQkFBUyxFQUFFLEVBQUU7QUFDL0IsUUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDO0FBQUUsWUFBTyxLQUFLLENBQUM7S0FBQSxBQUNwRSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWTtBQUFFLFlBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsV0FBVyxDQUFDLENBQUM7S0FBQSxBQUN4RixJQUFJLFNBQVMsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQztRQUFFLFNBQVMsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQy9ELFdBQU8sQ0FBQyxXQUFXLElBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEtBQUssT0FBTyxBQUFDLEdBQ3ZELEFBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEtBQUssT0FBTyxJQUFJLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxXQUFXLElBQ3pHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxLQUFLLE9BQU8sSUFBSSxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssV0FBVyxBQUFDLEdBRTNHLEFBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEtBQUssT0FBTyxJQUFJLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUNuRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsS0FBSyxPQUFPLElBQUksU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLEFBQUMsQUFDckcsQ0FBQztJQUNGLENBQUM7QUFDRixVQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztHQUM3QztFQUNEOztBQUVELG9CQUFtQixFQUFFLCtCQUFXO0FBQy9CLE1BQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU07QUFBRSxVQUFPO0dBQUEsQUFDL0IsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQ3pGLFVBQU8sSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0dBQzdCLE1BQU07QUFDTixVQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztHQUNsRDtFQUNEOztBQUVELFlBQVcsRUFBRSxxQkFBUyxFQUFFLEVBQUU7QUFDekIsTUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNiLGdCQUFhLEVBQUUsRUFBRTtHQUNqQixDQUFDLENBQUM7RUFDSDs7QUFFRCxnQkFBZSxFQUFFLDJCQUFXO0FBQzNCLE1BQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztFQUNqQzs7QUFFRCxvQkFBbUIsRUFBRSwrQkFBVztBQUMvQixNQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxDQUFDLENBQUM7RUFDckM7O0FBRUQsb0JBQW1CLEVBQUUsNkJBQVMsR0FBRyxFQUFFO0FBQ2xDLE1BQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7O0FBRWpDLE1BQUksR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDOztBQUVyQyxNQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7QUFDdkIsT0FBSSxDQUFDLFFBQVEsQ0FBQztBQUNiLFVBQU0sRUFBRSxJQUFJO0FBQ1osY0FBVSxFQUFFLEVBQUU7QUFDZCxpQkFBYSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxJQUFJLEdBQUcsQ0FBQyxHQUFHLEtBQUssTUFBTSxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUNuRixFQUFFLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO0FBQ3hDLFVBQU87R0FDUDs7QUFFRCxNQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRTtBQUNoQixVQUFPO0dBQ1A7O0FBRUQsTUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDLENBQUM7O0FBRXRCLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3BDLE9BQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQ3hDLGdCQUFZLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLFVBQU07SUFDTjtHQUNEOztBQUVELE1BQUksYUFBYSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFM0IsTUFBSSxHQUFHLEtBQUssTUFBTSxJQUFJLFlBQVksR0FBRyxDQUFDLENBQUMsSUFBSSxZQUFZLEdBQUcsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDekUsZ0JBQWEsR0FBRyxHQUFHLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxDQUFDO0dBQ3RDLE1BQU0sSUFBSSxHQUFHLEtBQUssVUFBVSxFQUFFO0FBQzlCLE9BQUksWUFBWSxHQUFHLENBQUMsRUFBRTtBQUNyQixpQkFBYSxHQUFHLEdBQUcsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDdEMsTUFBTTtBQUNOLGlCQUFhLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDcEM7R0FDRDs7QUFFRCxNQUFJLENBQUMsUUFBUSxDQUFDO0FBQ2IsZ0JBQWEsRUFBRSxhQUFhO0dBQzVCLENBQUMsQ0FBQztFQUVIOztBQUVELGNBQWEsRUFBRSx1QkFBUyxFQUFFLEVBQUU7QUFDM0IsTUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsS0FBSyxFQUFFLEVBQUU7QUFDcEMsT0FBSSxDQUFDLFFBQVEsQ0FBQztBQUNiLGlCQUFhLEVBQUUsSUFBSTtJQUNuQixDQUFDLENBQUM7R0FDSDtFQUNEOztBQUVELFVBQVMsRUFBRSxxQkFBVzs7O0FBQ3JCLE1BQUksWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7O0FBRXBGLE1BQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxZQUFZLElBQUksSUFBSSxFQUFFO0FBQ2pFLE9BQUksYUFBYSxHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQy9FLGVBQVksR0FBRyxhQUFhLEdBQUcsYUFBYSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7R0FDMUQ7O0FBRUQsTUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxVQUFTLEVBQUUsRUFBRTtBQUN4RCxPQUFJLFNBQVMsR0FBRyxZQUFZLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQzs7QUFFMUMsT0FBSSxXQUFXLEdBQUcsT0FBTyxDQUFDO0FBQ3pCLG1CQUFlLEVBQUUsSUFBSTtBQUNyQixnQkFBWSxFQUFFLFNBQVM7SUFDdkIsQ0FBQyxDQUFDOztBQUVILE9BQUksR0FBRyxHQUFHLFNBQVMsR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDOztBQUV2QyxPQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDO09BQy9DLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDO09BQzlDLFNBQVMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7O0FBRTdDLFVBQ0M7O01BQUssR0FBRyxFQUFFLEdBQUcsQUFBQyxFQUFDLEdBQUcsRUFBRSxTQUFTLEdBQUcsRUFBRSxDQUFDLEtBQUssQUFBQyxFQUFDLFNBQVMsRUFBRSxXQUFXLEFBQUMsRUFBQyxZQUFZLEVBQUUsVUFBVSxBQUFDLEVBQUMsWUFBWSxFQUFFLFVBQVUsQUFBQyxFQUFDLFdBQVcsRUFBRSxTQUFTLEFBQUMsRUFBQyxPQUFPLEVBQUUsU0FBUyxBQUFDO0lBQUUsRUFBRSxDQUFDLEtBQUs7SUFBTyxDQUNqTDtHQUNGLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRVQsTUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0FBQzNDLE1BQUksb0JBQW9CLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQUEsRUFBRTtVQUFJLEVBQUUsQ0FBQyxLQUFLLEtBQUssTUFBSyxLQUFLLENBQUMsVUFBVTtHQUFBLENBQUMsQ0FBQzs7QUFFckcsTUFBRyxhQUFhLElBQUksQ0FBQyxvQkFBb0IsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUMvRSxPQUFJLFdBQVcsR0FBRyxPQUFPLENBQUM7QUFDekIsbUJBQWUsRUFBRSxJQUFJO0FBQ3JCLGlCQUFlLElBQUk7QUFDbkIsZ0JBQVksRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYTtJQUN2QyxDQUFDLENBQUM7QUFDSCxPQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO0FBQ3BDLE1BQUcsQ0FBQyxPQUFPLENBQUM7O01BQUssR0FBRyxFQUFFLElBQUksQUFBQyxFQUFDLEdBQUcsRUFBRSxTQUFTLEFBQUMsRUFBQyxXQUFXLEVBQUUsU0FBUyxBQUFDLEVBQUMsU0FBUyxFQUFFLFdBQVcsQUFBQztJQUFFLGFBQWEsQ0FBQyxLQUFLO0lBQU8sQ0FBQyxDQUFDO0dBQ3pIOztBQUVELFNBQU8sR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLEdBQ3RCOztLQUFLLFNBQVMsRUFBQyxrQkFBa0I7R0FDL0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYTtHQUN0RyxBQUNOLENBQUM7RUFDRjs7QUFFRCx1QkFBc0IsRUFBRSxnQ0FBVSxLQUFLLEVBQUUsS0FBSyxFQUFFO0FBQy9DLE1BQUksT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUM7O0FBRTVDLE1BQUksT0FBTyxFQUFFO0FBQ1osVUFBTyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztHQUN0QjtFQUNEOztBQUVELE9BQU0sRUFBRSxrQkFBVztBQUNsQixNQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFO0FBQ3pELGFBQVUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUs7QUFDNUIsa0JBQWUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVU7QUFDdEMsWUFBUyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTTtBQUM1QixlQUFZLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTO0FBQ2xDLGVBQVksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVM7QUFDbEMsZ0JBQWEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVE7QUFDbEMsY0FBVyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSztHQUM3QixDQUFDLENBQUM7O0FBRUgsTUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDOztBQUVmLE1BQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUU7QUFDckIsT0FBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVMsR0FBRyxFQUFFO0FBQ3ZDLFFBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7QUFDcEIsUUFBRyxFQUFFLEdBQUcsQ0FBQyxLQUFLO0FBQ2QscUJBQWdCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCO0FBQ2pELHVCQUFrQixFQUFFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQztBQUMvRCxhQUFRLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQztLQUMxQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ1IsU0FBSyxDQUFDLElBQUksQ0FBQyxvQkFBQyxLQUFLLEVBQUssS0FBSyxDQUFJLENBQUMsQ0FBQztJQUNqQyxFQUFFLElBQUksQ0FBQyxDQUFDO0dBQ1Q7O0FBRUQsTUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsSUFBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFBLEFBQUMsQUFBQyxFQUFFO0FBQzVGLFFBQUssQ0FBQyxJQUFJLENBQUM7O01BQUssU0FBUyxFQUFDLG9CQUFvQixFQUFDLEdBQUcsRUFBQyxhQUFhO0lBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXO0lBQU8sQ0FBQyxDQUFDO0dBQ2pHOztBQUVELE1BQUksT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLDhCQUFNLFNBQVMsRUFBQyxnQkFBZ0IsRUFBQyxlQUFZLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQztBQUNuRyxNQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLDhCQUFNLFNBQVMsRUFBQyxjQUFjLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxBQUFDLEVBQUMsY0FBWSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQUFBQyxFQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsVUFBVSxBQUFDLEVBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxVQUFVLEFBQUMsRUFBQyx1QkFBdUIsRUFBRSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsQUFBQyxHQUFHLEdBQUcsSUFBSSxDQUFDOztBQUVuWSxNQUFJLElBQUksQ0FBQztBQUNULE1BQUksU0FBUyxDQUFDO0FBQ2QsTUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTtBQUN0QixZQUFTLEdBQUc7QUFDWCxPQUFHLEVBQUUsTUFBTTtBQUNYLGFBQVMsRUFBRSxhQUFhO0lBQ3hCLENBQUM7QUFDRixPQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFO0FBQ3JCLGFBQVMsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztJQUM3QztBQUNELE9BQUksR0FDSDs7TUFBSyxHQUFHLEVBQUMscUJBQXFCLEVBQUMsU0FBUyxFQUFDLG1CQUFtQjtJQUMzRDs7S0FBUyxTQUFTO0tBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRTtLQUFPO0lBQ3ZDLEFBQ04sQ0FBQztHQUNGOztBQUVELE1BQUksS0FBSyxDQUFDO0FBQ1YsTUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUN6QixNQUFHLEVBQUUsT0FBTztBQUNaLFlBQVMsRUFBRSxjQUFjO0FBQ3pCLFdBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsSUFBSSxDQUFDO0FBQ2xDLFVBQU8sRUFBRSxJQUFJLENBQUMsZ0JBQWdCO0FBQzlCLFNBQU0sRUFBRSxJQUFJLENBQUMsZUFBZTtHQUM1QixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRTFCLE1BQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtBQUNsRCxRQUFLLEdBQUcsb0JBQUMsS0FBSyxhQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQUFBQyxFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsaUJBQWlCLEFBQUMsRUFBQyxRQUFRLEVBQUMsR0FBRyxJQUFLLFVBQVUsRUFBSSxDQUFDO0dBQy9HLE1BQU07QUFDTixRQUFLLEdBQUc7O0lBQVMsVUFBVTs7SUFBYyxDQUFDO0dBQzFDOztBQUVELFNBQ0M7O0tBQUssR0FBRyxFQUFDLFNBQVMsRUFBQyxTQUFTLEVBQUUsV0FBVyxBQUFDO0dBQ3pDLCtCQUFPLElBQUksRUFBQyxRQUFRLEVBQUMsR0FBRyxFQUFDLE9BQU8sRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEFBQUMsRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEFBQUMsRUFBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEFBQUMsR0FBRztHQUNsSDs7TUFBSyxTQUFTLEVBQUMsZ0JBQWdCLEVBQUMsR0FBRyxFQUFDLFNBQVMsRUFBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGFBQWEsQUFBQyxFQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsZUFBZSxBQUFDLEVBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxlQUFlLEFBQUM7SUFDL0ksS0FBSztJQUNMLEtBQUs7SUFDTiw4QkFBTSxTQUFTLEVBQUMsY0FBYyxHQUFHO0lBQ2hDLE9BQU87SUFDUCxLQUFLO0lBQ0Q7R0FDTCxJQUFJO0dBQ0EsQ0FDTDtFQUNGOztDQUVELENBQUMsQ0FBQzs7QUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgT3B0aW9uID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG5cdGRpc3BsYXlOYW1lOiAnVmFsdWUnLFxuXG5cdHByb3BUeXBlczoge1xuXHRcdGxhYmVsOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWRcblx0fSxcblxuXHRibG9ja0V2ZW50OiBmdW5jdGlvbihldmVudCkge1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGxhYmVsID0gdGhpcy5wcm9wcy5sYWJlbDtcblxuXHRcdGlmICh0aGlzLnByb3BzLm9wdGlvbkxhYmVsQ2xpY2spIHtcblx0XHRcdGxhYmVsID0gKFxuXHRcdFx0XHQ8YSBjbGFzc05hbWU9XCJTZWxlY3QtaXRlbS1sYWJlbF9fYVwiXG5cdFx0XHRcdFx0b25Nb3VzZURvd249e3RoaXMuYmxvY2tFdmVudH1cblx0XHRcdFx0XHRvblRvdWNoRW5kPXt0aGlzLnByb3BzLm9uT3B0aW9uTGFiZWxDbGlja31cblx0XHRcdFx0XHRvbkNsaWNrPXt0aGlzLnByb3BzLm9uT3B0aW9uTGFiZWxDbGlja30+XG5cdFx0XHRcdFx0e2xhYmVsfVxuXHRcdFx0XHQ8L2E+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cIlNlbGVjdC1pdGVtXCI+XG5cdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cIlNlbGVjdC1pdGVtLWljb25cIlxuXHRcdFx0XHRcdG9uTW91c2VEb3duPXt0aGlzLmJsb2NrRXZlbnR9XG5cdFx0XHRcdFx0b25DbGljaz17dGhpcy5wcm9wcy5vblJlbW92ZX1cblx0XHRcdFx0XHRvblRvdWNoRW5kPXt0aGlzLnByb3BzLm9uUmVtb3ZlfT4mdGltZXM7PC9zcGFuPlxuXHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9XCJTZWxlY3QtaXRlbS1sYWJlbFwiPntsYWJlbH08L3NwYW4+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9wdGlvbjtcbiIsInZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyksXG5cdFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKSxcblx0SW5wdXQgPSByZXF1aXJlKCdyZWFjdC1pbnB1dC1hdXRvc2l6ZScpLFxuXHRjbGFzc2VzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpLFxuXHRWYWx1ZSA9IHJlcXVpcmUoJy4vVmFsdWUnKTtcblxudmFyIHJlcXVlc3RJZCA9IDA7XG5cbnZhciBTZWxlY3QgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cblx0ZGlzcGxheU5hbWU6ICdTZWxlY3QnLFxuXG5cdHByb3BUeXBlczoge1xuXHRcdHZhbHVlOiBSZWFjdC5Qcm9wVHlwZXMuYW55LCAgICAgICAgICAgICAgICAvLyBpbml0aWFsIGZpZWxkIHZhbHVlXG5cdFx0bXVsdGk6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAgICAgIC8vIG11bHRpLXZhbHVlIGlucHV0XG5cdFx0ZGlzYWJsZWQ6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAgIC8vIHdoZXRoZXIgdGhlIFNlbGVjdCBpcyBkaXNhYmxlZCBvciBub3Rcblx0XHRvcHRpb25zOiBSZWFjdC5Qcm9wVHlwZXMuYXJyYXksICAgICAgICAgICAgLy8gYXJyYXkgb2Ygb3B0aW9uc1xuXHRcdGRlbGltaXRlcjogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgICAvLyBkZWxpbWl0ZXIgdG8gdXNlIHRvIGpvaW4gbXVsdGlwbGUgdmFsdWVzXG5cdFx0YXN5bmNPcHRpb25zOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgIC8vIGZ1bmN0aW9uIHRvIGNhbGwgdG8gZ2V0IG9wdGlvbnNcblx0XHRhdXRvbG9hZDogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgICAgLy8gd2hldGhlciB0byBhdXRvLWxvYWQgdGhlIGRlZmF1bHQgYXN5bmMgb3B0aW9ucyBzZXRcblx0XHRwbGFjZWhvbGRlcjogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgLy8gZmllbGQgcGxhY2Vob2xkZXIsIGRpc3BsYXllZCB3aGVuIHRoZXJlJ3Mgbm8gdmFsdWVcblx0XHRub1Jlc3VsdHNUZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgLy8gcGxhY2Vob2xkZXIgZGlzcGxheWVkIHdoZW4gdGhlcmUgYXJlIG5vIG1hdGNoaW5nIHNlYXJjaCByZXN1bHRzXG5cdFx0Y2xlYXJhYmxlOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgIC8vIHNob3VsZCBpdCBiZSBwb3NzaWJsZSB0byByZXNldCB2YWx1ZVxuXHRcdGNsZWFyVmFsdWVUZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAvLyB0aXRsZSBmb3IgdGhlIFwiY2xlYXJcIiBjb250cm9sXG5cdFx0Y2xlYXJBbGxUZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgIC8vIHRpdGxlIGZvciB0aGUgXCJjbGVhclwiIGNvbnRyb2wgd2hlbiBtdWx0aTogdHJ1ZVxuXHRcdHNlYXJjaGFibGU6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAvLyB3aGV0aGVyIHRvIGVuYWJsZSBzZWFyY2hpbmcgZmVhdHVyZSBvciBub3Rcblx0XHRzZWFyY2hQcm9tcHRUZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgLy8gbGFiZWwgdG8gcHJvbXB0IGZvciBzZWFyY2ggaW5wdXRcblx0XHRuYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgICAgICAgLy8gZmllbGQgbmFtZSwgZm9yIGhpZGRlbiA8aW5wdXQgLz4gdGFnXG5cdFx0b25DaGFuZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgICAgIC8vIG9uQ2hhbmdlIGhhbmRsZXI6IGZ1bmN0aW9uKG5ld1ZhbHVlKSB7fVxuXHRcdG9uRm9jdXM6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgICAgICAvLyBvbkZvY3VzIGhhbmRsZXI6IGZ1bmN0aW9uKGV2ZW50KSB7fVxuXHRcdG9uQmx1cjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgICAgICAvLyBvbkJsdXIgaGFuZGxlcjogZnVuY3Rpb24oZXZlbnQpIHt9XG5cdFx0Y2xhc3NOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgIC8vIGNsYXNzTmFtZSBmb3IgdGhlIG91dGVyIGVsZW1lbnRcblx0XHRmaWx0ZXJPcHRpb246IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgLy8gbWV0aG9kIHRvIGZpbHRlciBhIHNpbmdsZSBvcHRpb246IGZ1bmN0aW9uKG9wdGlvbiwgZmlsdGVyU3RyaW5nKVxuXHRcdGZpbHRlck9wdGlvbnM6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAvLyBtZXRob2QgdG8gZmlsdGVyIHRoZSBvcHRpb25zIGFycmF5OiBmdW5jdGlvbihbb3B0aW9uc10sIGZpbHRlclN0cmluZywgW3ZhbHVlc10pXG5cdFx0bWF0Y2hQb3M6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgICAgIC8vIChhbnl8c3RhcnQpIG1hdGNoIHRoZSBzdGFydCBvciBlbnRpcmUgc3RyaW5nIHdoZW4gZmlsdGVyaW5nXG5cdFx0bWF0Y2hQcm9wOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgIC8vIChhbnl8bGFiZWx8dmFsdWUpIHdoaWNoIG9wdGlvbiBwcm9wZXJ0eSB0byBmaWx0ZXIgb25cblx0XHRpbnB1dFByb3BzOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LCAgICAgICAgLy8gY3VzdG9tIGF0dHJpYnV0ZXMgZm9yIHRoZSBJbnB1dCAoaW4gdGhlIFNlbGVjdC1jb250cm9sKSBlLmc6IHsnZGF0YS1mb28nOiAnYmFyJ31cblx0XHR0YWdnaW5nOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgICAgLy8gd2hldGhlciBhIG5ldyBvcHRpb24gY2FuIGJlIGNyZWF0ZWQgYnkgZ2l2aW5nIGEgbmFtZVxuXHRcdHRhZ2dpbmdQbGFjZWhvbGRlcjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAvLyByZXR1cm5zIHRoZSB0ZXh0IHRvIGJlIGRpc3BsYXllZCBhZnRlciB0aGUgbmV3IG9wdGlvblxuXG5cdFx0Lypcblx0XHQqIEFsbG93IHVzZXIgdG8gbWFrZSBvcHRpb24gbGFiZWwgY2xpY2thYmxlLiBXaGVuIHRoaXMgaGFuZGxlciBpcyBkZWZpbmVkIHdlIHNob3VsZFxuXHRcdCogd3JhcCBsYWJlbCBpbnRvIDxhPmxhYmVsPC9hPiB0YWcuXG5cdFx0KlxuXHRcdCogb25PcHRpb25MYWJlbENsaWNrIGhhbmRsZXI6IGZ1bmN0aW9uICh2YWx1ZSwgZXZlbnQpIHt9XG5cdFx0KlxuXHRcdCovXG5cdFx0b25PcHRpb25MYWJlbENsaWNrOiBSZWFjdC5Qcm9wVHlwZXMuZnVuY1xuXHR9LFxuXG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHZhbHVlOiB1bmRlZmluZWQsXG5cdFx0XHRvcHRpb25zOiBbXSxcblx0XHRcdGRpc2FibGVkOiBmYWxzZSxcblx0XHRcdGRlbGltaXRlcjogJywnLFxuXHRcdFx0YXN5bmNPcHRpb25zOiB1bmRlZmluZWQsXG5cdFx0XHRhdXRvbG9hZDogdHJ1ZSxcblx0XHRcdHBsYWNlaG9sZGVyOiAnU2VsZWN0Li4uJyxcblx0XHRcdG5vUmVzdWx0c1RleHQ6ICdObyByZXN1bHRzIGZvdW5kJyxcblx0XHRcdGNsZWFyYWJsZTogdHJ1ZSxcblx0XHRcdGNsZWFyVmFsdWVUZXh0OiAnQ2xlYXIgdmFsdWUnLFxuXHRcdFx0Y2xlYXJBbGxUZXh0OiAnQ2xlYXIgYWxsJyxcblx0XHRcdHNlYXJjaGFibGU6IHRydWUsXG5cdFx0XHRzZWFyY2hQcm9tcHRUZXh0OiAnVHlwZSB0byBzZWFyY2gnLFxuXHRcdFx0bmFtZTogdW5kZWZpbmVkLFxuXHRcdFx0b25DaGFuZ2U6IHVuZGVmaW5lZCxcblx0XHRcdGNsYXNzTmFtZTogdW5kZWZpbmVkLFxuXHRcdFx0bWF0Y2hQb3M6ICdhbnknLFxuXHRcdFx0bWF0Y2hQcm9wOiAnYW55Jyxcblx0XHRcdGlucHV0UHJvcHM6IHt9LFxuXHRcdFx0dGFnZ2luZzogZmFsc2UsXG5cdFx0XHR0YWdnaW5nUGxhY2Vob2xkZXI6IGZ1bmN0aW9uKGN1cnJlbnRWYWx1ZSkge1xuXHRcdFx0XHRyZXR1cm4gJ1ByZXNzIGVudGVyIG9yIGNsaWNrIHRvIGNyZWF0ZSBcXCcnICsgY3VycmVudFZhbHVlICsgJ1xcJyBhcyBhIG5ldyB0YWcuLi4nXG5cdFx0XHR9LFxuXHRcdFx0b25PcHRpb25MYWJlbENsaWNrOiB1bmRlZmluZWRcblx0XHR9O1xuXHR9LFxuXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdC8qXG5cdFx0XHQgKiBzZXQgYnkgZ2V0U3RhdGVGcm9tVmFsdWUgb24gY29tcG9uZW50V2lsbE1vdW50OlxuXHRcdFx0ICogLSB2YWx1ZVxuXHRcdFx0ICogLSB2YWx1ZXNcblx0XHRcdCAqIC0gZmlsdGVyZWRPcHRpb25zXG5cdFx0XHQgKiAtIGlucHV0VmFsdWVcblx0XHRcdCAqIC0gcGxhY2Vob2xkZXJcblx0XHRcdCAqIC0gZm9jdXNlZE9wdGlvblxuXHRcdFx0Ki9cblx0XHRcdG9wdGlvbnM6IHRoaXMucHJvcHMub3B0aW9ucyxcblx0XHRcdGlzRm9jdXNlZDogZmFsc2UsXG5cdFx0XHRpc09wZW46IGZhbHNlLFxuXHRcdFx0aXNMb2FkaW5nOiBmYWxzZVxuXHRcdH07XG5cdH0sXG5cblx0Y29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLl9vcHRpb25zQ2FjaGUgPSB7fTtcblx0XHR0aGlzLl9vcHRpb25zRmlsdGVyU3RyaW5nID0gJyc7XG5cdFx0dGhpcy5zZXRTdGF0ZSh0aGlzLmdldFN0YXRlRnJvbVZhbHVlKHRoaXMucHJvcHMudmFsdWUpKTtcblxuXHRcdGlmICh0aGlzLnByb3BzLmFzeW5jT3B0aW9ucyAmJiB0aGlzLnByb3BzLmF1dG9sb2FkKSB7XG5cdFx0XHR0aGlzLmF1dG9sb2FkQXN5bmNPcHRpb25zKCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fY2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRpZiAoIXRoaXMuc3RhdGUuaXNPcGVuKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHZhciBtZW51RWxlbSA9IHRoaXMucmVmcy5zZWxlY3RNZW51Q29udGFpbmVyLmdldERPTU5vZGUoKTtcblx0XHRcdHZhciBjb250cm9sRWxlbSA9IHRoaXMucmVmcy5jb250cm9sLmdldERPTU5vZGUoKTtcblxuXHRcdFx0dmFyIGV2ZW50T2NjdXJlZE91dHNpZGVNZW51ID0gdGhpcy5jbGlja2VkT3V0c2lkZUVsZW1lbnQobWVudUVsZW0sIGV2ZW50KTtcblx0XHRcdHZhciBldmVudE9jY3VyZWRPdXRzaWRlQ29udHJvbCA9IHRoaXMuY2xpY2tlZE91dHNpZGVFbGVtZW50KGNvbnRyb2xFbGVtLCBldmVudCk7XG5cblx0XHRcdC8vIEhpZGUgZHJvcGRvd24gbWVudSBpZiBjbGljayBvY2N1cnJlZCBvdXRzaWRlIG9mIG1lbnVcblx0XHRcdGlmIChldmVudE9jY3VyZWRPdXRzaWRlTWVudSAmJiBldmVudE9jY3VyZWRPdXRzaWRlQ29udHJvbCkge1xuXHRcdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0XHRpc09wZW46IGZhbHNlXG5cdFx0XHRcdH0sIHRoaXMuX3VuYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdFx0fVxuXHRcdH0uYmluZCh0aGlzKTtcblxuXHRcdHRoaXMuX2JpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2Nsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdH07XG5cblx0XHR0aGlzLl91bmJpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2Nsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdH07XG5cdH0sXG5cblx0Y29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuXHRcdGNsZWFyVGltZW91dCh0aGlzLl9ibHVyVGltZW91dCk7XG5cdFx0Y2xlYXJUaW1lb3V0KHRoaXMuX2ZvY3VzVGltZW91dCk7XG5cblx0XHRpZih0aGlzLnN0YXRlLmlzT3Blbikge1xuXHRcdFx0dGhpcy5fdW5iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSgpO1xuXHRcdH1cblx0fSxcblxuXHRjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbihuZXdQcm9wcykge1xuXHRcdGlmIChKU09OLnN0cmluZ2lmeShuZXdQcm9wcy5vcHRpb25zKSAhPT0gSlNPTi5zdHJpbmdpZnkodGhpcy5wcm9wcy5vcHRpb25zKSkge1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdG9wdGlvbnM6IG5ld1Byb3BzLm9wdGlvbnMsXG5cdFx0XHRcdGZpbHRlcmVkT3B0aW9uczogdGhpcy5maWx0ZXJPcHRpb25zKG5ld1Byb3BzLm9wdGlvbnMpXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0aWYgKG5ld1Byb3BzLnZhbHVlICE9PSB0aGlzLnN0YXRlLnZhbHVlKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHRoaXMuZ2V0U3RhdGVGcm9tVmFsdWUobmV3UHJvcHMudmFsdWUsIG5ld1Byb3BzLm9wdGlvbnMpKTtcblx0XHR9XG5cdH0sXG5cblx0Y29tcG9uZW50RGlkVXBkYXRlOiBmdW5jdGlvbigpIHtcblx0XHRpZiAodGhpcy5fZm9jdXNBZnRlclVwZGF0ZSkge1xuXHRcdFx0Y2xlYXJUaW1lb3V0KHRoaXMuX2JsdXJUaW1lb3V0KTtcblx0XHRcdHRoaXMuX2ZvY3VzVGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHRoaXMuZ2V0SW5wdXROb2RlKCkuZm9jdXMoKTtcblx0XHRcdFx0dGhpcy5fZm9jdXNBZnRlclVwZGF0ZSA9IGZhbHNlO1xuXHRcdFx0fS5iaW5kKHRoaXMpLCA1MCk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuX2ZvY3VzZWRPcHRpb25SZXZlYWwpIHtcblx0XHRcdGlmICh0aGlzLnJlZnMuZm9jdXNlZCAmJiB0aGlzLnJlZnMubWVudSkge1xuXHRcdFx0XHR2YXIgZm9jdXNlZERPTSA9IHRoaXMucmVmcy5mb2N1c2VkLmdldERPTU5vZGUoKTtcblx0XHRcdFx0dmFyIG1lbnVET00gPSB0aGlzLnJlZnMubWVudS5nZXRET01Ob2RlKCk7XG5cdFx0XHRcdHZhciBmb2N1c2VkUmVjdCA9IGZvY3VzZWRET00uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdFx0XHRcdHZhciBtZW51UmVjdCA9IG1lbnVET00uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cblx0XHRcdFx0aWYgKGZvY3VzZWRSZWN0LmJvdHRvbSA+IG1lbnVSZWN0LmJvdHRvbSB8fFxuXHRcdFx0XHRcdGZvY3VzZWRSZWN0LnRvcCA8IG1lbnVSZWN0LnRvcCkge1xuXHRcdFx0XHRcdG1lbnVET00uc2Nyb2xsVG9wID0gKGZvY3VzZWRET00ub2Zmc2V0VG9wICsgZm9jdXNlZERPTS5jbGllbnRIZWlnaHQgLSBtZW51RE9NLm9mZnNldEhlaWdodCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0dGhpcy5fZm9jdXNlZE9wdGlvblJldmVhbCA9IGZhbHNlO1xuXHRcdH1cblx0fSxcblxuXHRjbGlja2VkT3V0c2lkZUVsZW1lbnQ6IGZ1bmN0aW9uKGVsZW1lbnQsIGV2ZW50KSB7XG5cdFx0dmFyIGV2ZW50VGFyZ2V0ID0gKGV2ZW50LnRhcmdldCkgPyBldmVudC50YXJnZXQgOiBldmVudC5zcmNFbGVtZW50O1xuXHRcdHdoaWxlIChldmVudFRhcmdldCAhPSBudWxsKSB7XG5cdFx0XHRpZiAoZXZlbnRUYXJnZXQgPT09IGVsZW1lbnQpIHJldHVybiBmYWxzZTtcblx0XHRcdGV2ZW50VGFyZ2V0ID0gZXZlbnRUYXJnZXQub2Zmc2V0UGFyZW50O1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSxcblxuXHRnZXRTdGF0ZUZyb21WYWx1ZTogZnVuY3Rpb24odmFsdWUsIG9wdGlvbnMpIHtcblx0XHRpZiAoIW9wdGlvbnMpIHtcblx0XHRcdG9wdGlvbnMgPSB0aGlzLnN0YXRlLm9wdGlvbnM7XG5cdFx0fVxuXG5cdFx0Ly8gcmVzZXQgaW50ZXJuYWwgZmlsdGVyIHN0cmluZ1xuXHRcdHRoaXMuX29wdGlvbnNGaWx0ZXJTdHJpbmcgPSAnJztcblxuXHRcdHZhciB2YWx1ZXMgPSB0aGlzLmluaXRWYWx1ZXNBcnJheSh2YWx1ZSwgb3B0aW9ucyksXG5cdFx0XHRmaWx0ZXJlZE9wdGlvbnMgPSB0aGlzLmZpbHRlck9wdGlvbnMob3B0aW9ucywgdmFsdWVzKTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHR2YWx1ZTogdmFsdWVzLm1hcChmdW5jdGlvbih2KSB7IHJldHVybiB2LnZhbHVlOyB9KS5qb2luKHRoaXMucHJvcHMuZGVsaW1pdGVyKSxcblx0XHRcdHZhbHVlczogdmFsdWVzLFxuXHRcdFx0aW5wdXRWYWx1ZTogJycsXG5cdFx0XHRmaWx0ZXJlZE9wdGlvbnM6IGZpbHRlcmVkT3B0aW9ucyxcblx0XHRcdHBsYWNlaG9sZGVyOiAhdGhpcy5wcm9wcy5tdWx0aSAmJiB2YWx1ZXMubGVuZ3RoID8gdmFsdWVzWzBdLmxhYmVsIDogdGhpcy5wcm9wcy5wbGFjZWhvbGRlcixcblx0XHRcdGZvY3VzZWRPcHRpb246ICF0aGlzLnByb3BzLm11bHRpICYmIHZhbHVlcy5sZW5ndGggPyB2YWx1ZXNbMF0gOiB0aGlzLmdldEF1dG9tYXRpY0ZvY3VzZWRPcHRpb24oZmlsdGVyZWRPcHRpb25zLCAnJylcblx0XHR9O1xuXHR9LFxuXG5cdGluaXRWYWx1ZXNBcnJheTogZnVuY3Rpb24odmFsdWVzLCBvcHRpb25zKSB7XG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KHZhbHVlcykpIHtcblx0XHRcdGlmICh0eXBlb2YgdmFsdWVzID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHR2YWx1ZXMgPSB2YWx1ZXMuc3BsaXQodGhpcy5wcm9wcy5kZWxpbWl0ZXIpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFsdWVzID0gdmFsdWVzID8gW3ZhbHVlc10gOiBbXTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdmFsdWVzLm1hcChmdW5jdGlvbih2YWwpIHtcblx0XHRcdHJldHVybiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycpID8gdmFsID0gXy5maW5kV2hlcmUob3B0aW9ucywgeyB2YWx1ZTogdmFsIH0pIHx8IHsgdmFsdWU6IHZhbCwgbGFiZWw6IHZhbCB9IDogdmFsO1xuXHRcdH0pO1xuXHR9LFxuXG5cdHNldFZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdHRoaXMuX2ZvY3VzQWZ0ZXJVcGRhdGUgPSB0cnVlO1xuXHRcdHZhciBuZXdTdGF0ZSA9IHRoaXMuZ2V0U3RhdGVGcm9tVmFsdWUodmFsdWUpO1xuXHRcdG5ld1N0YXRlLmlzT3BlbiA9IGZhbHNlO1xuXHRcdHRoaXMuZmlyZUNoYW5nZUV2ZW50KG5ld1N0YXRlKTtcblx0XHR0aGlzLnNldFN0YXRlKG5ld1N0YXRlKTtcblx0fSxcblxuXHRzZWxlY3RWYWx1ZTogZnVuY3Rpb24odmFsdWUpIHtcblx0XHRpZiAoIXRoaXMucHJvcHMubXVsdGkpIHtcblx0XHRcdHRoaXMuc2V0VmFsdWUodmFsdWUpO1xuXHRcdH0gZWxzZSBpZiAodmFsdWUpIHtcblx0XHRcdHRoaXMuYWRkVmFsdWUodmFsdWUpO1xuXHRcdH1cblx0XHR0aGlzLl91bmJpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKCk7XG5cdH0sXG5cblx0YWRkVmFsdWU6IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0dGhpcy5zZXRWYWx1ZSh0aGlzLnN0YXRlLnZhbHVlcy5jb25jYXQodmFsdWUpKTtcblx0fSxcblxuXHRwb3BWYWx1ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zZXRWYWx1ZShfLmluaXRpYWwodGhpcy5zdGF0ZS52YWx1ZXMpKTtcblx0fSxcblxuXHRyZW1vdmVWYWx1ZTogZnVuY3Rpb24odmFsdWUpIHtcblx0XHR0aGlzLnNldFZhbHVlKF8ud2l0aG91dCh0aGlzLnN0YXRlLnZhbHVlcywgdmFsdWUpKTtcblx0fSxcblxuXHRjbGVhclZhbHVlOiBmdW5jdGlvbihldmVudCkge1xuXHRcdC8vIGlmIHRoZSBldmVudCB3YXMgdHJpZ2dlcmVkIGJ5IGEgbW91c2Vkb3duIGFuZCBub3QgdGhlIHByaW1hcnlcblx0XHQvLyBidXR0b24sIGlnbm9yZSBpdC5cblx0XHRpZiAoZXZlbnQgJiYgZXZlbnQudHlwZSA9PT0gJ21vdXNlZG93bicgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHRoaXMuc2V0VmFsdWUobnVsbCk7XG5cdH0sXG5cblx0cmVzZXRWYWx1ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zZXRWYWx1ZSh0aGlzLnN0YXRlLnZhbHVlKTtcblx0fSxcblxuXHRnZXRJbnB1dE5vZGU6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgaW5wdXQgPSB0aGlzLnJlZnMuaW5wdXQ7XG5cdFx0cmV0dXJuIHRoaXMucHJvcHMuc2VhcmNoYWJsZSA/IGlucHV0IDogaW5wdXQuZ2V0RE9NTm9kZSgpO1xuXHR9LFxuXG5cdGZpcmVDaGFuZ2VFdmVudDogZnVuY3Rpb24obmV3U3RhdGUpIHtcblx0XHRpZiAobmV3U3RhdGUudmFsdWUgIT09IHRoaXMuc3RhdGUudmFsdWUgJiYgdGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuXHRcdFx0dGhpcy5wcm9wcy5vbkNoYW5nZShuZXdTdGF0ZS52YWx1ZSwgbmV3U3RhdGUudmFsdWVzKTtcblx0XHR9XG5cdH0sXG5cdFxuXHRnZXROZXdUYWdPcHRpb246IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLnByb3BzLnRhZ2dpbmcgPyB7XG5cdFx0XHRsYWJlbDogdGhpcy5wcm9wcy50YWdnaW5nUGxhY2Vob2xkZXIodGhpcy5zdGF0ZS5pbnB1dFZhbHVlKSxcblx0XHRcdHZhbHVlOiBudWxsLFxuXHRcdFx0dHlwZTogJ2NyZWF0ZVRhZydcblx0XHR9IDogbnVsbDtcblx0fSxcblxuXHRoYW5kbGVNb3VzZURvd246IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0Ly8gaWYgdGhlIGV2ZW50IHdhcyB0cmlnZ2VyZWQgYnkgYSBtb3VzZWRvd24gYW5kIG5vdCB0aGUgcHJpbWFyeVxuXHRcdC8vIGJ1dHRvbiwgb3IgaWYgdGhlIGNvbXBvbmVudCBpcyBkaXNhYmxlZCwgaWdub3JlIGl0LlxuXHRcdGlmICh0aGlzLnByb3BzLmRpc2FibGVkIHx8IChldmVudC50eXBlID09PSAnbW91c2Vkb3duJyAmJiBldmVudC5idXR0b24gIT09IDApKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRpZiAodGhpcy5zdGF0ZS5pc0ZvY3VzZWQpIHtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRpc09wZW46IHRydWVcblx0XHRcdH0sIHRoaXMuX2JpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5fb3BlbkFmdGVyRm9jdXMgPSB0cnVlO1xuXHRcdFx0dGhpcy5nZXRJbnB1dE5vZGUoKS5mb2N1cygpO1xuXHRcdH1cblx0fSxcblxuXHRoYW5kbGVJbnB1dEZvY3VzOiBmdW5jdGlvbihldmVudCkge1xuXHRcdHZhciBuZXdJc09wZW4gPSB0aGlzLnN0YXRlLmlzT3BlbiB8fCB0aGlzLl9vcGVuQWZ0ZXJGb2N1cztcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdGlzRm9jdXNlZDogdHJ1ZSxcblx0XHRcdGlzT3BlbjogbmV3SXNPcGVuXG5cdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRpZihuZXdJc09wZW4pIHtcblx0XHRcdFx0dGhpcy5fYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUoKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR0aGlzLl91bmJpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dGhpcy5fb3BlbkFmdGVyRm9jdXMgPSBmYWxzZTtcblxuXHRcdGlmICh0aGlzLnByb3BzLm9uRm9jdXMpIHtcblx0XHRcdHRoaXMucHJvcHMub25Gb2N1cyhldmVudCk7XG5cdFx0fVxuXHR9LFxuXG5cdGhhbmRsZUlucHV0Qmx1cjogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHR0aGlzLl9ibHVyVGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAodGhpcy5fZm9jdXNBZnRlclVwZGF0ZSkgcmV0dXJuO1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGlzRm9jdXNlZDogZmFsc2Vcblx0XHRcdH0pO1xuXHRcdH0uYmluZCh0aGlzKSwgNTApO1xuXG5cdFx0aWYgKHRoaXMucHJvcHMub25CbHVyKSB7XG5cdFx0XHR0aGlzLnByb3BzLm9uQmx1cihldmVudCk7XG5cdFx0fVxuXHR9LFxuXG5cdGhhbmRsZUtleURvd246IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0aWYgKHRoaXMuc3RhdGUuZGlzYWJsZWQpIHJldHVybjtcblxuXHRcdHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuXG5cdFx0XHRjYXNlIDg6IC8vIGJhY2tzcGFjZVxuXHRcdFx0XHRpZiAoIXRoaXMuc3RhdGUuaW5wdXRWYWx1ZSkge1xuXHRcdFx0XHRcdHRoaXMucG9wVmFsdWUoKTtcblx0XHRcdFx0fVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0XHRjYXNlIDk6IC8vIHRhYlxuXHRcdFx0XHRpZiAoZXZlbnQuc2hpZnRLZXkgfHwgIXRoaXMuc3RhdGUuaXNPcGVuIHx8ICF0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24pIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5zZWxlY3RGb2N1c2VkT3B0aW9uKCk7XG5cdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAxMzogLy8gZW50ZXJcblx0XHRcdFx0dGhpcy5zZWxlY3RGb2N1c2VkT3B0aW9uKCk7XG5cdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAyNzogLy8gZXNjYXBlXG5cdFx0XHRcdGlmICh0aGlzLnN0YXRlLmlzT3Blbikge1xuXHRcdFx0XHRcdHRoaXMucmVzZXRWYWx1ZSgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMuY2xlYXJWYWx1ZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAzODogLy8gdXBcblx0XHRcdFx0dGhpcy5mb2N1c1ByZXZpb3VzT3B0aW9uKCk7XG5cdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSA0MDogLy8gZG93blxuXHRcdFx0XHR0aGlzLmZvY3VzTmV4dE9wdGlvbigpO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRcdGRlZmF1bHQ6IHJldHVybjtcblx0XHR9XG5cblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHR9LFxuXG5cdGhhbmRsZUlucHV0Q2hhbmdlOiBmdW5jdGlvbihldmVudCkge1xuXHRcdC8vIGFzc2lnbiBhbiBpbnRlcm5hbCB2YXJpYWJsZSBiZWNhdXNlIHdlIG5lZWQgdG8gdXNlXG5cdFx0Ly8gdGhlIGxhdGVzdCB2YWx1ZSBiZWZvcmUgc2V0U3RhdGUoKSBoYXMgY29tcGxldGVkLlxuXHRcdHRoaXMuX29wdGlvbnNGaWx0ZXJTdHJpbmcgPSBldmVudC50YXJnZXQudmFsdWU7XG5cblx0XHRpZiAodGhpcy5wcm9wcy5hc3luY09wdGlvbnMpIHtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRpc0xvYWRpbmc6IHRydWUsXG5cdFx0XHRcdGlucHV0VmFsdWU6IGV2ZW50LnRhcmdldC52YWx1ZVxuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLmxvYWRBc3luY09wdGlvbnMoZXZlbnQudGFyZ2V0LnZhbHVlLCB7XG5cdFx0XHRcdGlzTG9hZGluZzogZmFsc2UsXG5cdFx0XHRcdGlzT3BlbjogdHJ1ZVxuXHRcdFx0fSwgdGhpcy5fYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgZmlsdGVyZWRPcHRpb25zID0gdGhpcy5maWx0ZXJPcHRpb25zKHRoaXMuc3RhdGUub3B0aW9ucyk7XG5cblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRpc09wZW46IHRydWUsXG5cdFx0XHRcdGlucHV0VmFsdWU6IGV2ZW50LnRhcmdldC52YWx1ZSxcblx0XHRcdFx0ZmlsdGVyZWRPcHRpb25zOiBmaWx0ZXJlZE9wdGlvbnMsXG5cdFx0XHRcdGZvY3VzZWRPcHRpb246IHRoaXMuZ2V0QXV0b21hdGljRm9jdXNlZE9wdGlvbihmaWx0ZXJlZE9wdGlvbnMsIGV2ZW50LnRhcmdldC52YWx1ZSlcblx0XHRcdH0sIHRoaXMuX2JpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcblx0XHR9XG5cdH0sXG5cblx0Y3JlYXRlQXNOZXdUYWc6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuYWRkVmFsdWUodGhpcy5zdGF0ZS5pbnB1dFZhbHVlKTtcblx0fSxcblx0XG5cdGdldEF1dG9tYXRpY0ZvY3VzZWRPcHRpb246IGZ1bmN0aW9uKG9wdGlvbnMsIGN1cnJlbnRJbnB1dCkge1xuXHRcdHZhciBpbnB1dCA9IGN1cnJlbnRJbnB1dCB8fCB0aGlzLnN0YXRlLmlucHV0VmFsdWU7XG5cdFx0aWYgKHRoaXMucHJvcHMudGFnZ2luZykge1xuXHRcdFx0aWYob3B0aW9ucyAmJiBvcHRpb25zLmxlbmd0aCAmJiAoXy5pc0VtcHR5KGlucHV0KSB8fCAgaW5wdXQgPT09IG9wdGlvbnNbMF0ubGFiZWwpKSB7XG5cdFx0XHRcdHJldHVybiBvcHRpb25zWzBdO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBvcHRpb25zID8gb3B0aW9uc1swXSA6IG51bGw7XG5cdFx0fVxuXHR9LFxuXG5cdGF1dG9sb2FkQXN5bmNPcHRpb25zOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmxvYWRBc3luY09wdGlvbnMoJycsIHt9LCBmdW5jdGlvbigpIHt9KTtcblx0fSxcblx0XG5cdGxvYWRBc3luY09wdGlvbnM6IGZ1bmN0aW9uKGlucHV0LCBzdGF0ZSkge1xuXHRcdHZhciB0aGlzUmVxdWVzdElkID0gdGhpcy5fY3VycmVudFJlcXVlc3RJZCA9IHJlcXVlc3RJZCsrO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPD0gaW5wdXQubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBjYWNoZUtleSA9IGlucHV0LnNsaWNlKDAsIGkpO1xuXHRcdFx0aWYgKHRoaXMuX29wdGlvbnNDYWNoZVtjYWNoZUtleV0gJiYgKGlucHV0ID09PSBjYWNoZUtleSB8fCB0aGlzLl9vcHRpb25zQ2FjaGVbY2FjaGVLZXldLmNvbXBsZXRlKSkge1xuXHRcdFx0XHR2YXIgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnNDYWNoZVtjYWNoZUtleV0ub3B0aW9ucztcblx0XHRcdFx0dmFyIGZpbHRlcmVkT3B0aW9ucyA9IHRoaXMuZmlsdGVyT3B0aW9ucyhvcHRpb25zKTtcblxuXHRcdFx0XHR0aGlzLnNldFN0YXRlKF8uZXh0ZW5kKHtcblx0XHRcdFx0XHRvcHRpb25zOiBvcHRpb25zLFxuXHRcdFx0XHRcdGZpbHRlcmVkT3B0aW9uczogZmlsdGVyZWRPcHRpb25zLFxuXHRcdFx0XHRcdGZvY3VzZWRPcHRpb246IF8uY29udGFpbnMoZmlsdGVyZWRPcHRpb25zLCB0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24pID8gdGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uIDogdGhpcy5nZXRBdXRvbWF0aWNGb2N1c2VkT3B0aW9uKGZpbHRlcmVkT3B0aW9ucywgaW5wdXQpXG5cdFx0XHRcdH0sIHN0YXRlKSk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLnByb3BzLmFzeW5jT3B0aW9ucyhpbnB1dCwgZnVuY3Rpb24oZXJyLCBkYXRhKSB7XG5cblx0XHRcdGlmIChlcnIpIHRocm93IGVycjtcblxuXHRcdFx0dGhpcy5fb3B0aW9uc0NhY2hlW2lucHV0XSA9IGRhdGE7XG5cblx0XHRcdGlmICh0aGlzUmVxdWVzdElkICE9PSB0aGlzLl9jdXJyZW50UmVxdWVzdElkKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHZhciBmaWx0ZXJlZE9wdGlvbnMgPSB0aGlzLmZpbHRlck9wdGlvbnMoZGF0YS5vcHRpb25zKTtcblxuXHRcdFx0dGhpcy5zZXRTdGF0ZShfLmV4dGVuZCh7XG5cdFx0XHRcdG9wdGlvbnM6IGRhdGEub3B0aW9ucyxcblx0XHRcdFx0ZmlsdGVyZWRPcHRpb25zOiBmaWx0ZXJlZE9wdGlvbnMsXG5cdFx0XHRcdGZvY3VzZWRPcHRpb246IF8uY29udGFpbnMoZmlsdGVyZWRPcHRpb25zLCB0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24pID8gdGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uIDogdGhpcy5nZXRBdXRvbWF0aWNGb2N1c2VkT3B0aW9uKGZpbHRlcmVkT3B0aW9ucywgaW5wdXQpXG5cdFx0XHR9LCBzdGF0ZSkpO1xuXG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0fSxcblxuXHRmaWx0ZXJPcHRpb25zOiBmdW5jdGlvbihvcHRpb25zLCB2YWx1ZXMpIHtcblx0XHRpZiAoIXRoaXMucHJvcHMuc2VhcmNoYWJsZSkge1xuXHRcdFx0cmV0dXJuIG9wdGlvbnM7XG5cdFx0fVxuXG5cdFx0dmFyIGZpbHRlclZhbHVlID0gdGhpcy5fb3B0aW9uc0ZpbHRlclN0cmluZztcblx0XHR2YXIgZXhjbHVkZSA9ICh2YWx1ZXMgfHwgdGhpcy5zdGF0ZS52YWx1ZXMpLm1hcChmdW5jdGlvbihpKSB7XG5cdFx0XHRyZXR1cm4gaS52YWx1ZTtcblx0XHR9KTtcblx0XHRpZiAodGhpcy5wcm9wcy5maWx0ZXJPcHRpb25zKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5wcm9wcy5maWx0ZXJPcHRpb25zLmNhbGwodGhpcywgb3B0aW9ucywgZmlsdGVyVmFsdWUsIGV4Y2x1ZGUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgZmlsdGVyT3B0aW9uID0gZnVuY3Rpb24ob3ApIHtcblx0XHRcdFx0aWYgKHRoaXMucHJvcHMubXVsdGkgJiYgXy5jb250YWlucyhleGNsdWRlLCBvcC52YWx1ZSkpIHJldHVybiBmYWxzZTtcblx0XHRcdFx0aWYgKHRoaXMucHJvcHMuZmlsdGVyT3B0aW9uKSByZXR1cm4gdGhpcy5wcm9wcy5maWx0ZXJPcHRpb24uY2FsbCh0aGlzLCBvcCwgZmlsdGVyVmFsdWUpO1xuXHRcdFx0XHR2YXIgdmFsdWVUZXN0ID0gU3RyaW5nKG9wLnZhbHVlKSwgbGFiZWxUZXN0ID0gU3RyaW5nKG9wLmxhYmVsKTtcblx0XHRcdFx0cmV0dXJuICFmaWx0ZXJWYWx1ZSB8fCAodGhpcy5wcm9wcy5tYXRjaFBvcyA9PT0gJ3N0YXJ0JykgPyAoXG5cdFx0XHRcdFx0KHRoaXMucHJvcHMubWF0Y2hQcm9wICE9PSAnbGFiZWwnICYmIHZhbHVlVGVzdC50b0xvd2VyQ2FzZSgpLnN1YnN0cigwLCBmaWx0ZXJWYWx1ZS5sZW5ndGgpID09PSBmaWx0ZXJWYWx1ZSkgfHxcblx0XHRcdFx0XHQodGhpcy5wcm9wcy5tYXRjaFByb3AgIT09ICd2YWx1ZScgJiYgbGFiZWxUZXN0LnRvTG93ZXJDYXNlKCkuc3Vic3RyKDAsIGZpbHRlclZhbHVlLmxlbmd0aCkgPT09IGZpbHRlclZhbHVlKVxuXHRcdFx0XHQpIDogKFxuXHRcdFx0XHRcdCh0aGlzLnByb3BzLm1hdGNoUHJvcCAhPT0gJ2xhYmVsJyAmJiB2YWx1ZVRlc3QudG9Mb3dlckNhc2UoKS5pbmRleE9mKGZpbHRlclZhbHVlLnRvTG93ZXJDYXNlKCkpID49IDApIHx8XG5cdFx0XHRcdFx0KHRoaXMucHJvcHMubWF0Y2hQcm9wICE9PSAndmFsdWUnICYmIGxhYmVsVGVzdC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoZmlsdGVyVmFsdWUudG9Mb3dlckNhc2UoKSkgPj0gMClcblx0XHRcdFx0KTtcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gXy5maWx0ZXIob3B0aW9ucywgZmlsdGVyT3B0aW9uLCB0aGlzKTtcblx0XHR9XG5cdH0sXG5cblx0c2VsZWN0Rm9jdXNlZE9wdGlvbjogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCF0aGlzLnN0YXRlLmlzT3BlbikgcmV0dXJuO1xuXHRcdGlmICh0aGlzLnByb3BzLnRhZ2dpbmcgJiYgIXRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbiAmJiAhXy5pc0VtcHR5KHRoaXMuc3RhdGUuaW5wdXRWYWx1ZSkpIHtcblx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZUFzTmV3VGFnKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLnNlbGVjdFZhbHVlKHRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbik7XG5cdFx0fVxuXHR9LFxuXG5cdGZvY3VzT3B0aW9uOiBmdW5jdGlvbihvcCkge1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0Zm9jdXNlZE9wdGlvbjogb3Bcblx0XHR9KTtcblx0fSxcblxuXHRmb2N1c05leHRPcHRpb246IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZm9jdXNBZGphY2VudE9wdGlvbignbmV4dCcpO1xuXHR9LFxuXG5cdGZvY3VzUHJldmlvdXNPcHRpb246IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZm9jdXNBZGphY2VudE9wdGlvbigncHJldmlvdXMnKTtcblx0fSxcblxuXHRmb2N1c0FkamFjZW50T3B0aW9uOiBmdW5jdGlvbihkaXIpIHtcblx0XHR0aGlzLl9mb2N1c2VkT3B0aW9uUmV2ZWFsID0gdHJ1ZTtcblxuXHRcdHZhciBvcHMgPSB0aGlzLnN0YXRlLmZpbHRlcmVkT3B0aW9ucztcblxuXHRcdGlmICghdGhpcy5zdGF0ZS5pc09wZW4pIHtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRpc09wZW46IHRydWUsXG5cdFx0XHRcdGlucHV0VmFsdWU6ICcnLFxuXHRcdFx0XHRmb2N1c2VkT3B0aW9uOiB0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24gfHwgb3BzW2RpciA9PT0gJ25leHQnID8gMCA6IG9wcy5sZW5ndGggLSAxXVxuXHRcdFx0fSwgdGhpcy5fYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICghb3BzLmxlbmd0aCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciBmb2N1c2VkSW5kZXggPSAtMTtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgb3BzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZiAodGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uID09PSBvcHNbaV0pIHtcblx0XHRcdFx0Zm9jdXNlZEluZGV4ID0gaTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dmFyIGZvY3VzZWRPcHRpb24gPSBvcHNbMF07XG5cblx0XHRpZiAoZGlyID09PSAnbmV4dCcgJiYgZm9jdXNlZEluZGV4ID4gLTEgJiYgZm9jdXNlZEluZGV4IDwgb3BzLmxlbmd0aCAtIDEpIHtcblx0XHRcdGZvY3VzZWRPcHRpb24gPSBvcHNbZm9jdXNlZEluZGV4ICsgMV07XG5cdFx0fSBlbHNlIGlmIChkaXIgPT09ICdwcmV2aW91cycpIHtcblx0XHRcdGlmIChmb2N1c2VkSW5kZXggPiAwKSB7XG5cdFx0XHRcdGZvY3VzZWRPcHRpb24gPSBvcHNbZm9jdXNlZEluZGV4IC0gMV07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmb2N1c2VkT3B0aW9uID0gb3BzW29wcy5sZW5ndGggLSAxXTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdGZvY3VzZWRPcHRpb246IGZvY3VzZWRPcHRpb25cblx0XHR9KTtcblxuXHR9LFxuXG5cdHVuZm9jdXNPcHRpb246IGZ1bmN0aW9uKG9wKSB7XG5cdFx0aWYgKHRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbiA9PT0gb3ApIHtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRmb2N1c2VkT3B0aW9uOiBudWxsXG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cblx0YnVpbGRNZW51OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgZm9jdXNlZFZhbHVlID0gdGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uID8gdGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uLnZhbHVlIDogbnVsbDtcblxuXHRcdGlmKHRoaXMuc3RhdGUuZmlsdGVyZWRPcHRpb25zLmxlbmd0aCA+IDAgJiYgZm9jdXNlZFZhbHVlID09IG51bGwpIHtcblx0XHRcdHZhciBmb2N1c2VkT3B0aW9uID0gdGhpcy5nZXRBdXRvbWF0aWNGb2N1c2VkT3B0aW9uKHRoaXMuc3RhdGUuZmlsdGVyZWRPcHRpb25zKTtcblx0XHRcdGZvY3VzZWRWYWx1ZSA9IGZvY3VzZWRPcHRpb24gPyBmb2N1c2VkT3B0aW9uLnZhbHVlIDogbnVsbDtcblx0XHR9XG5cblx0XHR2YXIgb3BzID0gXy5tYXAodGhpcy5zdGF0ZS5maWx0ZXJlZE9wdGlvbnMsIGZ1bmN0aW9uKG9wKSB7XG5cdFx0XHR2YXIgaXNGb2N1c2VkID0gZm9jdXNlZFZhbHVlID09PSBvcC52YWx1ZTtcblxuXHRcdFx0dmFyIG9wdGlvbkNsYXNzID0gY2xhc3Nlcyh7XG5cdFx0XHRcdCdTZWxlY3Qtb3B0aW9uJzogdHJ1ZSxcblx0XHRcdFx0J2lzLWZvY3VzZWQnOiBpc0ZvY3VzZWRcblx0XHRcdH0pO1xuXG5cdFx0XHR2YXIgcmVmID0gaXNGb2N1c2VkID8gJ2ZvY3VzZWQnIDogbnVsbDtcblxuXHRcdFx0dmFyIG1vdXNlRW50ZXIgPSB0aGlzLmZvY3VzT3B0aW9uLmJpbmQodGhpcywgb3ApLFxuXHRcdFx0XHRtb3VzZUxlYXZlID0gdGhpcy51bmZvY3VzT3B0aW9uLmJpbmQodGhpcywgb3ApLFxuXHRcdFx0XHRtb3VzZURvd24gPSB0aGlzLnNlbGVjdFZhbHVlLmJpbmQodGhpcywgb3ApO1xuXG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8ZGl2IHJlZj17cmVmfSBrZXk9eydvcHRpb24tJyArIG9wLnZhbHVlfSBjbGFzc05hbWU9e29wdGlvbkNsYXNzfSBvbk1vdXNlRW50ZXI9e21vdXNlRW50ZXJ9IG9uTW91c2VMZWF2ZT17bW91c2VMZWF2ZX0gb25Nb3VzZURvd249e21vdXNlRG93bn0gb25DbGljaz17bW91c2VEb3dufT57b3AubGFiZWx9PC9kaXY+XG5cdFx0XHQpO1xuXHRcdH0sIHRoaXMpO1xuXHRcdFxuXHRcdHZhciB0YWdnaW5nT3B0aW9uID0gdGhpcy5nZXROZXdUYWdPcHRpb24oKTtcblx0XHR2YXIgaXNUYWdBbHJlYWR5QW5PcHRpb24gPSB0aGlzLnN0YXRlLmZpbHRlcmVkT3B0aW9ucy5zb21lKG9wID0+IG9wLnZhbHVlID09PSB0aGlzLnN0YXRlLmlucHV0VmFsdWUpO1xuXHRcdFxuXHRcdGlmKHRhZ2dpbmdPcHRpb24gJiYgIWlzVGFnQWxyZWFkeUFuT3B0aW9uICYmICFfLmlzRW1wdHkodGhpcy5zdGF0ZS5pbnB1dFZhbHVlKSkge1xuXHRcdFx0dmFyIG9wdGlvbkNsYXNzID0gY2xhc3Nlcyh7XG5cdFx0XHRcdCdTZWxlY3Qtb3B0aW9uJzogdHJ1ZSxcblx0XHRcdFx0J3BsYWNlaG9sZGVyJzogdHJ1ZSxcblx0XHRcdFx0J2lzLWZvY3VzZWQnOiAhdGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uXG5cdFx0XHR9KTtcblx0XHRcdHZhciBtb3VzZURvd24gPSB0aGlzLmNyZWF0ZUFzTmV3VGFnO1xuXHRcdFx0b3BzLnVuc2hpZnQoPGRpdiByZWY9e251bGx9IGtleT17J25ldy10YWcnfSBvbk1vdXNlRG93bj17bW91c2VEb3dufSBjbGFzc05hbWU9e29wdGlvbkNsYXNzfT57dGFnZ2luZ09wdGlvbi5sYWJlbH08L2Rpdj4pO1x0XHRcdFxuXHRcdH1cblxuXHRcdHJldHVybiBvcHMubGVuZ3RoID8gb3BzIDogKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJTZWxlY3Qtbm9yZXN1bHRzXCI+XG5cdFx0XHRcdHt0aGlzLnByb3BzLmFzeW5jT3B0aW9ucyAmJiAhdGhpcy5zdGF0ZS5pbnB1dFZhbHVlID8gdGhpcy5wcm9wcy5zZWFyY2hQcm9tcHRUZXh0IDogdGhpcy5wcm9wcy5ub1Jlc3VsdHNUZXh0fVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fSxcblxuXHRoYW5kbGVPcHRpb25MYWJlbENsaWNrOiBmdW5jdGlvbiAodmFsdWUsIGV2ZW50KSB7XG5cdFx0dmFyIGhhbmRsZXIgPSB0aGlzLnByb3BzLm9uT3B0aW9uTGFiZWxDbGljaztcblxuXHRcdGlmIChoYW5kbGVyKSB7XG5cdFx0XHRoYW5kbGVyKHZhbHVlLCBldmVudCk7XG5cdFx0fVxuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNlbGVjdENsYXNzID0gY2xhc3NlcygnU2VsZWN0JywgdGhpcy5wcm9wcy5jbGFzc05hbWUsIHtcblx0XHRcdCdpcy1tdWx0aSc6IHRoaXMucHJvcHMubXVsdGksXG5cdFx0XHQnaXMtc2VhcmNoYWJsZSc6IHRoaXMucHJvcHMuc2VhcmNoYWJsZSxcblx0XHRcdCdpcy1vcGVuJzogdGhpcy5zdGF0ZS5pc09wZW4sXG5cdFx0XHQnaXMtZm9jdXNlZCc6IHRoaXMuc3RhdGUuaXNGb2N1c2VkLFxuXHRcdFx0J2lzLWxvYWRpbmcnOiB0aGlzLnN0YXRlLmlzTG9hZGluZyxcblx0XHRcdCdpcy1kaXNhYmxlZCc6IHRoaXMucHJvcHMuZGlzYWJsZWQsXG5cdFx0XHQnaGFzLXZhbHVlJzogdGhpcy5zdGF0ZS52YWx1ZVxuXHRcdH0pO1xuXG5cdFx0dmFyIHZhbHVlID0gW107XG5cblx0XHRpZiAodGhpcy5wcm9wcy5tdWx0aSkge1xuXHRcdFx0dGhpcy5zdGF0ZS52YWx1ZXMuZm9yRWFjaChmdW5jdGlvbih2YWwpIHtcblx0XHRcdFx0dmFyIHByb3BzID0gXy5leHRlbmQoe1xuXHRcdFx0XHRcdGtleTogdmFsLnZhbHVlLFxuXHRcdFx0XHRcdG9wdGlvbkxhYmVsQ2xpY2s6ICEhdGhpcy5wcm9wcy5vbk9wdGlvbkxhYmVsQ2xpY2ssXG5cdFx0XHRcdFx0b25PcHRpb25MYWJlbENsaWNrOiB0aGlzLmhhbmRsZU9wdGlvbkxhYmVsQ2xpY2suYmluZCh0aGlzLCB2YWwpLFxuXHRcdFx0XHRcdG9uUmVtb3ZlOiB0aGlzLnJlbW92ZVZhbHVlLmJpbmQodGhpcywgdmFsKVxuXHRcdFx0XHR9LCB2YWwpO1xuXHRcdFx0XHR2YWx1ZS5wdXNoKDxWYWx1ZSB7Li4ucHJvcHN9IC8+KTtcblx0XHRcdH0sIHRoaXMpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLnByb3BzLmRpc2FibGVkIHx8ICghdGhpcy5zdGF0ZS5pbnB1dFZhbHVlICYmICghdGhpcy5wcm9wcy5tdWx0aSB8fCAhdmFsdWUubGVuZ3RoKSkpIHtcblx0XHRcdHZhbHVlLnB1c2goPGRpdiBjbGFzc05hbWU9XCJTZWxlY3QtcGxhY2Vob2xkZXJcIiBrZXk9XCJwbGFjZWhvbGRlclwiPnt0aGlzLnN0YXRlLnBsYWNlaG9sZGVyfTwvZGl2Pik7XG5cdFx0fVxuXG5cdFx0dmFyIGxvYWRpbmcgPSB0aGlzLnN0YXRlLmlzTG9hZGluZyA/IDxzcGFuIGNsYXNzTmFtZT1cIlNlbGVjdC1sb2FkaW5nXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz4gOiBudWxsO1xuXHRcdHZhciBjbGVhciA9IHRoaXMucHJvcHMuY2xlYXJhYmxlICYmIHRoaXMuc3RhdGUudmFsdWUgJiYgIXRoaXMucHJvcHMuZGlzYWJsZWQgPyA8c3BhbiBjbGFzc05hbWU9XCJTZWxlY3QtY2xlYXJcIiB0aXRsZT17dGhpcy5wcm9wcy5tdWx0aSA/IHRoaXMucHJvcHMuY2xlYXJBbGxUZXh0IDogdGhpcy5wcm9wcy5jbGVhclZhbHVlVGV4dH0gYXJpYS1sYWJlbD17dGhpcy5wcm9wcy5tdWx0aSA/IHRoaXMucHJvcHMuY2xlYXJBbGxUZXh0IDogdGhpcy5wcm9wcy5jbGVhclZhbHVlVGV4dH0gb25Nb3VzZURvd249e3RoaXMuY2xlYXJWYWx1ZX0gb25DbGljaz17dGhpcy5jbGVhclZhbHVlfSBkYW5nZXJvdXNseVNldElubmVySFRNTD17eyBfX2h0bWw6ICcmdGltZXM7JyB9fSAvPiA6IG51bGw7XG5cblx0XHR2YXIgbWVudTtcblx0XHR2YXIgbWVudVByb3BzO1xuXHRcdGlmICh0aGlzLnN0YXRlLmlzT3Blbikge1xuXHRcdFx0bWVudVByb3BzID0ge1xuXHRcdFx0XHRyZWY6ICdtZW51Jyxcblx0XHRcdFx0Y2xhc3NOYW1lOiAnU2VsZWN0LW1lbnUnXG5cdFx0XHR9O1xuXHRcdFx0aWYgKHRoaXMucHJvcHMubXVsdGkpIHtcblx0XHRcdFx0bWVudVByb3BzLm9uTW91c2VEb3duID0gdGhpcy5oYW5kbGVNb3VzZURvd247XG5cdFx0XHR9XG5cdFx0XHRtZW51ID0gKFxuXHRcdFx0XHQ8ZGl2IHJlZj1cInNlbGVjdE1lbnVDb250YWluZXJcIiBjbGFzc05hbWU9XCJTZWxlY3QtbWVudS1vdXRlclwiPlxuXHRcdFx0XHRcdDxkaXYgey4uLm1lbnVQcm9wc30+e3RoaXMuYnVpbGRNZW51KCl9PC9kaXY+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHR2YXIgaW5wdXQ7XG5cdFx0dmFyIGlucHV0UHJvcHMgPSBfLmV4dGVuZCh7XG5cdFx0XHRyZWY6ICdpbnB1dCcsXG5cdFx0XHRjbGFzc05hbWU6ICdTZWxlY3QtaW5wdXQnLFxuXHRcdFx0dGFiSW5kZXg6IHRoaXMucHJvcHMudGFiSW5kZXggfHwgMCxcblx0XHRcdG9uRm9jdXM6IHRoaXMuaGFuZGxlSW5wdXRGb2N1cyxcblx0XHRcdG9uQmx1cjogdGhpcy5oYW5kbGVJbnB1dEJsdXJcblx0XHR9LCB0aGlzLnByb3BzLmlucHV0UHJvcHMpO1xuXG5cdFx0aWYgKHRoaXMucHJvcHMuc2VhcmNoYWJsZSAmJiAhdGhpcy5wcm9wcy5kaXNhYmxlZCkge1xuXHRcdFx0aW5wdXQgPSA8SW5wdXQgdmFsdWU9e3RoaXMuc3RhdGUuaW5wdXRWYWx1ZX0gb25DaGFuZ2U9e3RoaXMuaGFuZGxlSW5wdXRDaGFuZ2V9IG1pbldpZHRoPVwiNVwiIHsuLi5pbnB1dFByb3BzfSAvPjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aW5wdXQgPSA8ZGl2IHsuLi5pbnB1dFByb3BzfT4mbmJzcDs8L2Rpdj47XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgcmVmPVwid3JhcHBlclwiIGNsYXNzTmFtZT17c2VsZWN0Q2xhc3N9PlxuXHRcdFx0XHQ8aW5wdXQgdHlwZT1cImhpZGRlblwiIHJlZj1cInZhbHVlXCIgbmFtZT17dGhpcy5wcm9wcy5uYW1lfSB2YWx1ZT17dGhpcy5zdGF0ZS52YWx1ZX0gZGlzYWJsZWQ9e3RoaXMucHJvcHMuZGlzYWJsZWR9IC8+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiU2VsZWN0LWNvbnRyb2xcIiByZWY9XCJjb250cm9sXCIgb25LZXlEb3duPXt0aGlzLmhhbmRsZUtleURvd259IG9uTW91c2VEb3duPXt0aGlzLmhhbmRsZU1vdXNlRG93bn0gb25Ub3VjaEVuZD17dGhpcy5oYW5kbGVNb3VzZURvd259PlxuXHRcdFx0XHRcdHt2YWx1ZX1cblx0XHRcdFx0XHR7aW5wdXR9XG5cdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPVwiU2VsZWN0LWFycm93XCIgLz5cblx0XHRcdFx0XHR7bG9hZGluZ31cblx0XHRcdFx0XHR7Y2xlYXJ9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHR7bWVudX1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2VsZWN0O1xuIl19
