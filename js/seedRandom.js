window.BR = window.BR || {};

BR.SeedRandom = function(seed) {
  this.seed = BR.SeedRandom.hash(seed);
  this.state = this.seed;
};

BR.SeedRandom.hash = function(str) {
  var h = 0;
  var s = String(str);
  for (var i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) || 1;
};

BR.SeedRandom.prototype.next = function() {
  this.state = (this.state * 1664525 + 1013904223) & 0x7fffffff;
  return this.state / 0x7fffffff;
};

BR.SeedRandom.prototype.nextInt = function(min, max) {
  return Math.floor(this.next() * (max - min + 1)) + min;
};

BR.SeedRandom.prototype.pick = function(arr) {
  return arr[this.nextInt(0, arr.length - 1)];
};

BR.SeedRandom.prototype.shuffle = function(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = this.nextInt(0, i);
    var tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
};

BR.SeedRandom.prototype.chance = function(probability) {
  return this.next() < probability;
};

BR.SeedRandom.prototype.weightedPick = function(items, weights) {
  var total = 0;
  for (var i = 0; i < weights.length; i++) total += weights[i];
  var roll = this.next() * total;
  var acc = 0;
  for (var i = 0; i < items.length; i++) {
    acc += weights[i];
    if (roll < acc) return items[i];
  }
  return items[items.length - 1];
};
