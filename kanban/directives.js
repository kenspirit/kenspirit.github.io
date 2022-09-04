angular.module('kanban.directives', [])
  .directive('kanbanCard', function() {
    return {
      restrict: 'E',
      replace: true,
      scope: {dataset: '='},
      templateUrl: 'card.html',
      link: function(scope) {
        scope.isAllChildsCompleted = function() {
          var tmp = scope.dataset.childs || [];
          return tmp.some(function(child) {
              return child.isCompleted === false;
            }) || scope.dataset.isCompleted;
        };
      }
    };
  })
  .directive('kanbanBoard', function() {
    return {
      restrict: 'E',
      replace: true,
      scope: {dataset: '='},
      templateUrl: 'board.html',
      link: function(scope) {
        scope.isAllChildsCompleted = function(card) {
          var tmp = card.childs || [];
          return tmp.some(function(child) {
              return child.isCompleted === false;
            }) || card.isCompleted;
        };

        scope.getLaneName = function(lane) {
          return lane.name + (lane.lane ? ' (' + lane.lane.name + ')' : '');
        };

        scope.buildBoardInfo = function(board, stage, lane) {
          return {
            id: board.id,
            isChildBoard: !!board.isChildBoard,
            stage: stage,
            lane: lane,
          };
        };

        function isLaneMatched(lane, card) {
          return (card[lane.fieldName] === lane.name)
            || (lane.isDefault && !card[lane.fieldName]);
        }

        scope.getCards = function(cards, boardInfos) {
          if (!cards) {
            return null;
          }

          return cards.filter(function(card) {

            if (!boardInfos) {
              return true;
            }

            return boardInfos.every(function(boardInfo) {
                var isMatched = true, lane = boardInfo.lane;

                if (card.kanbanStages) {
                  var status = card.kanbanStages[boardInfo.id];
                  if (!status) {
                    return isMatched;
                  }

                  if (status.stage !== boardInfo.stage.name) {
                    isMatched = false;
                  }
                } else if (boardInfo.isChildBoard) {
                  if (boardInfo.stage.isDefault) {
                    card.kanbanStages = {}; // Init the card to the default stage
                    card.kanbanStages[boardInfo.id] = {
                      stage: boardInfo.stage.name
                    };
                  } else {
                    isMatched = false;
                  }
                }

                if (isMatched && lane) {
                  isMatched = isLaneMatched(lane, card);

                  if (isMatched && lane.lane) {
                    isMatched = isLaneMatched(lane.lane, card);
                  }
                }

                return isMatched;
              });
          });
        };

        scope.getChildCardsByLane = function(cards, boardInfos, sublane) {
          if (!cards) {
            return null;
          }

          var childs = [],
              matchedCards = scope.getCards(cards, boardInfos);

          matchedCards.forEach(function(card) {
            if (!card.childs) {
              return;
            }

            card.childs.forEach(function(child) {
              if (isLaneMatched(sublane, child)) {
                childs.push(child);
              }
            });
          });

          return childs;
        };

        scope.getChildCardsByStage = function(cards, mainBoard, subBoard) {
          if (!cards) {
            return null;
          }

          var childs = [],
              matchedCards = scope.getCards(cards, mainBoard);

          matchedCards.forEach(function(card) {
            if (!card.childs) {
              return;
            }

            var matchedChilds = scope.getCards(card.childs, subBoard);
            if (matchedChilds && matchedChilds.length > 0) {
              childs = childs.concat(matchedChilds);
            }
          });

          return childs;
        };

        scope.updateCard = function($data, $channel, $event) {
          scope.$emit('CARD_UPDATE', scope.dataset.id, $data.id, $event.target.id);
        };

        scope.updateChildCardLane = function($data, $channel, $event) {
          scope.$emit('CHILD_LANE_UPDATE', scope.dataset.id, $data.parent, $data.id, $event.target.id);
        };

        scope.updateChildCardStage = function($data, $channel, $event) {
          scope.$emit('CHILD_CARD_UPDATE', scope.dataset.id, $data.parent, $data.id, $event.target.id);
        };

        scope.getColumnWidthCSS = function(laneCount) {
          return laneCount > 0 ? '' : 'colWidth';
        };

        scope.getUniqueStageId = function(boardInfos) {
          if (!boardInfos) {
            return '';
          }

          return boardInfos.map(function(boardInfo) {
            var ids = [boardInfo.id];
            ids.push(boardInfo.stage ? boardInfo.stage.name : '');

            var lane = boardInfo.lane, laneId = '';
            if (lane) {
              laneId = lane.fieldName + '-' + lane.name;
              if (lane.lane) {
                laneId += ':' + lane.lane.fieldName + '-' + lane.lane.name;
              }
            }
            ids.push(laneId);
            return ids.join(';');
          }).join('^');
        }
      }
    };
  });
