var master = require('./master');

var script = " \
  function somefunc(obj) { \
    console_log(\"somefunc, i am receving: \" + obj.message);\
    return { \
      value: 'answer: ' + obj.message \
    }; \
  }";

var inf_script = " \
  function somefunc(obj) { \
    var ind = 0;\
    while(true) console_log('message ' + ind++ + obj.message);\
  }";


var pool = new master.pool(150);

var data = {
  message : "Om nom"
};

function simple_test(){
  var worker = pool.take();
  worker.exec(script, 'somefunc', data, 500, function(err, msg){
		console.log('PARENT receiving', msg, err);
	      });

  var worker1 = pool.take();

  worker1.exec(script, 'somefunc', data, 1000, function(err, msg){
		 console.log('PARENT receiving', msg, err);
	       });

  var worker2 = pool.take();

  worker2.exec(script, 'somefunc', data, 500, function(err, msg){
		 console.log('PARENT receinving', msg, err);
	       });  
}

var counter = 0;

function heavy_test(){
  var ind = 0;
  while(ind < 130){
    var worker = pool.take();
    //    console.log('started ', ind);
    data.message = "Om Nom " + counter++;
    worker.exec(script, 'somefunc', data, 5000, function(err, msg){
		  console.log('PARENT receinving', msg, err);
		});  
    ind++;
  }
}

heavy_test();

setTimeout(function(){
	     console.log('hot start');
	     heavy_test();
}, 3000);
setTimeout(function(){
	     console.log('hot start');
	     heavy_test();
}, 3200);
setTimeout(function(){
	     console.log('hot start');
	     heavy_test();
}, 3500);