// Entity-Component-System -- MIT License -- Copyright (c) 2013 Roland Poulter


(function () {

	"use strict";


	// Provide an external reference to Components.

	if (typeof module !== 'undefined') {
		module.exports = Entity;
	}

	else {
		this.Entity = Entity;
	}


	Entity.Components = Components;


	function Entity () {}


	// Helper method for creating an entity object.

	Entity.createEntity = function () {

		return new this();

	};


	// Helper method for creating a component list.

	Entity.createComponents = function (components) {

		return new this.Components(components);

	};


	// Components is all that is really needed for an entity-component-system in JavaScript
	// because objects should work very nicely as entities. Otherwise you can use a uuid for entities.

	function Components (components) {

		this.components = components || {};

	}


	// Get a component by name.

	Components.prototype.getComponent = function (component_name) {

		return this.components[component_name];

	};


	// Store a component by name.

	Components.prototype.addComponent = function (component_name, component) {

		this.components[component_name] = component;

	};


	// Enumerate all stored components.

	Components.prototype.forEach =

	Components.prototype.forEachComponent = function (iterator, keys) {

		keys = keys || Object.keys(this.components);

		keys.forEach(this.forEachComponentIterator.bind(this, iterator));

	};


	Components.prototype.forEachComponentIterator = function (iterator, key) {

		iterator.call(this, this.components[key], key);

	};


	// Asynchronously enumerate all stored components.

	Components.prototype.forEachComponentAsync = function (iterator, callback, keys) {

		// Remember when the enumeration is done.

		var done = false;


		keys = keys || Object.keys(this.components);


		// When there are no components we can just finish by calling the callback.

		if (keys.length === 0) {
			callback();
		}

		// Otherwise, enumerate the components.

		else keys.forEach(function (key, index) {

			iterator.call(this, this.components[key], finish);


			function finish (error) {

				// Ignore finish if it is called after the enumeration is done.

				if (done) return;


				// Stop if there is an error.

				if (error) {
					callback(error);

					done = true;
				}


				// Remove the current key from the list, once the list is empty
				// we can assume its done.

				keys.splice(index, 1);

				if (keys.length === 0) {
					callback.apply(null, arguments);

					done = true;
				}

			}

		}.bind(this));

	};


	// Call a component method, doesn't invoke if the component is not found.
	// Throws an error when invoking a method that does not exist.

	Components.prototype.invoke = function (component_name, method, args) {

		var component = this.components[component_name];

		if (component) return component[method].apply(component, args);

	};


	// Invokes a method for all stored components. Does not throw an error
	// when a component is missing the method. Instead if skips it.

	Components.prototype.invokeForEachComponent = function (method, args, keys) {

		this.forEachComponent(this.invokeForEachComponentIterator.bind(this, method, args), keys);

	};


	Components.prototype.invokeForEachComponentIterator = function (method, args, component) {

		if (component[method]) component[method].apply(component, args);

	};


	// The asynchronous version of invokeForEachComponent. The callback is called once
	// all components methods have finished.

	Components.prototype.invokeForEachComponentAsync = function (method, args, callback, keys) {

		this.forEachComponentAsync(this.invokeForEachComponentIterator.bind(this, method, args), callback, keys);

	};


	Components.prototype.invokeForEachComponentIteratorAsync = function (method, args, component, finish) {

		// Puts the finish callback at the end of args.

		if (args) args[args.length] = finish;

		else args = [finish];


		// Calls the component method, or skips it if the method is undefined.

		if (component[method]) component[method].apply(component, args);

		else finish();

	};

})();
