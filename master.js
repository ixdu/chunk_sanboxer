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
		      self.cb(msg.error);
		    self.free = true;
		    self.pool.put(self);
		  });
  this.process.send({ 
		      code : code,
		      entry : entry,
		      data : data
		    });
  this.started_time = (new Date()).getTime();
  this.timeout = timeout;

  this.pool.checker_activate();
};

child.prototype.stop = function(){
  this.process.close();  
};

function workers_pool(){
  this.index = 0;
  this.free = [];
  this.busy = [];
};

workers_pool.prototype.checker_activate = function(){
  var self = this;
  if(!this.inverval)
    this.interval = setInterval(function(){
				  var ind, cur_time = (new Date).getTime(), child;
				  if(!self.busy.length){
				    clearInterval(self.interval);
				    self.interval = undefined;
				  }
				  for(ind in self.busy){
				    child = self.busy[ind]; 
				    if(child.started_time + child.timeout < cur_time){
				      child.cb('process killed because of long execution time');
				      self.delete(child);
				    }
				  }
				}, 500);

};

workers_pool.prototype.take = function(){
  var worker;
  if(this.free.length)
    worker = this.free.shift();
  else 
    worker = new child(++this.index , fork(__dirname + '/child_worker.js'));
  this.busy.push(worker);
  worker.free = false;
  worker.pool = this;

  return worker;
};

function delete_from_array(array, worker){
  var ind = array.length - 1;
  while(ind >= 0){
    if(array[ind].id == worker.id)
      array.splice(ind, 1);
    ind--;
  }
}

workers_pool.prototype.put = function(worker){
  delete_from_array(this.busy, worker);
  this.free.push(worker);
};

workers_pool.prototype.delete = function(worker){
  delete_from_array(this.busy, worker);
  console.log('length after ', this.busy.length);
  worker.process.kill("SIGKILL");  
};

module.exports.pool = workers_pool;

 

