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


var pool = new master.pool;

var data = {
  message : "Om nom"
};
var worker = pool.take();

function simple_test(){
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

function heavy_test(){
  var ind = 0;
  while(ind != 50){
    var worker = pool.take();
    console.log('started ', ind);
    worker.exec(script, 'somefunc', data, 2000, function(err, msg){
		   console.log('PARENT receinving', msg, err);
		 });  
    ind++;
  }
}

heavy_test();
