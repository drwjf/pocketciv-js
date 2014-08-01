var should = require('chai').should()
var pocketciv = require('../core/pocketciv')
var event = require('../core/event')

describe('#example', function() {
    it("adds -- to a string", function() {
        pocketciv.example('hei').should.equal('hei--');
    })
});

describe('EventDeck', function() {
    describe('initialization', function() {
        beforeEach(function() {
            pocketciv.EventDeck.shuffle();
        });
        it('should create thirteen cards when shuffled', function() {
            pocketciv.EventDeck.cardsLeft.should.equal(13);
        });
        it('should return a different card when drawn', function() {
            var all = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
            var drawn = [];
            for (var i = 0; i < 13; i++)
            {
                var card = pocketciv.EventDeck.draw();
                card.id.should.be.within(1,16);
                drawn.push(card.id);
                pocketciv.EventDeck.cardsLeft.should.equal(12-i);
            }
        });
        it('should throw NoMoreCards exception if all cards are drawn', function(done) {
            for (var i = 0; i < 13; i++)
            {
                pocketciv.EventDeck.draw();
            }
            try {
                pocketciv.EventDeck.draw();
                fail();
            } catch (ex) {
                done();
            }
            //pocketciv.EventDeck.draw().should.throw(pocketciv.NoMoreCardsError);
        });
    });
});

describe('Map', function() {
    describe('tribes', function() {
        describe('movement', function() {
            beforeEach(function() {
                pocketciv.Map.areas = {
                        1: {
                            'tribes': 2,
                            'neighbours': [2]
                        },
                        2: {
                            'tribes': 2,
                            'neighbours': [1,3]
                        },
                        3: {
                            'tribes': 2,
                            'neighbours': [2]
                        }
                };
            });
            it('should move tribes from area to another', function() {
                pocketciv.Map.moveTribes({ 1: 1, 2: 3, 3: 2 });
                pocketciv.Map.areas[1].tribes.should.equal(1);
                pocketciv.Map.areas[2].tribes.should.equal(3);
                pocketciv.Map.areas[3].tribes.should.equal(2);
            });
        });
        describe('changes', function() {
            beforeEach(function() {
                pocketciv.Map.areas = {
                        1: {
                            'tribes': 2,
                        },
                };
            });
            it('should remove a tribe from area', function() {
                pocketciv.Map.removeTribe(1);
                pocketciv.Map.areas[1].tribes.should.equal(1);
            });
            it('should add a tribe to area', function() {
                pocketciv.Map.addTribe(1); // Area: 1
                pocketciv.Map.areas[1].tribes.should.equal(3);
            });
            it('should remove multiple tribes from area', function() {
                pocketciv.Map.removeTribe(1, 2);
                pocketciv.Map.areas[1].tribes.should.equal(0);
            });
            it('should add multiple tribes to area', function() {
                pocketciv.Map.addTribe(1, 5); // Area: 1
                pocketciv.Map.areas[1].tribes.should.equal(7);
            });
        })
    });
    describe('tribeCount', function() {
      it('should count tribes from areas', function() {
        var target = pocketciv.Map;
        target.areas = {
          4: { 'tribes': 5 },
          3: { tribes: 0 },
          2: { tribes: 4 },
          1: { },
        }
        target.tribeCount.should.equal(9);
      });
    });
});

describe('TribeMover', function() {
    describe('simple', function() {
        beforeEach(function() {
            map = {
                1: { 'neighbours': [2] },
                2: { 'neighbours': [1,3] },
                3: { 'neighbours': [2] },
            }
            mover = new pocketciv.TribeMover(map, 1);
        });
        it('case 1', function() {
            mover.init({ 1: 1, 2: 1, 3: 1 });
            mover.ok({ 1: 1, 2: 1, 3: 1 }).should.be.true;
        });
        it('case 2', function() {
            mover.init({ 1: 1, 2: 1, 3: 0 });
            mover.ok({ 1: 0, 2: 1, 3: 1 }).should.be.true;
        });
        it('case 3', function() {
            mover.init({ 1: 2, 2: 0, 3: 0 });
            mover.ok({ 1: 0, 2: 2, 3: 0 }).should.be.true;
            mover.ok({ 1: 1, 2: 1, 3: 0 }).should.be.true;
            mover.ok({ 1: 1, 2: 0, 3: 1 }).should.be.false;
        });
        it('case 4 - neighbour limit', function() {
            mover.init({ 1: 2, 2: 0, 3: 0 });
            mover.ok({ 1: 2, 2: 2, 3: 0 }).should.be.false;
            mover.ok({ 1: 0, 2: 0, 3: 0 }).should.be.false;
        });
    });
    describe('complex', function() {
        beforeEach(function() {
            //   1 - 2
            //        \
            //         3
            //        / \
            //       4 - 5
            map = {
                1: { 'neighbours': [2] },
                2: { 'neighbours': [1,3] },
                3: { 'neighbours': [2,4,5] },
                4: { 'neighbours': [3,5] },
                5: { 'neighbours': [3,4] },
            }
            mover = new pocketciv.TribeMover(map, 1);
        });
        it('case 1', function() {
            mover.init({ 1: 1, 2: 1, 3: 1, 4: 0, 5: 0 });
            mover.ok({ 1: 1, 2: 1, 3: 1, 4: 0, 5: 0 }).should.be.true;
            mover.ok({ 1: 0, 2: 1, 3: 1, 4: 1, 5: 0 }).should.be.true;
            mover.ok({ 1: 0, 2: 2, 3: 1, 4: 0, 5: 0 }).should.be.true;
            mover.ok({ 1: 0, 2: 3, 3: 0, 4: 0, 5: 0 }).should.be.true;
        });
        it('case 2', function() {
            mover.init({ 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 });
            mover.ok({ 1: 0, 2: 0, 3: 2, 4: 0, 5: 0 }).should.be.true;
            mover.ok({ 1: 0, 2: 0, 3: 1, 4: 1, 5: 0 }).should.be.true;
            mover.ok({ 1: 0, 2: 0, 3: 1, 4: 0, 5: 1 }).should.be.true;
            mover.ok({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 2 }).should.be.true;
        });
        it('case 3', function() {
            mover.init({ 1: 6, 2: 6, 3: 6, 4: 0, 5: 0 });
            mover.ok({ 1: 6, 2: 6, 3: 6, 4: 3, 5: 3 }).should.be.false;
        });
    });
    describe('big one', function() {
        beforeEach(function() {
            //       2 - 7
            //      / \ / \
            //     1 - 3 - 6
            //      \ / \ /
            //       4 - 5
            map = {
                1: { 'neighbours': [2, 3, 4] },
                2: { 'neighbours': [1, 3, 7] },
                3: { 'neighbours': [1, 2, 7, 6, 5, 4] },
                4: { 'neighbours': [1, 3, 5] },
                5: { 'neighbours': [3, 4, 6] },
                6: { 'neighbours': [3, 5, 7] },
                7: { 'neighbours': [2, 3, 6] },
            }
            mover = new pocketciv.TribeMover(map, 1);
        });
        it('case 1', function() {
            mover.init({ 1: 0, 2: 0, 3: 6, 4: 0, 5: 0, 6: 0, 7: 0 });
            mover.ok({ 1: 1, 2: 1, 3: 0, 4: 1, 5: 1, 6: 1, 7: 1 }).should.be.true;
        });
    });
    describe('with sea and frontier', function() {
        beforeEach(function() {
            //       1 - 2---------
            //      SEA / \
            //         /   3
            //        /   / \ FRONTIER
            //           4 - 5
            map = {
                1: { 'neighbours': [2, 'sea'] },
                2: { 'neighbours': [1, 3, 'sea', 'frontier'] },
                3: { 'neighbours': [2, 5, 4, 'frontier'] },
                4: { 'neighbours': [3, 5, 'frontier'] },
                5: { 'neighbours': [3, 4, 'frontier'] },
            }
            mover = new pocketciv.TribeMover(map, 1);
        });
        it('case 1', function() {
            mover.init({ 1: 0, 2: 0, 3: 6, 4: 0, 5: 0 });
            mover.ok({ 1: 0, 2: 3, 3: 0, 4: 2, 5: 1 }).should.be.true;
        });
        it('case 2', function() {
            mover.init({ 1: 6, 2: 6, 3: 6, 4: 0, 5: 0 });
            mover.ok({ 1: 6, 2: 6, 3: 6, 4: 3, 5: 3 }).should.be.false;
        });
    });
    describe('with undefined', function() {
        it('should work as they were 0', function() {
            map = { 1: { "id": 1, "neighbours": [ 2 ] },
                    2: { "id": 2, "neighbours": [ 1 ] }};
            mover = new pocketciv.TribeMover(map, 1)
            mover.init({ 1: undefined, 2: 1 })
            mover.ok({ 1: 1, 2: undefined }).should.be.true;
        })
    });
    describe('scenario 1', function() {
        beforeEach(function() {
            map = {
    "1": { "id": 1, "neighbours": [ 3, 4, 8, 'frontier' ], "forest": true },
    "2": { "id": 2, "desert": true, "neighbours": [ 3, 5, 8, 'sea', 'frontier' ]  },
    "3": { "id": 3, "desert": true, "neighbours": [ 1, 2, 4, 8, 'frontier' ], },
    "4": { "id": 4, "desert": true, "neighbours": [ 1, 3, 'frontier' ]  },
    "5": { "id": 5, "tribes": 1, "neighbours": [ 2, 7, 'sea' ], "mountain": true },
    "7": { "id": 7, "neighbours": [ 5, 8, 'sea' ], "forest": true },
    "8": { "id": 8, "neighbours": [ 1, 2, 3, 7, 'sea', 'frontier' ], "forest": true, "mountain": true }
            }
            mover = new pocketciv.TribeMover(map, 1);
        });
        it('first round', function() {
            mover.init({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 2, 7: 0, 8: 0 });
            mover.ok({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 2, 7: 0, 8: 0 }).should.be.true;
            mover.ok({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 1, 7: 1, 8: 0 }).should.be.true;
            mover.ok({ 1: 0, 2: 0, 3: 1, 4: 0, 5: 1, 7: 0, 8: 0 }).should.be.false;
        });
        it('second round', function() {
            mover.init({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 2, 7: 2, 8: 0 });
            mover.ok({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 2, 7: 2, 8: 0 }).should.be.true;
            mover.ok({ 1: 0, 2: 1, 3: 0, 4: 0, 5: 1, 7: 1, 8: 1 }).should.be.true;
            mover.ok({ 1: 0, 2: 0, 3: 1, 4: 0, 5: 1, 7: 1, 8: 1 }).should.be.false;
        })
        
    });
});

describe("Engine", function() {
    describe('populate', function() {
        beforeEach(function() {
            engine = pocketciv.Engine;
            engine.init({
                'era': 1
            });
            pocketciv.Map.areas = {
                    1: {
                        'tribes': 2,
                        'neighbours': [ 2, 3 ]
                    },
                    2: {
                        'tribes': 1,
                        'neighbours': [ 1, 3 ]
                    },
                    3: {
                        'tribes': 0,
                        'neighbours': [ 2, 1 ]
                    }
            };
            engine.areaChanger = function(changes, done)
            {
                done.call(engine);
            }
        });
        it('should populate', function() {
            engine.phase.should.equal("populate");
            engine.runPhase('populate');
            pocketciv.Map.areas[1].tribes.should.equal(3);
            pocketciv.Map.areas[2].tribes.should.equal(2);
            pocketciv.Map.areas[3].tribes.should.equal(0);
            engine.phase.should.equal("move");
            //engine.move();
            //engine.event();
            //engine.advance();
            //engine.upkeep();
        });
    });
    describe('move', function() {
        beforeEach(function() {
            engine = pocketciv.Engine;
            engine.init({
                'era': 1
            });
            pocketciv.Map.areas = {
                    1: {
                        'tribes': 2,
                        'neighbours': [ 2, 3 ]
                    },
                    2: {
                        'tribes': 1,
                        'neighbours': [ 1, 3 ]
                    },
                    3: {
                        'tribes': 0,
                        'neighbours': [ 2, 1 ]
                    }
            };
            engine.phase = "move";
        });
        it('should call mover', function() {
            engine.mover = function(situation, move) {
                situation[1].tribes.should.equal(2);
                situation[2].tribes.should.equal(1);
                move.call(engine, { 1: 1, 2: 2, 3: 0});
            }
            engine.phase.should.equal("move");
            engine.move(function () {
                pocketciv.Map.areas[1].tribes.should.equal(1);
                pocketciv.Map.areas[2].tribes.should.equal(2);
                pocketciv.Map.areas[3].tribes.should.equal(0);
                engine.phase.should.equal("event");
            });
        });
    });
    describe('event', function() {
        beforeEach(function() {
            engine = pocketciv.Engine;
            engine.init({
                'era': 1,
                'deck': {
                    'usedCards': [1, 2, 3, 4]
                }
            });
            pocketciv.Map.areas = {
                    1: {
                        'id': 1,
                        'tribes': 2,
                        'neighbours': [ 2, 3 ]
                    },
                    2: {
                        'id': 2,
                        'tribes': 1,
                        'neighbours': [ 1, 3 ]
                    },
                    3: {
                        'id': 3,
                        'tribes': 0,
                        'neighbours': [ 2, 1 ]
                    }
            };
            engine.areaChanger = function(changes, done) {
                console.log("test area change with")
                console.log(changes)
                done && done.call(engine);
            }
            engine.phase = "event";
            engine.events = {
                'test': {
                    name: "Test event",
                    description: "Reset tribe count to one on selected area",
                    steps: "{%; run() %}",
                    run: function(engine, event, done) {
                        engine.drawer(engine.deck, function(card) {
                            var area_id = card.circle;
                            if (engine.map.areas[area_id].tribes > 1)
                            {
                                engine.map.areas[area_id].tribes = 1;
                            }
                            done();
                        })
                    }
                },
                'steps_event': {
                    name: 'steps_event',
                    title: 'Famine',
                    punchline: 'Event is upon us!',
                    description: "",
                    steps: {
                    '1': "{%; area_card() %}",
                    '1.1': "{% cityNumber = '7' %}",
                    '2.1': "In Active Region, Decimate Tribes and Farms. Reduce City AV by 2. {% change({ tribes: '0', farm: true}) %}",
                    '-': '{% change.city = cityNumber; change.farm = farmValue %}',
                    '1.2': "{% farmValue = false %}",
                    },
                }
            }
            testdeck = [
                {
                    'circle': 1
                },
                {
                    'events': { 1: { name: 'test' } },
                }
            ]
            stepsdeck = [
                {
                    'circle': 1
                },
                {
                    'events': { 1: { name: 'steps_event' } },
                }
            ]
        });
        it('should call drawer', function() {
            engine.drawer = function(deck, drawn) {
                var card = deck.draw();
                card.events = { };
                drawn.call(engine, card);
            }
            engine.phase.should.equal("event");
            engine.event(function () {
                pocketciv.EventDeck.cardsLeft.should.equal(11);
                engine.phase.should.equal("advance");
            });
        });
    });
});

describe("AdvanceAcquirer", function() {
    beforeEach(function() {
        engine = pocketciv.Engine;
        engine.map.areas = {
            1: {
                'city': 2,
                'tribes': 4,
                'mountain': true,
                'farm': true,
                'forest': true
            },
            2: {
                'city': 0,
                'tribes': 6,
            },
            3: {
                'city': 1,
                'forest': true,
            }
        }
        engine.acquired = { 'adv1': undefined }
    });
    it('should return empty advances', function() {
        engine.advances = {
            'adv1': { cost: { 'tribes': 100 } }, //already acquired
            'adv2': { cost: { 'tribes': 100 } }
        };
        acquirer = new pocketciv.AdvanceAcquirer(engine);
        
        acquirer.possibleAdvances().should.deep.equal({
            'adv2': { 'areas': [] }
        });
    });
    it('should return possible advances with cities by tribes', function() {
        engine.advances = {
            'adv1': { cost: { } }, // Already acquired
            'adv2': {
                cost: { 'tribes': 3 }
            },
            'adv3': {
                cost: { 'tribes': 5 }
            }
        };
        acquirer = new pocketciv.AdvanceAcquirer(engine);
        acquirer.possibleAdvances().should.deep.equal({
            'adv2': { 'areas': ["1"] },
            'adv3': { 'areas': [] },
        });
    });
    it('should return advances with free cost', function() {
        engine.advances = {
            'adv1': { cost: { } }, // Already acquired
            'adv2': {
                cost: { 'tribes': 3 }
            },
            'adv3': {
                cost: { }
            }
        };
        acquirer = new pocketciv.AdvanceAcquirer(engine);
        acquirer.possibleAdvances().should.deep.equal({
            'adv2': { 'areas': ["1"] },
            'adv3': { 'areas': ["1", "3"] },
        });
    });
    it('should return advances after acquire and deacquire', function() {
        engine.advances = {
            'adv1': { cost: { } }, // Already acquired
            'adv2': {
                cost: { 'tribes': 3 }
            },
            'adv3': {
                cost: { }
            }
        };
        acquirer = new pocketciv.AdvanceAcquirer(engine);
        acquirer.possibleAdvances().should.deep.equal({
            'adv2': { 'areas': ["1"] },
            'adv3': { 'areas': ["1", "3"] },
        });
        acquirer.acquire('adv2', 1);
        acquirer.possibleAdvances().should.deep.equal({
            'adv3': { 'areas': ["3"] },
        });
        acquirer.deacquire('adv2');
        acquirer.possibleAdvances().should.deep.equal({
            'adv2': { 'areas': ["1"] },
            'adv3': { 'areas': ["1", "3"] },
        });
    });
    it('should follow the requirement tree', function() {
        engine.advances = {
            'adv1': { cost: { } }, // Already acquired
            'adv2': {
                cost: { 'tribes': 3 },
                requires: [ 'adv1' ]
            },
            'adv3': {
                cost: { },
                requires: [ 'adv2' ]
            },
            'adv4': {
                cost: { },
                requires: [ 'notexisting' ]
            }
        };
        acquirer = new pocketciv.AdvanceAcquirer(engine);
        acquirer.possibleAdvances().should.deep.equal({
            'adv2': { 'areas': ["1"] },
        });
        acquirer.acquire('adv2', 1);
        acquirer.possibleAdvances().should.deep.equal({
            'adv3': { 'areas': ["3"] },
        });
    });
    it('should follow the requirement tree with optional reqs', function() {
        engine.advances = {
            'adv1': { cost: { } }, // Already acquired
            'adv2': {
                cost: { 'tribes': 3 },
                requires: [ 'adv1' ]
            },
            'adv3': {  // Already acquired
                cost: { },
                requires: [ 'adv1' ]
            },
            'adv4': {
                cost: { },
                requires: [ [ 'adv1', 'adv2'], 'adv3' ]
            }
        };
        engine.acquired['adv3'] = undefined;
        acquirer = new pocketciv.AdvanceAcquirer(engine);
        acquirer.possibleAdvances().should.deep.equal({
            'adv2': { 'areas': ["1"] },
            'adv4': { 'areas': ["1","3"] },
        });
    });
    it('should return advances by resources', function() {
        engine.advances = {
            'adv1': { cost: { } }, // Already acquired
            'adv2': {
                cost: { 'tribes': 3 },
                resources: [ 'wood', 'food' ]
            },
            'adv3': {
                cost: { },
                resources: [ 'stone' ]
            }
        };
        acquirer = new pocketciv.AdvanceAcquirer(engine);
        acquirer.possibleAdvances().should.deep.equal({
            'adv2': { 'areas': ["1"] },
            'adv3': { 'areas': ["1"] },
        });
        
    });
});

describe('EventRunner', function() {
    beforeEach(function() {
        engine = pocketciv.Engine;
        runner = event.runEvent;
        engine.map.areas = {
            5: { id: 5 }
        }
    });
    describe('steps', function() {
        beforeEach(function() {
            engine.acquired = {}
        });
        it('should go through steps', function(done) {
            var ev = new function()
            {
                this.steps = {
                    '1': "{% active_region = 5 %}",
                    '2': "{% change({ 'tribes': '-1' }) %}"
                }
                return this;
            }();
            runner(engine, ev, {}, function(changes) {
                changes.should.deep.equal({ 5: { 'tribes': '-1'}});
                done();
            });
        });
        it('should merge the context', function(done) {
            var ev = new function()
            {
                this.steps = {
                    '1': "{% active_region = 10 %}",
                    '2': "{% run() %}",
                }
                this.run = function() {
                    this.active_region = 5;
                    this.change({ 'tribes': '-2'})
                }
                return this;
            }();
            runner(engine, ev, {}, function(changes) {
                changes.should.deep.equal({ 5: { 'tribes': '-2'}});
                done();
            });
        });
        it('should be able to use engine', function(done) {
            var ev = new function()
            {
                engine.gold = 5;
                this.steps = {
                    '1': "{% active_region = engine.gold %}",
                    '2': "{% change({ 'tribes': '-1' }) %}"
                }
                return this;
            }();
            runner(engine, ev, {}, function(changes) {
                changes.should.deep.equal({ 5: { 'tribes': '-1'}});
                done();
            });
        });
        it('should break if', function(done) {
            var ev = new function()
            {
                this.steps = {
                    '1': "{% active_region = 5 %}",
                    '2': "{% change({ 'tribes': '-1' }) %}",
                    '3': "{% break_if(active_region == 5) %}",
                    '4': "{% change({ 'tribes': '-5' }) %}",
                }
                return this;
            }();
            runner(engine, ev, {}, function(changes) {
                changes.should.deep.equal({ 5: { 'tribes': '-1'}});
                done();
            });
        });
        it('should support variables', function(done) {
            var ev = new function()
            {
                this.steps = {
                    '1': "{% var variable = 3 %}",
                    '2': "{% variable = 5 %}",
                    '3': "{% active_region = variable %}",
                    '4': "{% change({ 'tribes': '-1' }) %}",
                }
                return this;
            }();
            runner(engine, ev, {}, function(changes) {
                changes.should.deep.equal({ 5: { 'tribes': '-1'}});
                done();
            });
        });
        it('should sort the steps', function(done) {
            var ev = new function()
            {
                this.steps = {
                    '1.2': "{% active_region = 5 %}",
                    '1.1': "{% active_region = 3 %}",
                    '4': "{% change({ 'tribes': '-1' }) %}",
                }
                return this;
            }();
            runner(engine, ev, {}, function(changes) {
                changes.should.deep.equal({ 5: { 'tribes': '-1'}});
                done();
            });
        });
        it('should merge the advance steps', function(done) {
            var ev = new function()
            {
                this.name = "event1";
                this.steps = {
                    '1.2': "{% active_region = 4 %}",
                    '1.1': "{% active_region = 3 %}",
                    '4': "{% change({ 'tribes': '-1' }) %}",
                }
                return this;
            }();
            engine.acquired = {
                'adv1': {
                    'events': {
                        'event1': {
                            'steps': {
                                '2': "{% active_region = 5 %}",
                            }
                        }
                    }
                }
            }
            runner(engine, ev, {}, function(changes) {
                changes.should.deep.equal({ 5: { 'tribes': '-1'}});
                done();
            });
        });
        
    });
    it('should have area_card function', function(done) {
        engine.drawer = function(deck, done)
        {
            done({ 'circle': 5 });
        }
        engine.acquired = {}
        var ev = new function()
        {
            this.steps = {
                // {%; means that the step will call done by itself
                '1': "{%; area_card() %}",
                '4': "{% change({ 'tribes': '-1' }) %}",
            }
            return this;
        }();
        runner(engine, ev, {}, function(changes) {
            changes.should.deep.equal({ 5: { 'tribes': '-1'}});
            done();
        });
    });
})
