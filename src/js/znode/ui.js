$(function(){
  
  //instantiate a NodeGraph object
  var graph = new NodeGraph();
  
  //instantiate a NodeData object
  //var nodeData = new NodeData();
  
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

    if (viewWin.css("display") == "none"){
       var children = $(e.target).children();
       if (children.length > 0){
         var type = children[0].tagName;
         if (type == "desc" || type == "SPAN"){
           graph.addNodeAtMouse();
         }
       }
     }

  });
  
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

  //textarea for the function name
  var fnameMessage = "Enter funct name";
  var functionname = $("#functionname").val(fnameMessage);

  functionname.focus(function(){
    if ($(this).val() == fnameMessage){
      $(this).val("");
    }
  }).blur(function(){
    if ($(this).val() == ""){
      $(this).val(fnameMessage);
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
  });
  
  function clearNames()
  {
    filename.val(nameMessage);
    classname.val(cnameMessage);
    functionname.val(fnameMessage);
  }
  
  $("#help").click(function(){
    //open() method that opens a new window with the URL and the name of the window
    //this is JS & DOM reference
    //window.open(URL,name,specs,replace)
    //only URL is required, other parameters are optional
    //_blank - URL is loaded into a new window.  This is default
    window.open("http://www.zreference.com/znode", "_blank");
  });
  
  //when save option is click, call saveFile function
  $("#save").click(saveFile);
  
  function saveFile(){
    var name = filename.val();
    var cname = classname.val();
    var fname = functionname.val();
    clearNames();
    
    if ((name == "" || name == nameMessage) &&
        (cname == "" || cname == cnameMessage) &&
        (fname == "" || fname == fnameMessage))
    {   
        alert("Please Name Your File, Class or Function");
        return;
    }
    
    if (name != "" && name != nameMessage)
    {
        $.post("json/save.php", {data:graph.toJSON(), name:name}, function(data){
        alert("Your file was saved.");
        });
        return;
    }

    if ((cname != "" && cname != cnameMessage) && (fname != "" && fname != fnameMessage))
    {
        var cfname = cname + "_" + fname;
        $.post("json/save.php", {data:graph.toJSON(), name:cfname}, function(data){
        alert("Your file was saved.");
        });
        return;
    }

    if (cname != "" && cname != cnameMessage)
    {
        $.post("json/save.php", {data:graph.toJSON(), name:cname}, function(data){
        alert("Your file was saved.");
        });
        return;
    }
    
  }//end of saveFile
  
  //if the open control window is displayed,
  //then if the user click the mouse on the canvas
  //the open window fades out
  $("#canvas").mousedown(function(){
    openWin.fadeOut();
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

  //handle the inherit button click 
  $("#inherit").click(function(){
    //get the saved file project that you wish
    //to see the inheritance view
    var name = filename.val();
    if (name == "" || name == nameMessage){
      alert("Please enter project name for inheritance view");
      return;
    }

    //get the JSON file with this filename if any
    //0 will be replaced with an enum to indicate 
    //what kind of file is being retrieved.
    //The indicator will decide whether the filename
    //being displayed in the Name: field
    retrieveJSON(name, 0);

  });//end of inherit button handler
  
  $("#composeView").click(function(){
    var name = classname.val();
    if (name == "" || name == cnameMessage){
      alert("Please Enter Class Name For Composition View");
      return;
    }

    //get the JSON file with this filename if any
    retrieveJSON(name, 1);
    
  }); //end of composition view 
  
  $("#gVariable").click(function(){
    //prompt the user to enter the global variable
    //input value will be saved to inputVar
    var inputVar = prompt("Message", "Enter Global Variable Name"); 
    retrieveJSON(inputVar, 2);  
  }); //end of global variable view
  
  $("#functionView").click(function(){
    var cname = classname.val();
    var fname = functionname.val();
    
    //If either the class or function name
    //is empty, put up alert and request can't
    //be executed.
    if ((cname == "" || cname == cnameMessage) ||
        (fname == "" || fname == fnameMessage))
    {
      alert("Please Enter Function And Class Names");
      return;
    }

    var joinName = cname + "_" + fname;
    
    //get the JSON file with this filename if any    
    retrieveJSON(joinName, 3);

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
    retrieveJSON(name, 0);
  }).live('mouseover', function(){
    $(this).css({"background-color": "#ededed"});
  }).live("mouseout", function(){
    $(this).css({"background-color": "white"});
  }); //end of file live
  
    function retrieveJSON(name, viewType)
    {
        $.getJSON("files/" + name + ".json", {n:Math.random()}, function(data){
        //get the graph data and put it on the canvas
        graph.fromJSON(data);
        if (viewType == 0)
        {
            //get the file name and put it in the form name field Name: 
            filename.val(name);
        }
        });
    }  
});