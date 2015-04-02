require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
Note: ESLint is currently misreporting unused / undeclared variables for JSX.
These errors can be ignored until the bug has been fixed.
 */

"use strict";

var React = require("react"),
    Select = require("react-select");

var STATES = require("./data/states");

function logChange(value) {
	console.log("Select value changed: " + value);
}

var CountrySelect = React.createClass({
	displayName: "CountrySelect",

	onClick: function onClick() {
		this.props.onSelect(this.props.value);
	},
	render: function render() {
		var className = this.props.value === this.props.selected ? "active" : "link";
		return React.createElement(
			"span",
			{ onClick: this.onClick, className: className },
			this.props.children
		);
	}
});

var StatesField = React.createClass({
	displayName: "StatesField",

	getDefaultProps: function getDefaultProps() {
		return {
			searchable: true,
			label: "States:"
		};
	},
	getInitialState: function getInitialState() {
		return {
			country: "AU",
			selectValue: "new-south-wales"
		};
	},
	switchCountry: function switchCountry(newCountry) {
		console.log("Country changed to " + newCountry);
		this.setState({
			country: newCountry,
			selectValue: null
		});
	},
	updateValue: function updateValue(newValue) {
		logChange("State changed to " + newValue);
		this.setState({
			selectValue: newValue || null
		});
	},
	render: function render() {
		var ops = STATES[this.state.country];
		return React.createElement(
			"div",
			null,
			React.createElement(
				"label",
				null,
				this.props.label
			),
			React.createElement(Select, { options: ops, value: this.state.selectValue, onChange: this.updateValue, searchable: this.props.searchable }),
			React.createElement(
				"div",
				{ className: "switcher" },
				"Country:",
				React.createElement(
					CountrySelect,
					{ value: "AU", selected: this.state.country, onSelect: this.switchCountry },
					"Australia"
				),
				React.createElement(
					CountrySelect,
					{ value: "US", selected: this.state.country, onSelect: this.switchCountry },
					"US"
				)
			)
		);
	}
});

var RemoteSelectField = React.createClass({
	displayName: "RemoteSelectField",

	loadOptions: function loadOptions(input, callback) {
		input = input.toLowerCase();

		var rtn = {
			options: [{ label: "One", value: "one" }, { label: "Two", value: "two" }, { label: "Three", value: "three" }],
			complete: true
		};

		if (input.slice(0, 1) === "a") {
			if (input.slice(0, 2) === "ab") {
				rtn = {
					options: [{ label: "AB", value: "ab" }, { label: "ABC", value: "abc" }, { label: "ABCD", value: "abcd" }],
					complete: true
				};
			} else {
				rtn = {
					options: [{ label: "A", value: "a" }, { label: "AA", value: "aa" }, { label: "AB", value: "ab" }],
					complete: false
				};
			}
		} else if (!input.length) {
			rtn.complete = false;
		}

		setTimeout(function () {
			callback(null, rtn);
		}, 500);
	},
	render: function render() {
		return React.createElement(
			"div",
			null,
			React.createElement(
				"label",
				null,
				this.props.label
			),
			React.createElement(Select, { asyncOptions: this.loadOptions, className: "remote-example", tagging: true })
		);
	}
});

var MultiSelectField = React.createClass({
	displayName: "MultiSelectField",

	render: function render() {
		var ops = [{ label: "chocolate", value: "chocolate" }, { label: "vanilla", value: "vanilla" }, { label: "strawberry", value: "strawberry" }, { label: "caramel", value: "caramel" }, { label: "cookiescream", value: "cookiescream" }, { label: "peppermint", value: "peppermint" }];
		return React.createElement(
			"div",
			null,
			React.createElement(
				"label",
				null,
				this.props.label
			),
			React.createElement(Select, { multi: true, placeholder: "Select your favourite(s)", options: ops, onChange: logChange, tagging: true })
		);
	}
});

var SelectedValuesField = React.createClass({
	displayName: "SelectedValuesField",

	onLabelClick: function onLabelClick(data, event) {
		console.log(data);
	},

	render: function render() {
		var ops = [{ label: "Chocolate", value: "chocolate" }, { label: "Vanilla", value: "vanilla" }, { label: "Strawberry", value: "strawberry" }, { label: "Caramel", value: "caramel" }, { label: "Cookies and Cream", value: "cookiescream" }, { label: "Peppermint", value: "peppermint" }];
		return React.createElement(
			"div",
			null,
			React.createElement(
				"label",
				null,
				this.props.label
			),
			React.createElement(Select, {
				onOptionLabelClick: this.onLabelClick,
				value: "chocolate,vanilla,strawberry",
				multi: true,
				placeholder: "Select your favourite(s)",
				options: ops,
				onChange: logChange })
		);
	}
});

React.render(React.createElement(
	"div",
	null,
	React.createElement(StatesField, null),
	React.createElement(StatesField, { label: "States (non-searchable):", searchable: false }),
	React.createElement(MultiSelectField, { label: "Multiselect (tagging):" }),
	React.createElement(SelectedValuesField, { label: "Clickable labels (labels as links):" }),
	React.createElement(RemoteSelectField, { label: "Remote Options (tagging):" })
), document.getElementById("example"));

},{"./data/states":2,"react":undefined,"react-select":undefined}],2:[function(require,module,exports){
"use strict";

exports.AU = [{ value: "australian-capital-territory", label: "Australian Capital Territory" }, { value: "new-south-wales", label: "New South Wales" }, { value: "victoria", label: "Victoria" }, { value: "queensland", label: "Queensland" }, { value: "western-australia", label: "Western Australia" }, { value: "south-australia", label: "South Australia" }, { value: "tasmania", label: "Tasmania" }, { value: "northern-territory", label: "Northern Territory" }];

exports.US = [{ value: "AL", label: "Alabama" }, { value: "AK", label: "Alaska" }, { value: "AS", label: "American Samoa" }, { value: "AZ", label: "Arizona" }, { value: "AR", label: "Arkansas" }, { value: "CA", label: "California" }, { value: "CO", label: "Colorado" }, { value: "CT", label: "Connecticut" }, { value: "DE", label: "Delaware" }, { value: "DC", label: "District Of Columbia" }, { value: "FM", label: "Federated States Of Micronesia" }, { value: "FL", label: "Florida" }, { value: "GA", label: "Georgia" }, { value: "GU", label: "Guam" }, { value: "HI", label: "Hawaii" }, { value: "ID", label: "Idaho" }, { value: "IL", label: "Illinois" }, { value: "IN", label: "Indiana" }, { value: "IA", label: "Iowa" }, { value: "KS", label: "Kansas" }, { value: "KY", label: "Kentucky" }, { value: "LA", label: "Louisiana" }, { value: "ME", label: "Maine" }, { value: "MH", label: "Marshall Islands" }, { value: "MD", label: "Maryland" }, { value: "MA", label: "Massachusetts" }, { value: "MI", label: "Michigan" }, { value: "MN", label: "Minnesota" }, { value: "MS", label: "Mississippi" }, { value: "MO", label: "Missouri" }, { value: "MT", label: "Montana" }, { value: "NE", label: "Nebraska" }, { value: "NV", label: "Nevada" }, { value: "NH", label: "New Hampshire" }, { value: "NJ", label: "New Jersey" }, { value: "NM", label: "New Mexico" }, { value: "NY", label: "New York" }, { value: "NC", label: "North Carolina" }, { value: "ND", label: "North Dakota" }, { value: "MP", label: "Northern Mariana Islands" }, { value: "OH", label: "Ohio" }, { value: "OK", label: "Oklahoma" }, { value: "OR", label: "Oregon" }, { value: "PW", label: "Palau" }, { value: "PA", label: "Pennsylvania" }, { value: "PR", label: "Puerto Rico" }, { value: "RI", label: "Rhode Island" }, { value: "SC", label: "South Carolina" }, { value: "SD", label: "South Dakota" }, { value: "TN", label: "Tennessee" }, { value: "TX", label: "Texas" }, { value: "UT", label: "Utah" }, { value: "VT", label: "Vermont" }, { value: "VI", label: "Virgin Islands" }, { value: "VA", label: "Virginia" }, { value: "WA", label: "Washington" }, { value: "WV", label: "West Virginia" }, { value: "WI", label: "Wisconsin" }, { value: "WY", label: "Wyoming" }];

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9yZWFjdC1jb21wb25lbnQtZ3VscC10YXNrcy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2FzZWxsZXJvL1dvcmtzcGFjZS9ucG0tbW9kdWxlcy9yZWFjdC1zZWxlY3QvZXhhbXBsZXMvc3JjL2FwcC5qcyIsIi9Vc2Vycy9hc2VsbGVyby9Xb3Jrc3BhY2UvbnBtLW1vZHVsZXMvcmVhY3Qtc2VsZWN0L2V4YW1wbGVzL3NyYy9kYXRhL3N0YXRlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7QUNLQSxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO0lBQzNCLE1BQU0sR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7O0FBRWxDLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQzs7QUFFdEMsU0FBUyxTQUFTLENBQUMsS0FBSyxFQUFFO0FBQ3pCLFFBQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEdBQUcsS0FBSyxDQUFDLENBQUM7Q0FDOUM7O0FBRUQsSUFBSSxhQUFhLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7O0FBQ3JDLFFBQU8sRUFBRSxtQkFBVztBQUNuQixNQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0VBQ3RDO0FBQ0QsT0FBTSxFQUFFLGtCQUFXO0FBQ2xCLE1BQUksU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFFBQVEsR0FBRyxNQUFNLENBQUM7QUFDN0UsU0FBTzs7S0FBTSxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQUFBQyxFQUFDLFNBQVMsRUFBRSxTQUFTLEFBQUM7R0FBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFB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RUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsRUFDOUIsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsRUFDaEMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFDL0IsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsRUFDbEMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsRUFDakMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsRUFDOUIsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsRUFDaEMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsRUFDbEMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsRUFDbkMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFDL0IsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxrQkFBa0IsRUFBRSxFQUMxQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxFQUNsQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLGVBQWUsRUFBRSxFQUN2QyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxFQUNsQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxFQUNuQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxFQUNyQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxFQUNsQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxFQUNqQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxFQUNsQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxFQUNoQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLGVBQWUsRUFBRSxFQUN2QyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxFQUNwQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxFQUNwQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxFQUNsQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixFQUFFLEVBQ3hDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFFLEVBQ3RDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsMEJBQTBCLEVBQUUsRUFDbEQsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsRUFDOUIsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsRUFDbEMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsRUFDaEMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFDL0IsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsRUFDdEMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsRUFDckMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsRUFDdEMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxnQkFBZ0IsRUFBRSxFQUN4QyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLGNBQWMsRUFBRSxFQUN0QyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxFQUNuQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUMvQixFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxFQUM5QixFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxFQUNqQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixFQUFFLEVBQ3hDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLEVBQ2xDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLEVBQ3BDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsZUFBZSxFQUFFLEVBQ3ZDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEVBQ25DLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQ3BDLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcbk5vdGU6IEVTTGludCBpcyBjdXJyZW50bHkgbWlzcmVwb3J0aW5nIHVudXNlZCAvIHVuZGVjbGFyZWQgdmFyaWFibGVzIGZvciBKU1guXG5UaGVzZSBlcnJvcnMgY2FuIGJlIGlnbm9yZWQgdW50aWwgdGhlIGJ1ZyBoYXMgYmVlbiBmaXhlZC5cbiAqL1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpLFxuXHRTZWxlY3QgPSByZXF1aXJlKCdyZWFjdC1zZWxlY3QnKTtcblxudmFyIFNUQVRFUyA9IHJlcXVpcmUoJy4vZGF0YS9zdGF0ZXMnKTtcblxuZnVuY3Rpb24gbG9nQ2hhbmdlKHZhbHVlKSB7XG5cdGNvbnNvbGUubG9nKCdTZWxlY3QgdmFsdWUgY2hhbmdlZDogJyArIHZhbHVlKTtcbn1cblxudmFyIENvdW50cnlTZWxlY3QgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdG9uQ2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMucHJvcHMub25TZWxlY3QodGhpcy5wcm9wcy52YWx1ZSk7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGNsYXNzTmFtZSA9IHRoaXMucHJvcHMudmFsdWUgPT09IHRoaXMucHJvcHMuc2VsZWN0ZWQgPyAnYWN0aXZlJyA6ICdsaW5rJztcblx0XHRyZXR1cm4gPHNwYW4gb25DbGljaz17dGhpcy5vbkNsaWNrfSBjbGFzc05hbWU9e2NsYXNzTmFtZX0+e3RoaXMucHJvcHMuY2hpbGRyZW59PC9zcGFuPjtcblx0fVxufSk7XG5cbnZhciBTdGF0ZXNGaWVsZCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0Z2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNlYXJjaGFibGU6IHRydWUsXG5cdFx0XHRsYWJlbDogJ1N0YXRlczonXG5cdFx0fTtcblx0fSxcblx0Z2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0Y291bnRyeTogJ0FVJyxcblx0XHRcdHNlbGVjdFZhbHVlOiAnbmV3LXNvdXRoLXdhbGVzJ1xuXHRcdH07XG5cdH0sXG5cdHN3aXRjaENvdW50cnk6IGZ1bmN0aW9uKG5ld0NvdW50cnkpIHtcblx0XHRjb25zb2xlLmxvZygnQ291bnRyeSBjaGFuZ2VkIHRvICcgKyBuZXdDb3VudHJ5KTtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdGNvdW50cnk6IG5ld0NvdW50cnksXG5cdFx0XHRzZWxlY3RWYWx1ZTogbnVsbFxuXHRcdH0pO1xuXHR9LFxuXHR1cGRhdGVWYWx1ZTogZnVuY3Rpb24obmV3VmFsdWUpIHtcblx0XHRsb2dDaGFuZ2UoJ1N0YXRlIGNoYW5nZWQgdG8gJyArIG5ld1ZhbHVlKTtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdHNlbGVjdFZhbHVlOiBuZXdWYWx1ZSB8fCBudWxsXG5cdFx0fSk7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG9wcyA9IFNUQVRFU1t0aGlzLnN0YXRlLmNvdW50cnldO1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2PlxuXHRcdFx0XHQ8bGFiZWw+e3RoaXMucHJvcHMubGFiZWx9PC9sYWJlbD5cblx0XHRcdFx0PFNlbGVjdCBvcHRpb25zPXtvcHN9IHZhbHVlPXt0aGlzLnN0YXRlLnNlbGVjdFZhbHVlfSBvbkNoYW5nZT17dGhpcy51cGRhdGVWYWx1ZX0gc2VhcmNoYWJsZT17dGhpcy5wcm9wcy5zZWFyY2hhYmxlfSAvPlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInN3aXRjaGVyXCI+XG5cdFx0XHRcdFx0Q291bnRyeTpcblx0XHRcdFx0XHQ8Q291bnRyeVNlbGVjdCB2YWx1ZT1cIkFVXCIgc2VsZWN0ZWQ9e3RoaXMuc3RhdGUuY291bnRyeX0gb25TZWxlY3Q9e3RoaXMuc3dpdGNoQ291bnRyeX0+QXVzdHJhbGlhPC9Db3VudHJ5U2VsZWN0PlxuXHRcdFx0XHRcdDxDb3VudHJ5U2VsZWN0IHZhbHVlPVwiVVNcIiBzZWxlY3RlZD17dGhpcy5zdGF0ZS5jb3VudHJ5fSBvblNlbGVjdD17dGhpcy5zd2l0Y2hDb3VudHJ5fT5VUzwvQ291bnRyeVNlbGVjdD5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59KTtcblxudmFyIFJlbW90ZVNlbGVjdEZpZWxkID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRsb2FkT3B0aW9uczogZnVuY3Rpb24oaW5wdXQsIGNhbGxiYWNrKSB7XG5cdFx0aW5wdXQgPSBpbnB1dC50b0xvd2VyQ2FzZSgpO1xuXG5cdFx0dmFyIHJ0biA9IHtcblx0XHRcdG9wdGlvbnM6IFtcblx0XHRcdFx0eyBsYWJlbDogJ09uZScsIHZhbHVlOiAnb25lJyB9LFxuXHRcdFx0XHR7IGxhYmVsOiAnVHdvJywgdmFsdWU6ICd0d28nIH0sXG5cdFx0XHRcdHsgbGFiZWw6ICdUaHJlZScsIHZhbHVlOiAndGhyZWUnIH1cblx0XHRcdF0sXG5cdFx0XHRjb21wbGV0ZTogdHJ1ZVxuXHRcdH07XG5cblx0XHRpZiAoaW5wdXQuc2xpY2UoMCwgMSkgPT09ICdhJykge1xuXHRcdFx0aWYgKGlucHV0LnNsaWNlKDAsIDIpID09PSAnYWInKSB7XG5cdFx0XHRcdHJ0biA9IHtcblx0XHRcdFx0XHRvcHRpb25zOiBbXG5cdFx0XHRcdFx0XHR7IGxhYmVsOiAnQUInLCB2YWx1ZTogJ2FiJyB9LFxuXHRcdFx0XHRcdFx0eyBsYWJlbDogJ0FCQycsIHZhbHVlOiAnYWJjJyB9LFxuXHRcdFx0XHRcdFx0eyBsYWJlbDogJ0FCQ0QnLCB2YWx1ZTogJ2FiY2QnIH1cblx0XHRcdFx0XHRdLFxuXHRcdFx0XHRcdGNvbXBsZXRlOiB0cnVlXG5cdFx0XHRcdH07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRydG4gPSB7XG5cdFx0XHRcdFx0b3B0aW9uczogW1xuXHRcdFx0XHRcdFx0eyBsYWJlbDogJ0EnLCB2YWx1ZTogJ2EnIH0sXG5cdFx0XHRcdFx0XHR7IGxhYmVsOiAnQUEnLCB2YWx1ZTogJ2FhJyB9LFxuXHRcdFx0XHRcdFx0eyBsYWJlbDogJ0FCJywgdmFsdWU6ICdhYicgfVxuXHRcdFx0XHRcdF0sXG5cdFx0XHRcdFx0Y29tcGxldGU6IGZhbHNlXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICghaW5wdXQubGVuZ3RoKSB7XG5cdFx0XHRydG4uY29tcGxldGUgPSBmYWxzZTtcblx0XHR9XG5cblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0Y2FsbGJhY2sobnVsbCwgcnRuKTtcblx0XHR9LCA1MDApO1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2PlxuXHRcdFx0XHQ8bGFiZWw+e3RoaXMucHJvcHMubGFiZWx9PC9sYWJlbD5cblx0XHRcdFx0PFNlbGVjdCBhc3luY09wdGlvbnM9e3RoaXMubG9hZE9wdGlvbnN9IGNsYXNzTmFtZT1cInJlbW90ZS1leGFtcGxlXCIgdGFnZ2luZz17dHJ1ZX0gLz5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn0pO1xuXG5cbnZhciBNdWx0aVNlbGVjdEZpZWxkID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBvcHMgPSBbXG5cdFx0XHR7IGxhYmVsOiAnY2hvY29sYXRlJywgdmFsdWU6ICdjaG9jb2xhdGUnIH0sXG5cdFx0XHR7IGxhYmVsOiAndmFuaWxsYScsIHZhbHVlOiAndmFuaWxsYScgfSxcblx0XHRcdHsgbGFiZWw6ICdzdHJhd2JlcnJ5JywgdmFsdWU6ICdzdHJhd2JlcnJ5JyB9LFxuXHRcdFx0eyBsYWJlbDogJ2NhcmFtZWwnLCB2YWx1ZTogJ2NhcmFtZWwnIH0sXG5cdFx0XHR7IGxhYmVsOiAnY29va2llc2NyZWFtJywgdmFsdWU6ICdjb29raWVzY3JlYW0nIH0sXG5cdFx0XHR7IGxhYmVsOiAncGVwcGVybWludCcsIHZhbHVlOiAncGVwcGVybWludCcgfVxuXHRcdF07XG5cdFx0cmV0dXJuIDxkaXY+XG5cdFx0XHQ8bGFiZWw+e3RoaXMucHJvcHMubGFiZWx9PC9sYWJlbD5cblx0XHRcdDxTZWxlY3QgbXVsdGk9e3RydWV9IHBsYWNlaG9sZGVyPVwiU2VsZWN0IHlvdXIgZmF2b3VyaXRlKHMpXCIgb3B0aW9ucz17b3BzfSBvbkNoYW5nZT17bG9nQ2hhbmdlfSB0YWdnaW5nPXt0cnVlfSAvPlxuXHRcdDwvZGl2Pjtcblx0fVxufSk7XG5cbnZhciBTZWxlY3RlZFZhbHVlc0ZpZWxkID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG5cdG9uTGFiZWxDbGljazogZnVuY3Rpb24gKGRhdGEsIGV2ZW50KSB7XG5cdFx0Y29uc29sZS5sb2coZGF0YSk7XG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgb3BzID0gW1xuXHRcdFx0eyBsYWJlbDogJ0Nob2NvbGF0ZScsIHZhbHVlOiAnY2hvY29sYXRlJyB9LFxuXHRcdFx0eyBsYWJlbDogJ1ZhbmlsbGEnLCB2YWx1ZTogJ3ZhbmlsbGEnIH0sXG5cdFx0XHR7IGxhYmVsOiAnU3RyYXdiZXJyeScsIHZhbHVlOiAnc3RyYXdiZXJyeScgfSxcblx0XHRcdHsgbGFiZWw6ICdDYXJhbWVsJywgdmFsdWU6ICdjYXJhbWVsJyB9LFxuXHRcdFx0eyBsYWJlbDogJ0Nvb2tpZXMgYW5kIENyZWFtJywgdmFsdWU6ICdjb29raWVzY3JlYW0nIH0sXG5cdFx0XHR7IGxhYmVsOiAnUGVwcGVybWludCcsIHZhbHVlOiAncGVwcGVybWludCcgfVxuXHRcdF07XG5cdFx0cmV0dXJuIDxkaXY+XG5cdFx0XHQ8bGFiZWw+e3RoaXMucHJvcHMubGFiZWx9PC9sYWJlbD5cblx0XHRcdDxTZWxlY3Rcblx0XHRcdFx0b25PcHRpb25MYWJlbENsaWNrPXt0aGlzLm9uTGFiZWxDbGlja31cblx0XHRcdFx0dmFsdWU9XCJjaG9jb2xhdGUsdmFuaWxsYSxzdHJhd2JlcnJ5XCJcblx0XHRcdFx0bXVsdGk9e3RydWV9XG5cdFx0XHRcdHBsYWNlaG9sZGVyPVwiU2VsZWN0IHlvdXIgZmF2b3VyaXRlKHMpXCJcblx0XHRcdFx0b3B0aW9ucz17b3BzfVxuXHRcdFx0XHRvbkNoYW5nZT17bG9nQ2hhbmdlfSAvPlxuXHRcdDwvZGl2Pjtcblx0fVxufSk7XG5cblxuUmVhY3QucmVuZGVyKFxuXHQ8ZGl2PlxuXHRcdDxTdGF0ZXNGaWVsZCAvPlxuXHRcdDxTdGF0ZXNGaWVsZCBsYWJlbD1cIlN0YXRlcyAobm9uLXNlYXJjaGFibGUpOlwiIHNlYXJjaGFibGU9e2ZhbHNlfSAvPlxuXHRcdDxNdWx0aVNlbGVjdEZpZWxkIGxhYmVsPVwiTXVsdGlzZWxlY3QgKHRhZ2dpbmcpOlwiLz5cblx0XHQ8U2VsZWN0ZWRWYWx1ZXNGaWVsZCBsYWJlbD1cIkNsaWNrYWJsZSBsYWJlbHMgKGxhYmVscyBhcyBsaW5rcyk6XCIgLz5cblx0XHQ8UmVtb3RlU2VsZWN0RmllbGQgbGFiZWw9XCJSZW1vdGUgT3B0aW9ucyAodGFnZ2luZyk6XCIvPlxuXHQ8L2Rpdj4sXG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdleGFtcGxlJylcbik7XG4iLCJleHBvcnRzLkFVID0gW1xuXHR7IHZhbHVlOiAnYXVzdHJhbGlhbi1jYXBpdGFsLXRlcnJpdG9yeScsIGxhYmVsOiAnQXVzdHJhbGlhbiBDYXBpdGFsIFRlcnJpdG9yeScgfSxcblx0eyB2YWx1ZTogJ25ldy1zb3V0aC13YWxlcycsIGxhYmVsOiAnTmV3IFNvdXRoIFdhbGVzJyB9LFxuXHR7IHZhbHVlOiAndmljdG9yaWEnLCBsYWJlbDogJ1ZpY3RvcmlhJyB9LFxuXHR7IHZhbHVlOiAncXVlZW5zbGFuZCcsIGxhYmVsOiAnUXVlZW5zbGFuZCcgfSxcblx0eyB2YWx1ZTogJ3dlc3Rlcm4tYXVzdHJhbGlhJywgbGFiZWw6ICdXZXN0ZXJuIEF1c3RyYWxpYScgfSxcblx0eyB2YWx1ZTogJ3NvdXRoLWF1c3RyYWxpYScsIGxhYmVsOiAnU291dGggQXVzdHJhbGlhJyB9LFxuXHR7IHZhbHVlOiAndGFzbWFuaWEnLCBsYWJlbDogJ1Rhc21hbmlhJyB9LFxuXHR7IHZhbHVlOiAnbm9ydGhlcm4tdGVycml0b3J5JywgbGFiZWw6ICdOb3J0aGVybiBUZXJyaXRvcnknIH1cbl07XG5cbmV4cG9ydHMuVVMgPSBbXG4gICAgeyB2YWx1ZTogJ0FMJywgbGFiZWw6ICdBbGFiYW1hJyB9LFxuICAgIHsgdmFsdWU6ICdBSycsIGxhYmVsOiAnQWxhc2thJyB9LFxuICAgIHsgdmFsdWU6ICdBUycsIGxhYmVsOiAnQW1lcmljYW4gU2Ftb2EnIH0sXG4gICAgeyB2YWx1ZTogJ0FaJywgbGFiZWw6ICdBcml6b25hJyB9LFxuICAgIHsgdmFsdWU6ICdBUicsIGxhYmVsOiAnQXJrYW5zYXMnIH0sXG4gICAgeyB2YWx1ZTogJ0NBJywgbGFiZWw6ICdDYWxpZm9ybmlhJyB9LFxuICAgIHsgdmFsdWU6ICdDTycsIGxhYmVsOiAnQ29sb3JhZG8nIH0sXG4gICAgeyB2YWx1ZTogJ0NUJywgbGFiZWw6ICdDb25uZWN0aWN1dCcgfSxcbiAgICB7IHZhbHVlOiAnREUnLCBsYWJlbDogJ0RlbGF3YXJlJyB9LFxuICAgIHsgdmFsdWU6ICdEQycsIGxhYmVsOiAnRGlzdHJpY3QgT2YgQ29sdW1iaWEnIH0sXG4gICAgeyB2YWx1ZTogJ0ZNJywgbGFiZWw6ICdGZWRlcmF0ZWQgU3RhdGVzIE9mIE1pY3JvbmVzaWEnIH0sXG4gICAgeyB2YWx1ZTogJ0ZMJywgbGFiZWw6ICdGbG9yaWRhJyB9LFxuICAgIHsgdmFsdWU6ICdHQScsIGxhYmVsOiAnR2VvcmdpYScgfSxcbiAgICB7IHZhbHVlOiAnR1UnLCBsYWJlbDogJ0d1YW0nIH0sXG4gICAgeyB2YWx1ZTogJ0hJJywgbGFiZWw6ICdIYXdhaWknIH0sXG4gICAgeyB2YWx1ZTogJ0lEJywgbGFiZWw6ICdJZGFobycgfSxcbiAgICB7IHZhbHVlOiAnSUwnLCBsYWJlbDogJ0lsbGlub2lzJyB9LFxuICAgIHsgdmFsdWU6ICdJTicsIGxhYmVsOiAnSW5kaWFuYScgfSxcbiAgICB7IHZhbHVlOiAnSUEnLCBsYWJlbDogJ0lvd2EnIH0sXG4gICAgeyB2YWx1ZTogJ0tTJywgbGFiZWw6ICdLYW5zYXMnIH0sXG4gICAgeyB2YWx1ZTogJ0tZJywgbGFiZWw6ICdLZW50dWNreScgfSxcbiAgICB7IHZhbHVlOiAnTEEnLCBsYWJlbDogJ0xvdWlzaWFuYScgfSxcbiAgICB7IHZhbHVlOiAnTUUnLCBsYWJlbDogJ01haW5lJyB9LFxuICAgIHsgdmFsdWU6ICdNSCcsIGxhYmVsOiAnTWFyc2hhbGwgSXNsYW5kcycgfSxcbiAgICB7IHZhbHVlOiAnTUQnLCBsYWJlbDogJ01hcnlsYW5kJyB9LFxuICAgIHsgdmFsdWU6ICdNQScsIGxhYmVsOiAnTWFzc2FjaHVzZXR0cycgfSxcbiAgICB7IHZhbHVlOiAnTUknLCBsYWJlbDogJ01pY2hpZ2FuJyB9LFxuICAgIHsgdmFsdWU6ICdNTicsIGxhYmVsOiAnTWlubmVzb3RhJyB9LFxuICAgIHsgdmFsdWU6ICdNUycsIGxhYmVsOiAnTWlzc2lzc2lwcGknIH0sXG4gICAgeyB2YWx1ZTogJ01PJywgbGFiZWw6ICdNaXNzb3VyaScgfSxcbiAgICB7IHZhbHVlOiAnTVQnLCBsYWJlbDogJ01vbnRhbmEnIH0sXG4gICAgeyB2YWx1ZTogJ05FJywgbGFiZWw6ICdOZWJyYXNrYScgfSxcbiAgICB7IHZhbHVlOiAnTlYnLCBsYWJlbDogJ05ldmFkYScgfSxcbiAgICB7IHZhbHVlOiAnTkgnLCBsYWJlbDogJ05ldyBIYW1wc2hpcmUnIH0sXG4gICAgeyB2YWx1ZTogJ05KJywgbGFiZWw6ICdOZXcgSmVyc2V5JyB9LFxuICAgIHsgdmFsdWU6ICdOTScsIGxhYmVsOiAnTmV3IE1leGljbycgfSxcbiAgICB7IHZhbHVlOiAnTlknLCBsYWJlbDogJ05ldyBZb3JrJyB9LFxuICAgIHsgdmFsdWU6ICdOQycsIGxhYmVsOiAnTm9ydGggQ2Fyb2xpbmEnIH0sXG4gICAgeyB2YWx1ZTogJ05EJywgbGFiZWw6ICdOb3J0aCBEYWtvdGEnIH0sXG4gICAgeyB2YWx1ZTogJ01QJywgbGFiZWw6ICdOb3J0aGVybiBNYXJpYW5hIElzbGFuZHMnIH0sXG4gICAgeyB2YWx1ZTogJ09IJywgbGFiZWw6ICdPaGlvJyB9LFxuICAgIHsgdmFsdWU6ICdPSycsIGxhYmVsOiAnT2tsYWhvbWEnIH0sXG4gICAgeyB2YWx1ZTogJ09SJywgbGFiZWw6ICdPcmVnb24nIH0sXG4gICAgeyB2YWx1ZTogJ1BXJywgbGFiZWw6ICdQYWxhdScgfSxcbiAgICB7IHZhbHVlOiAnUEEnLCBsYWJlbDogJ1Blbm5zeWx2YW5pYScgfSxcbiAgICB7IHZhbHVlOiAnUFInLCBsYWJlbDogJ1B1ZXJ0byBSaWNvJyB9LFxuICAgIHsgdmFsdWU6ICdSSScsIGxhYmVsOiAnUmhvZGUgSXNsYW5kJyB9LFxuICAgIHsgdmFsdWU6ICdTQycsIGxhYmVsOiAnU291dGggQ2Fyb2xpbmEnIH0sXG4gICAgeyB2YWx1ZTogJ1NEJywgbGFiZWw6ICdTb3V0aCBEYWtvdGEnIH0sXG4gICAgeyB2YWx1ZTogJ1ROJywgbGFiZWw6ICdUZW5uZXNzZWUnIH0sXG4gICAgeyB2YWx1ZTogJ1RYJywgbGFiZWw6ICdUZXhhcycgfSxcbiAgICB7IHZhbHVlOiAnVVQnLCBsYWJlbDogJ1V0YWgnIH0sXG4gICAgeyB2YWx1ZTogJ1ZUJywgbGFiZWw6ICdWZXJtb250JyB9LFxuICAgIHsgdmFsdWU6ICdWSScsIGxhYmVsOiAnVmlyZ2luIElzbGFuZHMnIH0sXG4gICAgeyB2YWx1ZTogJ1ZBJywgbGFiZWw6ICdWaXJnaW5pYScgfSxcbiAgICB7IHZhbHVlOiAnV0EnLCBsYWJlbDogJ1dhc2hpbmd0b24nIH0sXG4gICAgeyB2YWx1ZTogJ1dWJywgbGFiZWw6ICdXZXN0IFZpcmdpbmlhJyB9LFxuICAgIHsgdmFsdWU6ICdXSScsIGxhYmVsOiAnV2lzY29uc2luJyB9LFxuICAgIHsgdmFsdWU6ICdXWScsIGxhYmVsOiAnV3lvbWluZycgfVxuXTtcbiJdfQ==
