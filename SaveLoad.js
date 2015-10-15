function Save()
{
	var logoName = prompt("Save logo as: ");
	if (!logoName)
	{
		alert("Invalid name. Logo not saved!");
		return;
	}

	var logo = localStorage.getItem(logoName);
	if (logo)
	{
		if(!confirm("Logo with that name already exists. Do you want to overwrite it?"))
		{
			alert("Not overwritten bla bla")
			return;
		}
	}

	localStorage.setItem(logoName, JSON.stringify(lines));
}

function Open()
{
	var text = "Open logo: \n";
	// var keys = [];
	for(var i=0; i<localStorage.length; ++i) 
	{
		//keys.push(localStorage.key(i));
		text += "- " + localStorage.key(i) + "\n";
	    // var key = localStorage.key(i);
	    // var value = localStorage[key];
	    // console.log(key + " => " + value);
	}

	var logoName = prompt(text);
	if (!logoName)
	{
		alert("Invalid name!");
		return;
	}
	

	var logo = localStorage.getItem(logoName);

	if (!logo)
	{
		alert("Logo doesn't exist!");
		return;
	}

	var linesArray = JSON.parse(logo);

	lines = [];
	for (var i=0; i<linesArray.length; ++i)
	{
		lines.push(
			new Line(
				linesArray[i].start.x,
				linesArray[i].start.y,
				linesArray[i].end.x,
				linesArray[i].end.y
			)
		);
	}
	Redraw();
}

function DeleteSavedLogo(logoName)
{
	if (!logoName)
		logoName = prompt("Which logo should be deleted?")

	var logo = localStorage.getItem(logoName);
	if (logo)
	{
		localStorage.removeItem(logoName);
		console.log("deleted")
	}
}