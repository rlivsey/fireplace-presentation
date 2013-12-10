var attr    = FP.attr,
    one     = FP.hasOne,
    hasMany = FP.hasMany;

App.Store = FP.Store.extend({
  firebaseRoot: FIREBASE_ROOT
});

App.Person = FP.Model.extend({
  firstName: attr(),
  lastName:  attr(),
  dob:       attr("date"),
  addresses: hasMany("address")
});

App.Address = FP.Model.extend({
  number:   attr(),
  street:   attr(),
  city:     attr(),
  postcode: attr()
});

App.Company = FP.Model.extend({
  name: attr(),
  priority: Ember.computed.alias("name"),
  employees: hasMany("person", {embedded: false, as: "employee"})
});

App.Employee = FP.MetaModel.extend({
  department: attr(),
  jobTitle: attr()
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
    },

    updatePerson: function(person) {
      person.setProperties({
        firstName: Faker.Name.firstName(),
        lastName:  Faker.Name.lastName()
      });
      person.save();
    },

    createCompany: function() {
      var company = this.store.createRecord("company", {
        name: Faker.Company.companyName()
      });
      company.save();
    },

    updateCompany: function(company) {
      company.set("name", Faker.Company.companyName());
      company.save();
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
  }
});

App.SlidesSlide10Route = Ember.Route.extend({
  model: function() {
    return this.store.fetch("company");
  }
});

App.SlidesSlide11Route = Ember.Route.extend({
  model: function() {
    return this.store.fetch("company", {startAt: "A", endAt: "D"});
  }
});

App.SlidesSlide12Controller = Ember.ObjectController.extend({
  people: [],
  nonEmployees: function(){
    var employeeIDs = this.get("employees").mapBy("id");
    return this.get("people").filter(function(item){
      return !employeeIDs.contains(item.get("id"));
    });
  }.property("people.[]", "employees.[]")
});

App.SlidesSlide12Route = Ember.Route.extend({
  model: function() {
    return this.store.fetch("company", {limit: 1}).then(function(companies){
      return companies.get("firstObject");
    });
  },

  setupController: function(controller, model) {
    this._super(controller, model);
    controller.set("people", this.store.find("person"));
  },

  actions: {
    addEmployee: function(person) {
      var company = this.controller.get("content");
      var employee = this.store.createRecord("employee", {content: person});
      company.get("employees").pushObject(employee);
      company.save();
    },

    removeEmployee: function(person) {
      var company  = this.controller.get("content");
      var employee = company.get("employees").findBy("id", person.get("id"));
      company.get("employees").removeObject(employee);
      company.save();
    }
  }
});


App.SlidesSlide13Controller = Ember.ObjectController.extend({

});

App.EmployeeItemController = Ember.ObjectController.extend({
  detailsChanged: function() {
    if (this.get("changeCameFromFirebase")) {
      return;
    }
    this.get("content").save();
  }.observes("department", "jobTitle")
});

App.SlidesSlide13Route = Ember.Route.extend({
  model: function() {
    return this.store.fetch("company", {limit: 1}).then(function(companies){
      return companies.get("firstObject");
    });
  }
});