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
  addresses: hasMany("address"),
  fullName:  function() {
    return this.get("firstName") + ' ' + this.get("lastName");
  }.property("firstName", "lastName"),
  companies: hasMany({detached: true, embedded: false, path: "employments/{{id}}", as: "employment"})
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

App.Employment = FP.MetaModel.extend({

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
});

App.SlidesSlide7Route = Ember.Route.extend({
  actions: {
    createPerson: function() {
      this.person = this.store.createRecord("person", {
        firstName: "John",
        lastName: "Watson",
        dob: new Date(Date.UTC(1852, 7, 7))
      });
      this.person.save();
    },
    addAddress: function() {
      if (!this.person) {
        return;
      }
      this.person.get("addresses").pushObject(
        this.store.createRecord("address", {
          number: "221B",
          street: "Baker Street",
          city: "London",
          postcode: "NW1 6XE"
        })
      );
      this.person.save();
    }
  }
});

App.SlidesSlide8Route = Ember.Route.extend({
  model: function() {
    return this.store.fetch("person");
  }
});

App.SlidesSlide9Route = Ember.Route.extend({
  model: function() {
    return this.store.fetch("person", {limit: 5});
  }
});

App.SlidesSlide10Route = Ember.Route.extend({
  model: function() {
    return this.store.fetch("person", {limit: 5});
  }
});

App.SlidesSlide11Route = Ember.Route.extend({
  model: function() {
    return this.store.fetch("company");
  }
});

App.SlidesSlide12Route = Ember.Route.extend({
  model: function() {
    return this.store.fetch("company", {startAt: "A", endAt: "J"});
  }
});

App.SlidesSlide13Controller = Ember.ObjectController.extend({
  people: [],
  nonEmployees: function(){
    var employeeIDs = (this.get("employees") || []).mapBy("id");
    return this.get("people").filter(function(item){
      return !employeeIDs.contains(item.get("id"));
    });
  }.property("people.[]", "employees.[]")
});

App.SlidesSlide13Route = Ember.Route.extend({
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


App.SlidesSlide14Controller = Ember.ObjectController.extend({

});

App.EmployeeItemController = Ember.ObjectController.extend({
  detailsChanged: function() {
    if (this.get("changeCameFromFirebase")) {
      return;
    }
    this.get("content").save();
  }.observes("department", "jobTitle")
});

App.SlidesSlide14Route = Ember.Route.extend({
  model: function() {
    return this.store.fetch("company", {limit: 1}).then(function(companies){
      return companies.get("firstObject");
    });
  }
});

App.SlidesSlide15Controller = Ember.ObjectController.extend({
  allCompanies: [],
  otherCompanies: function(){
    var companyIDs = (this.get("companies") || []).mapBy("id");
    return this.get("allCompanies").filter(function(item){
      return !companyIDs.contains(item.get("id"));
    });
  }.property("companies.[]", "allCompanies.[]")
});

App.SlidesSlide15Route = Ember.Route.extend({
  model: function() {
    return this.store.fetch("person", {limit: 1}).then(function(people){
      return people.get("firstObject");
    });
  },

  setupController: function(controller, model) {
    this._super(controller, model);
    controller.set("allCompanies", this.store.find("company"));
  },

  actions: {
    // TODO - shouldn't need a meta model for this
    // and should handle saving the relationship when Person is saved
    // instead of saving the employment - will try and fix that before the presentation
    // so the slides match reality!
    joinCompany: function(company) {
      var person = this.controller.get("content");
      var employment = this.store.createRecord("employment", {content: company});
      person.get("companies").pushObject(employment);
      employment.save();
    },

    leaveCompany: function(company) {
      var person = this.controller.get("content");
      var employment = person.get("companies").findBy("id", company.get("id"));

      // just destry the meta model and everything updates itself
      employment.delete();
    }
  }
});