var attr = FP.attr,
    one  = FP.hasOne,
    many = FP.hasMany;

App.Store = FP.Store.extend({
  firebaseRoot: FIREBASE_ROOT
});

App.Person = FP.Model.extend({
  firstName: FP.attr(),
  lastName:  FP.attr(),
  dob:       FP.attr("date"),
  addresses: FP.hasMany("address")
});

App.Address = FP.Model.extend({
  number:   FP.attr(),
  street:   FP.attr(),
  city:     FP.attr(),
  postcode: FP.attr()
});

App.Thing = FP.Model.extend({
  name: FP.attr(),
  priority: Ember.computed.alias("name")
});

App.SlidesSlide6Route = Ember.Route.extend({
  actions: {
    createPerson: function() {
      var person = this.store.createRecord("person", {
        firstName: "John",
        lastName: "Watson",
        dob: new Date(Date.UTC(1852, 7, 7)),
        addresses: [
          this.store.createRecord("address", {
            number: "221B",
            street: "Baker Street",
            city: "London",
            postcode: "NW1 6XE"
          })
        ]
      });
      person.save();
    }
  }
});

App.SlidesRoute.reopen({
  actions: {
    createRandomPerson: function() {
      var person = this.store.createRecord("person", {
        firstName: Faker.Name.firstName(),
        lastName:  Faker.Name.lastName()
      });
      person.save();
    }
  }
})

App.SlidesSlide7Route = Ember.Route.extend({
  model: function() {
    return this.store.fetch("person");
  }
});

App.SlidesSlide8Route = Ember.Route.extend({
  model: function() {
    return this.store.fetch("person", {limit: 5});
  }
});

App.SlidesSlide9Route = Ember.Route.extend({
  model: function() {
    return this.store.fetch("person", {limit: 5});
  },

  actions: {
    updatePerson: function(person) {
      person.setProperties({
        firstName: Faker.Name.firstName(),
        lastName:  Faker.Name.lastName()
      });
      person.save();
    }
  }
});

App.SlidesSlide10Route = Ember.Route.extend({
  model: function() {
    return this.store.fetch("thing");
  },
  actions: {
    createThing: function() {
      var thing = this.store.createRecord("thing", {
        name: Faker.Company.companyName()
      });
      thing.save();
    }
  }
});