var should = require('chai').should()
var pocketciv = require('../pocketciv')

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
            var away = pocketciv.EventDeck.usedCards.slice(0);
            var drawn = [];
            for (var i = 0; i < 13; i++)
            {
                var card = pocketciv.EventDeck.draw();
                card.id.should.be.within(1,16);
                drawn.push(card.id);
                pocketciv.EventDeck.cardsLeft.should.equal(12-i);
            }
            var all = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
            drawn.should.have.members(all.filter(function(x) { return away.indexOf(x) < 0 }));
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
        });
        it('should populate', function() {
            engine.phase.should.equal("populate");
            engine.populate();
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
            engine.areaChanger = function(area, change, done) {
                done();
            }
            engine.phase = "event";
            engine.events = {
                'test': {
                    name: "Test event",
                    description: "Reset tribe count to one on selected area",
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
                    name: 'famine',
                    title: 'Famine',
                    punchline: 'Famine is upon us!',
                    description: "",
                    steps: {
                    '1': "{% area_card %}",
                    '2.1': "In {{ Active Region|area }}, Decimate Tribes and Farms. Reduce City AV by 2. {% change = { tribes: '0', farm: false, city: '-2' } %}",
                    '2.2': "{% if (adv(irrigation)) { %}2.2. If you have {{ adv:irrigation }}, do not Decimate Farms. Reduce City AV by 1 instead 2.{% change = { tribes: '0', city: '-1' } %}{% } %}",
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
        it('should call the event', function(done) {
            engine.drawer = function(deck, drawn) {
                var card = deck.draw();
                card = testdeck.pop();
                drawn.call(engine, card);
            }
            engine.phase.should.equal("event");
            engine.event(function () {
                pocketciv.EventDeck.cardsLeft.should.equal(10);
                // because testdeck card had circle: 1
                pocketciv.Map.areas[1].tribes.should.equal(1);
                pocketciv.Map.areas[2].tribes.should.equal(1);
                engine.phase.should.equal("advance");
                done();
            });
        });
        it('should do the steps', function(done) {
            engine.drawer = function(deck, drawn) {
                var card = deck.draw();
                card = stepsdeck.pop();
                drawn.call(engine, card);
            }
            engine.phase.should.equal("event");
            engine.event(function () {
                pocketciv.EventDeck.cardsLeft.should.equal(10);
                // because testdeck card had circle: 1
                pocketciv.Map.areas[1].tribes.should.equal(0);
                pocketciv.Map.areas[1].farm.should.equal(false);
                pocketciv.Map.areas[2].tribes.should.equal(1);
                engine.phase.should.equal("advance");
                done();
            });
        });
    });
});