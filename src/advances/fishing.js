var reducer = require("../core/reducer");
var _ = require('underscore')

module.exports = {
    name: "fishing",
    title: "Fishing",
    description: "Must be acquired by a City in a Region that borders the Sea. \
Cities that border the Sea do not need to check for Farm support during Upkeep. \
You may move your Tribes between any Regions that \
border the Sea at the cost of 1 Tribe.",
    points: 6,
    cost: { 'tribes': 6 },
    resources: [ 'wood' ],
    requires: [ ],
    required_by: [ 'shipping' ],
    events: { },
    can_acquire: function(area, engine) {
        return engine.isSeaNeighbour(area, "fishing");
    },
    phases: {
        'city_support.pre': function(ctx) {
            var areas = this.map.areas;
            ctx.supported = ctx.supported || [];
            _.each(areas, function(a, ak) {
                if (this.isSeaNeighbour(a, "fishing"))
                    ctx.supported.push(ak);
            },this);
            ctx.done && ctx.done();
        }
    },
    acquired: function() {
        this.params.sea_move = true;
        this.params.sea_cost = this.params.sea_cost == 0 ? 0 : 1;
    },
    actions: { },
}