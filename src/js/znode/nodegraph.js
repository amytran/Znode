function NodeGraph(){
  var win = $(window);
  var canvas = $("#canvas");
  var overlay = $("#overlay");
  var currentNode;
  var currentConnection = {};
  var connections = {};
  var connectionId = 0;
  var newNode;
  var nodes = {};
  var nodeId = 0;
  var mouseX = 0, mouseY = 0;
  var loops = [];
  var pathEnd = {};
  var zindex = 1;
  var hitConnect;
  var key = {};
  var SHIFT = 16;
  var topHeight = $("#controls").height();
  var newPaperWidth;
  var newPaperHeight;
  var timerID = -1;

  
  var paper = new Raphael("canvas", "100", "100");
  
  function resizePaper(w, h){
    //paper.setSize(win.width(), win.height() - topHeight);
    paper.setSize(w, h);
  }
  win.resize(resizePaper(win.width(), win.height() - topHeight));
  resizePaper(win.width(), win.height() - topHeight);
 
  canvas.append("<ul id='menu'><li>Left<\/li><li>Right<\/li><li>Top<\/li><li>Bottom<\/li><\/ul>");
  var menu = $("#menu");
  menu.css({"position" : "absolute", "left" : 100, "top" : 0, "z-index" : 5000, "border" : "1px solid gray", "padding" : 0});
  menu.hide();
  
  canvas.append("<div id='hit' />");
  hitConnect = $("#hit");
  hitConnect.css({"position" : "absolute", "left" : 100, "top" : 0, "z-index" : 4000, "border" : "none", 
                  "width" : 10, "height": 10, "cursor":"pointer", "font-size": "1px"});
                  
  $("#menu li").hover(function(){
    $(this).css("background-color", "#cccccc");
  },
  function(){
    $(this).css("background-color", "white");
  }).click(function(){
    menu.hide();
    var dir = $(this).text();
    connectNode(dir);
  });

  /************************************
   *    Scroll parts                  *
   ************************************/
    //scrollpane parts
    var scrollPane = $( ".scroll-pane" ),
        scrollContent = $( ".scroll-content" );
    
    //In order to get the control not being pushed up by the lower scrollbar,
    //make the scroll-pane height smaller
    var spWidth = $(".scroll-pane").css("width", $(window).width()),
        spHeight = $(".scroll-pane").css("height", $(window).height() - ($("#controls").height() * 2));
    
    var scWidth = $(".scroll-content").css("width", $("#canvas").width()),
        scHeight = $(".scroll-content").css("height", $("#canvas").height());
    
    var vBarHeight = $(".scroll-bar-vertical").height( 
            ($('.scroll-pane').height() - $("#controls").height()));
    
    var vscrollbar = $(".scroll-bar-vertical").slider({
        orientation: 'vertical',
        value: 100,
        slide: function(event, ui) {
        if ( scrollContent.height() > scrollPane.height() ) {
            scrollContent.css( "margin-top", Math.round(
                (100 - ui.value)/ 100 * ( scrollPane.height() - scrollContent.height() )
            ) + "px" );
            } else {
            scrollContent.css( "margin-top", 0 );
            }
        }
    });

    $(".scroll-bar").width($('.scroll-pane').width());
    
    var scrollbar = $( ".scroll-bar" ).slider({
        slide: function( event, ui ) {
        if ( scrollContent.width() > scrollPane.width() ) {
                scrollContent.css( "margin-left", Math.round( 
                    ui.value / 100 * ( scrollPane.width() - scrollContent.width() )
                ) + "px" );
            } else {
                scrollContent.css( "margin-left", 0 );
            }
        }
    });

//**********************************************************
    
  function connectNode(dir){
    var node, x, y;
    dir = dir.toLowerCase();
        
    if (dir == "left"){
      x = pathEnd.x + 5;
      y = pathEnd.y + topHeight - currentNode.height() / 2;
      
    }else if (dir == "right"){
      x = pathEnd.x - currentNode.width() - 5;
      y = pathEnd.y + topHeight - currentNode.height() / 2;
    }else if (dir == "top"){
      x = pathEnd.x - currentNode.width() / 2;
      y = pathEnd.y + topHeight + 5;
    }else if (dir == "bottom"){
      x = pathEnd.x - currentNode.width() / 2;
      y = pathEnd.y + topHeight - 5 - currentNode.height();
    }
    
 
    node = new Node(x, y, currentNode.width(), currentNode.height());
    saveConnection(node, dir);
    currentNode = node;
  }//end of connectNode
  
  function createConnection(a, conA, b, conB){
      var link = paper.path("M 0 0 L 1 1");
      link.attr({"stroke-width":2});
      link.parent = a[conA];
      
      a.addConnection(link);
      currentConnection = link;
      currentNode = a;
      saveConnection(b, conB);
  }
  
  function saveConnection(node, dir){
    if (!currentConnection) return;
    if (!currentConnection.parent) return;
    
    currentConnection.startNode = currentNode;
    currentConnection.endNode = node;
    currentConnection.startConnection = currentConnection.parent;
    currentConnection.endConnection = node[dir.toLowerCase()];
    
    currentConnection.id = connectionId;
    connections[connectionId] = currentConnection;
    connectionId++;
    
    currentNode.updateConnections();
    node.addConnection(currentConnection);
    
    //handle the effect of the connected line between
    //the two nodes when the mouse pointer is on the line
    //and away from the line.
    //when pointer click on the line, put up alert
    $(currentConnection.node).mouseenter(function(){
      this.raphael.attr("stroke","#FF0000");
    }).mouseleave(function(){
      this.raphael.attr("stroke","#000000");
    }).click(function(){
      if (confirm("Are you sure you want to delete this connection?")){
        this.raphael.remove();
        //connections uses raphael.id, so if this line is remove,
        //its id will be removed as well
        delete connections[this.raphael.id];
      }
    });
  }//end of saveConnection
  
  canvas.mousedown(function(e){
    if (menu.css("display") == "block"){
      if (e.target.tagName != "LI"){
        menu.hide();
        currentConnection.remove();
      }
    }
  });
  
  $(document).keydown(function(e){
    key[e.keyCode] = true;
  }).keyup(function(e){
    key[e.keyCode] = false;
  });
  
  $(document).mousemove(function(e){
    //initialize paper width and height
    //to the current size.
    //If the node is created beyond this area,
    //set paper's new size
    newPaperWidth = win.width(), 
        newPaperHeight = win.height();

    mouseX = e.pageX;
    mouseY = e.pageY - topHeight;
    if (mouseX > win.width())
    {
        newPaperWidth = mouseX;
    }
    if (mouseY > win.height())
    {
        newPaperHeight = mouseY;
    }
    
    if (newPaperWidth != win.width() 
    || newPaperHeight != win.height())
    {
        resizePaper(newPaperWidth, newPaperHeight);
    }

  }).mouseup(function(e){
    overlay.hide();
    var creatingNewNode = newNode;
    
    hitConnect.css({"left":mouseX - 5, "top":mouseY + topHeight - 5});
    for (var i in nodes){
      if (nodes[i]){
        var n = nodes[i];
        if (n != currentNode){
          var nLoc = n.content.position();
          if (hitTest(toGlobal(nLoc, n.left), hitConnect)){
            saveConnection(n, "left");
            newNode = false;
            break;
          }else if (hitTest(toGlobal(nLoc, n.top), hitConnect)){
            saveConnection(n, "top");
            newNode = false;
            break;
          }else if (hitTest(toGlobal(nLoc, n.right), hitConnect)){
            saveConnection(n, "right");
            newNode = false;
            break;
          }else if (hitTest(toGlobal(nLoc, n.bottom), hitConnect)){
            saveConnection(n, "bottom");
            newNode = false;
            break;
          }
        }
      }
    } //end of for loop
    hitConnect.css("left", "-100px");
    
    if (newNode){
      if (key[SHIFT]){
        menu.css({"left":mouseX - 10, "top":mouseY});
        menu.show();
      }else{
        var dir;
        var currDir = currentConnection.parent.attr("class");
        if (currDir == "left"){
          dir = "right";
        }else if (currDir == "right"){
          dir = "left";
        }else if (currDir == "top"){
          dir = "bottom";
        }else if (currDir == "bottom"){
          dir = "top";
        }
        
        if (pathEnd.x == undefined || pathEnd.y == undefined){
          currentConnection.remove();
        }else{
          connectNode(dir);
        }
      }
    }//end of newNode if statement
    newNode = false;
    
    for (var i in loops){
      clearInterval(loops[i]);
    }
    try{
      if (loops.length > 0) document.selection.empty();
    }catch(e){}
    loops = [];
    
    if (creatingNewNode) currentNode.txt[0].focus();
  }); //end of mouseDown and mouseUp
  
  function toGlobal(np, c){
    var l = c.position();
    return {position : function(){ return {left: l.left + np.left, top : l.top + np.top}; },
            width : function(){ return c.width(); },
            height : function(){ return c.height(); }};
  }
  
  //research about overlay
  //I believe it basically puts the
  //node on top of the trans.gif image
  function showOverlay(){
    overlay.show();
    overlay.css({"width" : win.width(), "height" : win.height()}); //, "opacity": 0.1});
  }
  
  function startDrag(element, bounds, dragCallback){
    showOverlay();
    var startX = mouseX - element.position().left;
    var startY = mouseY - element.position().top;
    if (!dragCallback) dragCallback = function(){};
      var id = setInterval(function(){
      var x = mouseX - startX;
      var y = mouseY - startY;
      if (bounds){
        if (x < bounds.left) x = bounds.left;
        if (x > bounds.right) x = bounds.right;
        if (y < bounds.top) y = bounds.top;
        if (y > bounds.bottom) y = bounds.bottom;
      }
      element.css("left", x).css("top",y);
      dragCallback();
    },topHeight);
    loops.push(id);
  }
  
  
  function Node(xp, yp, w, h, noDelete, forceId){
    
    if (forceId){
       nodeId = forceId;
    }
    this.id = nodeId;
    nodes[nodeId] = this;
    nodeId++;
    
    var curr = this;
    this.connections = {};
    var connectionIndex = 0;
    
    this.addConnection = function(c){
      curr.connections[connectionIndex++] = c;
      return c;
    }
    
    canvas.append("<div class='node'/>");
    var n = $(".node").last();
    n.css({"position" : "absolute",      
           "left" : xp, "top" : yp,
           "width" : w, "height" : h,   
           "border" : "1px solid gray",
           "background-color" : "white"});
    n.css("z-index", zindex++);
           
    this.content = n;
    
    this.width = function(){
      return n.width();
    }
    this.height = function(){
      return n.height();
    }
    this.x = function(){
      return n.position().left;
    }
    this.y = function(){
      return n.position().top;
    }
         
    var nodeWidth = n.width();
    var nodeHeight = n.height();
           
    //Create the top bar of the node
    n.append("<div class='bar'/>");
    var bar = $(".node .bar").last();
    bar.css({"height" : "10px", 
             "background-color" : "gray", 
             "padding" : "0", "margin": "0",
             "font-size" : "9px", "cursor" : "pointer"});
             
    if (!noDelete){
      //Create the cross sign on the node
      //for closing the node
      n.append("<div class='ex'>X<\/div>");
      var ex = $(".node .ex").last();
      ex.css({"position":"absolute","padding-right" : 2, "padding-top" : 1, "padding-left" : 2,
              "color" : "white", "font-family" : "sans-serif",
              "top" : 0, "left": 0, "cursor": "pointer",
              "font-size" : "7px", "background-color" : "gray", "z-index" : 100});
      ex.hover(function(){
        ex.css("color","black");
      }, function(){
        ex.css("color","white");
      }).click(function(){
      
        if (confirm("Are you sure you want to delete this node?")){
          curr.remove();
        }
      });
    }
    
    //Create the textarea for the node name
    n.append("<textarea class='name' spellcheck='false' />");
    var nName = $(".node .name").last();
    nName.css("position", "absolute");
    
    nName.css({"width" : nodeWidth - 5,
             "height" : "20px",
             "resize" : "none", "overflow" : "hidden",
             "left": 0, "top" : bar.height(),
             "font-size" : "12px" , "font-family" : "sans-serif",
             "border" : "1px solid gray","z-index":10});
    
    this.name = nName;
    
    //Create the textarea for the source code of this node class
    //if user wished to copy and paste in the code or write anything
    //wished.
    n.append("<textarea class='txt' spellcheck='false' />");
    var txt = $(".node .txt").last();
    txt.css("position","absolute");
   
    txt.css({"width" : nodeWidth - 5,
             "height" : nodeHeight - bar.height() - nName.height() - 10,
             "left": 0, "top" : bar.height() + nName.height() + 5,
             "resize" : "none", "overflow" : "hidden",
             "font-size" : "12px" , "font-family" : "sans-serif",
             "border" : "none","z-index":4});
          
    this.txt = txt;

    //Create the text src at the bottom of the node.
    //Once src is click, the source code of this node class
    //is opened in a different window if only if there is
    //source code exists in the source directory
    n.append("<div class='src'>SRC<\/div>");
    var srcPtr = $(".node .src").last();
    srcPtr.css({"position":"absolute", "z-index" : 10,
                "width" : nodeWidth/4, "height" : "10px",
                "left" : 0, "top" : nodeHeight - 11,
                "background-color" : "gray", "font-size" : "10px",
                "border" : "1px solid gray","font-family" : "sans-serif",
                "cursor" : "pointer"});
    srcPtr.hover(function(){
        srcPtr.css("color","black");
    }, function(){
        srcPtr.css("color","white");
    }).click(function(){
        //If the node name is entered, look into 
        //the URL for javascript with that name
        //and open window to show the source code.
        //Otherwise, alert user to enter the node name
        if (nName.val() != "")
        {
            //The src button of selected class node 
            cInput = nName.val();
            //Set the inherit functions and variables to be highlighted
            var inheritVarFunctArray = getHighlightText(cInput);
            //set the URL for the window.open
            var URL = "/myZnode/src/MainMenu/" + cInput + ".js";
            var newWin = window.open(URL, cInput);
            //set a timer to wait until the chile window is loaded
            //before processing the highlight.
            var loadTimer = self.setInterval(function() {setHighlightTerms(newWin, inheritVarFunctArray);}, 3000);
            setTimer(loadTimer);
        }
        else
        {
            alert("Enter Node Class Name");
        }
    });

    //Create the resizer box on the bottom right of the node
    n.append("<div class='resizer' />");
    var resizer = $(".node .resizer").last();
    
    resizer.css({"position" : "absolute" , "z-index" : 10,
                 "width" : "10px", "height" : "10px",
                 "left" : nodeWidth - 11, "top" : nodeHeight - 11,
                 "background-color" : "white", "font-size" : "1px",
                 "border" : "1px solid gray",
                 "cursor" : "pointer"});
    
    n.append("<div class='left'>");
    n.append("<div class='top'>");
    n.append("<div class='right'>");
    n.append("<div class='bottom'>");
    
    var left = $(".node .left").last();
    left.css("left","-11px");
    
    var top = $(".node .top").last();
    top.css("top","-11px");
    
    var right = $(".node .right").last();
    var bottom = $(".node .bottom").last();
    
    setupConnection(left);
    setupConnection(right);
    setupConnection(top);
    setupConnection(bottom);
    
    positionLeft();
    positionRight();
    positionTop();
    positionBottom();
    
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
    
    function positionLeft(){
      left.css("top", n.height() / 2 - 5);
    }
    function positionRight(){
      right.css("left",n.width() + 1).css("top", n.height() / 2 - 5);
    }
    function positionTop(){
      top.css("left", n.width() / 2 - 5);
    }
    function positionBottom(){
      bottom.css("top",n.height() + 1).css("left", n.width() / 2 - 5);
    }
    
    function setupConnection(div){
      div.css({"position" : "absolute", "width" : "10px", "padding":0,
               "height" : "10px", "background-color" : "#aaaaaa",
               "font-size" : "1px", "cursor" : "pointer"});
    }
    
    this.connectionPos = function(conn){
      var loc = conn.position();
      var nLoc = n.position();
      var point = {};
      point.x = nLoc.left + loc.left + 5;
      point.y = nLoc.top - topHeight + loc.top + 5;
      return point;
    }
    
    function updateConnections(){
       for (var i in curr.connections){
         var c = curr.connections[i];
         if (!c.removed){
           var nodeA = c.startNode.connectionPos(c.startConnection);
           var nodeB = c.endNode.connectionPos(c.endConnection);
           c.attr("path","M " + nodeA.x + " " + nodeA.y + " L " + nodeB.x + " " + nodeB.y);
            
         }
       }
    }
    this.updateConnections = updateConnections;
    
   //paper.path is from Rafael.js
   //This command creats a path element by given path
   //data string
   //uppercase command is absolute
   //lowercase command is relative
   //M = moveto
   //M 0 0 = command M with arguments (0,0)
   //L = lineto
   //L 1 1 = command L with arguments (1,1)
   function addLink(e){
      currentNode = curr;
      e.preventDefault();
      showOverlay();
    //draw a line by first move to 0,0
    //and ends the line at 1,1
      var link = paper.path("M 0 0 L 1 1");
    //stroke width in pixels, default is '1'
    //generate a line with 2 pixel width
      link.attr({"stroke-width":2});
      currentConnection = link;
      currentConnection.parent = $(this);
      
    //add the connection from this current node
    //to the new node
      curr.addConnection(link);
    //position of what? the link as the line
    //or the other node?
    //might have to put breakpoint and log to 
    //see what happen here
    //Maybe find out where the new node location?
      var loc = $(this).position();
      var nLoc = n.position();
      var x = loc.left + nLoc.left + 5;
      var y = loc.top + nLoc.top - topHeight + 5;
      newNode = true;
      
    //why use setInterval?
    //it is getting the node B x,y position
    //and connect the path end.
      var id = setInterval(function(){
        link.attr("path","M " + x + " " + y + " L " + mouseX + " " + mouseY);
        
        pathEnd.x = mouseX;
        pathEnd.y = mouseY;
      }, 30);
    
    //add the new id to the loops array
      loops.push(id);
   }
   
   //not sure what this does yet.
   left.mousedown(addLink);
   right.mousedown(addLink);
   top.mousedown(addLink);
   bottom.mousedown(addLink);
   
   //handle the "x" deletion of the node
   this.remove = function(){
     for (var i in curr.connections){
       var c = curr.connections[i];
       c.remove();
       delete connections[c.id];
       delete curr.connections[i];
     }
     n.remove();
     delete nodes[this.id];
   }
    
    resizer.mousedown(function(e){
      currentNode = curr;
      e.preventDefault();
      startDrag(resizer, {left : 20, top : 20, right : 500, bottom : 500},
      function(){
        var loc = resizer.position();
        var x = loc.left;
        var y = loc.top;
        n.css({"width" : x + resizer.width() + 1,
               "height" : y + resizer.height() + 1});
        
        nName.css({"width" : n.width() - 5, "height" : "20px"});
        
        txt.css({"width" : n.width() - 5, "height" : n.height() - bar.height() - nName.height() - 10});

        srcPtr.css({"width" : (x + resizer.width() + 1)/ 4, "height" : "10px",
                    "left" : 0, "top" : y - 1});
        
        positionLeft();
        positionRight();
        positionTop();
        positionBottom();
        updateConnections();
      });
    });
    
    //hanlde when the user drag the node on the bar
    //to move it around
    bar.mousedown(function(e){
      currentNode = curr;
      n.css("z-index", zindex++);
      e.preventDefault();
      startDrag(n, {left : 10, top: 40, right : win.width() - n.width() - 10, bottom : win.height() - n.height() - 10},
    //update the connection so it flows with it
      updateConnections);
    });
    
    //don't see any obvious effect
    n.mouseenter(function(){
      n.css("z-index", zindex++);
    });
    
  }//end of function node
  
  function hitTest(a, b){
    var aPos = a.position();
    var bPos = b.position();
    
    var aLeft = aPos.left;
    var aRight = aPos.left + a.width();
    var aTop = aPos.top;
    var aBottom = aPos.top + a.height();
    
    var bLeft = bPos.left;
    var bRight = bPos.left + b.width();
    var bTop = bPos.top;
    var bBottom = bPos.top + b.height();
    
    // http://tekpool.wordpress.com/2006/10/11/rectangle-intersection-determine-if-two-given-rectangles-intersect-each-other-or-not/
    return !( bLeft > aRight
      || bRight < aLeft
      || bTop > aBottom
      || bBottom < aTop
      );
  }
  
  
 function clear(){
    nodeId = 0;
    connectionsId = 0;
    for (var i in nodes){
        nodes[i].remove();
    }
  }
  
  this.clearAll = function(){
    clear();
    //defaultNode();
    currentConnection = null;
    currenNode = null;
  }
  
  this.addNode = function(x, y, w, h, noDelete){
    return new Node(x, y, w, h, noDelete);
  }
  
  var defaultWidth = 100;
  var defaultHeight = 80;
  
  this.addNodeAtMouse = function(){
    alert("Zevan");
    //var w = currentNode.width() || defaultWidth;
    //var h = currentNode.height() || defaultHeight;
    //var temp = new Node(mouseX, mouseY + 30, w, h);
    var temp = new Node(mouseX, mouseY + 30, defaultWidth, defaultHeight);
    temp.name[0].focus();  //focus the cursor in the node for node name input
    currentNode = temp;
    currentConnection = null;
  }
  
  this.createDefaultNode = function()
  {
    defaultNode();
  }
  
  function defaultNode(){
    
    /*
    * win.width and win.height varies 
    * depending how big or small you have the browser window.
    * defaultWidth = 100
    * defaultHeight = 50
    * create new node with xp, yp, w, h, noDelete = true, 
    */
        
    var temp = new Node(win.width() / 2 - defaultWidth / 2, 
                        win.height() / 2 - defaultHeight / 2,
                        defaultWidth, defaultHeight, true);
    temp.name[0].focus();  //focus the cursor in the node for text input
    //temp.txt[0].focus();  //focus the cursor in the node for text input
    currentNode = temp;
  }
  //defaultNode(); //call to create the default node

  this.fromJSON = function(data){
    //clear what is on the canvas prior to opening the 
    //selected file
    clear();
    //loop through all the data nodes of this saved json file
    //and build the graph out of the data
    for (var i in data.nodes){
        var n = data.nodes[i];
        //ex is the indicator for noDelete
        var ex = (i == "0") ? true : false;
        var temp = new Node(n.x, n.y, n.width, n.height, ex, n.id);
        //replace the node text string \n with '\n'
        var addNreturns = n.name.replace(/\\n/g,'\n');
        temp.name.val(addNreturns);   
        //replace the node text string \n with '\n'
        var addreturns = n.txt.replace(/\\n/g,'\n');
        temp.txt.val(addreturns);
    }
    //builds the connectors of the nodes
    for (i in data.connections){
      var c = data.connections[i];
    //get the data of the connector from node A to B
    //and which area to connect to left, right, top, bottom (conA/conB)
      createConnection(nodes[c.nodeA], c.conA, nodes[c.nodeB], c.conB);
    }
  }
  
  this.toJSON = function(){
    var json = '{"nodes" : [';
    for (var i in nodes){
      var n = nodes[i];
      json += '{"id" : ' + n.id + ', ';
      json += '"x" : ' + n.x() + ', ';
      json += '"y" : ' + n.y() + ', ';
      json += '"width" : ' + n.width() + ', ';
      json += '"height" : ' + n.height() + ', ';
      json += '"name" : "' + addSlashes(n.name.val()) + '", ';
      json += '"txt" : "' + addSlashes(n.txt.val()) + '"},';
    }
    json = json.substr(0, json.length - 1);
    json += '], "connections" : [';
    
    var hasConnections = false;
    for (i in connections){
      var c = connections[i];
      if (!c.removed){
      json += '{"nodeA" : ' + c.startNode.id + ', ';
      json += '"nodeB" : ' + c.endNode.id + ', ';
      json += '"conA" : "' + c.startConnection.attr("class") + '", ';
      json += '"conB" : "' + c.endConnection.attr("class") + '"},';
      hasConnections = true;
      }
    }
    if (hasConnections){
      json = json.substr(0, json.length - 1);
    }
    json += ']}';
    return json;
  }
  
  function addSlashes(str) {
    str = str.replace(/\"/g,'\\"');
    str = str.replace(/\\/g,'\\\\');
    str = str.replace(/\'/g,'\\\'');
    str = str.replace(/\0/g,'\\0');
    str = str.replace(/\n/g,'\\\\n');
    return str;
  }
  
  
  this.highlightText = function(searchWin, searchText)
  {
    setHighlightTerms(searchWin, searchText);
  }
  
  /*****************************************************************
   * setHighlightTerms and doHighlight functions are obtained from *
   * http://www.nsftools.com/misc/SearchAndHighlight.htm           *
   ****************************************************************/
  
  function setHighlightTerms(searchWin, searchText)
  {    
    //set the Highlight tags
    highlightStartTag = "<font style='color:blue; background-color:yellow;'>";
    highlightEndTag = "</font>";
    
    //The text array to be search
    searchArray = searchText.split(" ");
    
    if(!searchWin.document.body || typeof(searchWin.document.body.innerHTML) == "undefined")
    {
        alert("Sorry, search page is unavailable. Search failed.");
        return;
    }
    
    var bodyText = searchWin.document.body.innerHTML;
    for (var i = 0; i < searchArray.length; i++)
    {
        bodyText = doHighlight(bodyText, searchArray[i], highlightStartTag, highlightEndTag);
    }
    
    searchWin.document.body.innerHTML = bodyText;
    alert("Highlight completed");
    self.clearInterval(getTimer()); 
    
  }//end of setHighlightTerms
  
  //Update the html contents with the highlight tags
  function doHighlight(bodyText, searchTerm, highlightStartTag, highlightEndTag)
  {
    var newText = "";
    var i = -1;
    var lcSearchTerm = searchTerm.toLowerCase();
    var lcBodyText = bodyText.toLowerCase();

    while(bodyText.length > 0)
    {
        i = lcBodyText.indexOf(lcSearchTerm, i+1);
        console.log("bodyText length: " + bodyText.length + " i is: " + i);
        if(i < 0)
        {
            newText += bodyText;
            bodyText = "";
        }
        else 
        {
            newText += bodyText.substring(0,i) + highlightStartTag + bodyText.substr(i, searchTerm.length) + highlightEndTag;
            console.log("newText is: " + newText);
            bodyText = bodyText.substr(i + searchTerm.length);
            lcBodyText = bodyText.toLowerCase();
            i = -1;
        }
    }
    return newText;
  }//end of doHighlight
  
  //This function allows other files to access the data
  //in the NodeGraph class
  this.setLoadTimer = function(t)
  {
    setTimer(t);
  }
  
  function setTimer(t)
  {
    timerID = t;
  }
  
  function getTimer()
  {
    return timerID;
  }
  
  //This function define the list of inherited functions and variables
  //that will be highlighted for the inheritance view.
  function getHighlightText(cName)
  {
    if (cName == "VisualGameObject")
    {
        inheritData = "GameObject this.x this.y this.zOrder this.startupGameObject this.shutdownGameObject this.shutdown";
    }
    else if (cName == "RepeatingGameObject" || cName == "MainMenu" || cName == "AnimatedGameObject")
    {
        inheritData = "this.x this.y this.zOrder this.startupGameObject this.shutdownGameObject this.startupVisualGameObject this.draw this.shutdownVisualGameObject this.shutdown this.collisionArea";
    }
    else 
    {
        inheritData = "this.x this.y this.zOrder this.image this.currentFrame this.timeBetweenFrames this.timeSinceLastFrame this.frameWidth this.startupVisualGameObject this.draw this.shutdownVisualGameObject this.shutdown this.collisionArea this.startupAnimatedGameObject this.setAnimation this.draw this.shutdown this.collisionArea";
    }
    
    return inheritData;
  }//end of getHighlightText
  
  
  //Put together the specific classes' functions and variables
  //needed to be hightlighted for the composition view
  this.composeClass = function(childWin, classname)
  {
    //Define the including composition class functions and variables
    //that will need to be highlighted
    
    var highlightText = "";

    switch(classname)
    {        
        case "AnimatedGameObject":
            highlightText = "this.currentFrame this.timeBetweenFrames this.timeSinceLastFrame this.frameWidth startupAnimatedGameObject setAnimation draw shutdown collisionArea";
            setHighlightTerms(childWin, highlightText);
            break;
        case "ApplicationManager":
            highlightText = "startupApplicationManager startLevel openMainMenu updateScore this.canvasWidth this.canvasHeight";
            setHighlightTerms(childWin, highlightText);
            break;            
        case "GameObject":
            highlightText = "this.zOrder this.x this.y startupGameObject shutdownGameObject shutdown";
            setHighlightTerms(childWin, highlightText);
            break;
        case "GameObjectManager":
            highlightText = "this.loadingScreenColspeed this.loadingScreenColDirection this.loadingScreenCol this.resourcesLoaded this.canvasSupported this.backBufferContext2D this.backBuffer this.context2D this.canvas this.yScroll this.xScroll this.lastFrame this.removeGameObjects this.addedGameObjects this.gameObjects removeGameObject removeOldGameObjects keyDown keyUp addNewGameObjects addGameObject shutdownAll draw startupGameObjectManager";
            setHighlightTerms(childWin, highlightText);
            break;
        case "Level":
            highlightText = "this.block this.powerup this.blockWidth this.blockHeight startupLevel addBlocks addPowerups currentBlock groundHeight";
            setHighlightTerms(childWin, highlightText);
            break;
        case "LevelEndPost":
            highlightText = "startupLevelEndPost shutdown shutdownLevelEndPost update";
            setHighlightTerms(childWin, highlightText);
            break;
        case "MainMenu":
            highlightText = "startupMainMenu keyDown";
            setHighlightTerms(childWin, highlightText);
            break;
        case "Player":
            highlightText = "this.jumpHeight this.halfPI this.jumpHangTime this.jumpSinWaveSpeed this.jumpSinWavePos this.fallMultiplyer this.grounded this.speed this.left this.right this.screenBorder startupPlayer keyDown keyUp updateAnimation update";
            setHighlightTerms(childWin, highlightText);
            break;
        case "Powerup":
            highlightText = "this.value this.sineWavePos this.bounceTime this.bounceHeight startupPowerup shutdownPowerup shutdown update";
            setHighlightTerms(childWin, highlightText);
            break;
        case "Rectangle":
            highlightText = "this.left this.top this.width this.height startupRectangle intersects";
            setHighlightTerms(childWin, highlightText);
            break;
        case "RepeatingGameObject":
            highlightText = "this.width this.height this.scrollFactor startupRepeatingGameObject shutdownstartupRepeatingGameObject draw drawRepeat";
            setHighlightTerms(childWin, highlightText);
            break;
        case "ResourceManager":
            highlightText = "startupResourceManager this.imageProperties";
            setHighlightTerms(childWin, highlightText);
            break;
        case "VisualGameObject":
            highlightText = "startupVisualGameObject draw shutdownVisualGameObject shutdown collisionArea this.image";
            setHighlightTerms(childWin, highlightText);
            break;
        default:
            alert("Invalid class name entered.  Search failed!");
            break;
    }//end of switch
  }//end of composeClass
}//end of NodeGraph