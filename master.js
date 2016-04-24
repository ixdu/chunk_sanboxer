var child_process = require('child_process');


var fork = require('child_process').fork;
var example1 = fork(__dirname + '/nitchild.js');

example1.on('message', function(response) {
  console.log('PARENT', response);
});

var data = {
  hom : "Hah HAh"
};
 
var script = " \
  function somefunc(obj) { \
    console_log(\"dd\", obj.hom);\
  }";

//    return { \
  //    value: hello(obj.msg), \
 //     extra: 'bye ' + obj.num \
 //   }; \

example1.send({ code : script, 
		entry : 'somefunc', 
		arg : data 
	      });

setTimeout(function(){
	     example1.kill("SIGKILL");
	     console.log('finish');
}, 400);

//bases/b221/collections/vasya
/*
var bcontainer = get_base_container('t221.b221');
var _res = new responder(res);
bcontainer.process_quesy(req, _res);
*/

