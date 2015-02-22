var _ = require("underscore")

function getResources(area) {
    var ret = [];
    if (area.mountain || area.volcano)
        ret.push('stone');
    if (area.farm)
        ret.push('food');
    if (area.forest)
        ret.push('wood');
    return ret;
}

function AdvanceAcquirer(engine) {
    this.advances = _.omit(_.clone(engine.advances), engine.acquired);
    this.acquired = _.clone(engine.round.acquired) || {};
    this.nowacquired = {};
    this.acquired_names = _.clone(engine.acquired)
    this.amnt_of_acquird = _.union(_.map(engine.round.acquired, function(a) { return a.name; }), engine.acquired).length;
    this.areas = {};
    _.each(engine.map.areas, function(a, ak) {
        if (a.city > 0)
            this.areas[ak] = a;
    },this);
    this.gold = engine.gold;
}

AdvanceAcquirer.prototype = {
    possibleAdvances: function() {
        var adv = {};
        for (var key in _.omit(this.advances, this.acquired_names)) {
            // Check requirements
            if (_.has(this.advances[key], 'requires') && this.advances[key].requires) {
                var kk = _.keys(this.advances);
                var aq = this.acquired_names;
                var re = _.clone(this.advances[key].requires);

                // First, check optional requirements (either one must be required)
                // Remove them from re if they are satisfied
                var re = _.filter(re, function(r) {
                    if (!_.isArray(r)) return true;
                    return _.intersection(r, aq).length < 1;
                });
                // Check that all requirements are acquired
                if (!_.isEqual(_.intersection(aq, re), re)) {
                    continue;
                }
            }

            adv[key] = {
                'areas': []
            };

        if (_.reduce(this.areas, function(m, a) {return a.city ? m + a.city : m }, 0) > this.amnt_of_acquird)
        {
            for (var a in _.omit(this.areas, _.keys(this.acquired))) {
                // Check tribes
                var has_tribes = true;
                var has_resources = true;
                var has_gold = true;
                
                // Check tribes
                if ('tribes' in this.advances[key].cost) {
                    if (!(this.areas[a].tribes >= this.advances[key].cost.tribes))
                        has_tribes = false;
                }

                // Check resources
                if ('resources' in this.advances[key]) {
                    var area_resources = getResources(this.areas[a]);
                    if (!_.intersection(
                            area_resources, this.advances[key].resources).length ==
                        this.advances[key].resources.length) {
                        has_resources = false;
                    }
                }
                
                // Check gold
                if ('gold' in this.advances[key].cost) {
                    var total = _.reduce(this.nowacquired, function(memo, adva) {
                        return memo + (adva.cost.gold || 0)
                    }, 0);
                    if (this.gold < total + this.advances[key].cost.gold)
                        has_gold = false;
                }

                if (has_tribes && has_resources && has_gold)
                    adv[key].areas.push(a);
            }
        }
        }
        return adv;
    },
    acquire: function(name, area) {
        this.acquired[area] = this.advances[name];
        this.nowacquired[area] = this.advances[name];
        this.acquired_names.push(name);
    },
    deacquire: function(name) {
        for (var a in this.acquired)
        {
            if (this.acquired[a] == this.advances[name])
            {
                delete this.acquired[a];
            }
            if (this.nowacquired[a] == this.advances[name])
            {
                delete this.nowacquired[a];
                break;
            }
        }
        this.acquired_names.pop(name);
    }
}

module.exports = {
    title: "Acquire Advances",
    run: function() {
        var engine = this;
        engine.round.acquired = engine.round.acquired || {};
        engine.advanceAcquirer(engine, function(acquires) {
            console.log("ACQUIRING ")
            console.log(acquires)
            var changes = { };
            acquires = _.omit(acquires, _.keys(engine.round.acquired));
            for (var area in acquires)
            {
                if (_.has(acquires[area].cost, 'tribes'))
                    changes[area] = { 'tribes': '-'+acquires[area].cost.tribes };
                if (_.has(acquires[area].cost, 'gold'))
                    changes['gold'] = '-'+acquires[area].cost.gold;
            }
            engine.areaChange(changes, function() {
                _.each(_.values(acquires), function(a) {
                    engine.acquire(a.name);
                });
                engine.round.acquired = _.extend(engine.round.acquired, acquires);
            });
        });
    },
    AdvanceAcquirer: AdvanceAcquirer
}