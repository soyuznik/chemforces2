

var path = require('path');
var express = require('express');
var http = require('http');
var fs = require('fs');
const readline = require('readline');
const { createWorker } = require('tesseract.js');
var app = express();

var dir = path.join(__dirname, 'public');
app.use(express.static(dir));

app.get('/', function(req, res) {
    const folderPath = './public/database/';
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        console.error(err);
        res.statusCode = 500;
        res.end('Internal Server Error');
        return;
      }
      const imageFiles = files.filter(file => {
        const fileExtension = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png'].includes(fileExtension);
      });
	  app.post('/handle_scores', function(request, respond) {
    filePath = __dirname + '/public/ip_scores.txt';
    fs.writeFile(filePath, request.body, function () {
        respond.end();
    });
});
     const ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(':').pop();
      const randomIndex = Math.floor(Math.random() * imageFiles.length);
      const randomImage = imageFiles[randomIndex];
      var reactionText = "";
      (async () => {
        const worker = await createWorker('eng');
        const ret = await worker.recognize('./public/database/' + randomImage);
        await worker.terminate();
		reactionText = ret.data.text;
		app.get('/' + randomImage, function(req, res){
             res.send(reactionText);
        });
      })();
      res.setHeader('Content-Type', 'text/html');
      res.write('<!DOCTYPE html>');
      res.write('<html>');
      res.write('<head>');
      res.write(`<title>Random Image</title>
	            `);
      res.write(`</head>
	    <style>
table{
    font-family: Verdana,sans-serif;
    font-size: 15px;
    line-height: 1.5;
    color: #000!important;
    box-sizing: inherit;
    border-collapse: collapse;
    border-spacing: 0;
    width: 15%;
    display: table;
    border: 1px solid #ccc;
    margin: 20px 0;
    text-align: center;
    float:left;
}

.color_entry_list{
    -webkit-text-size-adjust: 100%;
    font-family: Verdana,sans-serif;
    font-size: 15px;
    line-height: 1.5;
    color: #000!important;
    border-collapse: collapse;
    border-spacing: 0;
    box-sizing: inherit;
    border-bottom: 1px solid #ddd;
    background-color: #E7E9EB;
}

.react_img{
    display: block;
  margin-left: auto;
  margin-right: auto;
}
</style>
	  
	  
	  `);
      res.write('<body onload="getscore_list()">');
      res.write(`
	  <div style="display: flex; justify-content: flex-end; position: relative;">
	  <svg width="1200" height="40" style="position: relative;">
         <rect id="boxing" width="1200" height="40" x="40" y="1" style="fill:rgb(0,0,0); position: relative;" />
  Sorry, your browser does not support inline SVG.  
</svg>
	  <img src="http://${ip}:80/database/${randomImage}" alt="Random Image" style="display: block;margin-left: auto;margin-right: 25%; z-index: -5; position: absolute; ">
	  </div>`);
	  res.write(`
	       <div class="center" style="display: flex; flex-flow: row; align-items: center; justify-content: center; margin-top: 20px; gap: 5px;">
		      <form>
			     <input id="TEXTINPUT1" style="width: 400px;"></input>
			  </form>
		      <button onclick="recognize()"> Send </button>
			  <button onclick="refresh()"> Continue </button>
			   <button onclick="move()"> Move Right </button>
			   <p id= "iscore"><i> Score: waiting </i></p>
			   
		   </div>
		 <div class="center" style="display: flex; justify-content: center; margin-top: 20px;"> 
		   <table id="placement_list" class="ws-table-all notranslate">
                  <tbody id="placement_tbody">
                  <th>Player</th>
                  <th>Score</th>
            </tbody>
			</table>
        </div>
		   
	  `);
	  res.write(`
	  <script>
	  function getanswer(){
		  var xmlHttp = new XMLHttpRequest();
         xmlHttp.open( "GET", "http://${ip}:80/${randomImage}", false ); 
    xmlHttp.send( null );
    return xmlHttp.responseText;
	  }
	  
	  
	  
	  function getscore_list(){
		  var xmlHttp = new XMLHttpRequest();
         xmlHttp.open( "GET", "http://${ip}:80/ip_scores.txt", false ); 
    xmlHttp.send( null );
    var text = xmlHttp.responseText;
	var list = document.getElementById('placement_list');
	var lines = text.split("\\n");
	for(var i = 0; i < lines.length; i++){
		var infos = lines[i].split(" ");
		let row = list.insertRow();
		row.insertCell().textContent = infos[0];
		row.insertCell().textContent = infos[1];
	}
	
	  }
	  
	  
	  function refresh() {
		  location.reload();
	  }
      function check_and_refresh() {
           refresh();
      }
	  function move() {
		   var box = document.getElementById('boxing');
           var currentX = parseFloat(box.getAttribute('x'));
           box.setAttribute('x', currentX + 30);
      }
	  function recognize(){
		  var texi = document.getElementById('TEXTINPUT1');
	      var dist = levenshtein(texi.value , getanswer());
		  var scorei = document.getElementById('iscore');
		  scorei.innerText = "Score " + (100 - dist);
		  var score__ = 100 - dist;
		  var current_ip = "not found";
		  fetch('https://api.ipify.org?format=json')
                .then(response => response.json())
                .then(data => {
                    current_ip = data.ip;
                })
                .catch(error => {});
		  var xmlHttp = new XMLHttpRequest();
         xmlHttp.open( "GET", "http://${ip}:80/ip_scores.txt", false ); 
    xmlHttp.send( null );
    var text = xmlHttp.responseText;
	var lines = text.split("\\n");
	var new_text = "";
	for(var i = 0; i < lines.length; i++){
		var infos = lines[i].split(" ");
		if(infos[0] == current_ip){
			var new_score = int(infos[1]) + score__;
	    }
		lines[i] = infos[0] + " " + new_score;
	  }
	  for(var i = 0; i < lines.length; i++){
		  new_text = new_text + lines[i] + "\\n";
	  }
	  var xmlHttp = new XMLHttpRequest();
      xmlHttp.open( "POST", "http://${ip}:80/handle_scores", false ); 
      xmlHttp.send(new_text);
	  var node = document.getElementById("placement_tbody");
while (node.children.length > 1) {
  console.log(node.lastChild.tagName);
  if(node.lastChild.tagName == "TH") continue;
  node.removeChild(node.lastChild);
}
	  getscore_list();
	  }
	  function levenshtein(s, t) {
           if (s === t) {
               return 0;
           }
           var n = s.length, m = t.length;
           if (n === 0 || m === 0) {
               return n + m;
           }
           var x = 0, y, a, b, c, d, g, h, k;
           var p = new Array(n);
           for (y = 0; y < n;) {
               p[y] = ++y;
           }
	       
           for (; (x + 3) < m; x += 4) {
               var e1 = t.charCodeAt(x);
               var e2 = t.charCodeAt(x + 1);
               var e3 = t.charCodeAt(x + 2);
               var e4 = t.charCodeAt(x + 3);
               c = x;
               b = x + 1;
               d = x + 2;
               g = x + 3;
               h = x + 4;
               for (y = 0; y < n; y++) {
                   k = s.charCodeAt(y);
                   a = p[y];
                   if (a < c || b < c) {
                       c = (a > b ? b + 1 : a + 1);
                   }
                   else {
                       if (e1 !== k) {
                           c++;
                       }
                   }
	       
                   if (c < b || d < b) {
                       b = (c > d ? d + 1 : c + 1);
                   }
                   else {
                       if (e2 !== k) {
                           b++;
                       }
                   }
	       
                   if (b < d || g < d) {
                       d = (b > g ? g + 1 : b + 1);
                   }
                   else {
                       if (e3 !== k) {
                           d++;
                       }
                   }
	       
                   if (d < g || h < g) {
                       g = (d > h ? h + 1 : d + 1);
                   }
                   else {
                       if (e4 !== k) {
                           g++;
                       }
                   }
                   p[y] = h = g;
                   g = d;
                   d = b;
                   b = c;
                   c = a;
               }
           }
	       
           for (; x < m;) {
               var e = t.charCodeAt(x);
               c = x;
               d = ++x;
               for (y = 0; y < n; y++) {
                   a = p[y];
                   if (a < c || d < c) {
                       d = (a > d ? d + 1 : a + 1);
                   }
                   else {
                       if (e !== s.charCodeAt(y)) {
                           d = c + 1;
                       }
                       else {
                           d = c;
                       }
                   }
                   p[y] = d;
                   c = a;
               }
               h = d;
           }
	       
           return h;
      }
	  </script>
	  
	  `);
      res.write('</body>');
      res.write('</html>');

      res.end();
	});
});




app.listen(80, function () {
    console.log('Listening on http://${ip}:80/');
});


