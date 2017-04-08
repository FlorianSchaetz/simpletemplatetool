# Simple Template Tool
A simple, JS based tool for using templates

This tool allows to store templates (texts with variables in them) in a data file and quickly look them up via a shortcut (or using category lists) in a simple HTML UI. Variables will either be automatically inserted (currently only available for «currentyear») or offered as input elements. The tool will try to copy the current version of the text into the clipboard automatically.

Basic use case:

* Open tool
* Select template via shortcut look-up or category list
* (Optionally) enter values for the variables
* Paste the (automatically copied) result wherever you want it

Possible variable types:

* «currentyear» will automatically be replaced with the current year
* «something else» will lead to an input field labeled "something else" appearing where you can enter the content for this variable (the name is completely up to you)
* «boxsomething else» same as above, only the input field will be a textarea, to allow for multi-line texts (happens if you prefix your variable name with "box")
* «boolsomething else:This text will appear» will lead to a checkbox labeld "something else" appearing, if checked, the text "This text will appear" will be inserted, otherwise nothing will be inserted

A simple example with the variables not yet entered...

![Form without filled fields](http://florian-schaetz.de/projects/templatetool/letter-before.png)

The same example with the variables entered...

![Form with filled fields](http://florian-schaetz.de/projects/templatetool/letter-after.png)

Autocompletion is provided via Awesomplete (http://leaverou.github.io/awesomplete/) by Lea Verou