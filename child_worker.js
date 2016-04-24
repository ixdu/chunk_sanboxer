var duk = require('duktape'),
    util = require('util'),
    vm = require('vm');

function run_in_v8(code, func, data, context){
  var _code = code + '; return_value = ' + func + '(' + JSON.stringify(data) + ');';
//  console.log(_code);
  vm.runInNewContext(_code, vm.createContext(context));
  return context.return_value;
}

function run_in_duktape(code, func, arg, context){
  duk.run("somefunc", JSON.stringify(arg.data), arg.code, { console_log : console.log }, function(error, ret){
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
  process.send({ result : run_in_v8(msg.code, msg.entry, msg.data, { console_log : console.log })});
});