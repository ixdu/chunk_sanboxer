var child_process = require('child_process');

var fork = require('child_process').fork;

function child(id, process){
  this.id = id,
  this.process = process;
}

child.prototype.exec = function(code, entry, data, timeout, callback){
  var self = this;
  this.cb = callback;
//  console
  this.process.on('message', function(msg){
		    if(msg.result)
		      self.cb(undefined, msg.result);
		    else
		      self.cb(msg.error);
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

module.exports.pool = workers_pool;

 

