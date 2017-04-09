"use strict";

/*
 * A simple class to parse all expressions («...») from a text. Expressions can contain new lines (\n or \r\n)
 */
class ExpressionFinder {
	
	getExpressions(text) {
		var expressions = text.match(/«(.|\r|\n)+?»/g);
		if (expressions != undefined && expressions != null) {
			return expressions;
		}
		return [];
	}	
	
}
/*
 * This class converts expressions into apropriate Variable objects that represent/handle these expressions
 */
class VariableFactory {
		
	constructor() {
		
		// the list of variables that are not offered for input but replaced automatically
		this.autoVariables = {};
		this.autoVariables["currentyear"] = function() { return '' + new Date().getFullYear(); };
	}
	
	/*
	 * This method converts an array of expressions into Variable objects; If an expressions is in the list more than once, only one Variable will be created for all of them
	 */
	createVariables(expressions) {
		
		// To prevent us from creating more than one variable for a repeated expression
		var knownExpressions = {};
		
		var variables = [];
		for(var i=0; i<expressions.length; i++) {
	
			if (knownExpressions[expressions[i]] != true) {
				knownExpressions[expressions[i]] = true;
				variables.push( this.createVariable(expressions[i]));
			}
		}
		return variables;
	}
		
	/*
	 * This method converts one expression into an appropriate Variable object 
	 */
	createVariable(expression) {
		var name = expression.substring(1, expression.length-1);
		
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
	
}

/*
 * A Variable object encapsulates an expression and (optionally) offers an input element to modify the current content
 *
 * This base Variable class offers a simple text input field for modifying the content; If no content was entered, the content is the expression itself
 */
class Variable {
	
	constructor(expression) {
		this.expression = expression;
		this.name = this.expression.substring(1, this.expression.length-1);
	}
	
	/*
	 * Can be overriden; Return true if this object offers an input elment via createInput() (thus allowing the user to modify the content)
	 */
	isEnterable() {
		return true;
	}
	
	/*
	 * if isEnterable returns true, this method should create an input element to modify the content of this variable, otherwise it should return null
	 */
	createInput() {
		this.input = document.createElement('input');
		this.input.variable = this;
		this.input.oninput = this.onInputInternal;
		return this.input;
	}
	
	/*
	 * Sets the handler method that will be called after something was entered into this variable's input (if it exists)
	 */
	setOnInput(oninput) {
		this.oninput = oninput;
	}

	/*
	 * The base variable simply sets this variable's content to the value of the input, calls the oninput callback method and re-focuses its input
	 */	
	onInputInternal() {
		this.variable.content = this.variable.input.value;
		this.variable.oninput();
		this.focus();
	}

	/*
	 * The base variable's name is the expression minus the « and » characters at the beginning and end
	 */
	getName(){
		return this.name;
	}
	
	/*
	 * The base variable's content is the value entered into its input field; If the value is null or empty, it's the expression itself
	 */
	getContent() {
		if (this.content != null && this.content.length > 0) {
			return this.content;	
		}
		return '«' + this.getName() + '»';
	}
	
	getSpanClassName() {
		return null;
	}
}

/*
 * AutoVariables offer no input field for editing, but have one fixed content that will be used always (for example «currentyear» will automatically be replaced by the current year)
 */ 
class AutoVariable extends Variable {

	constructor(expression, content) {
		super(expression);
		this.content = content;
	}
	
	isEnterable() {
		return false;
	}
	
	createInput() {
		return null;
	}
}

/*
 * A variable for entering blocks of text into a textarea instead of a single-line input field; 
 */
class TextareaVariable extends Variable {
	
	/*
	 * The expression for this has the prefix "textarea:", but this prefix will not be shown as a replacement
	 *
	 * Example: «textarea:Long Explanation»
	 */
	constructor(expression) {
		super(expression);
		this.name = this.expression.substring('«textarea:'.length, this.expression.length-1);
	}
	
	createInput() {
		this.input = document.createElement('textarea');
		this.input.variable = this;
		this.input.oninput = this.onInputInternal;
		return this.input;
	}	
	
}

/*
 * BooleanVariables offer only a checkbox instead of an input field; If the checkbox is checked, the content will be the content defined in the expression, otherwise the content will be empty, allowing for optional,
 * fixed blocks of text
 *
 * Please note: Currently, BooleanVariables cannot contain expressions themselves, sorry.
 */ 
class BooleanVariable extends Variable {
	
	/*
	 * The expression for this has the prefix "boolean:", followed by a name, followed by ":" and the content
	 *
	 * Example: «boolean:Add Copyright Notice:Copyright 2017 by Some Person»
	 */
	constructor(expression) {
		super(expression);
		
		var indexOfName = this.expression.indexOf(':');		
		var indexOfContent = this.expression.indexOf(':', indexOfName+1);
		this.name = this.expression.substring(indexOfName+1, indexOfContent);	
		this.value = this.expression.substring(indexOfContent+1, this.expression.length-1);		
	}

	getContent() {
		if (this.input.checked) {
			return this.content;	
		}
		return '';
	}
	
	createInput() {
		this.input = document.createElement('input');
		this.input.type = "checkbox";
		this.input.value = this.value;
		this.input.variable = this;
		this.input.oninput = this.onInputInternal;
		return this.input;
	}	

	getSpanClassName() {
		return "checkbox-span";
	}	
}

/*
 * This class handles the creation of variables, manages their input fields and updates the text input given in the constructor
 */
class VariableHandler {
	
	constructor(input) {
		this.variables = [];
		this.input = input;
		this.factory = new VariableFactory();
	}
	
	/*
	 * This method can be called to set another text into the input field; It removes all old Variable inputs, adds new ones, if needed, etc. In short, call this and everything else 
	 *  will work automatically
	 */	
	setText(text) {
		this.input.original = text;
		
		var expressions = new ExpressionFinder().getExpressions(text);
		this.variables = this.factory.createVariables(expressions);
		
		var parent = document.getElementById('variables');
				
		while (parent.hasChildNodes()) {
			var div = parent.lastChild;		
			parent.removeChild(div);
		}
				
		for(var i=0; i<this.variables.length; i++) {
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
				this.variables[i].setOnInput( function() { me.update(); } );
				parent.appendChild(div);
				
			}
		}
		this.update();		
	}
	
	replaceAll(text) {
		
		var modifiedText = text;
		
		for(var i=0; i<this.variables.length; i++) {
			var expression = this.variables[i].expression;
			var content = this.variables[i].getContent();
			
			modifiedText = modifiedText.split(expression).join(content);
			
		}
		
		return modifiedText;
	}
	
	update() {
		var text = this.input.original;
		this.input.value = this.replaceAll(text);
		this.selectAndCopy();
	}
	
	selectAndCopy() {
		this.input.select();
	
		try {
			var successful = document.execCommand('copy');
			if (successful) {
				this.input.selectionStart  = -1;
				this.input.selectionEnd  = -1;
			}				
		} catch (err) {
			console.log('Oops, unable to copy');
		}
	}
	
}

/*
 * This class handles the selection of a template; Once a selection is made, the VariableHandler takes over and works on the text
 */
class TemplateDataHandler {
	
	constructor(variableHandler) {
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
	
	initAutoComplete() {
		
		var list = [];
		
		for(var i=0; i<data.length; i++) {
			
			if (data[i].shortcut != null && data[i].shortcut != undefined && data[i].shortcut.length > 0) {
				list.push( data[i].shortcut );
			}
		}
		
		var awesomplete = new Awesomplete(this.search);
		awesomplete.list = list;
		
		this.search.addEventListener('awesomplete-selectcomplete', this.onSearchInput);
		
	}

	
	onSearchInput() {
		var shortcut = this.value;
		for(var i=0; i<data.length; i++) {
			if (data[i].shortcut === shortcut) {
				this.dataHandler.selectCategories.value = data[i].category;
				this.dataHandler.selectCategories.onchange();
				this.dataHandler.selectTemplates.value = data[i].template;
				this.dataHandler.selectTemplates.onchange();
			}
		}
		this.focus();
	}
	
	setCategories() {
		var categories = this.getCategories();
		for(var i=0; i<categories.length; i++) {
			var opt = document.createElement("option");
			opt.value = categories[i];
			opt.textContent = categories[i];
			this.selectCategories.appendChild(opt);
		}
	}
	
	getSelectedCategory() {
		if (this.selectCategories.selectedIndex == -1)
			return null;

		return this.selectCategories.options[this.selectCategories.selectedIndex].value;
	}
	
	getSelectedTemplate() {
		if (this.selectTemplates.selectedIndex == -1)
			return null;

		return this.selectTemplates.options[this.selectTemplates.selectedIndex].value;
	}
	
	onCategoryChanged() {
		var category = this.dataHandler.getSelectedCategory();
		this.dataHandler.setTemplates(category);
	}
	
	onTemplateChanged() {
		var category = this.dataHandler.getSelectedCategory();
		var template = this.dataHandler.getSelectedTemplate();			
		
		var content = this.dataHandler.getTemplate(category, template);
		
		this.dataHandler.variableHandler.setText(content.content);
		
		this.dataHandler.shortcut.value = content.shortcut;
	}

	
	setTemplates(category) {
		
		while(this.selectTemplates.options.length > 0) {
			this.selectTemplates.remove(0);
		}

		var templates = this.getTemplates(category);
		
		for(var i=0; i<templates.length; i++) {
			var opt = document.createElement("option");
			opt.value = templates[i];
			opt.textContent = templates[i];
			this.selectTemplates.appendChild(opt);
		}
		
		this.selectTemplates.onchange();
	}

	
	getCategories() {
		var temp = {};
		for(var i=0; i<data.length; i++) {			
			temp[data[i].category] = 1;
		}
	
		var categories = [];
		for(var key in temp) {
			categories.push(key);
		}
	
		return categories;
	}
	
	getTemplates(category) {
		var temp = {};
		for(var i=0; i<data.length; i++) {
			if (data[i].category == category) {
				temp[data[i].template] = 1;
			}
		}
		
		var templates = [];
		for(var key in temp) {
			templates.push(key);
		}
		
		return templates;
	}	
	
	getTemplate(category, template) {
		for(var i=0; i<data.length; i++) {
			if (data[i].category == category && data[i].template == template) {
				return data[i];
			}
		}
		return null;
	}	
}

// Various stuff to make it work in Internet Explorer...
function fixIE() {
	
	// Internet Explorer has no String.startsWith(...) method.
	if (!String.prototype.startsWith) {
		String.prototype.startsWith = function(searchString, position) {
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