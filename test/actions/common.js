var eventRunner = require('../../src/core/event')
var pocketciv = require('../../src/core/pocketciv')
var PhaseContext = require('../../src/core/context').Context;

var engine = undefined;
var done = function() { throw "Nomplemented"; };
var deck = [];
var reduce = [];

var getContext = function(state) {
    engine = new pocketciv.EngineBuild();
    state && engine.init(state);
    
    engine.drawer = function(dde, done) { console.log(deck); done(deck.shift()) }
    engine.reducer = function(rdc, done) {
        var r = reduce.shift();
        var ok = rdc.ok(r);
        if (ok.ok)
            done(ok);
        else {
            throw "NotOK";
        }
    }
    
    var ctx = new PhaseContext(engine);
    ctx.done = function() {
        done.call(this);
    };
    return ctx;
}

module.exports = {
    done: function(newdone) {
        done = newdone;
    },
    deck: deck,
    reduce: reduce,
    engine: engine,
    runAction: function(action, state) {
        var ctx = getContext(state)
        action.run.call(engine, ctx);
    }
}