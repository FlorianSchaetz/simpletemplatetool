function getCategories() {
	var temp = {};
	for(i=0; i<data.length; i++) {			
		temp[data[i].category] = 1;
	}
	
	var categories = [];
	for(var key in temp) {
		categories.push(key);
	}
	
	return categories;
}

function getTemplates(category) {
	var temp = {};
	for(i=0; i<data.length; i++) {
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

function setCategories() {
	var categories = getCategories();
	var select = document.getElementById("categories");
	for(i=0; i<categories.length; i++) {
		var opt = document.createElement("option");
		opt.value = categories[i];
		opt.textContent = categories[i];
		select.appendChild(opt);
	}
}

function setTemplates(category) {
	var select = document.getElementById("templates");
	while(select.options.length > 0) {
		select.remove(0);
	}

	var templates = getTemplates(category);
	
	for(i=0; i<templates.length; i++) {
		var opt = document.createElement("option");
		opt.value = templates[i];
		opt.textContent = templates[i];
		select.appendChild(opt);
	}
	
	onTemplateChanged();
}

function getSelectedCategory() {
	var select = document.getElementById("categories");

	if (select.selectedIndex == -1)
		return null;

	return select.options[select.selectedIndex].value;
}

function onCategoryChanged() {
	var category = getSelectedCategory();
	setTemplates(category);
}

function getSelectedTemplate() {
	var select = document.getElementById("templates");

	if (select.selectedIndex == -1)
		return null;

	return select.options[select.selectedIndex].value;
}

function getTemplate(category, template) {

	for(i=0; i<data.length; i++) {
		if (data[i].category == category && data[i].template == template) {
			return data[i];
		}
	}
	return null;
}

function onTemplateChanged() {
	var category = getSelectedCategory();
	var template = getSelectedTemplate();			
	
	var content = getTemplate(category, template);
	var textarea = document.getElementById("text");
	var text = postProcessText(content.content);
	textarea.original = text;
	
	setText(text);
	
	var shortcut = document.getElementById("shortcut");
	shortcut.value = content.shortcut;
}

function setText(text) {
	var textarea = document.getElementById("text");
	textarea.value = text;		
	selectAndCopy();	
}

function postProcessText(content) {		

	var parameters = document.getElementById("parameters");
	
	while (parameters.hasChildNodes()) {
		var div = parameters.lastChild;		
		parameters.removeChild(div);
	}

	var res = content.match(/«.+?»/g);
	
	if (res == null) {
		return content;
	}
	
	var temp = {};
	
	for(i=0; i<res.length; i++) {
		var name = res[i].substring(1, res[i].length-1);
		
		var replacement = null;
		if (name === 'currentyear') {
			replacement = '' + new Date().getFullYear();
		}
		if (name === 'currentmonth') {
			replacement = '' + new Date().getMonth();
		}
		
		if (replacement != null) {
			content = content.replace(res[i], replacement, 'g');
		} else if (temp[name] != 1234) {
			
			temp[name] = 1234;
			var div = document.createElement('div');			
			var label = name;
			
			if (name.startsWith("box")) {
				label = name.substring(3, name.length);
			}
			
			var span = document.createElement('span');
			span.innerHTML = label;
			div.append(span);
			
			if (name.startsWith("box")) {
				var input = document.createElement('textarea');
				input.oninput= function(event) {
					updateText(event);
				};
				input.name = name;
				div.append(input);	
			}else {
				var input = document.createElement('input');
				input.oninput= function(event) {
					updateText(event);
				};
				input.name = name;
				div.append(input);	
			}
			
			
			parameters.append(div);
		}
		
		
		
	}

	return content;
}

function updateText(event) {
	var parameters = document.getElementById("parameters");
	
	if (!parameters.hasChildNodes()) {
		return;
	}
	
	var arguments = {};
	
	for(i=0; i<parameters.childNodes.length; i++) {
		
		var input = parameters.childNodes[i].childNodes[1];
		var name = input.name; 
		var value = input.value;
		arguments[name] = value;	
	}
	
	var textarea = document.getElementById("text");
	var content = textarea.original;
		
	for(var name in arguments) {
		var value = arguments[name];	
		if (value != null && value != undefined && value.length > 0) {
			
			var regex = new RegExp('«' + name + '»', "g");
			
			content = content.replace(regex, value);	
		} 
	}
	setText(content);
	event.target.focus();
}

function selectAndCopy() {
	var textarea = document.getElementById("text");
	textarea.select();
	
	try {
		var successful = document.execCommand('copy');
		if (successful) {
			textarea.selectionStart  = -1;
			textarea.selectionEnd  = -1;
		}				
	} catch (err) {
		console.log('Oops, unable to copy');
	}
}

function init() {
	setCategories();
	onCategoryChanged();
	onTemplateChanged();	
	
	initAutoComplete();
	
	var input = document.getElementById("input");
	input.focus();
}

function initAutoComplete() {
	
	var list = [];
	
	for(i=0; i<data.length; i++) {
		
		if (data[i].shortcut != null && data[i].shortcut != undefined && data[i].shortcut.length > 0) {
			list.push( data[i].shortcut );
		}
	}
	
	var input = document.getElementById('input');
	var awesomplete = new Awesomplete(input);
	awesomplete.list = list;
	
	input.addEventListener('awesomplete-selectcomplete', function() { onInput(); });
	
}

function onInput() {
	var input = document.getElementById("input");
	var value = input.value;
	for(i=0; i<data.length; i++) {
		var d = data[i];
		if (d.shortcut === value) {
			
			var categories = document.getElementById("categories");		
			categories.value = d.category;
			onCategoryChanged();
			
			var templates = document.getElementById("templates");
			templates.value = d.template;
			onTemplateChanged();		
			
			var input = document.getElementById("input");
			input.select();
			input.focus();
			
			return;
		}
	}
}