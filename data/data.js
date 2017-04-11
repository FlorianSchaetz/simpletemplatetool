var data = [

	{ category : "keine", template : "Einführung", content: "Hier Einführungstext" },
	
		{ category : "keine", template : "No text just variables", content: "«voller Name»" },
		
		{ category : "keine", template : "No text just boolean variables", content: "«boolean:click me:Some random text\r\nwith two lines»«boolean:click me too:\r\nSome other random text\r\nwith two lines»" },

	{ category : "Briefe", template : "Brief an Herr XYZ", content: "Sehr geehrter Herr «voller Name»,\n bla bla bla\n Es geht um «Betrag» €. \n mfG \n (C) 2008-«currentyear»", shortcut : "-pf" },
	
	{ category : "Briefe", template : "Another TestTemplate", content: "Bla Blub Bli", shortcut : "-pfx"},
	
	{ category : "test2", template : "Yet Another TestTemplate", content: "Bla Blub Bli Blo «meinevariable17» «meinevariable11» «meinevariable13»", shortcut : "-pfy" },
	
	{ category : "test3", template : "And yet Another TestTemplate", content: "Bla Blub Bli Blo Blu", shortcut : "-pfz" },
	
	{ category : "test3", template : "And still another TestTemplate", content: "Bla Blub Bli Blo Blu «textarea:Some Random Text»", shortcut : "-pfa" },
	
	{ category : "test3", template : "And one more TestTemplate", content: "Bla Blub Bli Blo Blu «boolean:Insert Some Text:Some Text»", shortcut : "abcd" },
	
	{ category : "Letters", template : "Test Letter", content: "Hello «Recipient»,\r\n\r\nI hope this letter finds you well.\r\n\r\n«textarea:Letter content»\r\n\r\n«boolean:Insert Money Reminder:Don't forget: You owe me money!\r\n\r\n\»Yours\r\n\r\n\«My Name»\r\n\r\nP.S. «Recipient», the year is «currentyear»", shortcut : "TestLetter" }

];