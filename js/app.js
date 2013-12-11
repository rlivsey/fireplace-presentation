// very quick and dirty slide setup
// nothing nice to see here!

App = Ember.Application.create();

FIREBASE_DEMO_ROOT = "https://fireplace-presentation.firebaseio.com/demo";

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

// stolen from Ember.String.humanize which is coming soon...
Ember.Handlebars.registerBoundHelper('humanize', function(str) {
  str = str || "";
  return str.replace(/_/g, ' ').
    replace(/^\w/g, function(s){
      return s.toUpperCase();
    });
});


App.Router.map(function() {
  this.resource("home", {path: "/"});
  this.resource("slides", {path: "/slides"}, function() {
    for (var i=0; i<SLIDES.length; i++) {
      this.route(SLIDES[i]);
    }
  });
  this.route("control");
});

App.HomeRoute = Ember.Route.extend({
  redirect: function() {
    this.transitionTo("slides."+SLIDES[0]);
  }
});

App.ControlRoute = Ember.Route.extend({
  controllerName: "slides",

  actions: {
    currentSlideChanged: function(slide) {
      this.controller.set("currentSlide", slide);
    },

    nextSlide: function() {
      var next = this.controller.get("nextSlideName");
      if (next) {
        this.controller.currentRef.set(next);
      }
    },

    previousSlide: function() {
      var prev = this.controller.get("previousSlideName");
      if (prev) {
        this.controller.currentRef.set(prev);
      }
    }
  }
});

App.SlidesController = Ember.Controller.extend({
  needs: "application",
  currentJSON: null,
  showingJSON: false,
  locked: true,
  currentSlide: null,

  observeCurrent: function(){
    var _this = this;
    this.currentRef = new Firebase(FIREBASE_DEMO_ROOT).parent().child("current_slide");
    this.currentRef.on("value", function(snap) {
      Ember.run(function(){
        _this.send("currentSlideChanged", snap.val());
      });
    });
  }.on("init"),

  slideDidChange: function() {
    if (!this.get("locked")) {
      return;
    }

    var current = this.get("currentSlide");
    if (current) {
      this.currentRef.set(current);
    }
  }.observes("currentSlide"),

  currentSlideNum: function() {
    return SLIDES.indexOf(this.get("currentSlide"));
  }.property("currentSlide"),

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
  }.on('didInsertElement'),

  teardownListeners: function() {
    $("body").off("keyup");
  }.on("willDestroyElement")
});

App.SlidesRoute = Ember.Route.extend({

  setupController: function(controller) {
    var fb = new Firebase(FIREBASE_DEMO_ROOT);
    fb.on("value", function(snap) {
      controller.set("currentJSON", snap.val());
    });
  },

  actions: {
    didTransition: function() {
      // application route isn't set yet...
      Ember.run.next(this, function() {
        var path    = this.controllerFor("application").get("currentPath");
        var parts   = path.split(".");
        var current = parts[parts.length-1];
        this.controller.set("currentSlide", current);
      });
    },

    currentSlideChanged: function(slide) {
      if (this.controller.get("locked")) {
        this.transitionTo("slides."+slide);
      }
    },

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
      fb = new Firebase(FIREBASE_DEMO_ROOT);
      fb.remove();
    },

    toggleJSON: function() {
      this.controller.toggleProperty("showingJSON");
    },

    focusJSON: function() {
      this.controller.toggleProperty("focusedJSON");
    },

    lockSlide: function() {
      this.controller.toggleProperty("locked");
    }
  }
});
