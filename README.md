# Simple Template Tool
A simple, JS based tool for using templates

This tool allows to store templates (texts with variables in them) in a data file and quickly look them up via a shortcut (or using category lists) in a simple HTML UI. Variables will either be automatically inserted (currently only available for «currentyear») or offered as input elements. The tool will try to copy the current version of the text into the clipboard automatically.

Basic use case:

* Open tool
* Select template via shortcut look-up or category list
* (Optionally) enter values for the variables
* Paste the (automatically copied) result wherever you want it

Autocompletipm is provided via Awesomplete (http://leaverou.github.io/awesomplete/) by Lea Verou