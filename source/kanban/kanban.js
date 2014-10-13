var app = angular
  .module('Kanban', ['kanban.directives', 'ngDragDrop'])
  .config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('$$');
    $interpolateProvider.endSymbol('$$');
  })
  .controller('MainCtrl', ['$scope',
    function($scope) {
      $scope.SampleBoardAndCards1 = SampleBoardAndCards1;

      $scope.SampleBoardAndCards2 = SampleBoardAndCards2;

      $scope.SampleBoardAndCards3 = SampleBoardAndCards3;

      function filterCardById(cards, id) {
        return cards.filter(function(card) {
          if (card.id == id) {
            return true;
          }
          return false;
        })
      }

      $scope.$on('CARD_UPDATE', function(event, dataId, cardId, stageUniqueId) {
        if (!stageUniqueId) {
          return;
        }

        var boardInfos = stageUniqueId.split('^'),
            data = eval('$scope.SampleBoardAndCards' + dataId),
            card = filterCardById(data.cards, cardId);

        if (card.length <= 0) {
          return;
        }

        boardInfos.forEach(function(boardInfo) {
          var info = boardInfo.split(';');

          if (!card[0].kanbanStages[info[0]]) {
            card[0].kanbanStages[info[0]] = {};
          }
          card[0].kanbanStages[info[0]].stage = info[1];
        });
      });

    $scope.$on('CHILD_LANE_UPDATE', function(event, dataId, parentId, childId, stageUniqueId) {
      if (!stageUniqueId) {
        return;
      }
      var boardInfos = stageUniqueId.split('^'),
          data = eval('$scope.SampleBoardAndCards' + dataId),
          card = filterCardById(data.cards, parentId);

      if (card.length <= 0) {
        return;
      }

      var child = filterCardById(card[0].childs, childId);
      if (child.length <= 0) {
        return;
      }

      boardInfos.forEach(function(boardInfo) {
        var info = boardInfo.split(';');
        if (!info[2]) {
          return;
        }

        var lanes = info[2].split(':');
        lanes.forEach(function(lane) {
          var laneInfo = lane.split('-');
          if (child[0][laneInfo[0]]) {
              child[0][laneInfo[0]] = laneInfo[1];
          }
        });
      });

    });

    $scope.$on('CHILD_CARD_UPDATE', function(event, dataId, parentId, childId, stageUniqueId) {
      if (!stageUniqueId) {
        return;
      }
      var boardInfos = stageUniqueId.split('^'),
          data = eval('$scope.SampleBoardAndCards' + dataId),
          card = filterCardById(data.cards, parentId);

      if (card.length <= 0) {
        return;
      }

      var child = filterCardById(card[0].childs, childId);
      if (child.length <= 0) {
        return;
      }

      boardInfos.forEach(function(boardInfo) {
        var info = boardInfo.split(';');

        if (child[0].kanbanStages[info[0]]) {
          child[0].kanbanStages[info[0]].stage = info[1];
        }
      });

    });
  }]);
