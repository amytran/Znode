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

  //a0t (new)
  var viewWin = $("viewWin");
  viewWin.hide();
  
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
    graph.clearAll();
  });
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
    if (name == "" || name == nameMessage){
      alert("Please Name Your File");
      filename[0].focus();
      return;
    }
    $.post("json/save.php", {data:graph.toJSON(), name:name}, function(data){
      alert("Your file was saved.");
    });
  }
  
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
	console.log("fileList: " + fileList);
  });
  
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
  
  //event.preventDefault() stops the default action of an element
  //such as preventing a form being submitted when a submit button
  //is clicked.
  $("#nameForm").submit(function(e){
    e.preventDefault();
    saveFile();
  });

  //a0t (new)
  $("#inherit").click(function(){
	console.log("inherit button click");
	var clist =  $("#views");
	clist.html("<div>loading...<\/div>");
	viewWin.fadeIn();
	clist.load("json/files.php?"+Math.random()*1000000);
	var data = graph.getClassList();
	//classData = graph.getClassList();
	console.log("inherit - getData: " + data[0]);
	//nodeData.setupNodeData(data);
	var iWin = window.open("inheritView.html", "newWin");
	//var t = setTimeout("test()", 3000);
	var timerID = self.setInterval(function() {graph.displayInheritance(iWin, data);}, 3000)
	graph.setTimer(timerID);
	
	//alert("why can't I see the window?" + timerID);
  });
  
  //Process the click action when a saved file
  //in the open window.
  $(".file").live('click', function() {
    var name = $(this).text();
	//$(selector).getJSON(url,data,success(data,status,xhr))
	//only url is required.
	//what is the second parameter trying to do with the random?
	//I believe it gets the data from the url
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
  });
  
  
  
});