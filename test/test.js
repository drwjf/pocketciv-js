/*
if (!module.parent){
    (new(require("mocha"))()).ui("exports").reporter(function(r){
        var i = 1, n = r.grepTotal(r.suite);
        r.on("fail", function(t){ console.log("\x1b[31m[%d/%d] %s FAIL\x1b[0m", i++, n, t.fullTitle()); });
        r.on("pass", function(t){ console.log("\x1b[32m[%d/%d] %s OK\x1b[0m", i++, n, t.fullTitle()); });
        r.on("pending", function(t){ console.log("\x1b[33m[%d/%d] %s SKIP\x1b[0m", i++, n, t.fullTitle()); });
    }).addFile(__filename).run(process.exit);
}*/

var Mocha = require('mocha'); //The root mocha path 
var fs = require('fs');
var path = require('path');

var mocha = new Mocha();

var passed = [];
var failed = [];

function addDir(dir) {
// Here is an example:
fs.readdirSync(dir).filter(function(file){
    // Only keep the .js files
    return file.substr(-3) === '.js';

}).forEach(function(file){
    // Use the method "addFile" to add the file to mocha
    mocha.addFile(
        path.join('./'+dir, file)
    );
});
}

addDir('test/events')
addDir('test/advances')
addDir('test/actions')
addDir('test/core')

mocha.run(function(){

    console.log(passed.length + ' Tests Passed');
    /*
    passed.forEach(function(testName){
        console.log('Passed:', testName);
    });
    */

    console.log("\n"+failed.length + ' Tests Failed');
    /*
    failed.forEach(function(testName){
        console.log('Failed:', testName);
    });
    */

}).on('fail', function(test){
    failed.push(test.title);
}).on('pass', function(test){
    passed.push(test.title);
});
