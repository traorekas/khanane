
/* 
 * Creates a range
 * Usage example: <option ng-repeat="y in [] | range:1998:1900">{{y}}</option>
 */
module.filter('range', function() {
  return function(input, start, end) {    
    start = parseInt(start);
    end = parseInt(end);
    var direction = (start <= end) ? 1 : -1;
    while (start != end) {
        input.push(start);
        start += direction;
    }
    return input;
  };
});
