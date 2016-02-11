
function DeckBuilder() {

    var self = this;

    self._init = function() {
        self._cards = [];
    };

    self.add = function(card) {
        self._cards.push(card);
        return this;
    };

    self.build = function() {
        return new Deck(self._cards);
    };

    self._init();
};

function Deck(cards) {
    
    var self = this;

    self._nodesById = {};
    self._firstNode = null;
    self._lastNode = null;
    self._nodeCount = cards.length;

    _getNode = function(self, id) {
        return self._nodesById[id] || null;
    };

    _getNodeId = function(node) {
        if(node === null) {
            return null;
        }
        return node.ids[0];
    };

    _getNextNode = function(node) {
        if(node === null) {
            return null;
        }
        return node.next;
    };
        
    _getPrevNode = function(node) {
        if(node === null) {
            return null;
        }
        return node.prev;
    };
        
    /**
     * Get the canonical slide id for the given id, or null if no such id exists.
     */
    self.getSlide = function(id) {
        return _getNodeId(_getNode(self, id));
    };

    /**
     * Get the canonical slide id for the slide after the given slide id. Null
     * if there is no next node, or if the given id was not found.
     */ 
    self.slideAfter = function(id) {
        return _getNodeId(_getNextNode(_getNode(self, id)));
    };

    self.slideBefore = function(id) {
        return _getNodeId(_getPrevNode(_getNode(self, id)));
    };

    self.firstSlide = function() {
        return _getNodeId(self._firstNode);
    };

    self.lastSlide = function() {
        return _getNodeId(self._lastNode);
    };

    /**
     * Renders the specified slide id to the given element.
     */
    self.render = function(id, ele) {
        var node = _getNode(self, id);
        if(node !== null) {
            node.card.render(ele);
        }
    };


    self._init = function() {
        if(cards.length < 1) {
            throw "Deck must have at least one card.";
        }

        function mapNodeToId(id, node) {
            if(id in self._nodesById) {
                throw "Duplicate card id: " + id;
            }
            self._nodesById[id] = node;
            node.ids.push(id);
        };

        function createNode(prev, idx, card) {
            var node = {
                prev: prev,
                next: null,
                card: card,
                ids: []
            };
            var ids = card.getIds();
            for(var i=0; i<ids.length; i++) {
                mapNodeToId("" + ids[i], node);
            }
            mapNodeToId("" + idx, node);
            return node;
        };

        var tail = createNode(null, 1, cards[0]);
        self._firstNode = tail;
        for(var i=1; i<cards.length; i++) {
            var next = createNode(tail, i+1, cards[i]);
            tail.next = next;
            tail = next;
        }
        self._lastNode = tail;
    };


    self._init();

}

