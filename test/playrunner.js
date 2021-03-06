var pocketciv = require("../src/core/pocketciv")
var playFile = process.argv[2];
var play = require("./plays/" + playFile)
var _ = require("underscore")
var expect = require("chai").expect
var runplay = require("../src/core/runplay")

var engine = new pocketciv.EngineBuild();

function check(final, chk, path) {
    if (!path) path = "";
    _.each(chk, function(v, k) {
        mpath = path + '-' + k;
        if (_.isObject(v)) check(final[k], v, mpath);
        else {
            if (v[0] == "X") eval("expect(final[k], mpath)" + v.substring(1))
            else expect(final[k], mpath).to.equal(v);
        }
    })
}

try {
    if (typeof play.scenario === "string")
        play.scenario = require(play.scenario)
    runplay.run(engine, play);
}
catch (e) {
    if (typeof e == 'string' && (e == "END" || e.indexOf("Not implemented") > -1)) {
        console.log("ENDED");
        console.log(engine.map)
        if (play.check)
        {
            console.log('-- Checking');
            check(engine, play.check);
            console.log('-- Checked!');
        }
    }
    else throw e
}