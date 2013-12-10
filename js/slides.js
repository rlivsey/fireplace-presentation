var attr = FP.attr,
    one  = FP.hasOne,
    many = FP.hasMany;

App.Store = FP.Store.extend({
  firebaseRoot: FIREBASE_ROOT
});

App.Person = FP.Model.extend({
  firstName: attr()
});

App.SlidesSlide1Route = Ember.Route.extend({
  actions: {
    createPerson: function() {
      var person = this.store.createRecord("person", {
        firstName: "Bob"
      });
      person.save();
    }
  }
});