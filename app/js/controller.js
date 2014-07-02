var pocketciv = require("../../pocketciv");
var pocketcivApp = angular.module('pocketcivApp', []);

function getMovement(areas) {
    return _.object(_.map(pocketciv.Map.areas, function (area, id) {
        return [id, area.tribes];
    }));
}

pocketcivApp.controller('MainGame', function ($scope) {
    pocketciv.Map.areas =
    {
    "1": {
        "id": 1,
        "tribes": 5,
        "neighbours": [ 2, 'sea' ],
        "forest": true
    },
    "2": {
        "id": 2,
        "tribes": 5,
        "neighbours": [ 1, 3, 'sea', 'frontier' ] 
    },
    "3": {
        "id": 3,
        "tribes": 5,
        "neighbours": [ 2, 4, 5, 'frontier' ],
        "farm": true,
        "forest": true
    },
    "4": {
        "id": 4,
        "tribes": 0,
        "neighbours": [ 3, 5, 'frontier' ] 
    },
    "5": {
        "id": 5,
        "tribes": 8,
        "city": 3,
        "neighbours": [ 3, 4, 'frontier' ] 
    }
    };
    $scope.map = pocketciv.Map;
    $scope.deck = pocketciv.EventDeck;
    
    var moveFunc = undefined;
    $scope.moveTribes = function() {
        var mover = new pocketciv.TribeMover(pocketciv.Map.areas);
        mover.init(getMovement(pocketciv.Map.areas));
        if (mover.ok($scope.movement))
        {
            console.log("OK MOVE!");
            moveFunc.call(pocketciv.Engine, $scope.movement);
            $scope.hideMover = true;
        } else {
            console.log("FAILED MOVE")
        }
    }
    $scope.hideMover = true;
    
    var drawnFunc = undefined;
    $scope.hideDrawer = true;
    $scope.drawCard = function() {
        $scope.card = $scope.deck.draw();
        $scope.card = pocketciv.EventDeck.specific(7);
        $scope.hideDrawer = true;
        drawnFunc.call(pocketciv.Engine, $scope.card);
    }
    
    pocketciv.Engine.mover = function(situation, move) {
        console.log("Show mover")
        $scope.movement = getMovement(situation);
        $scope.hideMover = false;
        moveFunc = move;
    }
    
    pocketciv.Engine.drawer = function(deck, drawn) {
        console.log("Show drawer")
        $scope.deck = deck;
        $scope.hideDrawer = false;
        drawnFunc = drawn;
    }
    
    $scope.areaChangeOk = function() {
        $scope.areaChange = undefined;
        areaChangeDone.call($scope.engine);
    }
    
    var areaChangeDone = undefined;
    pocketciv.Engine.areaChanger = function(changes, done) {
        $scope.areaChange = changes;
        areaChangeDone = done;
    }
    
    $scope.possibleAreas = []
    $scope.selectedArea = undefined;
    var areaSelect = undefined;
    $scope.selectArea = function() {
        areaSelect.call(pocketciv.Engine, $scope.selectedArea);
        $scope.possibleAreas = []
    }
    pocketciv.Engine.areaSelector = function(possibleAreas, select)
    {
        $scope.possibleAreas = possibleAreas;
        areaSelect = select;
    }
    
    $scope.engine = pocketciv.Engine;
    $scope.engine.phase = "advance";
    $scope.engine.era = 3
    $scope.engine.acquired = {
        'literacy': pocketciv.Advances['literacy'],
        'agriculture': pocketciv.Advances['agriculture'],
    }
});