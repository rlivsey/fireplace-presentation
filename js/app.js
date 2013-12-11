// very quick and dirty slide setup
// nothing nice to see here!

App = Ember.Application.create();

FIREBASE_ROOT = "https://fireplace-presentation.firebaseio.com";

SLIDES = [
  'intro',
  'firebase',
  'using_firebase',
  'using_firebase_with_ember',
  'ember_fire',
  'fireplace',
  'attributes',
  'store',
  'creating',
  'finding',
  'limiting',
  'updating',
  'ordering',
  'filtering',
  'non_embedded',
  'meta',
  'detached',
  'references_basic',
  'references_advanced',
  'inspector',
  'thanks'
];

Ember.Handlebars.registerBoundHelper('json', function(json) {
  return JSON.stringify(json, null, 2);
});

App.Router.map(function() {
  this.resource("home", {path: "/"});
  this.resource("slides", {path: "/slides"}, function() {
    for (var i=0; i<SLIDES.length; i++) {
      this.route(SLIDES[i]);
    }
  });
});

App.HomeRoute = Ember.Route.extend({
  redirect: function() {
    this.transitionTo("slides."+SLIDES[0]);
  }
});

App.SlidesController = Ember.Controller.extend({
  needs: "application",
  currentJSON: null,
  showingJSON: false,

  currentSlideNum: function(){
    var path  = this.get("controllers.application.currentPath");
    var parts = path.split(".");
    var current = parts[parts.length-1];
    return SLIDES.indexOf(current);
  }.property("controllers.application.currentPath"),

  nextSlideName: function() {
    var next = this.get("currentSlideNum") + 1;
    return SLIDES[next];
  }.property("currentSlideNum"),

  previousSlideName: function() {
    var prev = this.get("currentSlideNum") - 1;
    return SLIDES[prev];
  }.property("currentSlideNum")

});

App.SlidesView = Ember.View.extend({
  classNames: "slides-container",
  classNameBindings: ["controller.showingJSON", "controller.focusedJSON"],

  setupListeners: function() {
    var controller = this.controller;
    $("body").on("keyup", function(e) {
      if (e.target.nodeName == "INPUT") {
        return;
      }

      switch(e.keyCode) {
        case 37: // left
          controller.send("previousSlide");
          e.preventDefault();
          break;
        case 39: // right
        case 32: // space
          controller.send("nextSlide");
          e.preventDefault();
          break;
      }
    });
  }.on('didInsertElement')
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
      var next = this.controller.get("nextSlideName");
      if (next) {
        this.transitionTo("slides."+next);
      }
    },

    previousSlide: function() {
      var prev = this.controller.get("previousSlideName");
      if (prev) {
        this.transitionTo("slides."+prev);
      }
    },

    clearData: function() {
      fb = new Firebase(FIREBASE_ROOT);
      fb.remove();
    },

    toggleJSON: function() {
      this.controller.toggleProperty("showingJSON");
    },

    focusJSON: function() {
      this.controller.toggleProperty("focusedJSON");
    }
  }
});
