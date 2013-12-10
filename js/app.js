// very quick and dirty slide setup
// nothing nice to see here!

App = Ember.Application.create();

NUM_SLIDES    = 10;
FIREBASE_ROOT = "https://fireplace-presentation.firebaseio.com";

Ember.Handlebars.registerBoundHelper('json', function(json) {
  return JSON.stringify(json, null, 2);
});

App.Router.map(function() {
  this.resource("home", {path: "/"});
  this.resource("slides", {path: "/slides"}, function() {
    for (var i=1; i<=NUM_SLIDES; i++) {
      this.route("slide"+i);
    }
  });
});

App.HomeRoute = Ember.Route.extend({
  redirect: function() {
    this.transitionTo("slides.slide1");
  }
});

App.SlidesController = Ember.Controller.extend({
  needs: "application",
  currentJSON: null,

  currentSlideNum: function(){
    var path = this.get("controllers.application.currentPath");
    return Number(path.replace(/\D/g, ''));
  }.property("controllers.application.currentPath"),

  nextSlideNum: function() {
    var next = this.get("currentSlideNum") + 1;
    if (next > NUM_SLIDES) {
      return;
    }
    return next;
  }.property("currentSlideNum"),

  previousSlideNum: function() {
    var prev = this.get("currentSlideNum") - 1;
    if (prev <= 0) {
      return;
    }
    return prev;
  }.property("currentSlideNum")

});

App.SlidesRoute = Ember.Route.extend({

  setupController: function(controller) {
    var fb = new Firebase(FIREBASE_ROOT);
    fb.on("value", function(snap) {
      controller.set("currentJSON", snap.val());
    });
  },

  actions: {
    nextSlide: function() {
      var next = this.controller.get("nextSlideNum");
      this.transitionTo("slides.slide"+next);
    },

    previousSlide: function() {
      var prev = this.controller.get("previousSlideNum");
      this.transitionTo("slides.slide"+prev);
    },

    clearData: function() {
      fb = new Firebase(FIREBASE_ROOT);
      fb.remove();
    }
  }
});
