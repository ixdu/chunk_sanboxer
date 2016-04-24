var child_process = require('child_process');

var fork = require('child_process').fork;

function child(id, process){
  this.id = id,
  this.process = process;
}

child.prototype.exec = function(code, entry, data, timeout, callback){
  var self = this;
  this.cb = callback;
  this.process.on('message', function(msg){
		    if(msg.result)
		      self.cb(undefined, msg.result);
		    else
		      self.cb('error during execution');
		    self.free = true;
		    self.pool.put(self);
		  });
  this.process.send({ 
		      code : code,
		      entry : entry,
		      data : data
		    });

  setTimeout(function(){
	       if(!self.free){
		 self.cb('process killed because of long execution time');
		 self.pool.delete(self);
	       }
	       
	     }, timeout);
};

child.prototype.stop = function(){
  this.process.close();  
};

function workers_pool(){
  this.index = 0;
  this.free = {};
  this.busy = {};
};

workers_pool.prototype.take = function(){
  var worker;
  if(this.free.length)
    worker = this.free.shift();
  else 
    worker = new child(++this.index , fork(__dirname + '/child_worker.js'));
  this.busy[worker.id] = worker;
  worker.free = false;
  worker.pool = this;

  return worker;
};

workers_pool.prototype.put = function(worker){
  delete this.busy[worker.id];
  this.free[worker.id] = worker;
};

workers_pool.prototype.delete = function(worker){
  delete this.busy[worker.id];
  worker.process.kill("SIGKILL");  
};

var pool = new workers_pool;

var data = {
  hom : "Hah HAh"
};
 
var script = " \
  function somefunc(obj) { \
    console_log(\"dd\", obj.hom);\
    return { \
      value: 'HOHO' + obj.hom \
    }; \
  }";

var inf_script = " \
  function somefunc(obj) { \
    while(true) console_log('hahahUHAHA');\
    console_log(\"dd\", obj.hom);\
  }";


var worker = pool.take();

worker.exec(script, 'somefunc', data, 500, function(err, msg){
	      console.log('PARENT', msg, err);
	    });

var worker1 = pool.take();

worker1.exec(inf_script, 'somefunc', data, 1000, function(err, msg){
	      console.log('PARENT', msg, err);
	    });

var worker2 = pool.take();

worker2.exec(script, 'somefunc', data, 500, function(err, msg){
	      console.log('PARENT', msg, err);
	    });

