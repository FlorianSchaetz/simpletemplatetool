var data = [

	{ category : "keine", template : "Einführung", content: "Hier Einführungstext" },

	{ category : "Briefe", template : "Brief an Herr XYZ", content: "Sehr geehrter Herr «voller Name»,\n bla bla bla\n Es geht um «Betrag» €. \n mfG \n (C) 2008-«currentyear»", shortcut : "-pf" },
	
	{ category : "Briefe", template : "Another TestTemplate", content: "Bla Blub Bli", shortcut : "-pfx"},
	
	{ category : "test2", template : "Yet Another TestTemplate", content: "Bla Blub Bli Blo «meinevariable17» «meinevariable11» «meinevariable13»", shortcut : "-pfy" },
	
	{ category : "test3", template : "And yet Another TestTemplate", content: "Bla Blub Bli Blo Blu", shortcut : "-pfz" },
	
	{ category : "test3", template : "And still another TestTemplate", content: "Bla Blub Bli Blo Blu «boxSome Random Text»", shortcut : "-pfz" },
	
	{ category : "test3", template : "And one more TestTemplate", content: "Bla Blub Bli Blo Blu «boolInsert Some Text:Some Text»", shortcut : "abcd" },
	
	{ category : "Letters", template : "Test Letter", content: "Hello «Recipient»,\r\n\r\nI hope this letter finds you well.\r\n\r\n«boxLetter content»\r\n\r\n«boolInsert Money Reminder:Don't forget: You owe me money!\r\n\r\n\»Yours\r\n\r\n\«My Name»", shortcut : "TestLetter" }

];