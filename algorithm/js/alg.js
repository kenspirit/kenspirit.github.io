angular.module('alg.directives', [])
  .directive('barChart', function() {
    return {
      restrict: 'E',
      replace: true,
      scope: {dataset: '=', merge: '='},
      template: '<svg ng-attr-width="$$graph.width$$" ng-attr-height="$$graph.height$$">' +
        '    <rect ng-show="merge" ng-attr-style="$$data.bgStyle$$" ng-repeat="data in dataset"' +
        '        ng-attr-width="$$width()$$"' +
        '        ng-attr-height="$$height(data.bgVal)$$"' +
        '        ng-attr-x="$$x($index)$$"' +
        '        ng-attr-y="$$y(data.bgVal)$$">' +
        '    </rect>' +
        '    <rect ng-attr-style="$$data.style$$" ng-repeat="data in dataset"' +
        '        ng-attr-width="$$width()$$"' +
        '        ng-attr-height="$$height(data.val)$$"' +
        '        ng-attr-x="$$x($index)$$"' +
        '        ng-attr-y="$$auxY(data.val)$$">' +
        '    </rect>' +
        '</svg>',
      link: function(scope) {
        scope.graph = {
          width: 400,
          height: 200
        };

        scope.width = function() {
          return scope.graph.width / scope.dataset.length;
        };

        scope.height = function(data) {
          var max = 0;
          for (var i = 0; i < scope.dataset.length; i++) {
            if (parseInt(scope.dataset[i].val) > max) {
              max = parseInt(scope.dataset[i].val);
            }
          }

          if (scope.merge) {
            return data / max * scope.graph.height / 2;
          } else {
            return data / max * scope.graph.height;
          }
        };

        scope.x = function(index) {
          return index * scope.width();
        };

        scope.y = function(data) {
          return scope.graph.height - scope.height(data);
        };

        scope.auxY = function(data) {
          if (scope.merge) {
            return scope.y(data) - scope.graph.height / 2;
          } else {
            return scope.y(data);
          }
        };
      }
    };
  })
  .directive('barLegends', function() {
    return {
      restrict: 'E',
      replace: true,
      scope: {legends: '='},
      template: '<svg ng-attr-width="$$graph.width$$" ng-attr-height="$$graph.height$$">' +
        '  <text ng-repeat="legend in legends" ng-attr-x="0" ng-attr-y="$$y($index)$$" ng-attr-style="$$legend.style$$" font-family="Verdana" font-size="10">$$legend.text$$</text>' +
        '</svg>',
      link: function(scope) {
        scope.graph = {
          height: 200,
          width: 200
        };

        scope.y = function(index) {
          return index * 15 + 20;
        };
      }
    };
  });

angular.module('alg.services', [])
  .service('Shuffler', function() {
    var Shuffler = {};
    function shuffle(o) {
      for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x) {}
      return o;
    }
    Shuffler.shuffle = shuffle;
    return Shuffler;
  })
  .service('WordSplitter', function() {
    var Splitter = {
      split: function(word) {
        var sentence = '';
        for (var i = 0; i < word.length; i++) {
          var code = word.charCodeAt(i);
          if (code >= 'A'.charCodeAt(0) && code <= 'Z'.charCodeAt(0)) {
            sentence += ' ';
          }
          if (i === 0) {
            sentence += word.charAt(i).toUpperCase();
          } else {
            sentence += word.charAt(i);
          }
        }
        return sentence;
      }
    };
    return Splitter;
  });

angular.module('alg.services.sort', ['alg.services'])
  .factory('SortAlgBase', ['$rootScope', 'WordSplitter',
    function($rootScope, WordSplitter) {
      function SortAlgBase(name) {
        this.name = name;
        this.sortData = [];
        this.shadowData = [];
        this.scope = null;
        this.interval = -1;
        this.operationStacks = [];

        this.style = {
          default: 'fill:rgb(123, 123, 123);stroke:white;stroke-width:1',
          currentlySeen: 'fill:green;',
          smallestInLoop: 'fill:red;',
          nextToCompare: 'fill:blue;'
        };

      }

      SortAlgBase.prototype.getName = function() {
        return this.name;
      };

      SortAlgBase.prototype.apply = function() {
        setTimeout(function() {$rootScope.$apply();}, 1);
      };

      SortAlgBase.prototype.isLarger = function(items, srcIdx, targetIdx) {
        if (parseInt(items[srcIdx].val) > parseInt(items[targetIdx].val)) {
          return true;
        }
        return false;
      };

      SortAlgBase.prototype.isSmaller = function(items, srcIdx, targetIdx) {
        if (parseInt(items[srcIdx].val) < parseInt(items[targetIdx].val)) {
          return true;
        }
        return false;
      };

      SortAlgBase.prototype.swap = function(items, srcIdx, targetIdx, styleAndTip) {
        var tmp = items[srcIdx];
        items[srcIdx] = items[targetIdx];
        items[targetIdx] = tmp;

        if (styleAndTip) {
          this.highlightAndTip(styleAndTip);
        }
      };

      SortAlgBase.prototype.swapShadowAndQueueNext = function(srcIdx, targetIdx, styleAndTip) {
        this.swap(this.shadowData, srcIdx, targetIdx);

        this.operationStacks[this.operationStacks.length] =
          this.swap.bind(this, this.sortData, srcIdx, targetIdx, styleAndTip);
      };

      SortAlgBase.prototype.start = function(scope, items, interval) {
        this.interval = interval;
        if (!this.scope || !this.scope.processing.isStarted) {
          this.scope = scope;
          this.scope.processing.isStarted = true;

          this.sortData = items;
          this.shadowData = this.sortData.map(function(val) {
            return val;
          });

          this.init();
        }

        if (interval > 0) {
          this.scope.processing.id = setInterval(this.step.bind(this), interval);
        } else {
          this.step();
        }
      };

      SortAlgBase.prototype.stop = function() {
        clearInterval(this.scope.processing.id);
      };

      SortAlgBase.prototype.complete = function() {
        this.highlightAndTip({
          tips: '',
          styles: {}
        });
        this.apply();
        this.stop();
        this.scope.init();
        this.cleanUp();
      };

      SortAlgBase.prototype.getAlgText = function() {
        return this.sort.toString();
      };

      SortAlgBase.prototype.init = function() {

      };

      SortAlgBase.prototype.step = function() {
        var nextStep = this.operationStacks.splice(0, 1)[0];
        if (nextStep) {
          nextStep();
          this.apply();
        } else {
          this.complete();
        }
      };

      SortAlgBase.prototype.cleanUp = function() {
        this.sortData = [];
        this.shadowData = [];
        this.interval = -1;
        this.operationStacks = [];
      };

      SortAlgBase.prototype.sort = function() {
        // to be implemented by child
      };

      SortAlgBase.prototype.setLegends = function(legends) {
        var i = 0;
        legends.length = 0; // clear all first
        for (var legend in this.style) {
          legends[i++] = {
            style: this.style[legend].replace('stroke:white', ''),
            text: WordSplitter.split(legend)
          };
        }
      };

      SortAlgBase.prototype.setTips = function(tips) {
        this.scope.processing.tips = tips;
      };

      SortAlgBase.prototype.highlight = function(styles) {
        for (var i in this.sortData) {
          if (styles[i]) {
            this.setStyle(i, styles[i]);
          } else {
            this.setStyle(i, this.style.default);
          }
        }
      };

      SortAlgBase.prototype.highlightAndTip = function(styleAndTip) {
        this.setTips(styleAndTip.tips);
        this.highlight(styleAndTip.styles);
      };

      SortAlgBase.prototype.setStyle = function(index, style) {
        if (index < 0 || index >= this.sortData.length) {
          return;
        }
        this.sortData[index].style = style;
      };

      return SortAlgBase;
    }])
    .factory('SelectionSort', ['SortAlgBase', function(SortAlgBase) {
      var SelectionSort = new SortAlgBase('Selection');

      SelectionSort.init = function() {
        this.constructor.prototype.init.call(this);

        var highlightObj;
        for (var i = 0; i < this.shadowData.length; i++) {
          var min = i;

          for (var j = i + 1; j < this.shadowData.length; j++) {
            highlightObj = {
              tips: 'Current smallest item is at position ' + (min + 1),
              styles: {}
            };

            highlightObj.styles[j] = this.style.nextToCompare;
            highlightObj.styles[min] = this.style.smallestInLoop;
            highlightObj.styles[i] = this.style.currentlySeen;

            this.operationStacks[this.operationStacks.length] =
              this.highlightAndTip.bind(this, highlightObj);

            if (this.isLarger(this.shadowData, min, j)) {
              min = j;
            }
          }

          if (i != min) {
            highlightObj = {
              tips: 'Swapped smallest item at position ' + (min + 1) +
                ' with item at position ' + (i + 1),
              styles: {}
            };

            highlightObj.styles[i] = this.style.smallestInLoop;
            highlightObj.styles[min] = this.style.currentlySeen;

            this.swapShadowAndQueueNext(i, min, highlightObj);
          }
        }
      };

      SelectionSort.sort = function(items) {
        for (var i = 0; i < items.length; i++) {
          var min = i;
          for (var j = i + 1; j < items.length; j++) {
            if (this.isLarger(items, min, j)) {
              min = j;
            }
          }
          if (i != min) {
            this.swap(items, i, min);
          }
        }
      };

      return SelectionSort;
    }])
  .factory('InsertionSort', ['SortAlgBase', function(SortAlgBase) {
    var InsertionSort = new SortAlgBase('Insertion');

    InsertionSort.init = function() {
      this.constructor.prototype.init.call(this);


      for (var i = 0; i < this.shadowData.length; i++) {
        var min = i;

        for (var j = i - 1; j >= 0; j--) {
          var highlightObj = {
            tips: 'Current smallest item is at position ' + (min + 1),
            styles: {}
          };

          highlightObj.styles[j] = this.style.nextToCompare;
          highlightObj.styles[min] = this.style.smallestInLoop;
          highlightObj.styles[i] = this.style.currentlySeen;

          this.operationStacks[this.operationStacks.length] =
            this.highlightAndTip.bind(this, highlightObj);

          if (this.isLarger(this.shadowData, j, min)) {
            highlightObj = {
              tips: 'Swapped smallest item at position ' + (min + 1) +
                ' with item at position ' + (j + 1),
              styles: {}
            };

            highlightObj.styles[j] = this.style.smallestInLoop;
            highlightObj.styles[min] = this.style.currentlySeen;

            this.swapShadowAndQueueNext(min, j, highlightObj);
            min = j;
          } else {
            break;
          }
        }
      }
    };

    InsertionSort.sort = function(items) {
      for (var i = 0; i < items.length; i++) {
        var min = i;
        for (var j = i - 1; j >= 0; j--) {
          if (this.isLarger(items, j, min)) {
            this.swap(items, min, j);
            min = j;
          } else {
            break;
          }
        }
      }
    };

    return InsertionSort;
  }])
  .factory('BubbleSort', ['SortAlgBase', function(SortAlgBase) {
    var BubbleSort = new SortAlgBase('Bubble');

    BubbleSort.init = function() {
      this.constructor.prototype.init.call(this);

      for (var i = this.shadowData.length - 1; i > 0; i--) {
        var tips = 'Finding largest in ' + (i + 1) + ' items';

        for (var j = 0; j < i; j++) {
          var highlightObj = {
            tips: tips + '.\nComparing item ' + (j + 1) + ' and ' + (j + 2),
            styles: {}
          };

          highlightObj.styles[j] = this.style.nextToCompare;
          highlightObj.styles[j + 1] = this.style.nextToCompare;
          highlightObj.styles[i] = this.style.currentlySeen;

          this.operationStacks[this.operationStacks.length] =
            this.highlightAndTip.bind(this, highlightObj);

          if (this.isLarger(this.shadowData, j, j + 1)) {
            this.swapShadowAndQueueNext(j, j + 1);
          }
        }
      }
    };

    BubbleSort.setLegends = function(legends) {
      delete this.style.smallestInLoop;
      this.constructor.prototype.setLegends.call(this, legends);
    };

    BubbleSort.sort = function(items) {
      for (var i = items.length - 1; i > 0; i--) {
        for (var j = 0; j < i; j++) {
          if (this.isLarger(items, j, j + 1)) {
            this.swap(items, j, j + 1);
          }
        }
      }
    };

    return BubbleSort;
  }])
  .factory('HeapSort', ['SortAlgBase', function(SortAlgBase) {
    var HeapSort = new SortAlgBase('Heap');

    HeapSort.init = function() {
      this.constructor.prototype.init.call(this);

      // Build a max heap
      var N = this.shadowData.length;
      for (var i = parseInt(N / 2); i >= 1; i--) {
        this.sink(i, N);
      }

      // Do the sort
      while (N > 1) {
        var styleAndTip = {
          tips: 'Put the largest item to the end of heap',
          styles: {}
        };

        styleAndTip.styles[N - 1] = this.style.nextToCompare;
        styleAndTip.styles[0] = this.style.currentlySeen;

        this.swapShadowAndQueueNext(0, N - 1, styleAndTip);
        this.sink(1, --N);
      }
    };

    HeapSort.sink = function(index, heapCount) {
      // index and heapCount are 1-based
      var i = index;
      var tips = 'Building max heap with count ' + heapCount;

      while (i * 2 <= heapCount) {
        var child = i * 2;
        if (child < heapCount &&
            this.isSmaller(this.shadowData, child - 1, child)) { // convert to 0-based
          child++; // take the larger child to compare
        }
        if (this.isLarger(this.shadowData, i - 1, child - 1)) { // convert to 0-based
          break;
        }

        var styleAndTip = {
          tips: tips + '.\nSinking item in position ' + i +
            ' with its larger child in position ' + (child - 1),
          styles: {}
        };

        styleAndTip.styles[child - 1] = this.style.nextToCompare;
        styleAndTip.styles[i - 1] = this.style.currentlySeen;

        // convert to 0-based
        this.swapShadowAndQueueNext(i - 1, child - 1, styleAndTip);
        i = child;
      }

      var highlightObj = {
        tips: tips + '.\nSink done for item ' + index,
        styles: {}
      };

      this.operationStacks[this.operationStacks.length] =
        this.highlightAndTip.bind(this, highlightObj);
    };

    HeapSort.setLegends = function(legends) {
      delete this.style.smallestInLoop;
      this.constructor.prototype.setLegends.call(this, legends);
    };

    HeapSort.sort = function(items) {
      function sink(items, index, heapCount) {
        // index and heapCount are 1-based
        var i = index;
        while (i * 2 <= heapCount) {
          var child = i * 2;
          if (child < heapCount &&
              this.isSmaller(items, child - 1, child)) { // convert to 0-based
            child++; // take the larger child to compare
          }
          if (this.isLarger(items, i - 1, child - 1)) { // convert to 0-based
            break;
          }

          this.swap(items, i - 1, child - 1); // convert to 0-based
          i = child;
        }
      }

      // Build a max heap
      var N = items.length;
      for (var i = parseInt(N / 2); i >= 1; i--) {
        sink(items, i, N);
      }

      // Do the sort
      while (N > 1) {
        this.swap(items, 0, N - 1); // Put the largest item to the end of items
        sink(items, 1, --N);
      }
    };

    return HeapSort;
  }])
  .factory('QuickSort', ['SortAlgBase', 'Shuffler', function(SortAlgBase, Shuffler) {
    var QuickSort = new SortAlgBase('Quick');

    QuickSort.init = function() {
      this.constructor.prototype.init.call(this);

      this.setTips('Shuffled.  Performane guarantee.');
      Shuffler.shuffle(this.sortData);
      this.shadowData = this.sortData.map(function(val) {
        return val;
      });

      this.operationStacks[this.operationStacks.length] =
        this.recursiveSort.bind(this, this.shadowData, 0, this.sortData.length - 1, true);
    };

    QuickSort.partition = function(items, low, high, needQueue) {
      var i = low;
      var j = high + 1;
      var tips = 'Partitioning items from ' + (low + 1) + ' to ' + j;
      var styleAndTip = {};

      while (true) {
        while (this.isSmaller(items, ++i, low)) {
          if (needQueue) {
            styleAndTip = {
              tips: tips + '\nItem ' + (i + 1) + ' is in order.  Go next.',
              styles: {}
            };

            styleAndTip.styles[i] = this.style.nextToCompare;
            styleAndTip.styles[low] = this.style.currentlySeen;
            this.operationStacks[this.operationStacks.length] =
              this.highlightAndTip.bind(this, styleAndTip);
          }

          if (i === high) {
            break;
          }
        }

        while (this.isSmaller(items, low, --j)) {
          if (needQueue) {
            styleAndTip = {
              tips: tips + '\nItem ' + (j + 1) + ' is in order.  Go next.',
              styles: {}
            };

            styleAndTip.styles[i] = this.style.outOfOrder;
            styleAndTip.styles[j] = this.style.nextToCompare;
            styleAndTip.styles[low] = this.style.currentlySeen;
            this.operationStacks[this.operationStacks.length] =
              this.highlightAndTip.bind(this, styleAndTip);
          }

          if (j === low) {
            break;
          }
        }

        if (i >= j) {
          break;
        }

        if (needQueue) {
          styleAndTip = {
            tips: tips + '\nSwapped out of order items ' + (i + 1) +
              ' and ' + (j + 1),
            styles: {}
          };

          styleAndTip.styles[i] = this.style.outOfOrder;
          styleAndTip.styles[j] = this.style.outOfOrder;
          styleAndTip.styles[low] = this.style.currentlySeen;

          this.swapShadowAndQueueNext(i, j, styleAndTip);
        } else {
          this.swap(i, j);
        }
      }

      if (needQueue) {
        styleAndTip = {
          tips: 'Partitioning done from ' + (low + 1) + ' to ' + (high + 1) +
            '.\nSwapped ref item to position ' + (j + 1),
          styles: {}
        };

        styleAndTip.styles[j] = this.style.outOfOrder;
        styleAndTip.styles[low] = this.style.currentlySeen;
        this.swapShadowAndQueueNext(low, j, styleAndTip);
      } else {
        this.swap(low, j);
      }
      return j;
    };

    QuickSort.recursiveSort = function(items, low, high, needQueue, styleAndTip) {
      if (styleAndTip) {
        this.highlightAndTip(styleAndTip);
      }

      if (needQueue) {
        if (low >= high) {
          return;
        }

        var i = this.partition(items, low, high, needQueue);

        styleAndTip = {
          tips: 'Recursive sort plan for partition from ' + (low + 1) + ' to ' + i,
          styles: {}
        };

        styleAndTip.styles[low] = this.style.currentlySeen;
        styleAndTip.styles[i - 1] = this.style.currentlySeen;

        this.operationStacks[this.operationStacks.length] =
          this.recursiveSort.bind(this, this.sortData, low, i - 1, false, styleAndTip);

        styleAndTip = {
          tips: 'Recursive sort plan for partition from ' + (i + 2) + ' to ' + (high + 1),
          styles: {}
        };

        styleAndTip.styles[i + 1] = this.style.currentlySeen;
        styleAndTip.styles[high] = this.style.currentlySeen;

        this.operationStacks[this.operationStacks.length] =
          this.recursiveSort.bind(this, this.sortData, i + 1, high, false, styleAndTip);

        this.recursiveSort(items, low, i - 1, true);
        this.recursiveSort(items, i + 1, high, true);
      }
    };

    QuickSort.setLegends = function(legends) {
      delete this.style.smallestInLoop;
      this.style.outOfOrder = 'fill:red;';
      this.constructor.prototype.setLegends.call(this, legends);
    };

    QuickSort.sort = function(items) {
      function partition(items, low, high) {
        var i = low;
        var j = high + 1;

        while (true) {
          while (this.isSmaller(items, ++i, low)) {
            if (i === high) {
              break;
            }
          }

          while (this.isSmaller(items, low, --j)) {
            if (j === low) {
              break;
            }
          }

          if (i >= j) {
            break;
          }

          this.swap(items, i, j);
        }

        this.swap(items, low, j);
        return j;
      }

      function sort(items, low, high) {
        if (low >= high) {
          return;
        }

        var i = partition(items, low, high);
        sort(items, low, i - 1);
        sort(items, i + 1, high);
      }

      Shuffler.shuffle(items); // Performance guarantee
      sort(items, 0, items.length - 1);
    };

    return QuickSort;
  }])
  .factory('ShellSort', ['SortAlgBase', function(SortAlgBase) {
    var ShellSort = new SortAlgBase('Shell');

    ShellSort.init = function() {
      this.constructor.prototype.init.call(this);

      var N = this.sortData.length;
      var h = 1; // 1-based
      while (h < parseInt(N / 3)) {
        h = h * 3 + 1;
      }

      while (h >= 1) {
        var tips = 'h calculated to be ' + h;

        for (var i = h - 1; i < N; i++) {
          for (var j = i; j >= h; j -= h) {
            var k = j - h;

            var highlightObj = {
              tips: tips + '.\nComparing item at position ' + (j + 1) +
                ' and ' + (k + 1),
              styles: {}
            };

            highlightObj.styles[j] = this.style.nextToCompare;
            highlightObj.styles[k] = this.style.nextToCompare;
            highlightObj.styles[i] = this.style.currentlySeen;

            this.operationStacks[this.operationStacks.length] =
              this.highlightAndTip.bind(this, highlightObj);

            // Insertion sort
            if (this.isSmaller(this.shadowData, j, k)) {
              highlightObj = {
                tips: tips + '\nSwapped smaller item at position ' + (k + 1) +
                  ' with item at position ' + (j + 1),
                styles: {}
              };

              highlightObj.styles[k] = this.style.nextToCompare;
              highlightObj.styles[j] = this.style.nextToCompare;
              highlightObj.styles[i] = this.style.currentlySeen;

              this.swapShadowAndQueueNext(j, k, highlightObj);
            } else {
              break;
            }
          }
        }
        h = parseInt(h / 3);
      }
    };

    ShellSort.setLegends = function(legends) {
      delete this.style.smallestInLoop;
      this.constructor.prototype.setLegends.call(this, legends);
    };

    ShellSort.sort = function(items) {
      var N = items.length;
      var h = 1; // 1-based
      while (h < parseInt(N / 3)) {
        h = h * 3 + 1;
      }

      while (h >= 1) {
        for (var i = h - 1; i < N; i++) {
          for (var j = i; j >= h && this.isSmaller(items, j, j - h); j -= h) {
            // Insertion sort
            this.swap(items, j, j - h);
          }
        }
        h = parseInt(h / 3);
      }
    };

    return ShellSort;
  }])
  .factory('TopDownMergeSort', ['SortAlgBase', function(SortAlgBase) {
    var TopDownMergeSort = new SortAlgBase('Merge (TopDown)');

    TopDownMergeSort.complete = function() {
      for (var i in this.sortData) {
        this.sortData[i].bgStyle = this.style.auxiliaryItem;
      }

      this.constructor.prototype.complete.call(this);
    };

    TopDownMergeSort.merge = function(items, low, mid, high) {
      var tips = 'Merging subarray from low pos ' + (low + 1) + ' to high pos ' +
        (high + 1);

      var aux = [];
      for (var k = low; k <= high; k++) {
        aux[k] = {
          val: items[k].val
        };
      }

      this.operationStacks[this.operationStacks.length] =
        function(items, low, high, tips) {
          for (var k = 0; k < items.length; k++) {
            if (k >= low && k <= high) {
              items[k].bgVal = items[k].val;
              items[k].bgStyle = this.style.auxiliaryItem;
            } else {
              items[k].bgVal = 0;
            }
            items[k].style = this.style.default;
          }
          this.setTips(tips +
            '\nAuxiliary items copied.');
        }.bind(this, this.sortData, low, high, tips);


      function exchange(items, k, ref, tips) {
        items[k].val = items[ref].bgVal;

        for (var i = 0; i < items.length; i++) {
          items[i].style = this.style.default;
          items[i].bgStyle = this.style.auxiliaryItem;
        }

        items[k].style = this.style.currentlyCompare;
        items[ref].bgStyle = this.style.currentlyCompare;
        this.setTips(tips);
      }

      var i = low, j = mid + 1;
      for (k = low; k <= high; k++) {
        var ref = k;
        var stepTips;

        if (i > mid) {
          stepTips = 'all left subarray items are copied.';
          ref = j;
          j++;
        } else if (j > high) {
          stepTips = 'all right subarray items are copied.';
          ref = i;
          i++;
        } else if (this.isSmaller(aux, j, i)) {
          stepTips = 'left item ' + (i + 1) + ' is larger than right item ' + (j + 1);
          ref = j;
          j++;
        } else {
          stepTips = 'right item ' + (j + 1) + ' is larger than left item ' + (i + 1);
          ref = i;
          i++;
        }
        stepTips = '\nCopied item ' + (ref + 1) + ' to item ' +
          (k + 1) + ' because ' + stepTips;
        items[k] = aux[ref];

        this.operationStacks[this.operationStacks.length] =
          exchange.bind(this, this.sortData, k, ref, tips + stepTips);
      }
    };

    TopDownMergeSort.recursiveSort = function(items, low, high) {
      if (high <= low) {
        return;
      }

      var mid = low + parseInt((high - low) / 2);
      this.recursiveSort(items, low, mid);
      this.recursiveSort(items, mid + 1, high);
      this.merge(items, low, mid, high);
    };

    TopDownMergeSort.init = function() {
      this.recursiveSort(this.shadowData, 0, this.shadowData.length - 1);
    };

    TopDownMergeSort.setLegends = function(legends) {
      delete this.style.smallestInLoop;
      delete this.style.currentlySeen;
      delete this.style.nextToCompare;
      this.style.auxiliaryItem = 'fill:#cccccc;stroke:white;stroke-width:1';
      this.style.currentlyCompare = 'fill:green';
      this.constructor.prototype.setLegends.call(this, legends);
    };

    TopDownMergeSort.sort = function(items) {
      function merge(items, aux, low, mid, high) {
        for (var k = low; k <= high; k++) {
          aux[k] = items[k];
        }

        var i = low, j = mid + 1;
        for (k = low; k <= high; k++) {
          if (i > mid) {
            items[k] = aux[j++];
          } else if (j > high) {
            items[k] = aux[i++];
          } else if (this.isSmaller(aux, j, i)) {
            items[k] = aux[j++];
          } else {
            items[k] = aux[i++];
          }
        }
      }

      function sort(items, aux, low, high) {
        if (high <= low) {
          return;
        }

        var mid = low + parseInt((high - low) / 2);
        sort(items, aux, low, mid);
        sort(items, aux, mid + 1, high);
        merge(items, aux, low, mid, high);
      }

      var aux = items.concat([]);

      sort(items, aux, 0, items.length - 1);
    };

    return TopDownMergeSort;
  }])
  .factory('BottomUpMergeSort', ['SortAlgBase', function(SortAlgBase) {
    var BottomUpMergeSort = new SortAlgBase('Merge (BottomUp)');

    BottomUpMergeSort.complete = function() {
      for (var i in this.sortData) {
        this.sortData[i].bgStyle = this.style.auxiliaryItem;
      }

      this.constructor.prototype.complete.call(this);
    };

    BottomUpMergeSort.merge = function(items, low, mid, high, size) {
      var tips = 'Merging items for subarray in size ' + size +
        '.  Low pos ' + (low + 1) + ' high pos ' + (high + 1);

      var aux = [];
      for (var k = low; k <= high; k++) {
        aux[k] = {
          val: items[k].val
        };
      }

      this.operationStacks[this.operationStacks.length] =
        function(items, low, high, tips) {
          for (var k = 0; k < items.length; k++) {
            if (k >= low && k <= high) {
              items[k].bgVal = items[k].val;
              items[k].bgStyle = this.style.auxiliaryItem;
            } else {
              items[k].bgVal = 0;
            }
            items[k].style = this.style.default;
          }
          this.setTips(tips +
            '\nAuxiliary items copied.');
        }.bind(this, this.sortData, low, high, tips);


      function exchange(items, k, ref, tips) {
        items[k].val = items[ref].bgVal;

        for (var i = 0; i < items.length; i++) {
          items[i].style = this.style.default;
          items[i].bgStyle = this.style.auxiliaryItem;
        }

        items[k].style = this.style.currentlyCompare;
        items[ref].bgStyle = this.style.currentlyCompare;
        this.setTips(tips);
      }

      var i = low, j = mid + 1;
      for (k = low; k <= high; k++) {
        var ref = k;
        var stepTips;

        if (i > mid) {
          stepTips = 'all left subarray items are copied.';
          ref = j;
          j++;
        } else if (j > high) {
          stepTips = 'all right subarray items are copied.';
          ref = i;
          i++;
        } else if (this.isSmaller(aux, j, i)) {
          stepTips = 'left item ' + (i + 1) + ' is larger than right item ' + (j + 1);
          ref = j;
          j++;
        } else {
          stepTips = 'right item ' + (j + 1) + ' is larger than left item ' + (i + 1);
          ref = i;
          i++;
        }
        stepTips = '\nCopied item ' + (ref + 1) + ' to item ' +
          (k + 1) + ' because ' + stepTips;
        items[k] = aux[ref];

        this.operationStacks[this.operationStacks.length] =
          exchange.bind(this, this.sortData, k, ref, tips + stepTips);
      }
    };

    BottomUpMergeSort.init = function() {
      var items = this.shadowData;
      var N = items.length;

      for (var size = 1; size < N; size = size + size) {
        for (var low = 0; low < N - size; low += size + size) {
          this.merge(items, low, low + size - 1, Math.min(low + size + size - 1, N - 1), size);
        }
      }
    };

    BottomUpMergeSort.setLegends = function(legends) {
      delete this.style.smallestInLoop;
      delete this.style.currentlySeen;
      delete this.style.nextToCompare;
      this.style.auxiliaryItem = 'fill:#cccccc;stroke:white;stroke-width:1';
      this.style.currentlyCompare = 'fill:green';
      this.constructor.prototype.setLegends.call(this, legends);
    };

    BottomUpMergeSort.sort = function(items) {
      function merge(items, aux, low, mid, high) {
        for (var k = low; k <= high; k++) {
          aux[k] = items[k];
        }

        var i = low, j = mid + 1;
        for (k = low; k <= high; k++) {
          if (i > mid) {
            items[k] = aux[j++];
          } else if (j > high) {
            items[k] = aux[i++];
          } else if (this.isSmaller(aux, j, i)) {
            items[k] = aux[j++];
          } else {
            items[k] = aux[i++];
          }
        }
      }

      var N = items.length;
      var aux = items.concat([]);

      for (var size = 1; size < N; size = size + size) {
        for (var low = 0; low < N - size; low += size + size) {
          merge(items, aux,
            low, low + size - 1, Math.min(low + size + size - 1, N - 1));
        }
      }
    };

    return BottomUpMergeSort;
  }])
  .factory('SortAlgFactory', ['InsertionSort', 'SelectionSort', 'BubbleSort',
    'HeapSort', 'QuickSort', 'ShellSort', 'TopDownMergeSort', 'BottomUpMergeSort',
    function(InsertionSort, SelectionSort, BubbleSort, HeapSort, QuickSort,
        ShellSort, TopDownMergeSort, BottomUpMergeSort) {
      // Shellsort, mergesort remained
      var algs = {};
      var methodNames = [];

      function SortAlgFactory() {
      }

      SortAlgFactory.get = function(algName) {
        return algs[algName];
      };

      SortAlgFactory.getAllSortMethods = function() {
        return methodNames;
      };

      SortAlgFactory.reg = function(algFn) {
        var algName = algFn.getName();

        if (algName in algs) {
          throw new Error('Alg ' + algName + ' already registered');
        }
        methodNames.push(algName);
        algs[algName] = algFn;
      };

      SortAlgFactory.reg(TopDownMergeSort);
      SortAlgFactory.reg(BottomUpMergeSort);
      SortAlgFactory.reg(ShellSort);
      SortAlgFactory.reg(QuickSort);
      SortAlgFactory.reg(HeapSort);
      SortAlgFactory.reg(BubbleSort);
      SortAlgFactory.reg(InsertionSort);
      SortAlgFactory.reg(SelectionSort);

      return SortAlgFactory;
    }]);

var app = angular.module('SortAlg',
    ['ngSanitize', 'ui.bootstrap', 'alg.directives', 'alg.services.sort']);
app.config(function($interpolateProvider) {
  $interpolateProvider.startSymbol('$$');
  $interpolateProvider.endSymbol('$$');
});
app.controller('SortCtrl', ['$scope', 'Shuffler', 'SortAlgFactory', 'SortAlgBase', '$sce',
    function($scope, Shuffler, SortAlgFactory, SortAlgBase, $sce) {

      $scope.changeAlg = function(method) {
        if ($scope.alg) {
          $scope.alg.cleanUp();
        }
        $scope.alg = SortAlgFactory.get(method);
        $scope.isMerge = method.indexOf('Merge') > -1;

        $scope.algText = $scope.alg.getAlgText();
        $scope.updateSortData($scope.sortSource);
        $scope.alg.setLegends($scope.legends);
      };

      $scope.updateSortData = function(sortSource) {
        if (!sortSource) {
          return; // when the data input is invalid
        }

        var alg = SortAlgFactory.get($scope.sortingMethods.selected);
        $scope.sortData = sortSource.split(',')
          .map(function(val) {
            return {
              val: val,
              style: alg.style.default,
              bgVal: 0,
              bgStyle: 'display:none'
            };
          });
        $scope.init();
      };

      $scope.changeSource = function(source) {
        var data = $scope.dataSource[source];
        if (!data) {
          return;
        }
        $scope.sortSource = data.join(',');
        $scope.updateSortData($scope.sortSource);
      };

      $scope.trustedCode = function(code) {
        if (!code) {
          return '';
        }
        return $sce.trustAsHtml('    ' + code);
      };

      $scope.start = function(button) {
        var alg = SortAlgFactory.get($scope.sortingMethods.selected);
        if (button == 'Start') {
          alg.start($scope, $scope.sortData, $scope.interval);
        } else {
          alg.stop();
        }
      };

      $scope.step = function() {
        var alg = SortAlgFactory.get($scope.sortingMethods.selected);
        alg.start($scope, $scope.sortData, -1);
      };

      $scope.init = function() {
        $scope.processing = {
          button: 'Start',
          isStarted: false
        };
      };

      $scope.interval = 300;

      var regMethods = SortAlgFactory.getAllSortMethods();
      $scope.sortingMethods = {
        options: regMethods,
        selected: regMethods[0]
      };

      var itemsInSeq =[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
      $scope.dataSource = {
        Asc: itemsInSeq,
        Desc: itemsInSeq.concat([]).reverse(),
        Random: Shuffler.shuffle(itemsInSeq.concat([])),
        options: ['Asc', 'Desc', 'Random'],
        selected: 'Random'
      };

      $scope.legends = [];

      $scope.init();
      $scope.changeSource($scope.dataSource.selected);
      $scope.changeAlg($scope.sortingMethods.selected);

      function getPosition(element) {
        var xPosition = 0;
        var yPosition = 0;

        while (element) {
          xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
          yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
          element = element.offsetParent;
        }
        return { x: xPosition, y: yPosition };
      }

      function setInterval(marginLeft, sliderBarWidth) {
        $scope.interval = parseInt(1000 * marginLeft / sliderBarWidth);
      }

      function setMarginLeft(marginLeft) {
        if (marginLeft < 0) {
          marginLeft = 1;
        } else if (marginLeft + $scope.sliderWidth >= $scope.sliderBarWidth - 1) {
          marginLeft = $scope.sliderBarWidth - $scope.sliderWidth - 1;
        }

        $scope.marginLeft = marginLeft;
      }

      $scope.isHold = false;
      $scope.lastClientX = 0;
      $scope.marginLeft = 60;
      $scope.sliderBarWidth = 0;
      $scope.sliderWidth = 0;

      $scope.holdSlider = function($event) {
        $scope.isHold = true;
        $scope.sliderBarWidth = $event.target.parentNode.offsetWidth;
        $scope.sliderWidth = $event.target.offsetWidth;
        $scope.lastClientX = $event.clientX; // Resetting position when holding
      };

      $scope.releaseSlider = function() {
        $scope.isHold = false;
      };

      $scope.setSlider = function($event) {
        if ($event.target.id === 'slider') {
          return; // Do nothing if clicking on slider
        }

        $scope.sliderBarWidth = $event.target.offsetWidth;
        $scope.sliderWidth = $event.target.childNodes[1].offsetWidth;

        var sliderBarPosition = getPosition($event.target),
            marginLeft = $event.clientX - sliderBarPosition.x - $scope.sliderWidth / 2;

        setMarginLeft(marginLeft);
        setInterval($scope.marginLeft, $scope.sliderBarWidth);
      };

      $scope.moveSlider = function($event) {
        if ($scope.isHold) {
          var diff = $event.clientX - $scope.lastClientX;
          $scope.lastClientX = $event.clientX;

          setMarginLeft($scope.marginLeft + diff);
          setInterval($scope.marginLeft, $scope.sliderBarWidth);
        }
      };
    }]);
