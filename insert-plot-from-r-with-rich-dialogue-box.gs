function ShowDialogue()
{
  var app = UiApp.createApplication();
  app.add(app.loadComponent("Car Plot"));
  
  var xlb = app.getElementById("XListBox");
  //var lb = app.createListBox();
  
  xlb.addItem("speed");
  xlb.addItem("dist");
  
  xlb.setItemSelected(0, true);
  
  var ylb = app.getElementById("YListBox");
  
  ylb.addItem("speed");
  ylb.addItem("dist");
  
  ylb.setItemSelected(1, true);
  
  var xhandler = app.createServerHandler('myXHandler');
  xlb.addChangeHandler(xhandler);

  var yhandler = app.createServerHandler('myYHandler');
  ylb.addChangeHandler(yhandler);

  var okhandler = app.createServerHandler("myOKHandler").addCallbackElement(app.getElementById("Component1"));
  app.getElementById("OKButton").addClickHandler(okhandler);
  
  SpreadsheetApp.getActiveSpreadsheet().show(app);
  
}

function myOKHandler(e)
{    
    run(e.parameter.XVal,e.parameter.YVal)
    
    var app = UiApp.getActiveApplication();
    app.close();
  
  return app;
}

function myYHandler(e) 
{
  return lbValidate("y", e.parameter.YVal);
}


function myXHandler(e) 
{
  return lbValidate("x", e.parameter.XVal);
}

function lbValidate(axis, val)
{
  var app = UiApp.getActiveApplication();

  var xlb = app.getElementById("XListBox");
  var ylb = app.getElementById("YListBox");
  
  if(axis == "y")
  {
    if(val == "speed")
    {
      Logger.log("y speed selected. x lb should change to dist");
      xlb.setSelectedIndex(1)
    }
    else
      xlb.setSelectedIndex(0)
  }
  
  if(axis == "x")
  {
    Logger.log(val + "<-- xlb.XVal");
    
    if(val == "speed")
    {
      Logger.log("x speed selected. y lb should change to dist");
      ylb.setSelectedIndex(1)
    }
    else
      ylb.setSelectedIndex(0)
    
  }

  //app.close();
  return app;
  
}



function run(x, y) {
  var sheet = SpreadsheetApp.getActiveSheet();
  
  var payload = 
      {
        "x" : x,
        "y" : y,
        "data" : "cars",
        "geom" : "[\"point\", \"smooth\"]"
      }
  
  var options = 
      {
        "method" : "POST",
        "payload" : payload   	
      };
  
  
  var response = UrlFetchApp.fetch("https://public.opencpu.org/R/pub/ggplot2/qplot/save", options);  
  
  var r_obj = Utilities.jsonParse(response.getContentText());
  
  var key = r_obj["object"];
  
  sheet.insertImage("http://public.opencpu.org/R/tmp/" + key + "/png", 2, 2);
  
  
};

/**
 * Adds a custom menu to the active spreadsheet, containing a single menu item
 * for invoking the readRows() function specified above.
 * The onOpen() function, when defined, is automatically invoked whenever the
 * spreadsheet is opened.
 * For more information on using the Spreadsheet API, see
 * https://developers.google.com/apps-script/service_spreadsheet
 */
function onOpen() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [{
    name : "Get Plot from R",
    functionName : "ShowDialogue"
  }];
  sheet.addMenu("EMIT R", entries);
};
