require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var React = require("react");

var Option = React.createClass({

	displayName: "Value",

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
				"a",
				{ className: "Select-item-label__a",
					onMouseDown: this.blockEvent,
					onTouchEnd: this.props.onOptionLabelClick,
					onClick: this.props.onOptionLabelClick },
				label
			);
		}

		return React.createElement(
			"div",
			{ className: "Select-item" },
			React.createElement(
				"span",
				{ className: "Select-item-icon",
					onMouseDown: this.blockEvent,
					onClick: this.props.onRemove,
					onTouchEnd: this.props.onRemove },
				"×"
			),
			React.createElement(
				"span",
				{ className: "Select-item-label" },
				label
			)
		);
	}

});

module.exports = Option;

},{"react":undefined}],"react-select":[function(require,module,exports){
"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _ = require("lodash"),
    React = require("react"),
    Input = require("react-input-autosize"),
    classes = require("classnames"),
    Value = require("./Value");

var requestId = 0;

var Select = React.createClass({

	displayName: "Select",

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
			delimiter: ",",
			asyncOptions: undefined,
			autoload: true,
			placeholder: "Select...",
			noResultsText: "No results found",
			clearable: true,
			clearValueText: "Clear value",
			clearAllText: "Clear all",
			searchable: true,
			searchPromptText: "Type to search",
			name: undefined,
			onChange: undefined,
			className: undefined,
			matchPos: "any",
			matchProp: "any",
			inputProps: {},
			tagging: false,
			taggingPlaceholder: function taggingPlaceholder(currentValue) {
				return "Press enter or click to create '" + currentValue + "' as a new tag...";
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
		this._optionsFilterString = "";
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
			document.addEventListener("click", this._closeMenuIfClickedOutside);
		};

		this._unbindCloseMenuIfClickedOutside = function () {
			document.removeEventListener("click", this._closeMenuIfClickedOutside);
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
		this._optionsFilterString = "";

		var values = this.initValuesArray(value, options),
		    filteredOptions = this.filterOptions(options, values);

		return {
			value: values.map(function (v) {
				return v.value;
			}).join(this.props.delimiter),
			values: values,
			inputValue: "",
			filteredOptions: filteredOptions,
			placeholder: !this.props.multi && values.length ? values[0].label : this.props.placeholder,
			focusedOption: !this.props.multi && values.length ? values[0] : this.getAutomaticFocusedOption(filteredOptions, "")
		};
	},

	initValuesArray: function initValuesArray(values, options) {
		if (!Array.isArray(values)) {
			if (typeof values === "string") {
				values = values.split(this.props.delimiter);
			} else {
				values = values ? [values] : [];
			}
		}

		return values.map(function (val) {
			return typeof val === "string" ? val = _.findWhere(options, { value: val }) || { value: val, label: val } : val;
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
		console.log("selecting value");
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
		if (event && event.type === "mousedown" && event.button !== 0) {
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
			type: "createTag"
		} : null;
	},

	handleMouseDown: function handleMouseDown(event) {
		// if the event was triggered by a mousedown and not the primary
		// button, or if the component is disabled, ignore it.
		if (this.props.disabled || event.type === "mousedown" && event.button !== 0) {
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
		this.loadAsyncOptions("", {}, function () {});
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
				return !filterValue || this.props.matchPos === "start" ? this.props.matchProp !== "label" && valueTest.toLowerCase().substr(0, filterValue.length) === filterValue || this.props.matchProp !== "value" && labelTest.toLowerCase().substr(0, filterValue.length) === filterValue : this.props.matchProp !== "label" && valueTest.toLowerCase().indexOf(filterValue.toLowerCase()) >= 0 || this.props.matchProp !== "value" && labelTest.toLowerCase().indexOf(filterValue.toLowerCase()) >= 0;
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
		this.focusAdjacentOption("next");
	},

	focusPreviousOption: function focusPreviousOption() {
		this.focusAdjacentOption("previous");
	},

	focusAdjacentOption: function focusAdjacentOption(dir) {
		this._focusedOptionReveal = true;

		var ops = this.state.filteredOptions;

		if (!this.state.isOpen) {
			this.setState({
				isOpen: true,
				inputValue: "",
				focusedOption: this.state.focusedOption || ops[dir === "next" ? 0 : ops.length - 1]
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

		if (dir === "next" && focusedIndex > -1 && focusedIndex < ops.length - 1) {
			focusedOption = ops[focusedIndex + 1];
		} else if (dir === "previous") {
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
				"Select-option": true,
				"is-focused": isFocused
			});

			var ref = isFocused ? "focused" : null;

			var mouseEnter = this.focusOption.bind(this, op),
			    mouseLeave = this.unfocusOption.bind(this, op),
			    mouseDown = this.selectValue.bind(this, op);

			return React.createElement(
				"div",
				{ ref: ref, key: "option-" + op.value, className: optionClass, onMouseEnter: mouseEnter, onMouseLeave: mouseLeave, onMouseDown: mouseDown, onClick: mouseDown },
				op.label
			);
		}, this);

		var taggingOption = this.getNewTagOption();
		var isTagAlreadyAnOption = this.state.filteredOptions.some(function (op) {
			return op.value === _this.state.inputValue;
		});

		if (taggingOption && !isTagAlreadyAnOption && !_.isEmpty(this.state.inputValue)) {
			var optionClass = classes({
				"Select-option": true,
				placeholder: true,
				"is-focused": !this.state.focusedOption
			});
			var mouseDown = this.createAsNewTag;
			ops.unshift(React.createElement(
				"div",
				{ ref: null, key: "new-tag", onMouseDown: mouseDown, className: optionClass },
				taggingOption.label
			));
		}

		return ops.length ? ops : React.createElement(
			"div",
			{ className: "Select-noresults" },
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
		var selectClass = classes("Select", this.props.className, {
			"is-multi": this.props.multi,
			"is-searchable": this.props.searchable,
			"is-open": this.state.isOpen,
			"is-focused": this.state.isFocused,
			"is-loading": this.state.isLoading,
			"is-disabled": this.props.disabled,
			"has-value": this.state.value
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
				"div",
				{ className: "Select-placeholder", key: "placeholder" },
				this.state.placeholder
			));
		}

		var loading = this.state.isLoading ? React.createElement("span", { className: "Select-loading", "aria-hidden": "true" }) : null;
		var clear = this.props.clearable && this.state.value && !this.props.disabled ? React.createElement("span", { className: "Select-clear", title: this.props.multi ? this.props.clearAllText : this.props.clearValueText, "aria-label": this.props.multi ? this.props.clearAllText : this.props.clearValueText, onMouseDown: this.clearValue, onClick: this.clearValue, dangerouslySetInnerHTML: { __html: "&times;" } }) : null;

		var menu;
		var menuProps;
		if (this.state.isOpen) {
			menuProps = {
				ref: "menu",
				className: "Select-menu"
			};
			if (this.props.multi) {
				menuProps.onMouseDown = this.handleMouseDown;
			}
			menu = React.createElement(
				"div",
				{ ref: "selectMenuContainer", className: "Select-menu-outer" },
				React.createElement(
					"div",
					menuProps,
					this.buildMenu()
				)
			);
		}

		var input;
		var inputProps = _.extend({
			ref: "input",
			className: "Select-input",
			tabIndex: this.props.tabIndex || 0,
			onFocus: this.handleInputFocus,
			onBlur: this.handleInputBlur
		}, this.props.inputProps);

		if (this.props.searchable && !this.props.disabled) {
			input = React.createElement(Input, _extends({ value: this.state.inputValue, onChange: this.handleInputChange, minWidth: "5" }, inputProps));
		} else {
			input = React.createElement(
				"div",
				inputProps,
				" "
			);
		}

		return React.createElement(
			"div",
			{ ref: "wrapper", className: selectClass },
			React.createElement("input", { type: "hidden", ref: "value", name: this.props.name, value: this.state.value, disabled: this.props.disabled }),
			React.createElement(
				"div",
				{ className: "Select-control", ref: "control", onKeyDown: this.handleKeyDown, onMouseDown: this.handleMouseDown, onTouchEnd: this.handleMouseDown },
				value,
				input,
				React.createElement("span", { className: "Select-arrow" }),
				loading,
				clear
			),
			menu
		);
	}

});

module.exports = Select;

},{"./Value":1,"classnames":undefined,"lodash":undefined,"react":undefined,"react-input-autosize":undefined}]},{},[])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9yZWFjdC1jb21wb25lbnQtZ3VscC10YXNrcy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2FzZWxsZXJvL1dvcmtzcGFjZS9ucG0tbW9kdWxlcy9yZWFjdC1zZWxlY3Qvc3JjL1ZhbHVlLmpzIiwiL1VzZXJzL2FzZWxsZXJvL1dvcmtzcGFjZS9ucG0tbW9kdWxlcy9yZWFjdC1zZWxlY3Qvc3JjL1NlbGVjdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUU3QixJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOztBQUU5QixZQUFXLEVBQUUsT0FBTzs7QUFFcEIsVUFBUyxFQUFFO0FBQ1YsT0FBSyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7RUFDeEM7O0FBRUQsV0FBVSxFQUFFLG9CQUFTLEtBQUssRUFBRTtBQUMzQixPQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7RUFDeEI7O0FBRUQsT0FBTSxFQUFFLGtCQUFXO0FBQ2xCLE1BQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDOztBQUU3QixNQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUU7QUFDaEMsUUFBSyxHQUNKOztNQUFHLFNBQVMsRUFBQyxzQkFBc0I7QUFDbEMsZ0JBQVcsRUFBRSxJQUFJLENBQUMsVUFBVSxBQUFDO0FBQzdCLGVBQVUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixBQUFDO0FBQzFDLFlBQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixBQUFDO0lBQ3RDLEtBQUs7SUFDSCxBQUNKLENBQUM7R0FDRjs7QUFFRCxTQUNDOztLQUFLLFNBQVMsRUFBQyxhQUFhO0dBQzNC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QUFXLEVBQUUsSUFBSSxDQUFDLGVBQWUsQUFBQyxFQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsZUFBZSxBQUFDO0lBQy9JLEtBQUs7SUFDTCxLQUFLO0lBQ04sOEJBQU0sU0FBUyxFQUFDLGNBQWMsR0FBRztJQUNoQyxPQUFPO0lBQ1AsS0FBSztJQUNEO0dBQ0wsSUFBSTtHQUNBLENBQ0w7RUFDRjs7Q0FFRCxDQUFDLENBQUM7O0FBRUgsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIE9wdGlvbiA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuXHRkaXNwbGF5TmFtZTogJ1ZhbHVlJyxcblxuXHRwcm9wVHlwZXM6IHtcblx0XHRsYWJlbDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkXG5cdH0sXG5cblx0YmxvY2tFdmVudDogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBsYWJlbCA9IHRoaXMucHJvcHMubGFiZWw7XG5cblx0XHRpZiAodGhpcy5wcm9wcy5vcHRpb25MYWJlbENsaWNrKSB7XG5cdFx0XHRsYWJlbCA9IChcblx0XHRcdFx0PGEgY2xhc3NOYW1lPVwiU2VsZWN0LWl0ZW0tbGFiZWxfX2FcIlxuXHRcdFx0XHRcdG9uTW91c2VEb3duPXt0aGlzLmJsb2NrRXZlbnR9XG5cdFx0XHRcdFx0b25Ub3VjaEVuZD17dGhpcy5wcm9wcy5vbk9wdGlvbkxhYmVsQ2xpY2t9XG5cdFx0XHRcdFx0b25DbGljaz17dGhpcy5wcm9wcy5vbk9wdGlvbkxhYmVsQ2xpY2t9PlxuXHRcdFx0XHRcdHtsYWJlbH1cblx0XHRcdFx0PC9hPlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJTZWxlY3QtaXRlbVwiPlxuXHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9XCJTZWxlY3QtaXRlbS1pY29uXCJcblx0XHRcdFx0XHRvbk1vdXNlRG93bj17dGhpcy5ibG9ja0V2ZW50fVxuXHRcdFx0XHRcdG9uQ2xpY2s9e3RoaXMucHJvcHMub25SZW1vdmV9XG5cdFx0XHRcdFx0b25Ub3VjaEVuZD17dGhpcy5wcm9wcy5vblJlbW92ZX0+JnRpbWVzOzwvc3Bhbj5cblx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPVwiU2VsZWN0LWl0ZW0tbGFiZWxcIj57bGFiZWx9PC9zcGFuPlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBPcHRpb247XG4iLCJ2YXIgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpLFxuXHRSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0JyksXG5cdElucHV0ID0gcmVxdWlyZSgncmVhY3QtaW5wdXQtYXV0b3NpemUnKSxcblx0Y2xhc3NlcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKSxcblx0VmFsdWUgPSByZXF1aXJlKCcuL1ZhbHVlJyk7XG5cbnZhciByZXF1ZXN0SWQgPSAwO1xuXG52YXIgU2VsZWN0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG5cdGRpc3BsYXlOYW1lOiAnU2VsZWN0JyxcblxuXHRwcm9wVHlwZXM6IHtcblx0XHR2YWx1ZTogUmVhY3QuUHJvcFR5cGVzLmFueSwgICAgICAgICAgICAgICAgLy8gaW5pdGlhbCBmaWVsZCB2YWx1ZVxuXHRcdG11bHRpOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgICAgICAvLyBtdWx0aS12YWx1ZSBpbnB1dFxuXHRcdGRpc2FibGVkOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgICAvLyB3aGV0aGVyIHRoZSBTZWxlY3QgaXMgZGlzYWJsZWQgb3Igbm90XG5cdFx0b3B0aW9uczogUmVhY3QuUHJvcFR5cGVzLmFycmF5LCAgICAgICAgICAgIC8vIGFycmF5IG9mIG9wdGlvbnNcblx0XHRkZWxpbWl0ZXI6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgICAgLy8gZGVsaW1pdGVyIHRvIHVzZSB0byBqb2luIG11bHRpcGxlIHZhbHVlc1xuXHRcdGFzeW5jT3B0aW9uczogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAvLyBmdW5jdGlvbiB0byBjYWxsIHRvIGdldCBvcHRpb25zXG5cdFx0YXV0b2xvYWQ6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAgIC8vIHdoZXRoZXIgdG8gYXV0by1sb2FkIHRoZSBkZWZhdWx0IGFzeW5jIG9wdGlvbnMgc2V0XG5cdFx0cGxhY2Vob2xkZXI6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgIC8vIGZpZWxkIHBsYWNlaG9sZGVyLCBkaXNwbGF5ZWQgd2hlbiB0aGVyZSdzIG5vIHZhbHVlXG5cdFx0bm9SZXN1bHRzVGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgIC8vIHBsYWNlaG9sZGVyIGRpc3BsYXllZCB3aGVuIHRoZXJlIGFyZSBubyBtYXRjaGluZyBzZWFyY2ggcmVzdWx0c1xuXHRcdGNsZWFyYWJsZTogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgICAvLyBzaG91bGQgaXQgYmUgcG9zc2libGUgdG8gcmVzZXQgdmFsdWVcblx0XHRjbGVhclZhbHVlVGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgLy8gdGl0bGUgZm9yIHRoZSBcImNsZWFyXCIgY29udHJvbFxuXHRcdGNsZWFyQWxsVGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAvLyB0aXRsZSBmb3IgdGhlIFwiY2xlYXJcIiBjb250cm9sIHdoZW4gbXVsdGk6IHRydWVcblx0XHRzZWFyY2hhYmxlOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgLy8gd2hldGhlciB0byBlbmFibGUgc2VhcmNoaW5nIGZlYXR1cmUgb3Igbm90XG5cdFx0c2VhcmNoUHJvbXB0VGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgIC8vIGxhYmVsIHRvIHByb21wdCBmb3Igc2VhcmNoIGlucHV0XG5cdFx0bmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgICAgICAgIC8vIGZpZWxkIG5hbWUsIGZvciBoaWRkZW4gPGlucHV0IC8+IHRhZ1xuXHRcdG9uQ2hhbmdlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgICAgICAvLyBvbkNoYW5nZSBoYW5kbGVyOiBmdW5jdGlvbihuZXdWYWx1ZSkge31cblx0XHRvbkZvY3VzOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgICAgICAgLy8gb25Gb2N1cyBoYW5kbGVyOiBmdW5jdGlvbihldmVudCkge31cblx0XHRvbkJsdXI6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgICAgICAgLy8gb25CbHVyIGhhbmRsZXI6IGZ1bmN0aW9uKGV2ZW50KSB7fVxuXHRcdGNsYXNzTmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgICAvLyBjbGFzc05hbWUgZm9yIHRoZSBvdXRlciBlbGVtZW50XG5cdFx0ZmlsdGVyT3B0aW9uOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgIC8vIG1ldGhvZCB0byBmaWx0ZXIgYSBzaW5nbGUgb3B0aW9uOiBmdW5jdGlvbihvcHRpb24sIGZpbHRlclN0cmluZylcblx0XHRmaWx0ZXJPcHRpb25zOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgLy8gbWV0aG9kIHRvIGZpbHRlciB0aGUgb3B0aW9ucyBhcnJheTogZnVuY3Rpb24oW29wdGlvbnNdLCBmaWx0ZXJTdHJpbmcsIFt2YWx1ZXNdKVxuXHRcdG1hdGNoUG9zOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgICAvLyAoYW55fHN0YXJ0KSBtYXRjaCB0aGUgc3RhcnQgb3IgZW50aXJlIHN0cmluZyB3aGVuIGZpbHRlcmluZ1xuXHRcdG1hdGNoUHJvcDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgICAvLyAoYW55fGxhYmVsfHZhbHVlKSB3aGljaCBvcHRpb24gcHJvcGVydHkgdG8gZmlsdGVyIG9uXG5cdFx0aW5wdXRQcm9wczogUmVhY3QuUHJvcFR5cGVzLm9iamVjdCwgICAgICAgIC8vIGN1c3RvbSBhdHRyaWJ1dGVzIGZvciB0aGUgSW5wdXQgKGluIHRoZSBTZWxlY3QtY29udHJvbCkgZS5nOiB7J2RhdGEtZm9vJzogJ2Jhcid9XG5cdFx0dGFnZ2luZzogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgICAgIC8vIHdoZXRoZXIgYSBuZXcgb3B0aW9uIGNhbiBiZSBjcmVhdGVkIGJ5IGdpdmluZyBhIG5hbWVcblx0XHR0YWdnaW5nUGxhY2Vob2xkZXI6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgLy8gcmV0dXJucyB0aGUgdGV4dCB0byBiZSBkaXNwbGF5ZWQgYWZ0ZXIgdGhlIG5ldyBvcHRpb25cblxuXHRcdC8qXG5cdFx0KiBBbGxvdyB1c2VyIHRvIG1ha2Ugb3B0aW9uIGxhYmVsIGNsaWNrYWJsZS4gV2hlbiB0aGlzIGhhbmRsZXIgaXMgZGVmaW5lZCB3ZSBzaG91bGRcblx0XHQqIHdyYXAgbGFiZWwgaW50byA8YT5sYWJlbDwvYT4gdGFnLlxuXHRcdCpcblx0XHQqIG9uT3B0aW9uTGFiZWxDbGljayBoYW5kbGVyOiBmdW5jdGlvbiAodmFsdWUsIGV2ZW50KSB7fVxuXHRcdCpcblx0XHQqL1xuXHRcdG9uT3B0aW9uTGFiZWxDbGljazogUmVhY3QuUHJvcFR5cGVzLmZ1bmNcblx0fSxcblxuXHRnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHR2YWx1ZTogdW5kZWZpbmVkLFxuXHRcdFx0b3B0aW9uczogW10sXG5cdFx0XHRkaXNhYmxlZDogZmFsc2UsXG5cdFx0XHRkZWxpbWl0ZXI6ICcsJyxcblx0XHRcdGFzeW5jT3B0aW9uczogdW5kZWZpbmVkLFxuXHRcdFx0YXV0b2xvYWQ6IHRydWUsXG5cdFx0XHRwbGFjZWhvbGRlcjogJ1NlbGVjdC4uLicsXG5cdFx0XHRub1Jlc3VsdHNUZXh0OiAnTm8gcmVzdWx0cyBmb3VuZCcsXG5cdFx0XHRjbGVhcmFibGU6IHRydWUsXG5cdFx0XHRjbGVhclZhbHVlVGV4dDogJ0NsZWFyIHZhbHVlJyxcblx0XHRcdGNsZWFyQWxsVGV4dDogJ0NsZWFyIGFsbCcsXG5cdFx0XHRzZWFyY2hhYmxlOiB0cnVlLFxuXHRcdFx0c2VhcmNoUHJvbXB0VGV4dDogJ1R5cGUgdG8gc2VhcmNoJyxcblx0XHRcdG5hbWU6IHVuZGVmaW5lZCxcblx0XHRcdG9uQ2hhbmdlOiB1bmRlZmluZWQsXG5cdFx0XHRjbGFzc05hbWU6IHVuZGVmaW5lZCxcblx0XHRcdG1hdGNoUG9zOiAnYW55Jyxcblx0XHRcdG1hdGNoUHJvcDogJ2FueScsXG5cdFx0XHRpbnB1dFByb3BzOiB7fSxcblx0XHRcdHRhZ2dpbmc6IGZhbHNlLFxuXHRcdFx0dGFnZ2luZ1BsYWNlaG9sZGVyOiBmdW5jdGlvbihjdXJyZW50VmFsdWUpIHtcblx0XHRcdFx0cmV0dXJuICdQcmVzcyBlbnRlciBvciBjbGljayB0byBjcmVhdGUgXFwnJyArIGN1cnJlbnRWYWx1ZSArICdcXCcgYXMgYSBuZXcgdGFnLi4uJ1xuXHRcdFx0fSxcblx0XHRcdG9uT3B0aW9uTGFiZWxDbGljazogdW5kZWZpbmVkXG5cdFx0fTtcblx0fSxcblxuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHQvKlxuXHRcdFx0ICogc2V0IGJ5IGdldFN0YXRlRnJvbVZhbHVlIG9uIGNvbXBvbmVudFdpbGxNb3VudDpcblx0XHRcdCAqIC0gdmFsdWVcblx0XHRcdCAqIC0gdmFsdWVzXG5cdFx0XHQgKiAtIGZpbHRlcmVkT3B0aW9uc1xuXHRcdFx0ICogLSBpbnB1dFZhbHVlXG5cdFx0XHQgKiAtIHBsYWNlaG9sZGVyXG5cdFx0XHQgKiAtIGZvY3VzZWRPcHRpb25cblx0XHRcdCovXG5cdFx0XHRvcHRpb25zOiB0aGlzLnByb3BzLm9wdGlvbnMsXG5cdFx0XHRpc0ZvY3VzZWQ6IGZhbHNlLFxuXHRcdFx0aXNPcGVuOiBmYWxzZSxcblx0XHRcdGlzTG9hZGluZzogZmFsc2Vcblx0XHR9O1xuXHR9LFxuXG5cdGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5fb3B0aW9uc0NhY2hlID0ge307XG5cdFx0dGhpcy5fb3B0aW9uc0ZpbHRlclN0cmluZyA9ICcnO1xuXHRcdHRoaXMuc2V0U3RhdGUodGhpcy5nZXRTdGF0ZUZyb21WYWx1ZSh0aGlzLnByb3BzLnZhbHVlKSk7XG5cblx0XHRpZiAodGhpcy5wcm9wcy5hc3luY09wdGlvbnMgJiYgdGhpcy5wcm9wcy5hdXRvbG9hZCkge1xuXHRcdFx0dGhpcy5hdXRvbG9hZEFzeW5jT3B0aW9ucygpO1xuXHRcdH1cblxuXHRcdHRoaXMuX2Nsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0aWYgKCF0aGlzLnN0YXRlLmlzT3Blbikge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR2YXIgbWVudUVsZW0gPSB0aGlzLnJlZnMuc2VsZWN0TWVudUNvbnRhaW5lci5nZXRET01Ob2RlKCk7XG5cdFx0XHR2YXIgY29udHJvbEVsZW0gPSB0aGlzLnJlZnMuY29udHJvbC5nZXRET01Ob2RlKCk7XG5cblx0XHRcdHZhciBldmVudE9jY3VyZWRPdXRzaWRlTWVudSA9IHRoaXMuY2xpY2tlZE91dHNpZGVFbGVtZW50KG1lbnVFbGVtLCBldmVudCk7XG5cdFx0XHR2YXIgZXZlbnRPY2N1cmVkT3V0c2lkZUNvbnRyb2wgPSB0aGlzLmNsaWNrZWRPdXRzaWRlRWxlbWVudChjb250cm9sRWxlbSwgZXZlbnQpO1xuXG5cdFx0XHQvLyBIaWRlIGRyb3Bkb3duIG1lbnUgaWYgY2xpY2sgb2NjdXJyZWQgb3V0c2lkZSBvZiBtZW51XG5cdFx0XHRpZiAoZXZlbnRPY2N1cmVkT3V0c2lkZU1lbnUgJiYgZXZlbnRPY2N1cmVkT3V0c2lkZUNvbnRyb2wpIHtcblx0XHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdFx0aXNPcGVuOiBmYWxzZVxuXHRcdFx0XHR9LCB0aGlzLl91bmJpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcblx0XHRcdH1cblx0XHR9LmJpbmQodGhpcyk7XG5cblx0XHR0aGlzLl9iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9jbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcblx0XHR9O1xuXG5cdFx0dGhpcy5fdW5iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9jbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcblx0XHR9O1xuXHR9LFxuXG5cdGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcblx0XHRjbGVhclRpbWVvdXQodGhpcy5fYmx1clRpbWVvdXQpO1xuXHRcdGNsZWFyVGltZW91dCh0aGlzLl9mb2N1c1RpbWVvdXQpO1xuXG5cdFx0aWYodGhpcy5zdGF0ZS5pc09wZW4pIHtcblx0XHRcdHRoaXMuX3VuYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUoKTtcblx0XHR9XG5cdH0sXG5cblx0Y29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24obmV3UHJvcHMpIHtcblx0XHRpZiAoSlNPTi5zdHJpbmdpZnkobmV3UHJvcHMub3B0aW9ucykgIT09IEpTT04uc3RyaW5naWZ5KHRoaXMucHJvcHMub3B0aW9ucykpIHtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRvcHRpb25zOiBuZXdQcm9wcy5vcHRpb25zLFxuXHRcdFx0XHRmaWx0ZXJlZE9wdGlvbnM6IHRoaXMuZmlsdGVyT3B0aW9ucyhuZXdQcm9wcy5vcHRpb25zKVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGlmIChuZXdQcm9wcy52YWx1ZSAhPT0gdGhpcy5zdGF0ZS52YWx1ZSkge1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh0aGlzLmdldFN0YXRlRnJvbVZhbHVlKG5ld1Byb3BzLnZhbHVlLCBuZXdQcm9wcy5vcHRpb25zKSk7XG5cdFx0fVxuXHR9LFxuXG5cdGNvbXBvbmVudERpZFVwZGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKHRoaXMuX2ZvY3VzQWZ0ZXJVcGRhdGUpIHtcblx0XHRcdGNsZWFyVGltZW91dCh0aGlzLl9ibHVyVGltZW91dCk7XG5cdFx0XHR0aGlzLl9mb2N1c1RpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0aGlzLmdldElucHV0Tm9kZSgpLmZvY3VzKCk7XG5cdFx0XHRcdHRoaXMuX2ZvY3VzQWZ0ZXJVcGRhdGUgPSBmYWxzZTtcblx0XHRcdH0uYmluZCh0aGlzKSwgNTApO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLl9mb2N1c2VkT3B0aW9uUmV2ZWFsKSB7XG5cdFx0XHRpZiAodGhpcy5yZWZzLmZvY3VzZWQgJiYgdGhpcy5yZWZzLm1lbnUpIHtcblx0XHRcdFx0dmFyIGZvY3VzZWRET00gPSB0aGlzLnJlZnMuZm9jdXNlZC5nZXRET01Ob2RlKCk7XG5cdFx0XHRcdHZhciBtZW51RE9NID0gdGhpcy5yZWZzLm1lbnUuZ2V0RE9NTm9kZSgpO1xuXHRcdFx0XHR2YXIgZm9jdXNlZFJlY3QgPSBmb2N1c2VkRE9NLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0XHR2YXIgbWVudVJlY3QgPSBtZW51RE9NLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG5cdFx0XHRcdGlmIChmb2N1c2VkUmVjdC5ib3R0b20gPiBtZW51UmVjdC5ib3R0b20gfHxcblx0XHRcdFx0XHRmb2N1c2VkUmVjdC50b3AgPCBtZW51UmVjdC50b3ApIHtcblx0XHRcdFx0XHRtZW51RE9NLnNjcm9sbFRvcCA9IChmb2N1c2VkRE9NLm9mZnNldFRvcCArIGZvY3VzZWRET00uY2xpZW50SGVpZ2h0IC0gbWVudURPTS5vZmZzZXRIZWlnaHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuX2ZvY3VzZWRPcHRpb25SZXZlYWwgPSBmYWxzZTtcblx0XHR9XG5cdH0sXG5cblx0Y2xpY2tlZE91dHNpZGVFbGVtZW50OiBmdW5jdGlvbihlbGVtZW50LCBldmVudCkge1xuXHRcdHZhciBldmVudFRhcmdldCA9IChldmVudC50YXJnZXQpID8gZXZlbnQudGFyZ2V0IDogZXZlbnQuc3JjRWxlbWVudDtcblx0XHR3aGlsZSAoZXZlbnRUYXJnZXQgIT0gbnVsbCkge1xuXHRcdFx0aWYgKGV2ZW50VGFyZ2V0ID09PSBlbGVtZW50KSByZXR1cm4gZmFsc2U7XG5cdFx0XHRldmVudFRhcmdldCA9IGV2ZW50VGFyZ2V0Lm9mZnNldFBhcmVudDtcblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0sXG5cblx0Z2V0U3RhdGVGcm9tVmFsdWU6IGZ1bmN0aW9uKHZhbHVlLCBvcHRpb25zKSB7XG5cdFx0aWYgKCFvcHRpb25zKSB7XG5cdFx0XHRvcHRpb25zID0gdGhpcy5zdGF0ZS5vcHRpb25zO1xuXHRcdH1cblxuXHRcdC8vIHJlc2V0IGludGVybmFsIGZpbHRlciBzdHJpbmdcblx0XHR0aGlzLl9vcHRpb25zRmlsdGVyU3RyaW5nID0gJyc7XG5cblx0XHR2YXIgdmFsdWVzID0gdGhpcy5pbml0VmFsdWVzQXJyYXkodmFsdWUsIG9wdGlvbnMpLFxuXHRcdFx0ZmlsdGVyZWRPcHRpb25zID0gdGhpcy5maWx0ZXJPcHRpb25zKG9wdGlvbnMsIHZhbHVlcyk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0dmFsdWU6IHZhbHVlcy5tYXAoZnVuY3Rpb24odikgeyByZXR1cm4gdi52YWx1ZTsgfSkuam9pbih0aGlzLnByb3BzLmRlbGltaXRlciksXG5cdFx0XHR2YWx1ZXM6IHZhbHVlcyxcblx0XHRcdGlucHV0VmFsdWU6ICcnLFxuXHRcdFx0ZmlsdGVyZWRPcHRpb25zOiBmaWx0ZXJlZE9wdGlvbnMsXG5cdFx0XHRwbGFjZWhvbGRlcjogIXRoaXMucHJvcHMubXVsdGkgJiYgdmFsdWVzLmxlbmd0aCA/IHZhbHVlc1swXS5sYWJlbCA6IHRoaXMucHJvcHMucGxhY2Vob2xkZXIsXG5cdFx0XHRmb2N1c2VkT3B0aW9uOiAhdGhpcy5wcm9wcy5tdWx0aSAmJiB2YWx1ZXMubGVuZ3RoID8gdmFsdWVzWzBdIDogdGhpcy5nZXRBdXRvbWF0aWNGb2N1c2VkT3B0aW9uKGZpbHRlcmVkT3B0aW9ucywgJycpXG5cdFx0fTtcblx0fSxcblxuXHRpbml0VmFsdWVzQXJyYXk6IGZ1bmN0aW9uKHZhbHVlcywgb3B0aW9ucykge1xuXHRcdGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZXMpKSB7XG5cdFx0XHRpZiAodHlwZW9mIHZhbHVlcyA9PT0gJ3N0cmluZycpIHtcblx0XHRcdFx0dmFsdWVzID0gdmFsdWVzLnNwbGl0KHRoaXMucHJvcHMuZGVsaW1pdGVyKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhbHVlcyA9IHZhbHVlcyA/IFt2YWx1ZXNdIDogW107XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHZhbHVlcy5tYXAoZnVuY3Rpb24odmFsKSB7XG5cdFx0XHRyZXR1cm4gKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnKSA/IHZhbCA9IF8uZmluZFdoZXJlKG9wdGlvbnMsIHsgdmFsdWU6IHZhbCB9KSB8fCB7IHZhbHVlOiB2YWwsIGxhYmVsOiB2YWwgfSA6IHZhbDtcblx0XHR9KTtcblx0fSxcblxuXHRzZXRWYWx1ZTogZnVuY3Rpb24odmFsdWUpIHtcblx0XHR0aGlzLl9mb2N1c0FmdGVyVXBkYXRlID0gdHJ1ZTtcblx0XHR2YXIgbmV3U3RhdGUgPSB0aGlzLmdldFN0YXRlRnJvbVZhbHVlKHZhbHVlKTtcblx0XHRuZXdTdGF0ZS5pc09wZW4gPSBmYWxzZTtcblx0XHR0aGlzLmZpcmVDaGFuZ2VFdmVudChuZXdTdGF0ZSk7XG5cdFx0dGhpcy5zZXRTdGF0ZShuZXdTdGF0ZSk7XG5cdH0sXG5cblx0c2VsZWN0VmFsdWU6IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0Y29uc29sZS5sb2coXCJzZWxlY3RpbmcgdmFsdWVcIik7XG5cdFx0aWYgKCF0aGlzLnByb3BzLm11bHRpKSB7XG5cdFx0XHR0aGlzLnNldFZhbHVlKHZhbHVlKTtcblx0XHR9IGVsc2UgaWYgKHZhbHVlKSB7XG5cdFx0XHR0aGlzLmFkZFZhbHVlKHZhbHVlKTtcblx0XHR9XG5cdFx0dGhpcy5fdW5iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSgpO1xuXHR9LFxuXG5cdGFkZFZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdHRoaXMuc2V0VmFsdWUodGhpcy5zdGF0ZS52YWx1ZXMuY29uY2F0KHZhbHVlKSk7XG5cdH0sXG5cblx0cG9wVmFsdWU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc2V0VmFsdWUoXy5pbml0aWFsKHRoaXMuc3RhdGUudmFsdWVzKSk7XG5cdH0sXG5cblx0cmVtb3ZlVmFsdWU6IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0dGhpcy5zZXRWYWx1ZShfLndpdGhvdXQodGhpcy5zdGF0ZS52YWx1ZXMsIHZhbHVlKSk7XG5cdH0sXG5cblx0Y2xlYXJWYWx1ZTogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHQvLyBpZiB0aGUgZXZlbnQgd2FzIHRyaWdnZXJlZCBieSBhIG1vdXNlZG93biBhbmQgbm90IHRoZSBwcmltYXJ5XG5cdFx0Ly8gYnV0dG9uLCBpZ25vcmUgaXQuXG5cdFx0aWYgKGV2ZW50ICYmIGV2ZW50LnR5cGUgPT09ICdtb3VzZWRvd24nICYmIGV2ZW50LmJ1dHRvbiAhPT0gMCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHR0aGlzLnNldFZhbHVlKG51bGwpO1xuXHR9LFxuXG5cdHJlc2V0VmFsdWU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc2V0VmFsdWUodGhpcy5zdGF0ZS52YWx1ZSk7XG5cdH0sXG5cblx0Z2V0SW5wdXROb2RlOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIGlucHV0ID0gdGhpcy5yZWZzLmlucHV0O1xuXHRcdHJldHVybiB0aGlzLnByb3BzLnNlYXJjaGFibGUgPyBpbnB1dCA6IGlucHV0LmdldERPTU5vZGUoKTtcblx0fSxcblxuXHRmaXJlQ2hhbmdlRXZlbnQ6IGZ1bmN0aW9uKG5ld1N0YXRlKSB7XG5cdFx0aWYgKG5ld1N0YXRlLnZhbHVlICE9PSB0aGlzLnN0YXRlLnZhbHVlICYmIHRoaXMucHJvcHMub25DaGFuZ2UpIHtcblx0XHRcdHRoaXMucHJvcHMub25DaGFuZ2UobmV3U3RhdGUudmFsdWUsIG5ld1N0YXRlLnZhbHVlcyk7XG5cdFx0fVxuXHR9LFxuXHRcblx0Z2V0TmV3VGFnT3B0aW9uOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5wcm9wcy50YWdnaW5nID8ge1xuXHRcdFx0bGFiZWw6IHRoaXMucHJvcHMudGFnZ2luZ1BsYWNlaG9sZGVyKHRoaXMuc3RhdGUuaW5wdXRWYWx1ZSksXG5cdFx0XHR2YWx1ZTogbnVsbCxcblx0XHRcdHR5cGU6ICdjcmVhdGVUYWcnXG5cdFx0fSA6IG51bGw7XG5cdH0sXG5cblx0aGFuZGxlTW91c2VEb3duOiBmdW5jdGlvbihldmVudCkge1xuXHRcdC8vIGlmIHRoZSBldmVudCB3YXMgdHJpZ2dlcmVkIGJ5IGEgbW91c2Vkb3duIGFuZCBub3QgdGhlIHByaW1hcnlcblx0XHQvLyBidXR0b24sIG9yIGlmIHRoZSBjb21wb25lbnQgaXMgZGlzYWJsZWQsIGlnbm9yZSBpdC5cblx0XHRpZiAodGhpcy5wcm9wcy5kaXNhYmxlZCB8fCAoZXZlbnQudHlwZSA9PT0gJ21vdXNlZG93bicgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0aWYgKHRoaXMuc3RhdGUuaXNGb2N1c2VkKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0aXNPcGVuOiB0cnVlXG5cdFx0XHR9LCB0aGlzLl9iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX29wZW5BZnRlckZvY3VzID0gdHJ1ZTtcblx0XHRcdHRoaXMuZ2V0SW5wdXROb2RlKCkuZm9jdXMoKTtcblx0XHR9XG5cdH0sXG5cblx0aGFuZGxlSW5wdXRGb2N1czogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHR2YXIgbmV3SXNPcGVuID0gdGhpcy5zdGF0ZS5pc09wZW4gfHwgdGhpcy5fb3BlbkFmdGVyRm9jdXM7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRpc0ZvY3VzZWQ6IHRydWUsXG5cdFx0XHRpc09wZW46IG5ld0lzT3BlblxuXHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYobmV3SXNPcGVuKSB7XG5cdFx0XHRcdHRoaXMuX2JpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0dGhpcy5fdW5iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHRoaXMuX29wZW5BZnRlckZvY3VzID0gZmFsc2U7XG5cblx0XHRpZiAodGhpcy5wcm9wcy5vbkZvY3VzKSB7XG5cdFx0XHR0aGlzLnByb3BzLm9uRm9jdXMoZXZlbnQpO1xuXHRcdH1cblx0fSxcblxuXHRoYW5kbGVJbnB1dEJsdXI6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0dGhpcy5fYmx1clRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKHRoaXMuX2ZvY3VzQWZ0ZXJVcGRhdGUpIHJldHVybjtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRpc0ZvY3VzZWQ6IGZhbHNlXG5cdFx0XHR9KTtcblx0XHR9LmJpbmQodGhpcyksIDUwKTtcblxuXHRcdGlmICh0aGlzLnByb3BzLm9uQmx1cikge1xuXHRcdFx0dGhpcy5wcm9wcy5vbkJsdXIoZXZlbnQpO1xuXHRcdH1cblx0fSxcblxuXHRoYW5kbGVLZXlEb3duOiBmdW5jdGlvbihldmVudCkge1xuXHRcdGlmICh0aGlzLnN0YXRlLmRpc2FibGVkKSByZXR1cm47XG5cblx0XHRzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcblxuXHRcdFx0Y2FzZSA4OiAvLyBiYWNrc3BhY2Vcblx0XHRcdFx0aWYgKCF0aGlzLnN0YXRlLmlucHV0VmFsdWUpIHtcblx0XHRcdFx0XHR0aGlzLnBvcFZhbHVlKCk7XG5cdFx0XHRcdH1cblx0XHRcdHJldHVybjtcblxuXHRcdFx0Y2FzZSA5OiAvLyB0YWJcblx0XHRcdFx0aWYgKGV2ZW50LnNoaWZ0S2V5IHx8ICF0aGlzLnN0YXRlLmlzT3BlbiB8fCAhdGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMuc2VsZWN0Rm9jdXNlZE9wdGlvbigpO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgMTM6IC8vIGVudGVyXG5cdFx0XHRcdHRoaXMuc2VsZWN0Rm9jdXNlZE9wdGlvbigpO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgMjc6IC8vIGVzY2FwZVxuXHRcdFx0XHRpZiAodGhpcy5zdGF0ZS5pc09wZW4pIHtcblx0XHRcdFx0XHR0aGlzLnJlc2V0VmFsdWUoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGlzLmNsZWFyVmFsdWUoKTtcblx0XHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgMzg6IC8vIHVwXG5cdFx0XHRcdHRoaXMuZm9jdXNQcmV2aW91c09wdGlvbigpO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgNDA6IC8vIGRvd25cblx0XHRcdFx0dGhpcy5mb2N1c05leHRPcHRpb24oKTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OiByZXR1cm47XG5cdFx0fVxuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0fSxcblxuXHRoYW5kbGVJbnB1dENoYW5nZTogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHQvLyBhc3NpZ24gYW4gaW50ZXJuYWwgdmFyaWFibGUgYmVjYXVzZSB3ZSBuZWVkIHRvIHVzZVxuXHRcdC8vIHRoZSBsYXRlc3QgdmFsdWUgYmVmb3JlIHNldFN0YXRlKCkgaGFzIGNvbXBsZXRlZC5cblx0XHR0aGlzLl9vcHRpb25zRmlsdGVyU3RyaW5nID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuXG5cdFx0aWYgKHRoaXMucHJvcHMuYXN5bmNPcHRpb25zKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0aXNMb2FkaW5nOiB0cnVlLFxuXHRcdFx0XHRpbnB1dFZhbHVlOiBldmVudC50YXJnZXQudmFsdWVcblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5sb2FkQXN5bmNPcHRpb25zKGV2ZW50LnRhcmdldC52YWx1ZSwge1xuXHRcdFx0XHRpc0xvYWRpbmc6IGZhbHNlLFxuXHRcdFx0XHRpc09wZW46IHRydWVcblx0XHRcdH0sIHRoaXMuX2JpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIGZpbHRlcmVkT3B0aW9ucyA9IHRoaXMuZmlsdGVyT3B0aW9ucyh0aGlzLnN0YXRlLm9wdGlvbnMpO1xuXG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0aXNPcGVuOiB0cnVlLFxuXHRcdFx0XHRpbnB1dFZhbHVlOiBldmVudC50YXJnZXQudmFsdWUsXG5cdFx0XHRcdGZpbHRlcmVkT3B0aW9uczogZmlsdGVyZWRPcHRpb25zLFxuXHRcdFx0XHRmb2N1c2VkT3B0aW9uOiB0aGlzLmdldEF1dG9tYXRpY0ZvY3VzZWRPcHRpb24oZmlsdGVyZWRPcHRpb25zLCBldmVudC50YXJnZXQudmFsdWUpXG5cdFx0XHR9LCB0aGlzLl9iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSk7XG5cdFx0fVxuXHR9LFxuXG5cdGNyZWF0ZUFzTmV3VGFnOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmFkZFZhbHVlKHRoaXMuc3RhdGUuaW5wdXRWYWx1ZSk7XG5cdH0sXG5cdFxuXHRnZXRBdXRvbWF0aWNGb2N1c2VkT3B0aW9uOiBmdW5jdGlvbihvcHRpb25zLCBjdXJyZW50SW5wdXQpIHtcblx0XHR2YXIgaW5wdXQgPSBjdXJyZW50SW5wdXQgfHwgdGhpcy5zdGF0ZS5pbnB1dFZhbHVlO1xuXHRcdGlmICh0aGlzLnByb3BzLnRhZ2dpbmcpIHtcblx0XHRcdGlmKG9wdGlvbnMgJiYgb3B0aW9ucy5sZW5ndGggJiYgKF8uaXNFbXB0eShpbnB1dCkgfHwgIGlucHV0ID09PSBvcHRpb25zWzBdLmxhYmVsKSkge1xuXHRcdFx0XHRyZXR1cm4gb3B0aW9uc1swXTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gb3B0aW9ucyA/IG9wdGlvbnNbMF0gOiBudWxsO1xuXHRcdH1cblx0fSxcblxuXHRhdXRvbG9hZEFzeW5jT3B0aW9uczogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5sb2FkQXN5bmNPcHRpb25zKCcnLCB7fSwgZnVuY3Rpb24oKSB7fSk7XG5cdH0sXG5cdFxuXHRsb2FkQXN5bmNPcHRpb25zOiBmdW5jdGlvbihpbnB1dCwgc3RhdGUpIHtcblx0XHR2YXIgdGhpc1JlcXVlc3RJZCA9IHRoaXMuX2N1cnJlbnRSZXF1ZXN0SWQgPSByZXF1ZXN0SWQrKztcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDw9IGlucHV0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgY2FjaGVLZXkgPSBpbnB1dC5zbGljZSgwLCBpKTtcblx0XHRcdGlmICh0aGlzLl9vcHRpb25zQ2FjaGVbY2FjaGVLZXldICYmIChpbnB1dCA9PT0gY2FjaGVLZXkgfHwgdGhpcy5fb3B0aW9uc0NhY2hlW2NhY2hlS2V5XS5jb21wbGV0ZSkpIHtcblx0XHRcdFx0dmFyIG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zQ2FjaGVbY2FjaGVLZXldLm9wdGlvbnM7XG5cdFx0XHRcdHZhciBmaWx0ZXJlZE9wdGlvbnMgPSB0aGlzLmZpbHRlck9wdGlvbnMob3B0aW9ucyk7XG5cblx0XHRcdFx0dGhpcy5zZXRTdGF0ZShfLmV4dGVuZCh7XG5cdFx0XHRcdFx0b3B0aW9uczogb3B0aW9ucyxcblx0XHRcdFx0XHRmaWx0ZXJlZE9wdGlvbnM6IGZpbHRlcmVkT3B0aW9ucyxcblx0XHRcdFx0XHRmb2N1c2VkT3B0aW9uOiBfLmNvbnRhaW5zKGZpbHRlcmVkT3B0aW9ucywgdGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uKSA/IHRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbiA6IHRoaXMuZ2V0QXV0b21hdGljRm9jdXNlZE9wdGlvbihmaWx0ZXJlZE9wdGlvbnMsIGlucHV0KVxuXHRcdFx0XHR9LCBzdGF0ZSkpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5wcm9wcy5hc3luY09wdGlvbnMoaW5wdXQsIGZ1bmN0aW9uKGVyciwgZGF0YSkge1xuXG5cdFx0XHRpZiAoZXJyKSB0aHJvdyBlcnI7XG5cblx0XHRcdHRoaXMuX29wdGlvbnNDYWNoZVtpbnB1dF0gPSBkYXRhO1xuXG5cdFx0XHRpZiAodGhpc1JlcXVlc3RJZCAhPT0gdGhpcy5fY3VycmVudFJlcXVlc3RJZCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR2YXIgZmlsdGVyZWRPcHRpb25zID0gdGhpcy5maWx0ZXJPcHRpb25zKGRhdGEub3B0aW9ucyk7XG5cblx0XHRcdHRoaXMuc2V0U3RhdGUoXy5leHRlbmQoe1xuXHRcdFx0XHRvcHRpb25zOiBkYXRhLm9wdGlvbnMsXG5cdFx0XHRcdGZpbHRlcmVkT3B0aW9uczogZmlsdGVyZWRPcHRpb25zLFxuXHRcdFx0XHRmb2N1c2VkT3B0aW9uOiBfLmNvbnRhaW5zKGZpbHRlcmVkT3B0aW9ucywgdGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uKSA/IHRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbiA6IHRoaXMuZ2V0QXV0b21hdGljRm9jdXNlZE9wdGlvbihmaWx0ZXJlZE9wdGlvbnMsIGlucHV0KVxuXHRcdFx0fSwgc3RhdGUpKTtcblxuXHRcdH0uYmluZCh0aGlzKSk7XG5cdH0sXG5cblx0ZmlsdGVyT3B0aW9uczogZnVuY3Rpb24ob3B0aW9ucywgdmFsdWVzKSB7XG5cdFx0aWYgKCF0aGlzLnByb3BzLnNlYXJjaGFibGUpIHtcblx0XHRcdHJldHVybiBvcHRpb25zO1xuXHRcdH1cblxuXHRcdHZhciBmaWx0ZXJWYWx1ZSA9IHRoaXMuX29wdGlvbnNGaWx0ZXJTdHJpbmc7XG5cdFx0dmFyIGV4Y2x1ZGUgPSAodmFsdWVzIHx8IHRoaXMuc3RhdGUudmFsdWVzKS5tYXAoZnVuY3Rpb24oaSkge1xuXHRcdFx0cmV0dXJuIGkudmFsdWU7XG5cdFx0fSk7XG5cdFx0aWYgKHRoaXMucHJvcHMuZmlsdGVyT3B0aW9ucykge1xuXHRcdFx0cmV0dXJuIHRoaXMucHJvcHMuZmlsdGVyT3B0aW9ucy5jYWxsKHRoaXMsIG9wdGlvbnMsIGZpbHRlclZhbHVlLCBleGNsdWRlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIGZpbHRlck9wdGlvbiA9IGZ1bmN0aW9uKG9wKSB7XG5cdFx0XHRcdGlmICh0aGlzLnByb3BzLm11bHRpICYmIF8uY29udGFpbnMoZXhjbHVkZSwgb3AudmFsdWUpKSByZXR1cm4gZmFsc2U7XG5cdFx0XHRcdGlmICh0aGlzLnByb3BzLmZpbHRlck9wdGlvbikgcmV0dXJuIHRoaXMucHJvcHMuZmlsdGVyT3B0aW9uLmNhbGwodGhpcywgb3AsIGZpbHRlclZhbHVlKTtcblx0XHRcdFx0dmFyIHZhbHVlVGVzdCA9IFN0cmluZyhvcC52YWx1ZSksIGxhYmVsVGVzdCA9IFN0cmluZyhvcC5sYWJlbCk7XG5cdFx0XHRcdHJldHVybiAhZmlsdGVyVmFsdWUgfHwgKHRoaXMucHJvcHMubWF0Y2hQb3MgPT09ICdzdGFydCcpID8gKFxuXHRcdFx0XHRcdCh0aGlzLnByb3BzLm1hdGNoUHJvcCAhPT0gJ2xhYmVsJyAmJiB2YWx1ZVRlc3QudG9Mb3dlckNhc2UoKS5zdWJzdHIoMCwgZmlsdGVyVmFsdWUubGVuZ3RoKSA9PT0gZmlsdGVyVmFsdWUpIHx8XG5cdFx0XHRcdFx0KHRoaXMucHJvcHMubWF0Y2hQcm9wICE9PSAndmFsdWUnICYmIGxhYmVsVGVzdC50b0xvd2VyQ2FzZSgpLnN1YnN0cigwLCBmaWx0ZXJWYWx1ZS5sZW5ndGgpID09PSBmaWx0ZXJWYWx1ZSlcblx0XHRcdFx0KSA6IChcblx0XHRcdFx0XHQodGhpcy5wcm9wcy5tYXRjaFByb3AgIT09ICdsYWJlbCcgJiYgdmFsdWVUZXN0LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihmaWx0ZXJWYWx1ZS50b0xvd2VyQ2FzZSgpKSA+PSAwKSB8fFxuXHRcdFx0XHRcdCh0aGlzLnByb3BzLm1hdGNoUHJvcCAhPT0gJ3ZhbHVlJyAmJiBsYWJlbFRlc3QudG9Mb3dlckNhc2UoKS5pbmRleE9mKGZpbHRlclZhbHVlLnRvTG93ZXJDYXNlKCkpID49IDApXG5cdFx0XHRcdCk7XG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIF8uZmlsdGVyKG9wdGlvbnMsIGZpbHRlck9wdGlvbiwgdGhpcyk7XG5cdFx0fVxuXHR9LFxuXG5cdHNlbGVjdEZvY3VzZWRPcHRpb246IGZ1bmN0aW9uKCkge1xuXHRcdGlmICghdGhpcy5zdGF0ZS5pc09wZW4pIHJldHVybjtcblx0XHRpZiAodGhpcy5wcm9wcy50YWdnaW5nICYmICF0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24gJiYgIV8uaXNFbXB0eSh0aGlzLnN0YXRlLmlucHV0VmFsdWUpKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVBc05ld1RhZygpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5zZWxlY3RWYWx1ZSh0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24pO1xuXHRcdH1cblx0fSxcblxuXHRmb2N1c09wdGlvbjogZnVuY3Rpb24ob3ApIHtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdGZvY3VzZWRPcHRpb246IG9wXG5cdFx0fSk7XG5cdH0sXG5cblx0Zm9jdXNOZXh0T3B0aW9uOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmZvY3VzQWRqYWNlbnRPcHRpb24oJ25leHQnKTtcblx0fSxcblxuXHRmb2N1c1ByZXZpb3VzT3B0aW9uOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmZvY3VzQWRqYWNlbnRPcHRpb24oJ3ByZXZpb3VzJyk7XG5cdH0sXG5cblx0Zm9jdXNBZGphY2VudE9wdGlvbjogZnVuY3Rpb24oZGlyKSB7XG5cdFx0dGhpcy5fZm9jdXNlZE9wdGlvblJldmVhbCA9IHRydWU7XG5cblx0XHR2YXIgb3BzID0gdGhpcy5zdGF0ZS5maWx0ZXJlZE9wdGlvbnM7XG5cblx0XHRpZiAoIXRoaXMuc3RhdGUuaXNPcGVuKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0aXNPcGVuOiB0cnVlLFxuXHRcdFx0XHRpbnB1dFZhbHVlOiAnJyxcblx0XHRcdFx0Zm9jdXNlZE9wdGlvbjogdGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uIHx8IG9wc1tkaXIgPT09ICduZXh0JyA/IDAgOiBvcHMubGVuZ3RoIC0gMV1cblx0XHRcdH0sIHRoaXMuX2JpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoIW9wcy5sZW5ndGgpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2YXIgZm9jdXNlZEluZGV4ID0gLTE7XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG9wcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKHRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbiA9PT0gb3BzW2ldKSB7XG5cdFx0XHRcdGZvY3VzZWRJbmRleCA9IGk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHZhciBmb2N1c2VkT3B0aW9uID0gb3BzWzBdO1xuXG5cdFx0aWYgKGRpciA9PT0gJ25leHQnICYmIGZvY3VzZWRJbmRleCA+IC0xICYmIGZvY3VzZWRJbmRleCA8IG9wcy5sZW5ndGggLSAxKSB7XG5cdFx0XHRmb2N1c2VkT3B0aW9uID0gb3BzW2ZvY3VzZWRJbmRleCArIDFdO1xuXHRcdH0gZWxzZSBpZiAoZGlyID09PSAncHJldmlvdXMnKSB7XG5cdFx0XHRpZiAoZm9jdXNlZEluZGV4ID4gMCkge1xuXHRcdFx0XHRmb2N1c2VkT3B0aW9uID0gb3BzW2ZvY3VzZWRJbmRleCAtIDFdO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Zm9jdXNlZE9wdGlvbiA9IG9wc1tvcHMubGVuZ3RoIC0gMV07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRmb2N1c2VkT3B0aW9uOiBmb2N1c2VkT3B0aW9uXG5cdFx0fSk7XG5cblx0fSxcblxuXHR1bmZvY3VzT3B0aW9uOiBmdW5jdGlvbihvcCkge1xuXHRcdGlmICh0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24gPT09IG9wKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0Zm9jdXNlZE9wdGlvbjogbnVsbFxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9LFxuXG5cdGJ1aWxkTWVudTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGZvY3VzZWRWYWx1ZSA9IHRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbiA/IHRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbi52YWx1ZSA6IG51bGw7XG5cblx0XHRpZih0aGlzLnN0YXRlLmZpbHRlcmVkT3B0aW9ucy5sZW5ndGggPiAwICYmIGZvY3VzZWRWYWx1ZSA9PSBudWxsKSB7XG5cdFx0XHR2YXIgZm9jdXNlZE9wdGlvbiA9IHRoaXMuZ2V0QXV0b21hdGljRm9jdXNlZE9wdGlvbih0aGlzLnN0YXRlLmZpbHRlcmVkT3B0aW9ucyk7XG5cdFx0XHRmb2N1c2VkVmFsdWUgPSBmb2N1c2VkT3B0aW9uID8gZm9jdXNlZE9wdGlvbi52YWx1ZSA6IG51bGw7XG5cdFx0fVxuXG5cdFx0dmFyIG9wcyA9IF8ubWFwKHRoaXMuc3RhdGUuZmlsdGVyZWRPcHRpb25zLCBmdW5jdGlvbihvcCkge1xuXHRcdFx0dmFyIGlzRm9jdXNlZCA9IGZvY3VzZWRWYWx1ZSA9PT0gb3AudmFsdWU7XG5cblx0XHRcdHZhciBvcHRpb25DbGFzcyA9IGNsYXNzZXMoe1xuXHRcdFx0XHQnU2VsZWN0LW9wdGlvbic6IHRydWUsXG5cdFx0XHRcdCdpcy1mb2N1c2VkJzogaXNGb2N1c2VkXG5cdFx0XHR9KTtcblxuXHRcdFx0dmFyIHJlZiA9IGlzRm9jdXNlZCA/ICdmb2N1c2VkJyA6IG51bGw7XG5cblx0XHRcdHZhciBtb3VzZUVudGVyID0gdGhpcy5mb2N1c09wdGlvbi5iaW5kKHRoaXMsIG9wKSxcblx0XHRcdFx0bW91c2VMZWF2ZSA9IHRoaXMudW5mb2N1c09wdGlvbi5iaW5kKHRoaXMsIG9wKSxcblx0XHRcdFx0bW91c2VEb3duID0gdGhpcy5zZWxlY3RWYWx1ZS5iaW5kKHRoaXMsIG9wKTtcblxuXHRcdFx0cmV0dXJuIDxkaXYgcmVmPXtyZWZ9IGtleT17J29wdGlvbi0nICsgb3AudmFsdWV9IGNsYXNzTmFtZT17b3B0aW9uQ2xhc3N9IG9uTW91c2VFbnRlcj17bW91c2VFbnRlcn0gb25Nb3VzZUxlYXZlPXttb3VzZUxlYXZlfSBvbk1vdXNlRG93bj17bW91c2VEb3dufSBvbkNsaWNrPXttb3VzZURvd259PntvcC5sYWJlbH08L2Rpdj47XG5cblx0XHR9LCB0aGlzKTtcblx0XHRcblx0XHR2YXIgdGFnZ2luZ09wdGlvbiA9IHRoaXMuZ2V0TmV3VGFnT3B0aW9uKCk7XG5cdFx0dmFyIGlzVGFnQWxyZWFkeUFuT3B0aW9uID0gdGhpcy5zdGF0ZS5maWx0ZXJlZE9wdGlvbnMuc29tZShvcCA9PiBvcC52YWx1ZSA9PT0gdGhpcy5zdGF0ZS5pbnB1dFZhbHVlKTtcblx0XHRcblx0XHRpZih0YWdnaW5nT3B0aW9uICYmICFpc1RhZ0FscmVhZHlBbk9wdGlvbiAmJiAhXy5pc0VtcHR5KHRoaXMuc3RhdGUuaW5wdXRWYWx1ZSkpIHtcblx0XHRcdHZhciBvcHRpb25DbGFzcyA9IGNsYXNzZXMoe1xuXHRcdFx0XHQnU2VsZWN0LW9wdGlvbic6IHRydWUsXG5cdFx0XHRcdCdwbGFjZWhvbGRlcic6IHRydWUsXG5cdFx0XHRcdCdpcy1mb2N1c2VkJzogIXRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvblxuXHRcdFx0fSk7XG5cdFx0XHR2YXIgbW91c2VEb3duID0gdGhpcy5jcmVhdGVBc05ld1RhZztcblx0XHRcdG9wcy51bnNoaWZ0KDxkaXYgcmVmPXtudWxsfSBrZXk9eyduZXctdGFnJ30gb25Nb3VzZURvd249e21vdXNlRG93bn0gY2xhc3NOYW1lPXtvcHRpb25DbGFzc30+e3RhZ2dpbmdPcHRpb24ubGFiZWx9PC9kaXY+KTtcdFx0XHRcblx0XHR9XG5cblx0XHRyZXR1cm4gb3BzLmxlbmd0aCA/IG9wcyA6IChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiU2VsZWN0LW5vcmVzdWx0c1wiPlxuXHRcdFx0XHR7dGhpcy5wcm9wcy5hc3luY09wdGlvbnMgJiYgIXRoaXMuc3RhdGUuaW5wdXRWYWx1ZSA/IHRoaXMucHJvcHMuc2VhcmNoUHJvbXB0VGV4dCA6IHRoaXMucHJvcHMubm9SZXN1bHRzVGV4dH1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH0sXG5cblx0aGFuZGxlT3B0aW9uTGFiZWxDbGljazogZnVuY3Rpb24gKHZhbHVlLCBldmVudCkge1xuXHRcdHZhciBoYW5kbGVyID0gdGhpcy5wcm9wcy5vbk9wdGlvbkxhYmVsQ2xpY2s7XG5cblx0XHRpZiAoaGFuZGxlcikge1xuXHRcdFx0aGFuZGxlcih2YWx1ZSwgZXZlbnQpO1xuXHRcdH1cblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzZWxlY3RDbGFzcyA9IGNsYXNzZXMoJ1NlbGVjdCcsIHRoaXMucHJvcHMuY2xhc3NOYW1lLCB7XG5cdFx0XHQnaXMtbXVsdGknOiB0aGlzLnByb3BzLm11bHRpLFxuXHRcdFx0J2lzLXNlYXJjaGFibGUnOiB0aGlzLnByb3BzLnNlYXJjaGFibGUsXG5cdFx0XHQnaXMtb3Blbic6IHRoaXMuc3RhdGUuaXNPcGVuLFxuXHRcdFx0J2lzLWZvY3VzZWQnOiB0aGlzLnN0YXRlLmlzRm9jdXNlZCxcblx0XHRcdCdpcy1sb2FkaW5nJzogdGhpcy5zdGF0ZS5pc0xvYWRpbmcsXG5cdFx0XHQnaXMtZGlzYWJsZWQnOiB0aGlzLnByb3BzLmRpc2FibGVkLFxuXHRcdFx0J2hhcy12YWx1ZSc6IHRoaXMuc3RhdGUudmFsdWVcblx0XHR9KTtcblxuXHRcdHZhciB2YWx1ZSA9IFtdO1xuXG5cdFx0aWYgKHRoaXMucHJvcHMubXVsdGkpIHtcblx0XHRcdHRoaXMuc3RhdGUudmFsdWVzLmZvckVhY2goZnVuY3Rpb24odmFsKSB7XG5cdFx0XHRcdHZhciBwcm9wcyA9IF8uZXh0ZW5kKHtcblx0XHRcdFx0XHRrZXk6IHZhbC52YWx1ZSxcblx0XHRcdFx0XHRvcHRpb25MYWJlbENsaWNrOiAhIXRoaXMucHJvcHMub25PcHRpb25MYWJlbENsaWNrLFxuXHRcdFx0XHRcdG9uT3B0aW9uTGFiZWxDbGljazogdGhpcy5oYW5kbGVPcHRpb25MYWJlbENsaWNrLmJpbmQodGhpcywgdmFsKSxcblx0XHRcdFx0XHRvblJlbW92ZTogdGhpcy5yZW1vdmVWYWx1ZS5iaW5kKHRoaXMsIHZhbClcblx0XHRcdFx0fSwgdmFsKTtcblx0XHRcdFx0dmFsdWUucHVzaCg8VmFsdWUgey4uLnByb3BzfSAvPik7XG5cdFx0XHR9LCB0aGlzKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5wcm9wcy5kaXNhYmxlZCB8fCAoIXRoaXMuc3RhdGUuaW5wdXRWYWx1ZSAmJiAoIXRoaXMucHJvcHMubXVsdGkgfHwgIXZhbHVlLmxlbmd0aCkpKSB7XG5cdFx0XHR2YWx1ZS5wdXNoKDxkaXYgY2xhc3NOYW1lPVwiU2VsZWN0LXBsYWNlaG9sZGVyXCIga2V5PVwicGxhY2Vob2xkZXJcIj57dGhpcy5zdGF0ZS5wbGFjZWhvbGRlcn08L2Rpdj4pO1xuXHRcdH1cblxuXHRcdHZhciBsb2FkaW5nID0gdGhpcy5zdGF0ZS5pc0xvYWRpbmcgPyA8c3BhbiBjbGFzc05hbWU9XCJTZWxlY3QtbG9hZGluZ1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+IDogbnVsbDtcblx0XHR2YXIgY2xlYXIgPSB0aGlzLnByb3BzLmNsZWFyYWJsZSAmJiB0aGlzLnN0YXRlLnZhbHVlICYmICF0aGlzLnByb3BzLmRpc2FibGVkID8gPHNwYW4gY2xhc3NOYW1lPVwiU2VsZWN0LWNsZWFyXCIgdGl0bGU9e3RoaXMucHJvcHMubXVsdGkgPyB0aGlzLnByb3BzLmNsZWFyQWxsVGV4dCA6IHRoaXMucHJvcHMuY2xlYXJWYWx1ZVRleHR9IGFyaWEtbGFiZWw9e3RoaXMucHJvcHMubXVsdGkgPyB0aGlzLnByb3BzLmNsZWFyQWxsVGV4dCA6IHRoaXMucHJvcHMuY2xlYXJWYWx1ZVRleHR9IG9uTW91c2VEb3duPXt0aGlzLmNsZWFyVmFsdWV9IG9uQ2xpY2s9e3RoaXMuY2xlYXJWYWx1ZX0gZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3sgX19odG1sOiAnJnRpbWVzOycgfX0gLz4gOiBudWxsO1xuXG5cdFx0dmFyIG1lbnU7XG5cdFx0dmFyIG1lbnVQcm9wcztcblx0XHRpZiAodGhpcy5zdGF0ZS5pc09wZW4pIHtcblx0XHRcdG1lbnVQcm9wcyA9IHtcblx0XHRcdFx0cmVmOiAnbWVudScsXG5cdFx0XHRcdGNsYXNzTmFtZTogJ1NlbGVjdC1tZW51J1xuXHRcdFx0fTtcblx0XHRcdGlmICh0aGlzLnByb3BzLm11bHRpKSB7XG5cdFx0XHRcdG1lbnVQcm9wcy5vbk1vdXNlRG93biA9IHRoaXMuaGFuZGxlTW91c2VEb3duO1xuXHRcdFx0fVxuXHRcdFx0bWVudSA9IChcblx0XHRcdFx0PGRpdiByZWY9XCJzZWxlY3RNZW51Q29udGFpbmVyXCIgY2xhc3NOYW1lPVwiU2VsZWN0LW1lbnUtb3V0ZXJcIj5cblx0XHRcdFx0XHQ8ZGl2IHsuLi5tZW51UHJvcHN9Pnt0aGlzLmJ1aWxkTWVudSgpfTwvZGl2PlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0dmFyIGlucHV0O1xuXHRcdHZhciBpbnB1dFByb3BzID0gXy5leHRlbmQoe1xuXHRcdFx0cmVmOiAnaW5wdXQnLFxuXHRcdFx0Y2xhc3NOYW1lOiAnU2VsZWN0LWlucHV0Jyxcblx0XHRcdHRhYkluZGV4OiB0aGlzLnByb3BzLnRhYkluZGV4IHx8IDAsXG5cdFx0XHRvbkZvY3VzOiB0aGlzLmhhbmRsZUlucHV0Rm9jdXMsXG5cdFx0XHRvbkJsdXI6IHRoaXMuaGFuZGxlSW5wdXRCbHVyXG5cdFx0fSwgdGhpcy5wcm9wcy5pbnB1dFByb3BzKTtcblxuXHRcdGlmICh0aGlzLnByb3BzLnNlYXJjaGFibGUgJiYgIXRoaXMucHJvcHMuZGlzYWJsZWQpIHtcblx0XHRcdGlucHV0ID0gPElucHV0IHZhbHVlPXt0aGlzLnN0YXRlLmlucHV0VmFsdWV9IG9uQ2hhbmdlPXt0aGlzLmhhbmRsZUlucHV0Q2hhbmdlfSBtaW5XaWR0aD1cIjVcIiB7Li4uaW5wdXRQcm9wc30gLz47XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlucHV0ID0gPGRpdiB7Li4uaW5wdXRQcm9wc30+Jm5ic3A7PC9kaXY+O1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IHJlZj1cIndyYXBwZXJcIiBjbGFzc05hbWU9e3NlbGVjdENsYXNzfT5cblx0XHRcdFx0PGlucHV0IHR5cGU9XCJoaWRkZW5cIiByZWY9XCJ2YWx1ZVwiIG5hbWU9e3RoaXMucHJvcHMubmFtZX0gdmFsdWU9e3RoaXMuc3RhdGUudmFsdWV9IGRpc2FibGVkPXt0aGlzLnByb3BzLmRpc2FibGVkfSAvPlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cIlNlbGVjdC1jb250cm9sXCIgcmVmPVwiY29udHJvbFwiIG9uS2V5RG93bj17dGhpcy5oYW5kbGVLZXlEb3dufSBvbk1vdXNlRG93bj17dGhpcy5oYW5kbGVNb3VzZURvd259IG9uVG91Y2hFbmQ9e3RoaXMuaGFuZGxlTW91c2VEb3dufT5cblx0XHRcdFx0XHR7dmFsdWV9XG5cdFx0XHRcdFx0e2lucHV0fVxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cIlNlbGVjdC1hcnJvd1wiIC8+XG5cdFx0XHRcdFx0e2xvYWRpbmd9XG5cdFx0XHRcdFx0e2NsZWFyfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0e21lbnV9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNlbGVjdDtcbiJdfQ==
