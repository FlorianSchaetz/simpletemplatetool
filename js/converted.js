"use strict";

/*
 * A simple class to parse all expressions («...») from a text. Expressions can contain new lines (\n or \r\n)
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ExpressionFinder = function () {
	function ExpressionFinder() {
		_classCallCheck(this, ExpressionFinder);
	}

	_createClass(ExpressionFinder, [{
		key: "getExpressions",
		value: function getExpressions(text) {
			var expressions = text.match(/«(.|\r|\n)+?»/g);
			if (expressions != undefined && expressions != null) {
				return expressions;
			}
			return [];
		}
	}]);

	return ExpressionFinder;
}();
/*
 * This class converts expressions into apropriate Variable objects that represent/handle these expressions
 */


var VariableFactory = function () {
	function VariableFactory() {
		_classCallCheck(this, VariableFactory);

		// the list of variables that are not offered for input but replaced automatically
		this.autoVariables = {};
		this.autoVariables["currentyear"] = function () {
			return '' + new Date().getFullYear();
		};
	}

	/*
  * This method converts an array of expressions into Variable objects; If an expressions is in the list more than once, only one Variable will be created for all of them
  */


	_createClass(VariableFactory, [{
		key: "createVariables",
		value: function createVariables(expressions) {

			// To prevent us from creating more than one variable for a repeated expression
			var knownExpressions = {};

			var variables = [];
			for (var i = 0; i < expressions.length; i++) {

				if (knownExpressions[expressions[i]] != true) {
					knownExpressions[expressions[i]] = true;
					variables.push(this.createVariable(expressions[i]));
				}
			}
			return variables;
		}

		/*
   * This method converts one expression into an appropriate Variable object 
   */

	}, {
		key: "createVariable",
		value: function createVariable(expression) {
			var name = expression.substring(1, expression.length - 1);

			var autoFunction = this.autoVariables[name];

			if (autoFunction != undefined && autoFunction != null) {
				return new AutoVariable(expression, autoFunction());
			} else if (name.startsWith("textarea:")) {
				return new TextareaVariable(expression);
			} else if (name.startsWith("boolean:")) {
				return new BooleanVariable(expression);
			} else {
				return new Variable(expression);
			}
		}
	}]);

	return VariableFactory;
}();

/*
 * A Variable object encapsulates an expression and (optionally) offers an input element to modify the current content
 *
 * This base Variable class offers a simple text input field for modifying the content; If no content was entered, the content is the expression itself
 */


var Variable = function () {
	function Variable(expression) {
		_classCallCheck(this, Variable);

		this.expression = expression;
		this.name = this.expression.substring(1, this.expression.length - 1);
	}

	/*
  * Can be overriden; Return true if this object offers an input elment via createInput() (thus allowing the user to modify the content)
  */


	_createClass(Variable, [{
		key: "isEnterable",
		value: function isEnterable() {
			return true;
		}

		/*
   * if isEnterable returns true, this method should create an input element to modify the content of this variable, otherwise it should return null
   */

	}, {
		key: "createInput",
		value: function createInput() {
			this.input = document.createElement('input');
			this.input.variable = this;
			this.input.oninput = this.onInputInternal;
			return this.input;
		}

		/*
   * Sets the handler method that will be called after something was entered into this variable's input (if it exists)
   */

	}, {
		key: "setOnInput",
		value: function setOnInput(oninput) {
			this.oninput = oninput;
		}

		/*
   * The base variable simply sets this variable's content to the value of the input, calls the oninput callback method and re-focuses its input
   */

	}, {
		key: "onInputInternal",
		value: function onInputInternal() {
			this.variable.content = this.variable.input.value;
			this.variable.oninput();
			this.focus();
		}

		/*
   * The base variable's name is the expression minus the « and » characters at the beginning and end
   */

	}, {
		key: "getName",
		value: function getName() {
			return this.name;
		}

		/*
   * The base variable's content is the value entered into its input field; If the value is null or empty, it's the expression itself
   */

	}, {
		key: "getContent",
		value: function getContent() {
			if (this.content != null && this.content.length > 0) {
				return this.content;
			}
			return '«' + this.getName() + '»';
		}
	}, {
		key: "getSpanClassName",
		value: function getSpanClassName() {
			return null;
		}
	}]);

	return Variable;
}();

/*
 * AutoVariables offer no input field for editing, but have one fixed content that will be used always (for example «currentyear» will automatically be replaced by the current year)
 */


var AutoVariable = function (_Variable) {
	_inherits(AutoVariable, _Variable);

	function AutoVariable(expression, content) {
		_classCallCheck(this, AutoVariable);

		var _this = _possibleConstructorReturn(this, (AutoVariable.__proto__ || Object.getPrototypeOf(AutoVariable)).call(this, expression));

		_this.content = content;
		return _this;
	}

	_createClass(AutoVariable, [{
		key: "isEnterable",
		value: function isEnterable() {
			return false;
		}
	}, {
		key: "createInput",
		value: function createInput() {
			return null;
		}
	}]);

	return AutoVariable;
}(Variable);

/*
 * A variable for entering blocks of text into a textarea instead of a single-line input field; 
 */


var TextareaVariable = function (_Variable2) {
	_inherits(TextareaVariable, _Variable2);

	/*
  * The expression for this has the prefix "textarea:", but this prefix will not be shown as a replacement
  *
  * Example: «textarea:Long Explanation»
  */
	function TextareaVariable(expression) {
		_classCallCheck(this, TextareaVariable);

		var _this2 = _possibleConstructorReturn(this, (TextareaVariable.__proto__ || Object.getPrototypeOf(TextareaVariable)).call(this, expression));

		_this2.name = _this2.expression.substring('«textarea:'.length, _this2.expression.length - 1);
		return _this2;
	}

	_createClass(TextareaVariable, [{
		key: "createInput",
		value: function createInput() {
			this.input = document.createElement('textarea');
			this.input.variable = this;
			this.input.oninput = this.onInputInternal;
			return this.input;
		}
	}]);

	return TextareaVariable;
}(Variable);

/*
 * BooleanVariables offer only a checkbox instead of an input field; If the checkbox is checked, the content will be the content defined in the expression, otherwise the content will be empty, allowing for optional,
 * fixed blocks of text
 *
 * Please note: Currently, BooleanVariables cannot contain expressions themselves, sorry.
 */


var BooleanVariable = function (_Variable3) {
	_inherits(BooleanVariable, _Variable3);

	/*
  * The expression for this has the prefix "boolean:", followed by a name, followed by ":" and the content
  *
  * Example: «boolean:Add Copyright Notice:Copyright 2017 by Some Person»
  */
	function BooleanVariable(expression) {
		_classCallCheck(this, BooleanVariable);

		var _this3 = _possibleConstructorReturn(this, (BooleanVariable.__proto__ || Object.getPrototypeOf(BooleanVariable)).call(this, expression));

		var indexOfName = _this3.expression.indexOf(':');
		var indexOfContent = _this3.expression.indexOf(':', indexOfName + 1);
		_this3.name = _this3.expression.substring(indexOfName + 1, indexOfContent);
		_this3.value = _this3.expression.substring(indexOfContent + 1, _this3.expression.length - 1);
		return _this3;
	}

	_createClass(BooleanVariable, [{
		key: "getContent",
		value: function getContent() {
			if (this.input.checked) {
				return this.content;
			}
			return '';
		}
	}, {
		key: "createInput",
		value: function createInput() {
			this.input = document.createElement('input');
			this.input.type = "checkbox";
			this.input.value = this.value;
			this.input.variable = this;

			// because Edge doesn't like oninput on checkboxes...
			this.input.onchange = this.onInputInternal;

			return this.input;
		}
	}, {
		key: "getSpanClassName",
		value: function getSpanClassName() {
			return "checkbox-span";
		}
	}]);

	return BooleanVariable;
}(Variable);

/*
 * This class handles the creation of variables, manages their input fields and updates the text input given in the constructor
 */


var VariableHandler = function () {
	function VariableHandler(input) {
		_classCallCheck(this, VariableHandler);

		this.variables = [];
		this.input = input;
		this.factory = new VariableFactory();
	}

	/*
  * This method can be called to set another text into the input field; It removes all old Variable inputs, adds new ones, if needed, etc. In short, call this and everything else 
  *  will work automatically
  */


	_createClass(VariableHandler, [{
		key: "setText",
		value: function setText(text) {
			this.input.original = text;

			var expressions = new ExpressionFinder().getExpressions(text);
			this.variables = this.factory.createVariables(expressions);

			var parent = document.getElementById('variables');

			while (parent.hasChildNodes()) {
				var div = parent.lastChild;
				parent.removeChild(div);
			}

			for (var i = 0; i < this.variables.length; i++) {
				if (this.variables[i].isEnterable()) {
					var div = document.createElement('div');
					var span = document.createElement('span');
					span.innerHTML = this.variables[i].getName();

					if (this.variables[i].getSpanClassName() != null) {
						span.className = this.variables[i].getSpanClassName();
					}

					div.appendChild(span);
					div.appendChild(this.variables[i].createInput());
					var me = this;
					this.variables[i].setOnInput(function () {
						me.update();
					});
					parent.appendChild(div);
				}
			}
			this.update();
		}
	}, {
		key: "replaceAll",
		value: function replaceAll(text) {

			var modifiedText = text;

			for (var i = 0; i < this.variables.length; i++) {
				var expression = this.variables[i].expression;
				var content = this.variables[i].getContent();

				modifiedText = modifiedText.split(expression).join(content);
			}

			return modifiedText;
		}
	}, {
		key: "update",
		value: function update() {
			var text = this.input.original;
			this.input.value = this.replaceAll(text);
			this.selectAndCopy();
		}
	}, {
		key: "selectAndCopy",
		value: function selectAndCopy() {
			this.input.select();

			try {
				var successful = document.execCommand('copy');
				if (successful) {
					this.input.selectionStart = -1;
					this.input.selectionEnd = -1;
				}
			} catch (err) {
				console.log('Oops, unable to copy');
			}
		}
	}]);

	return VariableHandler;
}();

/*
 * This class handles the selection of a template; Once a selection is made, the VariableHandler takes over and works on the text
 */


var TemplateDataHandler = function () {
	function TemplateDataHandler(variableHandler) {
		_classCallCheck(this, TemplateDataHandler);

		this.shortcut = document.getElementById("shortcut");
		this.search = document.getElementById("search");
		this.search.dataHandler = this;
		this.search.oninput = this.onSearchInput;
		this.variableHandler = variableHandler;
		this.selectCategories = document.getElementById("categories");
		this.selectCategories.dataHandler = this;
		this.selectCategories.onchange = this.onCategoryChanged;
		this.selectTemplates = document.getElementById("templates");
		this.selectTemplates.dataHandler = this;
		this.selectTemplates.onchange = this.onTemplateChanged;

		this.setCategories();
		this.selectCategories.onchange();
		this.selectTemplates.onchange();

		this.initAutoComplete();
	}

	_createClass(TemplateDataHandler, [{
		key: "initAutoComplete",
		value: function initAutoComplete() {

			var list = [];

			for (var i = 0; i < data.length; i++) {

				if (data[i].shortcut != null && data[i].shortcut != undefined && data[i].shortcut.length > 0) {
					list.push(data[i].shortcut);
				}
			}

			var awesomplete = new Awesomplete(this.search);
			awesomplete.list = list;

			this.search.addEventListener('awesomplete-selectcomplete', this.onSearchInput);
		}
	}, {
		key: "onSearchInput",
		value: function onSearchInput() {
			var shortcut = this.value;
			for (var i = 0; i < data.length; i++) {
				if (data[i].shortcut === shortcut) {
					this.dataHandler.selectCategories.value = data[i].category;
					this.dataHandler.selectCategories.onchange();
					this.dataHandler.selectTemplates.value = data[i].template;
					this.dataHandler.selectTemplates.onchange();
				}
			}
			this.focus();
		}
	}, {
		key: "setCategories",
		value: function setCategories() {
			var categories = this.getCategories();
			for (var i = 0; i < categories.length; i++) {
				var opt = document.createElement("option");
				opt.value = categories[i];
				opt.textContent = categories[i];
				this.selectCategories.appendChild(opt);
			}
		}
	}, {
		key: "getSelectedCategory",
		value: function getSelectedCategory() {
			if (this.selectCategories.selectedIndex == -1) return null;

			return this.selectCategories.options[this.selectCategories.selectedIndex].value;
		}
	}, {
		key: "getSelectedTemplate",
		value: function getSelectedTemplate() {
			if (this.selectTemplates.selectedIndex == -1) return null;

			return this.selectTemplates.options[this.selectTemplates.selectedIndex].value;
		}
	}, {
		key: "onCategoryChanged",
		value: function onCategoryChanged() {
			var category = this.dataHandler.getSelectedCategory();
			this.dataHandler.setTemplates(category);
		}
	}, {
		key: "onTemplateChanged",
		value: function onTemplateChanged() {
			var category = this.dataHandler.getSelectedCategory();
			var template = this.dataHandler.getSelectedTemplate();

			var content = this.dataHandler.getTemplate(category, template);

			this.dataHandler.variableHandler.setText(content.content);

			this.dataHandler.shortcut.value = content.shortcut;
		}
	}, {
		key: "setTemplates",
		value: function setTemplates(category) {

			while (this.selectTemplates.options.length > 0) {
				this.selectTemplates.remove(0);
			}

			var templates = this.getTemplates(category);

			for (var i = 0; i < templates.length; i++) {
				var opt = document.createElement("option");
				opt.value = templates[i];
				opt.textContent = templates[i];
				this.selectTemplates.appendChild(opt);
			}

			this.selectTemplates.onchange();
		}
	}, {
		key: "getCategories",
		value: function getCategories() {
			var temp = {};
			for (var i = 0; i < data.length; i++) {
				temp[data[i].category] = 1;
			}

			var categories = [];
			for (var key in temp) {
				categories.push(key);
			}

			return categories;
		}
	}, {
		key: "getTemplates",
		value: function getTemplates(category) {
			var temp = {};
			for (var i = 0; i < data.length; i++) {
				if (data[i].category == category) {
					temp[data[i].template] = 1;
				}
			}

			var templates = [];
			for (var key in temp) {
				templates.push(key);
			}

			return templates;
		}
	}, {
		key: "getTemplate",
		value: function getTemplate(category, template) {
			for (var i = 0; i < data.length; i++) {
				if (data[i].category == category && data[i].template == template) {
					return data[i];
				}
			}
			return null;
		}
	}]);

	return TemplateDataHandler;
}();

// Various stuff to make it work in Internet Explorer...


function fixIE() {

	// Internet Explorer has no String.startsWith(...) method.
	if (!String.prototype.startsWith) {
		String.prototype.startsWith = function (searchString, position) {
			position = position || 0;
			return this.indexOf(searchString, position) === position;
		};
	}
}

function init() {

	fixIE();

	//var str = ;

	var variableHandler = new VariableHandler(document.getElementById("text"));

	var dataHandler = new TemplateDataHandler(variableHandler);
}