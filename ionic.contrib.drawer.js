(function() {

'use strict';

/**
 * The ionic-contrib-frosted-glass is a fun frosted-glass effect
 * that can be used in iOS apps to give an iOS 7 frosted-glass effect
 * to any element.
 */
angular.module('ionic.contrib.drawer', ['ionic'])

.controller('drawerCtrl', ['$scope', '$window', '$element', '$attrs', '$ionicGesture', '$document', function($scope, $window, $element, $attr, $ionicGesture, $document) {
  var el = $element[0];
  var dragging = false;
  var startX, lastX, offsetX, newX;
  var side;

  // How far to drag before triggering
  var thresholdX = 15;
  // How far from edge before triggering
  var edgeX = 40;

  var LEFT = 0;
  var RIGHT = 1;

  var isTargetDrag = false;

  var width = $element[0].clientWidth;

  var enableAnimation = function() {
    $element.addClass('animate');
  };
  var disableAnimation = function() {
    $element.removeClass('animate');
  };

  // Check if this is on target or not
  var isTarget = function(el) {
    while(el) {
      if(el === $element[0]) {
        return true;
      }
      el = el.parentNode;
    }
  };

  var startDrag = function(e) {
    disableAnimation();

    dragging = true;
    offsetX = lastX - startX;
    console.log('Starting drag');
    console.log('Offset:', offsetX);
  };

  var startTargetDrag = function(e) {
    disableAnimation();

    dragging = true;
    isTargetDrag = true;
    offsetX = lastX - startX;
    console.log('Starting target drag');
    console.log('Offset:', offsetX);
  };

  side = $attr.side == 'left' ? LEFT : RIGHT;
  console.log(side);

  var doEndDrag = function(e) {
    startX = null;
    lastX = null;
    offsetX = null;
    isTargetDrag = false;

    if(!dragging) {
      return;
    }

    dragging = false;

    console.log('End drag');
    enableAnimation();

    ionic.requestAnimationFrame(function() {
      if(side === LEFT && newX < (-width / 2)) {
        el.style.transform = el.style.webkitTransform = 'translate3d(' + -width + 'px, 0, 0)';
        angular.element(document.getElementById('blurrable-content')).removeClass('blur');
      } else if(side === RIGHT && newX > (width / 2)) {
        el.style.transform = el.style.webkitTransform = 'translate3d(' + width + 'px, 0, 0)';
        angular.element(document.getElementById('blurrable-content')).removeClass('blur');
      } else {
        el.style.transform = el.style.webkitTransform = 'translate3d(0px, 0, 0)';
        angular.element(document.getElementById('blurrable-content')).addClass('blur');
      }
    });
  };

  var doDrag = function(e) {
    if(e.defaultPrevented) {
      return;
    }

    if(!lastX) {
      startX = e.gesture.touches[0].pageX;
    }

    lastX = e.gesture.touches[0].pageX;

    if(!dragging) {

      // Dragged 15 pixels and finger is by edge
      if(Math.abs(lastX - startX) > thresholdX) {
        if(isTarget(e.target)) {
          startTargetDrag(e);
        } else if((side === LEFT && startX < edgeX) || (side === RIGHT && startX > ($window.innerWidth - edgeX))) {
          startDrag(e);
        } 
      }
    } else {
      //console.log(lastX, offsetX, lastX - offsetX);
      if(side === LEFT) newX = Math.min(0, (-width + (lastX - offsetX)));
      if(side === RIGHT) newX = Math.max(0, width - ($window.innerWidth - (lastX - offsetX)));
      ionic.requestAnimationFrame(function() {
        el.style.transform = el.style.webkitTransform = 'translate3d(' + newX + 'px, 0, 0)';
        var blurPx;
        if(side === LEFT) blurPx = (lastX > width) ? 10 : Math.round((lastX / width) * 10);
        if(side === RIGHT) blurPx = (newX > width) ? 0 : Math.round(((width - newX) / width) * 10);
        angular.element(document.getElementById('blurrable-content')).css('-webkit-filter', 'blur(' + blurPx + 'px)');
        if(blurPx === 0) {
          angular.element(document.getElementById('blurrable-content')).css('-webkit-filter', null);
          angular.element(document.getElementById('blurrable-content')).removeClass('blur');
        }
      });

    }

    if(dragging) {
      e.gesture.srcEvent.preventDefault();
    }
  };

  $ionicGesture.on('drag', function(e) {
    doDrag(e);
  }, $document);
  $ionicGesture.on('dragend', function(e) {
    doEndDrag(e);
  }, $document);


  this.close = function(closeSide) {
    if(closeSide !== side) return;
    enableAnimation();
    ionic.requestAnimationFrame(function() {
      if(side === LEFT) {
        el.style.transform = el.style.webkitTransform = 'translate3d(-100%, 0, 0)';
      } else {
        el.style.transform = el.style.webkitTransform = 'translate3d(100%, 0, 0)';
      }
    });
    $scope.blurContent(10, 20, 0, true);
  };

  this.open = function(openSide) {
    if(openSide !== side) return;
    enableAnimation();
    ionic.requestAnimationFrame(function() {
      if(side === LEFT) {
        el.style.transform = el.style.webkitTransform = 'translate3d(0%, 0, 0)';
      } else {
        el.style.transform = el.style.webkitTransform = 'translate3d(0%, 0, 0)';
      }
    });
    $scope.blurContent(0, 20, 10);
  };
}])

.directive('drawer', ['$rootScope', '$ionicGesture', function($rootScope, $ionicGesture) {
  return {
    restrict: 'E',
    controller: 'drawerCtrl',
    link: function($scope, $element, $attr, ctrl) {
      $element.addClass($attr.side);
      $scope['openDrawer' + $attr.side] = function(openSide) {
        ctrl.open(($attr.side === 'left') ? 0 : 1);
      };
      $scope['closeDrawer' + $attr.side] = function(closeSide) {
        console.log('close');
        ctrl.close(($attr.side === 'left') ? 0 : 1);
      };
    }
  }
}])

.directive('drawerClose', ['$rootScope', function($rootScope) {
  return {
    restrict: 'A',
    link: function($scope, $element, $attr) {
      $element.bind('click', function() {
        var drawerCtrl = $element.inheritedData('$drawerController');
        drawerCtrl.close(($attr.drawerClose === 'left') ? 0 : 1);
      });
    }
  }
}]);

})();
