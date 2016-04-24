var duk = require('duktape'),
    util = require('util'),
    vm = require('vm');

function run_in_v8(code, func, data, context){
  var _code = code + '; return_value = ' + func + '(' + JSON.stringify(data) + ');';
  try{
    vm.runInNewContext(_code, vm.createContext(context));
    return { result : context.return_value };
  } catch (x) {
    return { error : x.toString()};
  }
}


function run_in_duktape(code, func, data, context){
  var _code = code + '; function starter(data){ return ' + func + '(JSON.parse(data)); }';
  try{
    return { result : duk.runSync("starter", JSON.stringify(data), _code, { console_log : console.log })};    
  } catch (x) {
    return { error : x.toString()};
  }
}

process.on('message', function(msg) {
	     //process.send(run_in_duktape(msg.code, msg.entry, msg.data, { console_log : console.log }));
	     process.send(run_in_v8(msg.code, msg.entry, msg.data, { console_log : console.log }));
});