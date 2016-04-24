var duk = require('duktape'),
    util = require('util'),
    vm = require('vm');

function run_in_v8(code, func, arg, context){
  var _code = code + ';' + func + '(' + JSON.stringify(arg) + ');';
  console.log(_code);
  vm.runInNewContext(_code, vm.createContext(context));
//  console.log(util.inspect(context));
}

function run_in_duktape(code, func, arg, context){
  duk.run("somefunc", JSON.stringify(arg.arg), arg.code, { console_log : console.log }, function(error, ret){
	    if(error) {
	      console.log("got error: " + ret);
	    } else {
//	      var retVal = JSON.parse(ret);
//	      console.log('ret value ', retVal.value);
//	      console.log('ret extra ', retVal.extra);
	    }
	  });  
}

function cons(msg){
  console.log('ddddd' + msg);
}

process.on('message', function(msg) {
  run_in_v8(msg.code, msg.entry, msg.arg, { console_log : console.log });
});