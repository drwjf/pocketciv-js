module.exports = {
    "title": "Scenario 3",
    "map": {
        "areas": {
            "1": {
                "id": 1,
                "desert": true,
                "neighbours": [ 3, 'sea', 'frontier'],
            },
            "2": {
                "id": 2,
                "tribes": 1,
                "desert": true,
                "forest": true,
                "neighbours": [ 7, 'sea'],
            },
            "3": {
                "id": 3,
                "mountain": true,
                "forest": true,
                "neighbours": [ 1, 5, 'sea', 'frontier'],
            },
            "4": {
                "id": 4,
                "desert": true,
                "neighbours": [ 'sea', 'frontier']
            },
            "5": {
                "id": 5,
                "forest": true,
                "neighbours": [ 3, 'sea', 'frontier'],
            },
            "7": {
                "id": 7,
                "tribes": 4,
                "city": 1,
                "forest": true,
                "mountain": true,
                "farm": true,
                "neighbours": [ 2, 'sea' ]
            },
        },
        "width": 9,
        "height": 9,
        "grid":[
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1, 7,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1, 2, 7,-1,-1,-1,-1,-1,-1,-1 ],
        [-1, 2, 2, 7, 7,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1, 2,-1,-1,-1, 4,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1, 0, 4, 4, 0, 0 ],
        [-1,-1, 5, 5, 3, 1, 0, 0, 4, 0, 0 ],
        [-1,-1, 0, 5, 3, 3, 1, 0, 0, 0, 0 ],
        [-1, 0, 0, 0, 5, 3, 1, 1, 0, 0, 0 ],
        [-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [-1,-1,-1,-1,-1, 0, 0, 0, 0, 0, 0 ],
        [-1,-1,-1,-1,-1,-1, 0, 0, 0, 0, 0 ],
        [-1,-1,-1,-1,-1,-1, 0, 0, 0, 0, 0 ],
        [-1,-1,-1,-1,-1,-1, 0, 0, 0, 0, 0 ],
        ] 
    }
}