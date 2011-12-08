$(function(){
  
  //instantiate a NodeGraph object
  var graph = new NodeGraph();
    
  //This is where it creates a node
  //on the canvas when a mouse is click on the canvas
  
  // consider moving to NodeGraph
  $("#canvas").mouseup(function(e){
     if (openWin.css("display") == "none"){
       var children = $(e.target).children();
       if (children.length > 0){
         var type = children[0].tagName;
         if (type == "desc" || type == "SPAN"){
           graph.addNodeAtMouse();
         }
       }
     }
  });
  
  var classWin = $("#classWin");
  var gVarWin = $("#gVarWin");
  var composeWin = $("#composeWin");
  
  // ui code
  var openWin = $("#openWin");
  openWin.hide();
  
  var nameMessage = "Enter your file name";
  var filename = $("#filename").val(nameMessage);

  filename.focus(function(){
    if ($(this).val() == nameMessage){
      $(this).val("");
    }
  }).blur(function(){
    if ($(this).val() == ""){
      $(this).val(nameMessage);
    }
  });

  //textarea for the class name
  var cnameMessage = "Enter class name";
  var classname = $("#classname").val(cnameMessage);

  classname.focus(function(){
    if ($(this).val() == cnameMessage){
      $(this).val("");
    }
  }).blur(function(){
    if ($(this).val() == ""){
      $(this).val(cnameMessage);
    }
  });

  //$(selector).mouseenter() is jquery event
  //this event occurs when the mouse pointer is over an element
  //jquery effect custom animations syntax
  //$(selector).animate({params},[duration],[easing],[callback])
  //200 below is the duration - speed of the animation.  Possible values
  //are "fast", "slow", "normal", or milliseconds.
  $(".btn").mouseenter(function(){
    $(this).animate({"backgroundColor" : "white"}, 200);
  }).mouseleave(function(){
    $(this).animate({"backgroundColor" : "#efefef"});
  });
  $("#clear").click(function(){
    clearNames();
    graph.clearAll();
    openWin.fadeOut();
    classWin.fadeOut();
    gVarWin.fadeOut();
    composeWin.fadeOut();
  });
  
  function clearNames()
  {
    filename.val(nameMessage);
    classname.val(cnameMessage);
  }
  
  $("#help").click(function(){
    //open() method that opens a new window with the URL and the name of the window
    //this is JS & DOM reference
    //window.open(URL,name,specs,replace)
    //only URL is required, other parameters are optional
    //_blank - URL is loaded into a new window.  This is default
    window.open("http://www.zreference.com/znode", "_blank");
  });
  
  //when new option is clicked, create the default node
  $("#new").click(function(){graph.createDefaultNode()});
  
  //when save option is clicked, call saveFile function
  $("#save").click(saveFile);
  
  function saveFile(){
    var name = filename.val();
    clearNames();
    
    if (name == "" || name == nameMessage)
    {   
        alert("Please Name Your File");
        return;
    }
    
    $.post("json/save.php", {data:graph.toJSON(), name:name}, function(data){
        alert("Your file was saved.");
    });
  
  }//end of saveFile
  
  //if the open control window is displayed,
  //then if the user click the mouse on the canvas
  //the open window fades out
  $("#canvas").mousedown(function(){
    clearNames();
    openWin.fadeOut();
    classWin.fadeOut();
    gVarWin.fadeOut();
    composeWin.fadeOut();
  });
  
  //open menu is click, list all the 
  //saved .json files
  $("#open").click(function(){
    var fileList =  $("#files");
    //what does this loading really do?
    //it just puts the text on the division
    //while the data is being load, but didn't see it
    //because not that many files to load
    fileList.html("<div>loading...<\/div>");
    openWin.fadeIn();
    fileList.load("json/files.php?"+Math.random()*1000000);
  });
    
  //event.preventDefault() stops the default action of an element
  //such as preventing a form being submitted when a submit button
  //is clicked.
  $("#nameForm").submit(function(e){
    e.preventDefault();
    saveFile();
  });

  //source menu is click, list all the 
  //.js files in MainMenu
  $("#sourceView").click(function(){
    var fileList =  $("#classes");
    fileList.html("<div>loading...<\/div>");
    classWin.fadeIn();
    fileList.load("json/classes.php?"+Math.random()*1000000);
  });

  //handle the inherit button click 
  $("#inherit").click(function(){    
    var name = prompt("Message", "Enter Class Name For The Inheritance View");

    $.getJSON("MainMenu/InheritanceView/" + name + ".json", {n:Math.random()}, function(data){
    //get the graph data and put it on the canvas
    graph.fromJSON(data);
    });
    
  });//end of inherit button handler
  
  $("#composeView").click(function(){
    var name = classname.val();
    if (name == "" || name == cnameMessage){
      alert("Please Enter Class Name For Composition View");
      return;
    }
    
    var clist = getComposeNodes(name);

    //global variable menu is click, list all the 
    //saved .json files in MainMenu/GlobalVariables
    var fileList =  $("#compose_nodes");
    fileList.html("<div>loading...<\/div>");
    classWin.fadeOut();
    composeWin.fadeIn();
    fileList.load("json/getCompose.php?"+Math.random()*1000000, {data:clist});
  }); //end of composition view 
  
  $("#gVariable").click(function(){    
    //global variable menu is click, list all the 
    //saved .json files in MainMenu/GlobalVariables
    var fileList =  $("#globalvars");
    fileList.html("<div>loading...<\/div>");
    gVarWin.fadeIn();
    fileList.load("json/g_variables.php?"+Math.random()*1000000);

  }); //end of global variable view
  
  $("#functionView").click(function(){
    //prompt the user to enter the global variable
    //input value will be saved to inputVar
    var cInput = prompt("Message", "Enter Class Name"); 
    var fInput = prompt("Message", "Enter Function Name");

    if (cInput == null || fInput == null)
    {
        //User cancelled action
        return;
    }
    else
    {
        var URL = "/myZnode/src/MainMenu/" + cInput + ".js";
        var childWin = window.open(URL, cInput);
        //set a timer to wait until the chile window is loaded
        //before processing the highlight.
        var loadTimer = self.setInterval(function() {graph.highlightText(childWin, fInput);}, 3000);
        graph.setLoadTimer(loadTimer);
    }
  }); //end of function view
  
    //Process the click action when a saved file
    //in the open window.
    $(".file").live('click', function() {
        var name = $(this).text();
        //$(selector).getJSON(url,data,success(data,status,xhr))
        //only url is required.
        //what is the second parameter trying to do with the random?
        //Data will be retrieved from current directory/files/

        //get the JSON file with this filename if any
        $.getJSON("files/" + name + ".json", {n:Math.random()}, function(data){
        //get the graph data and put it on the canvas
        graph.fromJSON(data);
        //get the file name and put it in the form name field Name: 
        filename.val(name);
        });

    }).live('mouseover', function(){
       $(this).css({"background-color": "#ededed"});
    }).live("mouseout", function(){
       $(this).css({"background-color": "white"});
    }); //end of file live
      
    //Process the click action when a source file
    //in the source class window.
    $(".classFile").live('click', function() {
        var name = $(this).text();
        var URL = "/myZnode/src/MainMenu/" + name + ".js";
        var childWin = window.open(URL, name);            
    }).live('mouseover', function(){
      $(this).css({"background-color": "#ededed"});
    }).live("mouseout", function(){
      $(this).css({"background-color": "white"});
    }); //end of class files live  

    //Process the click action when a source file
    //in the source class window.
    $(".composeFile").live('click', function() {
        var name = $(this).text();
        if (name != "Empty")
        {
            var cname = classname.val();
            var URL = "/myZnode/src/MainMenu/" + name + ".js";
            var childWin = window.open(URL, name);            
            //set a timer to wait until the chile window is loaded
            //before processing the highlight.
            var loadTimer = self.setInterval(function() {graph.composeClass(childWin, cname);}, 3000);
            graph.setLoadTimer(loadTimer);
        }
        else
        {
            alert("Invalid Class Name.  No Data!");
        }
    }).live('mouseover', function(){
      $(this).css({"background-color": "#ededed"});
    }).live("mouseout", function(){
      $(this).css({"background-color": "white"});
    }); //end of class files live  
    
    //Process the click action when a global variable file
    //in the global variable window.
    $(".gVarFile").live('click', function() {
        var name = $(this).text();
        //get the saved .json files for the global variables information
        $.getJSON("MainMenu/GlobalVariables/" + name + ".json", {n:Math.random()}, function(data){
            classWin.fadeOut();
            gVarWin.fadeOut();
            //get the graph data and put it on the canvas
            graph.fromJSON(data);
        });
    }).live('mouseover', function(){
      $(this).css({"background-color": "#ededed"});
    }).live("mouseout", function(){
      $(this).css({"background-color": "white"});
    }); //end of global variable files live  
        
    //This function specify the nodes that contain the 
    //class entered by the user for the composition view
    function getComposeNodes(cName)
    {
        //define a local array
        var composeNodes = [];
        
        switch (cName)
        {
            case "AnimatedGameObject":
                composeNodes = ["GameObjectManager", "LevelEndPost", "Player", "Powerup"];
                break;
            case "ApplicationManager":
                composeNodes = ["GameObjectManager", "LevelEndPost", "MainMenu", "Powerup"];
                break;            
            case "GameObject":
                composeNodes = ["VisualGameObject", "GameObjectManager"];                
                break;
            case "GameObjectManager":
                composeNodes = ["ApplicationManager", "Main"];
                break;
            case "Level":
                composeNodes = ["GameObjectManager", "Player"];
                break;
            case "LevelEndPost":
                composeNodes = ["GameObjectManager", "Level"];
                break;
            case "MainMenu":
                composeNodes = ["ApplicationManager", "GameObjectManager"];
                break;
            case "Player":
                composeNodes = ["ApplicationManager", "GameObjectManager"];
                break;
            case "Powerup":
                composeNodes = ["GameObjectManager", "Level"];
                break;
            case "Rectangle":
                composeNodes = ["ApplicationManager", "LevelEndPost", "Powerup", "VisualGameObject"];
                break;
            case "RepeatingGameObject":
                composeNodes = ["ApplicationManager", "GameObjectManager"];
                break;
            case "ResourceManager":
                composeNodes = ["GameObjectManager"];
                break;
            case "VisualGameObject":
                composeNodes = ["AnimatedGameObject", "GameObjectManager", "Level", "LevelEndPost", "MainMenu", "Powerup", "RepeatingGameObject"];
                break;
            default:
                composeNodes = ["Empty"];
                break;
        }
        
        //return the array list of nodes for the composition view listing
        return composeNodes;
    }
    
});