(function( $ ) {
	// Several of the methods in this plugin use code adapated from Prototype
	//  Prototype JavaScript framework, version 1.6.0.1
	//  (c) 2005-2007 Sam Stephenson
	var regs = {
		undHash: /_|-/,
		colons: /::/,
		words: /([A-Z]+)([A-Z][a-z])/g,
		lowUp: /([a-z\d])([A-Z])/g,
		dash: /([a-z\d])([A-Z])/g,
		replacer: /\{([^\}]+)\}/g,
		dot: /\./
	},
		// gets the nextPart property from current
		// add - if true and nextPart doesnt exist, create it as an empty object
		getNext = function(current, nextPart, add){
			return current[nextPart] !== undefined ? current[nextPart] : ( add && (current[nextPart] = {}) );
		},
		// returns true if the object can have properties (no nulls)
		isContainer = function(current){
			var type = typeof current;
			return current && ( type == 'function' || type == 'object' );
		},
		// a reference
		getObject,
		/** 
		 * @class jQuery.String
		 * @parent jquerymx.lang
		 * 
		 * A collection of useful string helpers. Available helpers are:
		 * <ul>
		 *   <li>[jQuery.String.capitalize|capitalize]: Capitalizes a string (some_string &raquo; Some_string)</li>
		 *   <li>[jQuery.String.camelize|camelize]: Capitalizes a string from something undercored 
		 *       (some_string &raquo; someString, some-string &raquo; someString)</li>
		 *   <li>[jQuery.String.classize|classize]: Like [jQuery.String.camelize|camelize], 
		 *       but the first part is also capitalized (some_string &raquo; SomeString)</li>
		 *   <li>[jQuery.String.niceName|niceName]: Like [jQuery.String.classize|classize], but a space separates each 'word' (some_string &raquo; Some String)</li>
		 *   <li>[jQuery.String.underscore|underscore]: Underscores a string (SomeString &raquo; some_string)</li>
		 *   <li>[jQuery.String.sub|sub]: Returns a string with {param} replaced values from data.
		 *       <code><pre>
		 *       $.String.sub("foo {bar}",{bar: "far"})
		 *       //-> "foo far"</pre></code>
		 *   </li>
		 * </ul>
		 * 
		 */
		str = $.String = $.extend( $.String || {} , {
			
			
			/**
			 * @function getObject
			 * Gets an object from a string.  It can also modify objects on the
			 * 'object path' by removing or adding properties.
			 * 
			 *     Foo = {Bar: {Zar: {"Ted"}}}
		 	 *     $.String.getObject("Foo.Bar.Zar") //-> "Ted"
			 * 
			 * @param {String} name the name of the object to look for
			 * @param {Array} [roots] an array of root objects to look for the 
			 *   name.  If roots is not provided, the window is used.
			 * @param {Boolean} [add] true to add missing objects to 
			 *  the path. false to remove found properties. undefined to 
			 *  not modify the root object
			 * @return {Object} The object.
			 */
			getObject : getObject = function( name, roots, add ) {
			
				// the parts of the name we are looking up
				// ['App','Models','Recipe']
				var parts = name ? name.split(regs.dot) : [],
					length =  parts.length,
					current,
					ret, 
					i,
					r = 0,
					type;
				
				// make sure roots is an array
				roots = $.isArray(roots) ? roots : [roots || window];
				
				if(length == 0){
					return roots[0];
				}
				// for each root, mark it as current
				while( current = roots[r++] ) {
					// walk current to the 2nd to last object
					// or until there is not a container
					for (i =0; i < length - 1 && isContainer(current); i++ ) {
						current = getNext(current, parts[i], add);
					}
					// if we can get a property from the 2nd to last object
					if( isContainer(current) ) {
						
						// get (and possibly set) the property
						ret = getNext(current, parts[i], add); 
						
						// if there is a value, we exit
						if( ret !== undefined ) {
							// if add is false, delete the property
							if ( add === false ) {
								delete current[parts[i]];
							}
							return ret;
							
						}
					}
				}
			},
			/**
			 * Capitalizes a string
			 * @param {String} s the string.
			 * @return {String} a string with the first character capitalized.
			 */
			capitalize: function( s, cache ) {
				return s.charAt(0).toUpperCase() + s.substr(1);
			},
			/**
			 * Capitalizes a string from something undercored. Examples:
			 * @codestart
			 * jQuery.String.camelize("one_two") //-> "oneTwo"
			 * "three-four".camelize() //-> threeFour
			 * @codeend
			 * @param {String} s
			 * @return {String} a the camelized string
			 */
			camelize: function( s ) {
				s = str.classize(s);
				return s.charAt(0).toLowerCase() + s.substr(1);
			},
			/**
			 * Like [jQuery.String.camelize|camelize], but the first part is also capitalized
			 * @param {String} s
			 * @return {String} the classized string
			 */
			classize: function( s , join) {
				var parts = s.split(regs.undHash),
					i = 0;
				for (; i < parts.length; i++ ) {
					parts[i] = str.capitalize(parts[i]);
				}

				return parts.join(join || '');
			},
			/**
			 * Like [jQuery.String.classize|classize], but a space separates each 'word'
			 * @codestart
			 * jQuery.String.niceName("one_two") //-> "One Two"
			 * @codeend
			 * @param {String} s
			 * @return {String} the niceName
			 */
			niceName: function( s ) {
				return str.classize(s,' ');
			},

			/**
			 * Underscores a string.
			 * @codestart
			 * jQuery.String.underscore("OneTwo") //-> "one_two"
			 * @codeend
			 * @param {String} s
			 * @return {String} the underscored string
			 */
			underscore: function( s ) {
				return s.replace(regs.colons, '/').replace(regs.words, '$1_$2').replace(regs.lowUp, '$1_$2').replace(regs.dash, '_').toLowerCase();
			},
			/**
			 * Returns a string with {param} replaced values from data.
			 * 
			 *     $.String.sub("foo {bar}",{bar: "far"})
			 *     //-> "foo far"
			 *     
			 * @param {String} s The string to replace
			 * @param {Object} data The data to be used to look for properties.  If it's an array, multiple
			 * objects can be used.
			 * @param {Boolean} [remove] if a match is found, remove the property from the object
			 */
			sub: function( s, data, remove ) {
				var obs = [],
					remove = typeof remove == 'boolean' ? !remove : remove;
				obs.push(s.replace(regs.replacer, function( whole, inside ) {
					//convert inside to type
					var ob = getObject(inside, data, remove);
					
					// if a container, push into objs (which will return objects found)
					if( isContainer(ob) ){
						obs.push(ob);
						return "";
					}else{
						return ""+ob;
					}
				}));
				
				return obs.length <= 1 ? obs[0] : obs;
			},
			_regs : regs
		});
})(jQuery);
(function( $ ) {

	// =============== HELPERS =================

	    // if we are initializing a new class
	var initializing = false,
		makeArray = $.makeArray,
		isFunction = $.isFunction,
		isArray = $.isArray,
		extend = $.extend,
		getObject = $.String.getObject,
		concatArgs = function(arr, args){
			return arr.concat(makeArray(args));
		},
		
		// tests if we can get super in .toString()
		fnTest = /xyz/.test(function() {
			xyz;
		}) ? /\b_super\b/ : /.*/,
		
		// overwrites an object with methods, sets up _super
		//   newProps - new properties
		//   oldProps - where the old properties might be
		//   addTo - what we are adding to
		inheritProps = function( newProps, oldProps, addTo ) {
			addTo = addTo || newProps
			for ( var name in newProps ) {
				// Check if we're overwriting an existing function
				addTo[name] = isFunction(newProps[name]) && 
							  isFunction(oldProps[name]) && 
							  fnTest.test(newProps[name]) ? (function( name, fn ) {
					return function() {
						var tmp = this._super,
							ret;

						// Add a new ._super() method that is the same method
						// but on the super-class
						this._super = oldProps[name];

						// The method only need to be bound temporarily, so we
						// remove it when we're done executing
						ret = fn.apply(this, arguments);
						this._super = tmp;
						return ret;
					};
				})(name, newProps[name]) : newProps[name];
			}
		},
		STR_PROTOTYPE = 'prototype'

	/**
	 * @class jQuery.Class
	 * @plugin jquery/class
	 * @parent jquerymx
	 * @download dist/jquery/jquery.class.js
	 * @test jquery/class/qunit.html
	 * @description Easy inheritance in JavaScript.
	 * 
	 * Class provides simulated inheritance in JavaScript. Use Class to bridge the gap between
	 * jQuery's functional programming style and Object Oriented Programming. It 
	 * is based off John Resig's [http://ejohn.org/blog/simple-javascript-inheritance/|Simple Class]
	 * Inheritance library.  Besides prototypal inheritance, it includes a few important features:
	 * 
	 *   - Static inheritance
	 *   - Introspection
	 *   - Namespaces
	 *   - Setup and initialization methods
	 *   - Easy callback function creation
	 * 
	 * 
	 * The [mvc.class Get Started with jQueryMX] has a good walkthrough of $.Class.
	 * 
	 * ## Static v. Prototype
	 * 
	 * Before learning about Class, it's important to
	 * understand the difference between
	 * a class's __static__ and __prototype__ properties.
	 * 
	 *     //STATIC
	 *     MyClass.staticProperty  //shared property
	 *     
	 *     //PROTOTYPE
	 *     myclass = new MyClass()
	 *     myclass.prototypeMethod() //instance method
	 * 
	 * A static (or class) property is on the Class constructor
	 * function itself
	 * and can be thought of being shared by all instances of the 
	 * Class. Prototype propertes are available only on instances of the Class.
	 * 
	 * ## A Basic Class
	 * 
	 * The following creates a Monster class with a
	 * name (for introspection), static, and prototype members.
	 * Every time a monster instance is created, the static
	 * count is incremented.
	 *
	 * @codestart
	 * $.Class('Monster',
	 * /* @static *|
	 * {
	 *   count: 0
	 * },
	 * /* @prototype *|
	 * {
	 *   init: function( name ) {
	 *
	 *     // saves name on the monster instance
	 *     this.name = name;
	 *
	 *     // sets the health
	 *     this.health = 10;
	 *
	 *     // increments count
	 *     this.constructor.count++;
	 *   },
	 *   eat: function( smallChildren ){
	 *     this.health += smallChildren;
	 *   },
	 *   fight: function() {
	 *     this.health -= 2;
	 *   }
	 * });
	 *
	 * hydra = new Monster('hydra');
	 *
	 * dragon = new Monster('dragon');
	 *
	 * hydra.name        // -> hydra
	 * Monster.count     // -> 2
	 * Monster.shortName // -> 'Monster'
	 *
	 * hydra.eat(2);     // health = 12
	 *
	 * dragon.fight();   // health = 8
	 *
	 * @codeend
	 *
	 * 
	 * Notice that the prototype <b>init</b> function is called when a new instance of Monster is created.
	 * 
	 * 
	 * ## Inheritance
	 * 
	 * When a class is extended, all static and prototype properties are available on the new class.
	 * If you overwrite a function, you can call the base class's function by calling
	 * <code>this._super</code>.  Lets create a SeaMonster class.  SeaMonsters are less
	 * efficient at eating small children, but more powerful fighters.
	 * 
	 * 
	 *     Monster("SeaMonster",{
	 *       eat: function( smallChildren ) {
	 *         this._super(smallChildren / 2);
	 *       },
	 *       fight: function() {
	 *         this.health -= 1;
	 *       }
	 *     });
	 *     
	 *     lockNess = new SeaMonster('Lock Ness');
	 *     lockNess.eat(4);   //health = 12
	 *     lockNess.fight();  //health = 11
	 * 
	 * ### Static property inheritance
	 * 
	 * You can also inherit static properties in the same way:
	 * 
	 *     $.Class("First",
	 *     {
	 *         staticMethod: function() { return 1;}
	 *     },{})
	 *
	 *     First("Second",{
	 *         staticMethod: function() { return this._super()+1;}
	 *     },{})
	 *
	 *     Second.staticMethod() // -> 2
	 * 
	 * ## Namespaces
	 * 
	 * Namespaces are a good idea! We encourage you to namespace all of your code.
	 * It makes it possible to drop your code into another app without problems.
	 * Making a namespaced class is easy:
	 * 
	 * 
	 *     $.Class("MyNamespace.MyClass",{},{});
	 *
	 *     new MyNamespace.MyClass()
	 * 
	 * 
	 * <h2 id='introspection'>Introspection</h2>
	 * 
	 * Often, it's nice to create classes whose name helps determine functionality.  Ruby on
	 * Rails's [http://api.rubyonrails.org/classes/ActiveRecord/Base.html|ActiveRecord] ORM class
	 * is a great example of this.  Unfortunately, JavaScript doesn't have a way of determining
	 * an object's name, so the developer must provide a name.  Class fixes this by taking a String name for the class.
	 * 
	 *     $.Class("MyOrg.MyClass",{},{})
	 *     MyOrg.MyClass.shortName //-> 'MyClass'
	 *     MyOrg.MyClass.fullName //->  'MyOrg.MyClass'
	 * 
	 * The fullName (with namespaces) and the shortName (without namespaces) are added to the Class's
	 * static properties.
	 *
	 *
	 * ## Setup and initialization methods
	 * 
	 * <p>
	 * Class provides static and prototype initialization functions.
	 * These come in two flavors - setup and init.
	 * Setup is called before init and
	 * can be used to 'normalize' init's arguments.
	 * </p>
	 * <div class='whisper'>PRO TIP: Typically, you don't need setup methods in your classes. Use Init instead.
	 * Reserve setup methods for when you need to do complex pre-processing of your class before init is called.
	 *
	 * </div>
	 * @codestart
	 * $.Class("MyClass",
	 * {
	 *   setup: function() {} //static setup
	 *   init: function() {} //static constructor
	 * },
	 * {
	 *   setup: function() {} //prototype setup
	 *   init: function() {} //prototype constructor
	 * })
	 * @codeend
	 *
	 * ### Setup
	 * 
	 * Setup functions are called before init functions.  Static setup functions are passed
	 * the base class followed by arguments passed to the extend function.
	 * Prototype static functions are passed the Class constructor 
	 * function arguments.
	 * 
	 * If a setup function returns an array, that array will be used as the arguments
	 * for the following init method.  This provides setup functions the ability to normalize
	 * arguments passed to the init constructors.  They are also excellent places
	 * to put setup code you want to almost always run.
	 * 
	 * 
	 * The following is similar to how [jQuery.Controller.prototype.setup]
	 * makes sure init is always called with a jQuery element and merged options
	 * even if it is passed a raw
	 * HTMLElement and no second parameter.
	 * 
	 *     $.Class("jQuery.Controller",{
	 *       ...
	 *     },{
	 *       setup: function( el, options ) {
	 *         ...
	 *         return [$(el),
	 *                 $.extend(true,
	 *                    this.Class.defaults,
	 *                    options || {} ) ]
	 *       }
	 *     })
	 * 
	 * Typically, you won't need to make or overwrite setup functions.
	 * 
	 * ### Init
	 *
	 * Init functions are called after setup functions.
	 * Typically, they receive the same arguments
	 * as their preceding setup function.  The Foo class's <code>init</code> method
	 * gets called in the following example:
	 * 
	 *     $.Class("Foo", {
	 *       init: function( arg1, arg2, arg3 ) {
	 *         this.sum = arg1+arg2+arg3;
	 *       }
	 *     })
	 *     var foo = new Foo(1,2,3);
	 *     foo.sum //-> 6
	 * 
	 * ## Proxies
	 * 
	 * Similar to jQuery's proxy method, Class provides a
	 * [jQuery.Class.static.proxy proxy]
	 * function that returns a callback to a method that will always
	 * have
	 * <code>this</code> set to the class or instance of the class.
	 * 
	 * 
	 * The following example uses this.proxy to make sure
	 * <code>this.name</code> is available in <code>show</code>.
	 * 
	 *     $.Class("Todo",{
	 *       init: function( name ) { 
	 *       	this.name = name 
	 *       },
	 *       get: function() {
	 *         $.get("/stuff",this.proxy('show'))
	 *       },
	 *       show: function( txt ) {
	 *         alert(this.name+txt)
	 *       }
	 *     })
	 *     new Todo("Trash").get()
	 * 
	 * Callback is available as a static and prototype method.
	 * 
	 * ##  Demo
	 * 
	 * @demo jquery/class/class.html
	 * 
	 * 
	 * @constructor
	 * 
	 * To create a Class call:
	 * 
	 *     $.Class( [NAME , STATIC,] PROTOTYPE ) -> Class
	 * 
	 * <div class='params'>
	 *   <div class='param'><label>NAME</label><code>{optional:String}</code>
	 *   <p>If provided, this sets the shortName and fullName of the 
	 *      class and adds it and any necessary namespaces to the 
	 *      window object.</p>
	 *   </div>
	 *   <div class='param'><label>STATIC</label><code>{optional:Object}</code>
	 *   <p>If provided, this creates static properties and methods
	 *   on the class.</p>
	 *   </div>
	 *   <div class='param'><label>PROTOTYPE</label><code>{Object}</code>
	 *   <p>Creates prototype methods on the class.</p>
	 *   </div>
	 * </div>
	 * 
	 * When a Class is created, the static [jQuery.Class.static.setup setup] 
	 * and [jQuery.Class.static.init init]  methods are called.
	 * 
	 * To create an instance of a Class, call:
	 * 
	 *     new Class([args ... ]) -> instance
	 * 
	 * The created instance will have all the 
	 * prototype properties and methods defined by the PROTOTYPE object.
	 * 
	 * When an instance is created, the prototype [jQuery.Class.prototype.setup setup] 
	 * and [jQuery.Class.prototype.init init]  methods 
	 * are called.
	 */

	clss = $.Class = function() {
		if (arguments.length) {
			return clss.extend.apply(clss, arguments);
		}
	};

	/* @Static*/
	extend(clss, {
		/**
		 * @function proxy
		 * Returns a callback function for a function on this Class.
		 * Proxy ensures that 'this' is set appropriately.  
		 * @codestart
		 * $.Class("MyClass",{
		 *     getData: function() {
		 *         this.showing = null;
		 *         $.get("data.json",this.proxy('gotData'),'json')
		 *     },
		 *     gotData: function( data ) {
		 *         this.showing = data;
		 *     }
		 * },{});
		 * MyClass.showData();
		 * @codeend
		 * <h2>Currying Arguments</h2>
		 * Additional arguments to proxy will fill in arguments on the returning function.
		 * @codestart
		 * $.Class("MyClass",{
		 *    getData: function( <b>callback</b> ) {
		 *      $.get("data.json",this.proxy('process',<b>callback</b>),'json');
		 *    },
		 *    process: function( <b>callback</b>, jsonData ) { //callback is added as first argument
		 *        jsonData.processed = true;
		 *        callback(jsonData);
		 *    }
		 * },{});
		 * MyClass.getData(showDataFunc)
		 * @codeend
		 * <h2>Nesting Functions</h2>
		 * Proxy can take an array of functions to call as 
		 * the first argument.  When the returned callback function
		 * is called each function in the array is passed the return value of the prior function.  This is often used
		 * to eliminate currying initial arguments.
		 * @codestart
		 * $.Class("MyClass",{
		 *    getData: function( callback ) {
		 *      //calls process, then callback with value from process
		 *      $.get("data.json",this.proxy(['process2',callback]),'json') 
		 *    },
		 *    process2: function( type,jsonData ) {
		 *        jsonData.processed = true;
		 *        return [jsonData];
		 *    }
		 * },{});
		 * MyClass.getData(showDataFunc);
		 * @codeend
		 * @param {String|Array} fname If a string, it represents the function to be called.  
		 * If it is an array, it will call each function in order and pass the return value of the prior function to the
		 * next function.
		 * @return {Function} the callback function.
		 */
		proxy: function( funcs ) {

			//args that should be curried
			var args = makeArray(arguments),
				self;

			// get the functions to callback
			funcs = args.shift();

			// if there is only one function, make funcs into an array
			if (!isArray(funcs) ) {
				funcs = [funcs];
			}
			
			// keep a reference to us in self
			self = this;
			
			
			return function class_cb() {
				// add the arguments after the curried args
				var cur = concatArgs(args, arguments),
					isString, 
					length = funcs.length,
					f = 0,
					func;
				
				// go through each function to call back
				for (; f < length; f++ ) {
					func = funcs[f];
					if (!func ) {
						continue;
					}
					
					// set called with the name of the function on self (this is how this.view works)
					isString = typeof func == "string";
					if ( isString && self._set_called ) {
						self.called = func;
					}
					
					// call the function
					cur = (isString ? self[func] : func).apply(self, cur || []);
					
					// pass the result to the next function (if there is a next function)
					if ( f < length - 1 ) {
						cur = !isArray(cur) || cur._use_call ? [cur] : cur
					}
				}
				return cur;
			}
		},
		/**
		 * @function newInstance
		 * Creates a new instance of the class.  This method is useful for creating new instances
		 * with arbitrary parameters.
		 * <h3>Example</h3>
		 * @codestart
		 * $.Class("MyClass",{},{})
		 * var mc = MyClass.newInstance.apply(null, new Array(parseInt(Math.random()*10,10))
		 * @codeend
		 * @return {class} instance of the class
		 */
		newInstance: function() {
			// get a raw instance objet (init is not called)
			var inst = this.rawInstance(),
				args;
				
			// call setup if there is a setup
			if ( inst.setup ) {
				args = inst.setup.apply(inst, arguments);
			}
			// call init if there is an init, if setup returned args, use those as the arguments
			if ( inst.init ) {
				inst.init.apply(inst, isArray(args) ? args : arguments);
			}
			return inst;
		},
		/**
		 * Setup gets called on the inherting class with the base class followed by the
		 * inheriting class's raw properties.
		 * 
		 * Setup will deeply extend a static defaults property on the base class with 
		 * properties on the base class.  For example:
		 * 
		 *     $.Class("MyBase",{
		 *       defaults : {
		 *         foo: 'bar'
		 *       }
		 *     },{})
		 * 
		 *     MyBase("Inheriting",{
		 *       defaults : {
		 *         newProp : 'newVal'
		 *       }
		 *     },{}
		 *     
		 *     Inheriting.defaults -> {foo: 'bar', 'newProp': 'newVal'}
		 * 
		 * @param {Object} baseClass the base class that is being inherited from
		 * @param {String} fullName the name of the new class
		 * @param {Object} staticProps the static properties of the new class
		 * @param {Object} protoProps the prototype properties of the new class
		 */
		setup: function( baseClass, fullName ) {
			// set defaults as the merger of the parent defaults and this object's defaults
			this.defaults = extend(true, {}, baseClass.defaults, this.defaults);
			return arguments;
		},
		rawInstance: function() {
			// prevent running init
			initializing = true;
			var inst = new this();
			initializing = false;
			// allow running init
			return inst;
		},
		/**
		 * Extends a class with new static and prototype functions.  There are a variety of ways
		 * to use extend:
		 * 
		 *     // with className, static and prototype functions
		 *     $.Class('Task',{ STATIC },{ PROTOTYPE })
		 *     // with just classname and prototype functions
		 *     $.Class('Task',{ PROTOTYPE })
		 *     // with just a className
		 *     $.Class('Task')
		 * 
		 * You no longer have to use <code>.extend</code>.  Instead, you can pass those options directly to
		 * $.Class (and any inheriting classes):
		 * 
		 *     // with className, static and prototype functions
		 *     $.Class('Task',{ STATIC },{ PROTOTYPE })
		 *     // with just classname and prototype functions
		 *     $.Class('Task',{ PROTOTYPE })
		 *     // with just a className
		 *     $.Class('Task')
		 * 
		 * @param {String} [fullName]  the classes name (used for classes w/ introspection)
		 * @param {Object} [klass]  the new classes static/class functions
		 * @param {Object} [proto]  the new classes prototype functions
		 * 
		 * @return {jQuery.Class} returns the new class
		 */
		extend: function( fullName, klass, proto ) {
			// figure out what was passed and normalize it
			if ( typeof fullName != 'string' ) {
				proto = klass;
				klass = fullName;
				fullName = null;
			}
			if (!proto ) {
				proto = klass;
				klass = null;
			}

			proto = proto || {};
			var _super_class = this,
				_super = this[STR_PROTOTYPE],
				name, shortName, namespace, prototype;

			// Instantiate a base class (but only create the instance,
			// don't run the init constructor)
			initializing = true;
			prototype = new this();
			initializing = false;
			
			// Copy the properties over onto the new prototype
			inheritProps(proto, _super, prototype);

			// The dummy class constructor
			function Class() {
				// All construction is actually done in the init method
				if ( initializing ) return;

				// we are being called w/o new, we are extending
				if ( this.constructor !== Class && arguments.length ) { 
					return arguments.callee.extend.apply(arguments.callee, arguments)
				} else { //we are being called w/ new
					return this.Class.newInstance.apply(this.Class, arguments)
				}
			}
			// Copy old stuff onto class
			for ( name in this ) {
				if ( this.hasOwnProperty(name) ) {
					Class[name] = this[name];
				}
			}

			// copy new static props on class
			inheritProps(klass, this, Class);

			// do namespace stuff
			if ( fullName ) {

				var parts = fullName.split(/\./),
					shortName = parts.pop(),
					current = getObject(parts.join('.'), window, true),
					namespace = current;

				
				current[shortName] = Class;
			}

			// set things that can't be overwritten
			extend(Class, {
				prototype: prototype,
				/**
				 * @attribute namespace 
				 * The namespaces object
				 * 
				 *     $.Class("MyOrg.MyClass",{},{})
				 *     MyOrg.MyClass.namespace //-> MyOrg
				 * 
				 */
				namespace: namespace,
				/**
				 * @attribute shortName 
				 * The name of the class without its namespace, provided for introspection purposes.
				 * 
				 *     $.Class("MyOrg.MyClass",{},{})
				 *     MyOrg.MyClass.shortName //-> 'MyClass'
				 *     MyOrg.MyClass.fullName //->  'MyOrg.MyClass'
				 * 
				 */
				shortName: shortName,
				constructor: Class,
				/**
				 * @attribute fullName 
				 * The full name of the class, including namespace, provided for introspection purposes.
				 * 
				 *     $.Class("MyOrg.MyClass",{},{})
				 *     MyOrg.MyClass.shortName //-> 'MyClass'
				 *     MyOrg.MyClass.fullName //->  'MyOrg.MyClass'
				 * 
				 */
				fullName: fullName
			});

			//make sure our prototype looks nice
			Class[STR_PROTOTYPE].Class = Class[STR_PROTOTYPE].constructor = Class;

			

			// call the class setup
			var args = Class.setup.apply(Class, concatArgs([_super_class],arguments));
			
			// call the class init
			if ( Class.init ) {
				Class.init.apply(Class, args || concatArgs([_super_class],arguments));
			}

			/* @Prototype*/
			return Class;
			/** 
			 * @function setup
			 * If a setup method is provided, it is called when a new 
			 * instances is created.  It gets passed the same arguments that
			 * were given to the Class constructor function (<code> new Class( arguments ... )</code>).
			 * 
			 *     $.Class("MyClass",
			 *     {
			 *        setup: function( val ) {
			 *           this.val = val;
			 *         }
			 *     })
			 *     var mc = new MyClass("Check Check")
			 *     mc.val //-> 'Check Check'
			 * 
			 * Setup is called before [jQuery.Class.prototype.init init].  If setup 
			 * return an array, those arguments will be used for init. 
			 * 
			 *     $.Class("jQuery.Controller",{
			 *       setup : function(htmlElement, rawOptions){
			 *         return [$(htmlElement), 
			 *                   $.extend({}, this.Class.defaults, rawOptions )] 
			 *       }
			 *     })
			 * 
			 * <div class='whisper'>PRO TIP: 
			 * Setup functions are used to normalize constructor arguments and provide a place for
			 * setup code that extending classes don't have to remember to call _super to
			 * run.
			 * </div>
			 * 
			 * Setup is not defined on $.Class itself, so calling super in inherting classes
			 * will break.  Don't do the following:
			 * 
			 *     $.Class("Thing",{
			 *       setup : function(){
			 *         this._super(); // breaks!
			 *       }
			 *     })
			 * 
			 * @return {Array|undefined} If an array is return, [jQuery.Class.prototype.init] is 
			 * called with those arguments; otherwise, the original arguments are used.
			 */
			//break up
			/** 
			 * @function init
			 * If an <code>init</code> method is provided, it gets called when a new instance
			 * is created.  Init gets called after [jQuery.Class.prototype.setup setup], typically with the 
			 * same arguments passed to the Class 
			 * constructor: (<code> new Class( arguments ... )</code>).  
			 * 
			 *     $.Class("MyClass",
			 *     {
			 *        init: function( val ) {
			 *           this.val = val;
			 *        }
			 *     })
			 *     var mc = new MyClass(1)
			 *     mc.val //-> 1
			 * 
			 * [jQuery.Class.prototype.setup Setup] is able to modify the arguments passed to init.  Read
			 * about it there.
			 * 
			 */
			//Breaks up code
			/**
			 * @attribute constructor
			 * 
			 * A reference to the Class (or constructor function).  This allows you to access 
			 * a class's static properties from an instance.
			 * 
			 * ### Quick Example
			 * 
			 *     // a class with a static property
			 *     $.Class("MyClass", {staticProperty : true}, {});
			 *     
			 *     // a new instance of myClass
			 *     var mc1 = new MyClass();
			 * 
			 *     // read the static property from the instance:
			 *     mc1.constructor.staticProperty //-> true
			 *     
			 * Getting static properties with the constructor property, like
			 * [jQuery.Class.static.fullName fullName], is very common.
			 * 
			 */
		}

	})





	clss.callback = clss[STR_PROTOTYPE].callback = clss[STR_PROTOTYPE].
	/**
	 * @function proxy
	 * Returns a method that sets 'this' to the current instance.  This does the same thing as 
	 * and is described better in [jQuery.Class.static.proxy].
	 * The only difference is this proxy works
	 * on a instance instead of a class.
	 * @param {String|Array} fname If a string, it represents the function to be called.  
	 * If it is an array, it will call each function in order and pass the return value of the prior function to the
	 * next function.
	 * @return {Function} the callback function
	 */
	proxy = clss.proxy;


})(jQuery);
(function( $ ) {
	/**
	 * @attribute destroyed
	 * @parent specialevents
	 * @download  http://jmvcsite.heroku.com/pluginify?plugins[]=jquery/dom/destroyed/destroyed.js
	 * @test jquery/event/destroyed/qunit.html
	 * Provides a destroyed event on an element.
	 * <p>
	 * The destroyed event is called when the element
	 * is removed as a result of jQuery DOM manipulators like remove, html,
	 * replaceWith, etc. Destroyed events do not bubble, so make sure you don't use live or delegate with destroyed
	 * events.
	 * </p>
	 * <h2>Quick Example</h2>
	 * @codestart
	 * $(".foo").bind("destroyed", function(){
	 *    //clean up code
	 * })
	 * @codeend
	 * <h2>Quick Demo</h2>
	 * @demo jquery/event/destroyed/destroyed.html 
	 * <h2>More Involved Demo</h2>
	 * @demo jquery/event/destroyed/destroyed_menu.html 
	 */

	var oldClean = jQuery.cleanData;

	$.cleanData = function( elems ) {
		for ( var i = 0, elem;
		(elem = elems[i]) !== undefined; i++ ) {
			$(elem).triggerHandler("destroyed");
			//$.event.remove( elem, 'destroyed' );
		}
		oldClean(elems);
	};

})(jQuery);
(function() {

	// Alias helpful methods from jQuery
	var isArray = $.isArray,
		isObject = function( obj ) {
			return typeof obj === 'object' && obj !== null && obj;
		},
		makeArray = $.makeArray,
		each = $.each,
		// listens to changes on val and 'bubbles' the event up
		// - val the object to listen to changes on
		// - prop the property name val is at on
		// - parent the parent object of prop
		hookup = function( val, prop, parent ) {
			// if it's an array make a list, otherwise a val
			if (val instanceof $.Observe){
				// we have an observe already
				// make sure it is not listening to this already
				unhookup([val], parent._namespace)
			} else if ( isArray(val) ) {
				val = new $.Observe.List(val)
			} else {
				val = new $.Observe(val)
			}
			// attr (like target, how you (delegate) to get to the target)
            // currentAttr (how to get to you)
            // delegateAttr (hot to get to the delegated Attr)
			
			//
			//
			//listen to all changes and trigger upwards
			val.bind("change" + parent._namespace, function( ev, attr ) {
				// trigger the type on this ...
				var args = $.makeArray(arguments),
					ev = args.shift();
				if(prop === "*"){
					args[0] = parent.indexOf(val)+"." + args[0]
				} else {
					args[0] = prop +  "." + args[0]
				}
				// change the attr
				//ev.origTarget = ev.origTarget || ev.target;
				// the target should still be the original object ...
				$.event.trigger(ev, args, parent)
			});

			return val;
		},
		unhookup = function(items, namespace){
			var item;
			for(var i =0; i < items.length; i++){
				item = items[i]
				if(  item && item.unbind ){
					item.unbind("change" + namespace)
				}
			}
		},
		// an id to track events for a given observe
		id = 0,
		collecting = null,
		// call to start collecting events (Observe sends all events at once)
		collect = function() {
			if (!collecting ) {
				collecting = [];
				return true;
			}
		},
		// creates an event on item, but will not send immediately 
		// if collecting events
		// - item - the item the event should happen on
		// - event - the event name ("change")
		// - args - an array of arguments
		trigger = function( item, event, args ) {
			// send no events if initalizing
			if (item._init) {
				return;
			}
			if (!collecting ) {
				return $.event.trigger(event, args, item, true)
			} else {
				collecting.push({
					t: item,
					ev: event,
					args: args
				})
			}
		},
		// which batch of events this is for, might not want to send multiple
		// messages on the same batch.  This is mostly for 
		// event delegation
		batchNum = 0,
		// sends all pending events
		sendCollection = function() {
			var len = collecting.length,
				items = collecting.slice(0),
				cur;
			collecting = null;
			batchNum ++;
			for ( var i = 0; i < len; i++ ) {
				cur = items[i];
				// batchNum
				$.event.trigger({
					type: cur.ev,
					batchNum : batchNum
				}, cur.args, cur.t)
			}
			
		},
		// a helper used to serialize an Observe or Observe.List where:
		// observe - the observable
		// how - to serialize with 'attrs' or 'serialize'
		// where - to put properties, in a {} or [].
		serialize = function( observe, how, where ) {
			// go through each property
			observe.each(function( name, val ) {
				// if the value is an object, and has a attrs or serialize function
				where[name] = isObject(val) && typeof val[how] == 'function' ?
				// call attrs or serialize to get the original data back
				val[how]() :
				// otherwise return the value
				val
			})
			return where;
		};

	/**
	 * @class jQuery.Observe
	 * @parent jquerymx.lang
	 * @test jquery/lang/observe/qunit.html
	 * 
	 * Observe provides the awesome observable pattern for
	 * JavaScript Objects and Arrays. It lets you
	 * 
	 *   - Set and remove property or property values on objects and arrays
	 *   - Listen for changes in objects and arrays
	 *   - Work with nested properties
	 * 
	 * ## Creating an $.Observe
	 * 
	 * To create an $.Observe, or $.Observe.List, you can simply use 
	 * the `$.O(data)` shortcut like:
	 * 
	 *     var person = $.O({name: 'justin', age: 29}),
	 *         hobbies = $.O(['programming', 'basketball', 'nose picking'])
	 * 
	 * Depending on the type of data passed to $.O, it will create an instance of either: 
	 * 
	 *   - $.Observe, which is used for objects like: `{foo: 'bar'}`, and
	 *   - [jQuery.Observe.List $.Observe.List], which is used for arrays like `['foo','bar']`
	 *   
	 * $.Observe.List and $.Observe are very similar. In fact,
	 * $.Observe.List inherits $.Observe and only adds a few extra methods for
	 * manipulating arrays like [jQuery.Observe.List.prototype.push push].  Go to
	 * [jQuery.Observe.List $.Observe.List] for more information about $.Observe.List.
	 * 
	 * You can also create a `new $.Observe` simply by pass it the data you want to observe:
	 * 
	 *     var data = { 
	 *       addresses : [
	 *         {
	 *           city: 'Chicago',
	 *           state: 'IL'
	 *         },
	 *         {
	 *           city: 'Boston',
	 *           state : 'MA'
	 *         }
	 *         ],
	 *       name : "Justin Meyer"
	 *     },
	 *     o = new $.Observe(data);
	 *     
	 * _o_ now represents an observable copy of _data_.  
	 * 
	 * ## Getting and Setting Properties
	 * 
	 * Use [jQuery.Observe.prototype.attr attr] and [jQuery.Observe.prototype.attr attrs]
	 * to get and set properties.
	 * 
	 * For example, you can read the property values of _o_ with
	 * `observe.attr( name )` like:
	 * 
	 *     // read name
	 *     o.attr('name') //-> Justin Meyer
	 *     
	 * And set property names of _o_ with 
	 * `observe.attr( name, value )` like:
	 * 
	 *     // update name
	 *     o.attr('name', "Brian Moschel") //-> o
	 * 
	 * Observe handles nested data.  Nested Objects and
	 * Arrays are converted to $.Observe and 
	 * $.Observe.Lists.  This lets you read nested properties 
	 * and use $.Observe methods on them.  The following 
	 * updates the second address (Boston) to 'New York':
	 * 
	 *     o.attr('addresses.1').attrs({
	 *       city: 'New York',
	 *       state: 'NY'
	 *     })
	 * 
	 * `attrs()` can be used to get all properties back from the observe:
	 * 
	 *     o.attrs() // -> 
	 *     { 
	 *       addresses : [
	 *         {
	 *           city: 'Chicago',
	 *           state: 'IL'
	 *         },
	 *         {
	 *           city: 'New York',
	 *           state : 'MA'
	 *         }
	 *       ],
	 *       name : "Brian Moschel"
	 *     }
	 * 
	 * ## Listening to property changes
	 * 
	 * When a property value is changed, it creates events
	 * that you can listen to.  There are two ways to listen
	 * for events:
	 * 
	 *   - [jQuery.Observe.prototype.bind bind] - listen for any type of change
	 *   - [jQuery.Observe.prototype.delegate delegate] - listen to a specific type of change
	 *     
	 * With `bind( "change" , handler( ev, attr, how, newVal, oldVal ) )`, you can listen
	 * to any change that happens within the 
	 * observe. The handler gets called with the property name that was
	 * changed, how it was changed ['add','remove','set'], the new value
	 * and the old value.
	 * 
	 *     o.bind('change', function( ev, attr, how, nevVal, oldVal ) {
	 *     
	 *     })
	 * 
	 * `delegate( attr, event, handler(ev, newVal, oldVal ) )` lets you listen
	 * to a specific event on a specific attribute. 
	 * 
	 *     // listen for name changes
	 *     o.delegate("name","set", function(){
	 *     
	 *     })
	 *     
	 * Delegate lets you specify multiple attributes and values to match 
	 * for the callback. For example,
	 * 
	 *     r = $.O({type: "video", id : 5})
	 *     r.delegate("type=images id","set", function(){})
	 *     
	 * This is used heavily by [jQuery.route $.route].
	 * 
	 * @constructor
	 * 
	 * @param {Object} obj a JavaScript Object that will be 
	 * converted to an observable
	 */
	$.Class('jQuery.Observe',
	/**
	 * @prototype
	 */
	{
		init: function( obj ) {
			// _data is where we keep the properties
			this._data = {};
			// the namespace this object uses to listen to events
			this._namespace = ".observe" + (++id);
			// sets all attrs
			this._init = true;
			this.attrs(obj);
			delete this._init;
		},
		/**
		 * Get or set an attribute on the observe.
		 * 
		 *     o = new $.Observe({});
		 *     
		 *     // sets a user property
		 *     o.attr('user',{name: 'hank'});
		 *     
		 *     // read the user's name
		 *     o.attr('user.name') //-> 'hank'
		 * 
		 * If a value is set for the first time, it will trigger 
		 * an `'add'` and `'set'` change event.  Once
		 * the value has been added.  Any future value changes will
		 * trigger only `'set'` events.
		 * 
		 * 
		 * @param {String} attr the attribute to read or write.
		 * 
		 *     o.attr('name') //-> reads the name
		 *     o.attr('name', 'Justin') //-> writes the name
		 *     
		 * You can read or write deep property names.  For example:
		 * 
		 *     o.attr('person', {name: 'Justin'})
		 *     o.attr('person.name') //-> 'Justin'
		 * 
		 * @param {Object} [val] if provided, sets the value.
		 * @return {Object} the observable or the attribute property.
		 * 
		 * If you are reading, the property value is returned:
		 * 
		 *     o.attr('name') //-> Justin
		 *     
		 * If you are writing, the observe is returned for chaining:
		 * 
		 *     o.attr('name',"Brian").attr('name') //-> Justin
		 */
		attr: function( attr, val ) {

			if ( val === undefined ) {
				// if we are getting a value
				return this._get(attr)
			} else {
				// otherwise we are setting
				this._set(attr, val);
				return this;
			}
		},
		/**
		 * Iterates through each attribute, calling handler 
		 * with each attribute name and value.
		 * 
		 *     new Observe({foo: 'bar'})
		 *       .each(function(name, value){
		 *         equals(name, 'foo')
		 *         equals(value,'bar')
		 *       })
		 * 
		 * @param {function} handler(attrName,value) A function that will get 
		 * called back with the name and value of each attribute on the observe.
		 * 
		 * Returning `false` breaks the looping.  The following will never
		 * log 3:
		 * 
		 *     new Observe({a : 1, b : 2, c: 3})
		 *       .each(function(name, value){
		 *         console.log(value)
		 *         if(name == 2){
		 *           return false;
		 *         }
		 *       })
		 * 
		 * @return {jQuery.Observe} the original observable.
		 */
		each: function() {
			return each.apply(null, [this.__get()].concat(makeArray(arguments)))
		},
		/**
		 * Removes a property
		 * 
		 *     o =  new $.Observe({foo: 'bar'});
		 *     o.removeAttr('foo'); //-> 'bar'
		 * 
		 * This creates a `'remove'` change event. Learn more about events
		 * in [jQuery.Observe.prototype.bind bind] and [jQuery.Observe.prototype.delegate delegate].
		 * 
		 * @param {String} attr the attribute name to remove.
		 * @return {Object} the value that was removed.
		 */
		removeAttr: function( attr ) {
			// convert the attr into parts (if nested)
			var parts = isArray(attr) ? attr : attr.split("."),
				// the actual property to remove
				prop = parts.shift(),
				// the current value
				current = this._data[prop];

			// if we have more parts, call removeAttr on that part
			if ( parts.length ) {
				return current.removeAttr(parts)
			} else {
				// otherwise, delete
				delete this._data[prop];
				// create the event
				trigger(this, "change", [prop, "remove", undefined, current]);
				return current;
			}
		},
		// reads a property from the object
		_get: function( attr ) {
			var parts = isArray(attr) ? attr : (""+attr).split("."),
				current = this.__get(parts.shift());
			if ( parts.length ) {
				return current ? current._get(parts) : undefined
			} else {
				return current;
			}
		},
		// reads a property directly if an attr is provided, otherwise
		// returns the 'real' data object itself
		__get: function( attr ) {
			return attr ? this._data[attr] : this._data;
		},
		// sets attr prop as value on this object where
		// attr - is a string of properties or an array  of property values
		// value - the raw value to set
		// description - an object with converters / serializers / defaults / getterSetters?
		_set: function( attr, value ) {
			// convert attr to attr parts (if it isn't already)
			var parts = isArray(attr) ? attr : ("" + attr).split("."),
				// the immediate prop we are setting
				prop = parts.shift(),
				// its current value
				current = this.__get(prop);

			// if we have an object and remaining parts
			if ( isObject(current) && parts.length ) {
				// that object should set it (this might need to call attr)
				current._set(parts, value)
			} else if (!parts.length ) {
				// otherwise, we are setting it on this object
				// todo: check if value is object and transform
				// are we changing the value
				if ( value !== current ) {

					// check if we are adding this for the first time
					// if we are, we need to create an 'add' event
					var changeType = this.__get().hasOwnProperty(prop) ? "set" : "add";

					// set the value on data
					this.__set(prop,
					// if we are getting an object
					isObject(value) ?
					// hook it up to send event to us
					hookup(value, prop, this) :
					// value is normal
					value);



					// trigger the change event
					trigger(this, "change", [prop, changeType, value, current]);

					// if we can stop listening to our old value, do it
					current && unhookup([current], this._namespace);
				}

			} else {
				throw "jQuery.Observe: set a property on an object that does not exist"
			}
		},
		// directly sets a property on this object
		__set: function( prop, val ) {
			this._data[prop] = val;
			// add property directly for easy writing
			// check if its on the prototype so we don't overwrite methods like attrs
			if (!(prop in this.constructor.prototype)) {
				this[prop] = val
			}
		},
		/**
		 * Listens to changes on a jQuery.Observe.
		 * 
		 * When attributes of an observe change, including attributes on nested objects,
		 * a `'change'` event is triggered on the observe.  These events come
		 * in three flavors:
		 * 
		 *   - `add` - a attribute is added
		 *   - `set` - an existing attribute's value is changed
		 *   - `remove` - an attribute is removed
		 * 
		 * The change event is fired with:
		 * 
		 *  - the attribute changed
		 *  - how it was changed
		 *  - the newValue of the attribute
		 *  - the oldValue of the attribute
		 * 
		 * Example:
		 * 
		 *     o = new $.Observe({name : "Payal"});
		 *     o.bind('change', function(ev, attr, how, newVal, oldVal){
		 *       // ev    -> {type: 'change'}
		 *       // attr  -> "name"
		 *       // how   -> "add"
		 *       // newVal-> "Justin"
		 *       // oldVal-> undefined 
		 *     })
		 *     
		 *     o.attr('name', 'Justin')
		 * 
		 * Listening to `change` is only useful for when you want to 
		 * know every change on an Observe.  For most applications,
		 * [jQuery.Observe.prototype.delegate delegate] is 
		 * much more useful as it lets you listen to specific attribute
		 * changes and sepecific types of changes.
		 * 
		 * 
		 * @param {String} eventType the event name.  Currently,
		 * only 'change' events are supported. For more fine 
		 * grained control, use [jQuery.Observe.prototype.delegate].
		 * 
		 * @param {Function} handler(event, attr, how, newVal, oldVal) A 
		 * callback function where
		 * 
		 *   - event - the event
		 *   - attr - the name of the attribute changed
		 *   - how - how the attribute was changed (add, set, remove)
		 *   - newVal - the new value of the attribute
		 *   - oldVal - the old value of the attribute
		 * 
		 * @return {$.Observe} the observe for chaining.
		 */
		bind: function( eventType, handler ) {
			$.fn.bind.apply($([this]), arguments);
			return this;
		},
		/**
		 * Unbinds a listener.  This uses [http://api.jquery.com/unbind/ jQuery.unbind]
		 * and works very similar.  This means you can 
		 * use namespaces or unbind all event handlers for a given event:
		 * 
		 *     // unbind a specific event handler
		 *     o.unbind('change', handler)
		 *     
		 *     // unbind all change event handlers bound with the
		 *     // foo namespace
		 *     o.unbind('change.foo')
		 *     
		 *     // unbind all change event handlers
		 *     o.unbind('change')
		 * 
		 * @param {String} eventType - the type of event with
		 * any optional namespaces.  Currently, only `change` events
		 * are supported with bind.
		 * 
		 * @param {Function} [handler] - The original handler function passed
		 * to [jQuery.Observe.prototype.bind bind].
		 * 
		 * @return {jQuery.Observe} the original observe for chaining.
		 */
		unbind: function( eventType, handler ) {
			$.fn.unbind.apply($([this]), arguments);
			return this;
		},
		/**
		 * Get the serialized Object form of the observe.  Serialized
		 * data is typically used to send back to a server.
		 * 
		 *     o.serialize() //-> { name: 'Justin' }
		 *     
		 * Serialize currently returns the same data 
		 * as [jQuery.Observe.prototype.attrs].  However, in future
		 * versions, serialize will be able to return serialized
		 * data similar to [jQuery.Model].  The following will work:
		 * 
		 *     new Observe({time: new Date()})
		 *       .serialize() //-> { time: 1319666613663 }
		 * 
		 * @return {Object} a JavaScript Object that can be 
		 * serialized with `JSON.stringify` or other methods. 
		 * 
		 */
		serialize: function() {
			return serialize(this, 'serialize', {});
		},
		/**
		 * Set multiple properties on the observable
		 * @param {Object} props
		 * @param {Boolean} remove true if you should remove properties that are not in props
		 */
		attrs: function( props, remove ) {
			if ( props === undefined ) {
				return serialize(this, 'attrs', {})
			}

			props = $.extend(true, {}, props);
			var prop, collectingStarted = collect();

			for ( prop in this._data ) {
				var curVal = this._data[prop],
					newVal = props[prop];

				// if we are merging ...
				if ( newVal === undefined ) {
					remove && this.removeAttr(prop);
					continue;
				}
				if ( isObject(curVal) && isObject(newVal) ) {
					curVal.attrs(newVal, remove)
				} else if ( curVal != newVal ) {
					this._set(prop, newVal)
				} else {

				}
				delete props[prop];
			}
			// add remaining props
			for ( var prop in props ) {
				newVal = props[prop];
				this._set(prop, newVal)
			}
			if ( collectingStarted ) {
				sendCollection();
			}
		}
	});
	// Helpers for list
	/**
	 * @class jQuery.Observe.List
	 * @inherits jQuery.Observe
	 * @parent jQuery.Observe
	 * 
	 * An observable list.  You can listen to when items are push, popped,
	 * spliced, shifted, and unshifted on this array.
	 * 
	 * 
	 */
	var list = jQuery.Observe('jQuery.Observe.List',
	/**
	 * @prototype
	 */
	{
		init: function( instances, options ) {
			this.length = 0;
			this._namespace = ".list" + (++id);
			this._init = true;
			this.bind('change',this.proxy('_changes'));
			this.push.apply(this, makeArray(instances || []));
			$.extend(this, options);
			if(this.comparator){
				this.sort()
			}
			delete this._init;
		},
		_changes : function(ev, attr, how, newVal, oldVal){
			// detects an add, sorts it, re-adds?
			//console.log("")
			
			
			
			// if we are sorting, and an attribute inside us changed
			if(this.comparator && /^\d+./.test(attr) ) {
				
				// get the index
				var index = +(/^\d+/.exec(attr)[0]),
					// and item
					item = this[index],
					// and the new item
					newIndex = this.sortedIndex(item);
				
				if(newIndex !== index){
					// move ...
					[].splice.call(this, index, 1);
					[].splice.call(this, newIndex, 0, item);
					
					trigger(this, "move", [item, newIndex, index]);
					ev.stopImmediatePropagation();
					trigger(this,"change", [
						attr.replace(/^\d+/,newIndex),
						how,
						newVal,
						oldVal
					]);
					return;
				}
			}
			
			
			// if we add items, we need to handle 
			// sorting and such
			
			// trigger direct add and remove events ...
			if(attr.indexOf('.') === -1){
				
				if( how === 'add' ) {
					trigger(this, how, [newVal,+attr]);
				} else if( how === 'remove' ) {
					trigger(this, how, [oldVal, +attr])
				}
				
			}
			// issue add, remove, and move events ...
		},
		sortedIndex : function(item){
			var itemCompare = item.attr(this.comparator),
				equaled = 0,
				i;
			for(var i =0; i < this.length; i++){
				if(item === this[i]){
					equaled = -1;
					continue;
				}
				if(itemCompare <= this[i].attr(this.comparator) ) {
					return i+equaled;
				}
			}
			return i+equaled;
		},
		__get : function(attr){
			return attr ? this[attr] : this;
		},
		__set : function(attr, val){
			this[attr] = val;
		},
		/**
		 * Returns the serialized form of this list.
		 */
		serialize: function() {
			return serialize(this, 'serialize', []);
		},
		/**
		 * Iterates through each item of the list, calling handler 
		 * with each index and value.
		 * 
		 *     new Observe.List(['a'])
		 *       .each(function(index, value){
		 *         equals(index, 1)
		 *         equals(value,'a')
		 *       })
		 * 
		 * @param {function} handler(index,value) A function that will get 
		 * called back with the index and value of each item on the list.
		 * 
		 * Returning `false` breaks the looping.  The following will never
		 * log 'c':
		 * 
		 *     new Observe(['a','b','c'])
		 *       .each(function(index, value){
		 *         console.log(value)
		 *         if(index == 1){
		 *           return false;
		 *         }
		 *       })
		 * 
		 * @return {jQuery.Observe.List} the original observable.
		 */
		// placeholder for each
		/**
		 * Remove items or add items from a specific point in the list.
		 * 
		 * ### Example
		 * 
		 * The following creates a list of numbers and replaces 2 and 3 with
		 * "a", and "b".
		 * 
		 *     var l = new $.Observe.List([0,1,2,3]);
		 *     
		 *     l.bind('change', function( ev, attr, how, newVals, oldVals, where ) { ... })
		 *     
		 *     l.splice(1,2, "a", "b"); // results in [0,"a","b",3]
		 *     
		 * This creates 2 change events.  The first event is the removal of 
		 * numbers one and two where it's callback values will be:
		 * 
		 *   - attr - "1" - indicates where the remove event took place
		 *   - how - "remove"
		 *   - newVals - undefined
		 *   - oldVals - [1,2] -the array of removed values
		 *   - where - 1 - the location of where these items where removed
		 * 
		 * The second change event is the addition of the "a", and "b" values where 
		 * the callback values will be:
		 * 
		 *   - attr - "1" - indicates where the add event took place
		 *   - how - "added"
		 *   - newVals - ["a","b"]
		 *   - oldVals - [1, 2] - the array of removed values
		 *   - where - 1 - the location of where these items where added
		 * 
		 * @param {Number} index where to start removing or adding items
		 * @param {Object} count the number of items to remove
		 * @param {Object} [added] an object to add to 
		 */
		splice: function( index, count ) {
			var args = makeArray(arguments),
				i;

			for ( i = 2; i < args.length; i++ ) {
				var val = args[i];
				if ( isObject(val) ) {
					args[i] = hookup(val, "*", this)
				}
			}
			if ( count === undefined ) {
				count = args[1] = this.length - index;
			}
			var removed = [].splice.apply(this, args);
			if ( count > 0 ) {
				trigger(this, "change", [""+index, "remove", undefined, removed]);
				unhookup(removed, this._namespace);
			}
			if ( args.length > 2 ) {
				trigger(this, "change", [""+index, "add", args.slice(2), removed]);
			}
			return removed;
		},
		/**
		 * Updates an array with a new array.  It is able to handle
		 * removes in the middle of the array.
		 * 
		 * @param {Array} props
		 * @param {Boolean} remove
		 */
		attrs: function( props, remove ) {
			if ( props === undefined ) {
				return serialize(this, 'attrs', []);
			}

			// copy
			props = props.slice(0);

			var len = Math.min(props.length, this.length),
				collectingStarted = collect();
			for ( var prop = 0; prop < len; prop++ ) {
				var curVal = this[prop],
					newVal = props[prop];

				if ( isObject(curVal) && isObject(newVal) ) {
					curVal.attrs(newVal, remove)
				} else if ( curVal != newVal ) {
					this._set(prop, newVal)
				} else {

				}
			}
			if ( props.length > this.length ) {
				// add in the remaining props
				this.push(props.slice(this.length))
			} else if ( props.length < this.length && remove ) {
				this.splice(props.length)
			}
			//remove those props didn't get too
			if ( collectingStarted ) {
				sendCollection()
			}
		},
		sort: function(method, silent){
			var comparator = this.comparator,
				args = comparator ? [function(a, b){
					a = a[comparator]
					b = b[comparator]
					return a === b ? 0 : (a < b ? -1 : 1);
				}] : [],
				res = [].sort.apply(this, args);
				
			!silent && trigger(this, "reset");

		}
	}),


		// create push, pop, shift, and unshift
		// converts to an array of arguments 
		getArgs = function( args ) {
			if ( args[0] && ($.isArray(args[0])) ) {
				return args[0]
			}
			else {
				return makeArray(args)
			}
		};
	// describes the method and where items should be added
	each({
		/**
		 * @function push
		 * Add items to the end of the list.
		 * 
		 *     var l = new $.Observe.List([]);
		 *     
		 *     l.bind('change', function( 
		 *         ev,        // the change event
		 *         attr,      // the attr that was changed, for multiple items, "*" is used 
		 *         how,       // "add"
		 *         newVals,   // an array of new values pushed
		 *         oldVals,   // undefined
		 *         where      // the location where these items where added
		 *         ) {
		 *     
		 *     })
		 *     
		 *     l.push('0','1','2');
		 * 
		 * @return {Number} the number of items in the array
		 */
		push: "length",
		/**
		 * @function unshift
		 * Add items to the start of the list.  This is very similar to
		 * [jQuery.Observe.prototype.push].
		 */
		unshift: 0
	},
	// adds a method where
	// - name - method name
	// - where - where items in the array should be added


	function( name, where ) {
		list.prototype[name] = function() {
			// get the items being added
			var args = getArgs(arguments),
				// where we are going to add items
				len = where ? this.length : 0;

			// go through and convert anything to an observe that needs to be converted
			for ( var i = 0; i < args.length; i++ ) {
				var val = args[i];
				if ( isObject(val) ) {
					args[i] = hookup(val, "*", this)
				}
			}
			
			// if we have a sort item, add that
			if( args.length == 1 && this.comparator ) {
				// add each item ...
				// we could make this check if we are already adding in order
				// but that would be confusing ...
				var index = this.sortedIndex(args[0]);
				this.splice(index, 0, args[0]);
				return this.length;
			}
			
			// call the original method
			var res = [][name].apply(this, args)
			
			// cause the change where the args are:
			// len - where the additions happened
			// add - items added
			// args - the items added
			// undefined - the old value
			if ( this.comparator  && args.length > 1) {
				this.sort(null, true);
				trigger(this,"reset", [args])
			} else {
				trigger(this, "change", [""+len, "add", args, undefined])
			}
			

			return res;
		}
	});

	each({
		/**
		 * @function pop
		 * 
		 * Removes an item from the end of the list.
		 * 
		 *     var l = new $.Observe.List([0,1,2]);
		 *     
		 *     l.bind('change', function( 
		 *         ev,        // the change event
		 *         attr,      // the attr that was changed, for multiple items, "*" is used 
		 *         how,       // "remove"
		 *         newVals,   // undefined
		 *         oldVals,   // 2
		 *         where      // the location where these items where added
		 *         ) {
		 *     
		 *     })
		 *     
		 *     l.pop();
		 * 
		 * @return {Object} the element at the end of the list
		 */
		pop: "length",
		/**
		 * @function shift
		 * Removes an item from the start of the list.  This is very similar to
		 * [jQuery.Observe.prototype.pop].
		 * 
		 * @return {Object} the element at the start of the list
		 */
		shift: 0
	},
	// creates a 'remove' type method


	function( name, where ) {
		list.prototype[name] = function() {
			
			var args = getArgs(arguments),
				len = where && this.length ? this.length - 1 : 0;


			var res = [][name].apply(this, args)

			// create a change where the args are
			// "*" - change on potentially multiple properties
			// "remove" - items removed
			// undefined - the new values (there are none)
			// res - the old, removed values (should these be unbound)
			// len - where these items were removed
			trigger(this, "change", [""+len, "remove", undefined, [res]])

			if ( res && res.unbind ) {
				res.unbind("change" + this._namespace)
			}
			return res;
		}
	});
	
	list.prototype.
	/**
	 * @function indexOf
	 * Returns the position of the item in the array.  Returns -1 if the
	 * item is not in the array.
	 * @param {Object} item
	 * @return {Number}
	 */
	indexOf = [].indexOf || function(item){
		return $.inArray(item, this)
	}

	/**
	 * @class $.O
	 */
	$.O = function(data, options){
		if(isArray(data) || data instanceof $.Observe.List){
			return new $.Observe.List(data, options)
		} else {
			return new $.Observe(data, options)
		}
	}
})(jQuery);
(function($){
  '$:nomunge'; // Used by YUI compressor.
  
  // Method / object references.
  var fake_onhashchange,
    jq_event_special = $.event.special,
    
    // Reused strings.
    str_location = 'location',
    str_hashchange = 'hashchange',
    str_href = 'href',
    
    // IE6/7 specifically need some special love when it comes to back-button
    // support, so let's do a little browser sniffing..
    browser = $.browser,
    mode = document.documentMode,
    is_old_ie = browser.msie && ( mode === undefined || mode < 8 ),
    
    // Does the browser support window.onhashchange? Test for IE version, since
    // IE8 incorrectly reports this when in "IE7" or "IE8 Compatibility View"!
    supports_onhashchange = 'on' + str_hashchange in window && !is_old_ie;
  
  // Get location.hash (or what you'd expect location.hash to be) sans any
  // leading #. Thanks for making this necessary, Firefox!
  function get_fragment( url ) {
    url = url || window[ str_location ][ str_href ];
    return url.replace( /^[^#]*#?(.*)$/, '$1' );
  };
  
  // Property: jQuery.hashchangeDelay
  // 
  // The numeric interval (in milliseconds) at which the <hashchange event>
  // polling loop executes. Defaults to 100.
  
  $[ str_hashchange + 'Delay' ] = 100;
  
  // Event: hashchange event
  // 
  // Fired when location.hash changes. In browsers that support it, the native
  // window.onhashchange event is used (IE8, FF3.6), otherwise a polling loop is
  // initialized, running every <jQuery.hashchangeDelay> milliseconds to see if
  // the hash has changed. In IE 6 and 7, a hidden Iframe is created to allow
  // the back button and hash-based history to work.
  // 
  // Usage:
  // 
  // > $(window).bind( 'hashchange', function(e) {
  // >   var hash = location.hash;
  // >   ...
  // > });
  // 
  // Additional Notes:
  // 
  // * The polling loop and Iframe are not created until at least one callback
  //   is actually bound to 'hashchange'.
  // * If you need the bound callback(s) to execute immediately, in cases where
  //   the page 'state' exists on page load (via bookmark or page refresh, for
  //   example) use $(window).trigger( 'hashchange' );
  // * The event can be bound before DOM ready, but since it won't be usable
  //   before then in IE6/7 (due to the necessary Iframe), recommended usage is
  //   to bind it inside a $(document).ready() callback.
  
  jq_event_special[ str_hashchange ] = $.extend( jq_event_special[ str_hashchange ], {
    
    // Called only when the first 'hashchange' event is bound to window.
    setup: function() {
      // If window.onhashchange is supported natively, there's nothing to do..
      if ( supports_onhashchange ) { return false; }
      
      // Otherwise, we need to create our own. And we don't want to call this
      // until the user binds to the event, just in case they never do, since it
      // will create a polling loop and possibly even a hidden Iframe.
      $( fake_onhashchange.start );
    },
    
    // Called only when the last 'hashchange' event is unbound from window.
    teardown: function() {
      // If window.onhashchange is supported natively, there's nothing to do..
      if ( supports_onhashchange ) { return false; }
      
      // Otherwise, we need to stop ours (if possible).
      $( fake_onhashchange.stop );
    }
    
  });
  
  // fake_onhashchange does all the work of triggering the window.onhashchange
  // event for browsers that don't natively support it, including creating a
  // polling loop to watch for hash changes and in IE 6/7 creating a hidden
  // Iframe to enable back and forward.
  fake_onhashchange = (function(){
    var self = {},
      timeout_id,
      iframe,
      set_history,
      get_history;
    
    // Initialize. In IE 6/7, creates a hidden Iframe for history handling.
    function init(){
      // Most browsers don't need special methods here..
      set_history = get_history = function(val){ return val; };
      
      // But IE6/7 do!
      if ( is_old_ie ) {
        
        // Create hidden Iframe after the end of the body to prevent initial
        // page load from scrolling unnecessarily.
        iframe = $('<iframe src="javascript:0"/>').hide().insertAfter( 'body' )[0].contentWindow;
        
        // Get history by looking at the hidden Iframe's location.hash.
        get_history = function() {
          return get_fragment( iframe.document[ str_location ][ str_href ] );
        };
        
        // Set a new history item by opening and then closing the Iframe
        // document, *then* setting its location.hash.
        set_history = function( hash, history_hash ) {
          if ( hash !== history_hash ) {
            var doc = iframe.document;
            doc.open().close();
            doc[ str_location ].hash = '#' + hash;
          }
        };
        
        // Set initial history.
        set_history( get_fragment() );
      }
    };
    
    // Start the polling loop.
    self.start = function() {
      // Polling loop is already running!
      if ( timeout_id ) { return; }
      
      // Remember the initial hash so it doesn't get triggered immediately.
      var last_hash = get_fragment();
      
      // Initialize if not yet initialized.
      set_history || init();
      
      // This polling loop checks every $.hashchangeDelay milliseconds to see if
      // location.hash has changed, and triggers the 'hashchange' event on
      // window when necessary.
      if(!navigator.userAgent.match(/Rhino/))
	      (function loopy(){
	        var hash = get_fragment(),
	          history_hash = get_history( last_hash );
	        
	        if ( hash !== last_hash ) {
	          set_history( last_hash = hash, history_hash );
	          
	          $(window).trigger( str_hashchange );
	          
	        } else if ( history_hash !== last_hash ) {
	          window[ str_location ][ str_href ] = window[ str_location ][ str_href ].replace( /#.*/, '' ) + '#' + history_hash;
	        }
	        
	        timeout_id = setTimeout( loopy, $[ str_hashchange + 'Delay' ] );
	      })();
    };
    
    // Stop the polling loop, but only if an IE6/7 Iframe wasn't created. In
    // that case, even if there are no longer any bound event handlers, the
    // polling loop is still necessary for back/next to work at all!
    self.stop = function() {
      if ( !iframe ) {
        timeout_id && clearTimeout( timeout_id );
        timeout_id = 0;
      }
    };
    
    return self;
  })();
})(jQuery);
(function($){
	
	var digitTest = /^\d+$/,
		keyBreaker = /([^\[\]]+)|(\[\])/g,
		plus = /\+/g,
		paramTest = /([^?#]*)(#.*)?$/;
	
	/**
	 * @add jQuery.String
	 */
	$.String = $.extend($.String || {}, { 
		
		/**
		 * @function deparam
		 * 
		 * Takes a string of name value pairs and returns a Object literal that represents those params.
		 * 
		 * @param {String} params a string like <code>"foo=bar&person[age]=3"</code>
		 * @return {Object} A JavaScript Object that represents the params:
		 * 
		 *     {
		 *       foo: "bar",
		 *       person: {
		 *         age: "3"
		 *       }
		 *     }
		 */
		deparam: function(params){
		
			if(! params || ! paramTest.test(params) ) {
				return {};
			} 
		   
		
			var data = {},
				pairs = params.split('&'),
				current;
				
			for(var i=0; i < pairs.length; i++){
				current = data;
				var pair = pairs[i].split('=');
				
				// if we find foo=1+1=2
				if(pair.length != 2) { 
					pair = [pair[0], pair.slice(1).join("=")]
				}
				  
        var key = decodeURIComponent(pair[0].replace(plus, " ")), 
          value = decodeURIComponent(pair[1].replace(plus, " ")),
					parts = key.match(keyBreaker);
		
				for ( var j = 0; j < parts.length - 1; j++ ) {
					var part = parts[j];
					if (!current[part] ) {
						// if what we are pointing to looks like an array
						current[part] = digitTest.test(parts[j+1]) || parts[j+1] == "[]" ? [] : {}
					}
					current = current[part];
				}
				lastPart = parts[parts.length - 1];
				if(lastPart == "[]"){
					current.push(value)
				}else{
					current[lastPart] = value;
				}
			}
			return data;
		}
	});
	
})(jQuery);
(function($){
    /**
     * @page jQuery.toJSON jQuery.toJSON
     * @parent jquerymx.lang
     * 
     *     jQuery.toJSON( json-serializble )
     * 
     * Converts the given argument into a JSON respresentation.
     * 
     * If an object has a "toJSON" function, that will 
     * be used to get the representation.
     * Non-integer/string keys are skipped in the 
     * object, as are keys that point to a function.
     * 
     * json-serializble:
     * The *thing* to be converted.
     */
    $.toJSON = function(o, replacer, space, recurse)
    {
        if (typeof(JSON) == 'object' && JSON.stringify)
            return JSON.stringify(o, replacer, space);

        if (!recurse && $.isFunction(replacer))
            o = replacer("", o);

        if (typeof space == "number")
            space = "          ".substring(0, space);
        space = (typeof space == "string") ? space.substring(0, 10) : "";
        
        var type = typeof(o);
    
        if (o === null)
            return "null";
    
        if (type == "undefined" || type == "function")
            return undefined;
        
        if (type == "number" || type == "boolean")
            return o + "";
    
        if (type == "string")
            return $.quoteString(o);
    
        if (type == 'object')
        {
            if (typeof o.toJSON == "function") 
                return $.toJSON( o.toJSON(), replacer, space, true );
            
            if (o.constructor === Date)
            {
                var month = o.getUTCMonth() + 1;
                if (month < 10) month = '0' + month;

                var day = o.getUTCDate();
                if (day < 10) day = '0' + day;

                var year = o.getUTCFullYear();
                
                var hours = o.getUTCHours();
                if (hours < 10) hours = '0' + hours;
                
                var minutes = o.getUTCMinutes();
                if (minutes < 10) minutes = '0' + minutes;
                
                var seconds = o.getUTCSeconds();
                if (seconds < 10) seconds = '0' + seconds;
                
                var milli = o.getUTCMilliseconds();
                if (milli < 100) milli = '0' + milli;
                if (milli < 10) milli = '0' + milli;

                return '"' + year + '-' + month + '-' + day + 'T' +
                             hours + ':' + minutes + ':' + seconds + 
                             '.' + milli + 'Z"'; 
            }

            var process = ($.isFunction(replacer)) ?
                function (k, v) { return replacer(k, v); } :
                function (k, v) { return v; },
                nl = (space) ? "\n" : "",
                sp = (space) ? " " : "";

            if (o.constructor === Array) 
            {
                var ret = [];
                for (var i = 0; i < o.length; i++)
                    ret.push(( $.toJSON( process(i, o[i]), replacer, space, true ) || "null" ).replace(/^/gm, space));

                return "[" + nl + ret.join("," + nl) + nl + "]";
            }
        
            var pairs = [], proplist;
            if ($.isArray(replacer)) {
                proplist = $.map(replacer, function (v) {
                    return (typeof v == "string" || typeof v == "number") ?
                        v + "" :
                        null;
                });
            }
            for (var k in o) {
                var name, val, type = typeof k;

                if (proplist && $.inArray(k + "", proplist) == -1)
                    continue;

                if (type == "number")
                    name = '"' + k + '"';
                else if (type == "string")
                    name = $.quoteString(k);
                else
                    continue;  //skip non-string or number keys
            
                val = $.toJSON( process(k, o[k]), replacer, space, true );
            
                if (typeof val == "undefined")
                    continue;  //skip pairs where the value is a function.
            
                pairs.push((name + ":" + sp + val).replace(/^/gm, space));
            }

            return "{" + nl + pairs.join("," + nl) + nl + "}";
        }
    };

    /** 
     * @function jQuery.evalJSON
     * Evaluates a given piece of json source.
     **/
    $.evalJSON = function(src)
    {
        if (typeof(JSON) == 'object' && JSON.parse)
            return JSON.parse(src);
        return eval("(" + src + ")");
    };
    
    /** 
     * @function jQuery.secureEvalJSON
     * Evals JSON in a way that is *more* secure.
     **/
    $.secureEvalJSON = function(src)
    {
        if (typeof(JSON) == 'object' && JSON.parse)
            return JSON.parse(src);
        
        var filtered = src;
        filtered = filtered.replace(/\\["\\\/bfnrtu]/g, '@');
        filtered = filtered.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']');
        filtered = filtered.replace(/(?:^|:|,)(?:\s*\[)+/g, '');
        
        if (/^[\],:{}\s]*$/.test(filtered))
            return eval("(" + src + ")");
        else
            throw new SyntaxError("Error parsing JSON, source is not valid.");
    };

    /** 
     * @function jQuery.quoteString
     * 
     * Returns a string-repr of a string, escaping quotes intelligently.  
     * Mostly a support function for toJSON.
     * 
     * Examples:
     * 
     *      jQuery.quoteString("apple") //-> "apple"
     * 
     *      jQuery.quoteString('"Where are we going?", she asked.')
     *        // -> "\"Where are we going?\", she asked."
     **/
    $.quoteString = function(string)
    {
        if (string.match(_escapeable))
        {
            return '"' + string.replace(_escapeable, function (a) 
            {
                var c = _meta[a];
                if (typeof c === 'string') return c;
                c = a.charCodeAt();
                return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
            }) + '"';
        }
        return '"' + string + '"';
    };
    
    var _escapeable = /["\\\x00-\x1f\x7f-\x9f]/g;
    
    var _meta = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
    };
})(jQuery);
(function() {

	// Common helper methods taken from jQuery (or other places)
	// Keep here so someday can be abstracted
	var $String = $.String,
		getObject = $String.getObject,
		underscore = $String.underscore,
		classize = $String.classize,
		isArray = $.isArray,
		makeArray = $.makeArray,
		extend = $.extend,
		each = $.each,
		trigger = function(obj, event, args){
			$.event.trigger(event, args, obj, true)
		},
		
		// used to make an ajax request where
		// ajaxOb - a bunch of options
		// data - the attributes or data that will be sent
		// success - callback function
		// error - error callback
		// fixture - the name of the fixture (typically a path or something on $.fixture
		// type - the HTTP request type (defaults to "post")
		// dataType - how the data should return (defaults to "json")
		ajax = function(ajaxOb, data, success, error, fixture, type, dataType ) {

			
			// if we get a string, handle it
			if ( typeof ajaxOb == "string" ) {
				// if there's a space, it's probably the type
				var sp = ajaxOb.indexOf(" ")
				if ( sp > -1 ) {
					ajaxOb = {
						url:  ajaxOb.substr(sp + 1),
						type: ajaxOb.substr(0, sp)
					}
				} else {
					ajaxOb = {url : ajaxOb}
				}
			}

			// if we are a non-array object, copy to a new attrs
			ajaxOb.data = typeof data == "object" && !isArray(data) ?
				extend(ajaxOb.data || {}, data) : data;
	

			// get the url with any templated values filled out
			ajaxOb.url = $String.sub(ajaxOb.url, ajaxOb.data, true);
			ajaxOb.JSUI = true;
			return $.ajax(extend({
				type: type || "post",
				dataType: dataType ||"json",
				fixture: fixture,
				success : success,
				error: error
			},ajaxOb));
		},
		// guesses at a fixture name where
		// extra - where to look for 'MODELNAME'+extra fixtures (ex: "Create" -> '-recipeCreate')
		// or - if the first fixture fails, default to this
		fixture = function( model, extra, or ) {
			// get the underscored shortName of this Model
			var u = underscore(model.shortName),
				// the first place to look for fixtures
				f = "-" + u + (extra || "");

			// if the fixture exists in $.fixture
			return $.fixture && $.fixture[f] ?
			// return the name
			f :
			// or return or
			or ||
			// or return a fixture derived from the path
			"//" + underscore(model.fullName).replace(/\.models\..*/, "").replace(/\./g, "/") + "/fixtures/" + u + (extra || "") + ".json";
		},
		// takes attrs, and adds it to the attrs (so it can be added to the url)
		// if attrs already has an id, it means it's trying to update the id
		// in this case, it sets the new ID as newId.
		addId = function( model, attrs, id ) {
			attrs = attrs || {};
			var identity = model.id;
			if ( attrs[identity] && attrs[identity] !== id ) {
				attrs["new" + $String.capitalize(id)] = attrs[identity];
				delete attrs[identity];
			}
			attrs[identity] = id;
			return attrs;
		},
		// returns the best list-like object (list is passed)
		getList = function( type ) {
			var listType = type || $.Model.List || Array;
			return new listType();
		},
		// a helper function for getting an id from an instance
		getId = function( inst ) {
			return inst[inst.constructor.id]
		},
		// returns a collection of unique items
		// this works on objects by adding a "__u Nique" property.
		unique = function( items ) {
			var collect = [];
			// check unique property, if it isn't there, add to collect
			each(items, function( i, item ) {
				if (!item["__u Nique"] ) {
					collect.push(item);
					item["__u Nique"] = 1;
				}
			});
			// remove unique 
			return each(collect, function( i, item ) {
				delete item["__u Nique"];
			});
		},
		// helper makes a request to a static ajax method
		// it also calls updated, created, or destroyed
		// and it returns a deferred that resolvesWith self and the data
		// returned from the ajax request
		makeRequest = function( self, type, success, error, method ) {
			// create the deferred makeRequest will return
			var deferred = $.Deferred(),
				// on a successful ajax request, call the
				// updated | created | destroyed method
				// then resolve the deferred
				resolve = function( data ) {
					self[method || type + "d"](data);
					deferred.resolveWith(self, [self, data, type]);
				},
				// on reject reject the deferred
				reject = function( data ) {
					deferred.rejectWith(self, [data])
				},
				// the args to pass to the ajax method
				args = [self.serialize(), resolve, reject],
				// the Model
				model = self.constructor,
				jqXHR,
				promise = deferred.promise();

			// destroy does not need data
			if ( type == 'destroy' ) {
				args.shift();
			}

			// update and destroy need the id
			if ( type !== 'create' ) {
				args.unshift(getId(self))
			}

			// hook up success and error
			deferred.then(success);
			deferred.fail(error);

			// call the model's function and hook up
			// abort
			jqXHR = model[type].apply(model, args);
			if(jqXHR && jqXHR.abort){
				promise.abort = function(){
					jqXHR.abort();
				}
			}
			return promise;
		},
		// a quick way to tell if it's an object and not some string
		isObject = function( obj ) {
			return typeof obj === 'object' && obj !== null && obj;
		},
		$method = function( name ) {
			return function( eventType, handler ) {
				try {
					return $.fn[name].apply($([this]), arguments);
				} catch (e) {
					// Do nothing... seems like it didn't matter anyway.
					// A fix for the haunted seatmap by Rupert. Who's ashamed to be tampering here.
					// We seem to have encountered a race condition when loading the seatmap
                  // Sometimes another event interrupts the parser during the ajaxConvert process
                  // Catching the resulting typeerror appears to allow us to proceed without ill effects
				}
				
			}
		},
		bind = $method('bind'),
		unbind = $method('unbind'),
		STR_CONSTRUCTOR = 'constructor';
	/**
	 * @class jQuery.Model
	 * @parent jquerymx
	 * @download  http://jmvcsite.heroku.com/pluginify?plugins[]=jquery/model/model.js
	 * @test jquery/model/qunit.html
	 * @plugin jquery/model
	 * @description Models and apps data layer.
	 * 
	 * Models super-charge an application's
	 * data layer, making it easy to:
	 * 
	 *  - Get and modify data from the server
	 *  - Listen to changes in data
	 *  - Setting and retrieving models on elements
	 *  - Deal with lists of data
	 *  - Do other good stuff
	 * 
	 * Model inherits from [jQuery.Class $.Class] and make use
	 * of REST services and [http://api.jquery.com/category/deferred-object/ deferreds]
	 * so these concepts are worth exploring.  Also, 
	 * the [mvc.model Get Started with jQueryMX] has a good walkthrough of $.Model.
	 * 
	 * 
	 * ## Get and modify data from the server
	 * 
	 * $.Model makes connecting to a JSON REST service 
	 * really easy.  The following models <code>todos</code> by
	 * describing the services that can create, retrieve,
	 * update, and delete todos. 
	 * 
	 *     $.Model('Todo',{
	 *       findAll: 'GET /todos.json',
	 *       findOne: 'GET /todos/{id}.json',
	 *       create:  'POST /todos.json',
	 *       update:  'PUT /todos/{id}.json',
	 *       destroy: 'DELETE /todos/{id}.json' 
	 *     },{});
	 * 
	 * This lets you create, retrieve, update, and delete
	 * todos programatically:
	 * 
	 * __Create__
	 * 
	 * Create a todo instance and 
	 * call <code>[$.Model::save save]\(success, error\)</code>
	 * to create the todo on the server.
	 *     
	 *     // create a todo instance
	 *     var todo = new Todo({name: "do the dishes"})
	 *     
	 *     // save it on the server
	 *     todo.save();
	 * 
	 * __Retrieve__
	 * 
	 * Retrieve a list of todos from the server with
	 * <code>[$.Model.findAll findAll]\(params, callback(items)\)</code>: 
	 *     
	 *     Todo.findAll({}, function( todos ){
	 *     
	 *       // print out the todo names
	 *       $.each(todos, function(i, todo){
	 *         console.log( todo.name );
	 *       });
	 *     });
	 * 
	 * Retrieve a single todo from the server with
	 * <code>[$.Model.findOne findOne]\(params, callback(item)\)</code>:
	 * 
	 *     Todo.findOne({id: 5}, function( todo ){
	 *     
	 *       // print out the todo name
	 *       console.log( todo.name );
	 *     });
	 * 
	 * __Update__
	 * 
	 * Once an item has been created on the server,
	 * you can change its properties and call
	 * <code>save</code> to update it on the server.
	 * 
	 *     // update the todos' name
	 *     todo.attr('name','Take out the trash')
	 *       
	 *     // update it on the server
	 *     todo.save()
	 *       
	 * 
	 * __Destroy__
	 * 
	 * Call <code>[$.Model.prototype.destroy destroy]\(success, error\)</code>
	 * to delete an item on the server.
	 * 
	 *     todo.destroy()
	 * 
	 * ## Listen to changes in data
	 * 
	 * Listening to changes in data is a critical part of 
	 * the [http://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller Model-View-Controller]
	 * architecture.  $.Model lets you listen to when an item is created, updated, destroyed
	 * or its properties are changed. Use 
	 * <code>Model.[$.Model.bind bind]\(eventType, handler(event, model)\)</code>
	 * to listen to all events of type on a model and
	 * <code>model.[$.Model.prototype.bind bind]\(eventType, handler(event)\)</code>
	 * to listen to events on a specific instance.
	 * 
	 * __Create__
	 * 
	 *     // listen for when any todo is created
	 *     Todo.bind('created', function( ev, todo ) {...})
	 *     
	 *     // listen for when a specific todo is created
	 *     var todo = new Todo({name: 'do dishes'})
	 *     todo.bind('created', function( ev ) {...})
	 *   
	 * __Update__
	 * 
	 *     // listen for when any todo is updated
	 *     Todo.bind('updated', function( ev, todo ) {...})
	 *     
	 *     // listen for when a specific todo is created
	 *     Todo.findOne({id: 6}, function( todo ) {
	 *       todo.bind('updated', function( ev ) {...})
	 *     })
	 *   
	 * __Destroy__
	 * 
	 *     // listen for when any todo is destroyed
	 *     Todo.bind('destroyed', function( ev, todo ) {...})
	 *    
	 *     // listen for when a specific todo is destroyed
	 *     todo.bind('destroyed', function( ev ) {...})
	 * 
	 * __Property Changes__
	 * 
	 *     // listen for when the name property changes
	 *     todo.bind('name', function(ev){  })
	 * 
	 * __Listening with Controller__
	 * 
	 * You should be using controller to listen to model changes like:
	 * 
	 *     $.Controller('Todos',{
	 *       "{Todo} updated" : function(Todo, ev, todo) {...}
	 *     })
	 * 
	 * 
	 * ## Setting and retrieving data on elements
	 * 
	 * Almost always, we use HTMLElements to represent
	 * data to the user.  When that data changes, we update those
	 * elements to reflect the new data.
	 * 
	 * $.Model has helper methods that make this easy.  They
	 * let you "add" a model to an element and also find
	 * all elements that have had a model "added" to them.
	 * 
	 * Consider a todo list widget
	 * that lists each todo in the page and when a todo is
	 * deleted, removes it.  
	 * 
	 * <code>[jQuery.fn.model $.fn.model]\(item\)</code> lets you set or read a model 
	 * instance from an element:
	 * 
	 *     Todo.findAll({}, function( todos ) {
	 *       
	 *       $.each(todos, function(todo) {
	 *         $('<li>').model(todo)
	 *                  .text(todo.name)
	 *                  .appendTo('#todos')
	 *       });
	 *     });
	 * 
	 * When a todo is deleted, get its element with
	 * <code>item.[$.Model.prototype.elements elements]\(context\)</code>
	 * and remove it from the page.
	 * 
	 *     Todo.bind('destroyed', function( ev, todo ) { 
	 *       todo.elements( $('#todos') ).remove()
	 *     })
	 * 
	 * __Using EJS and $.Controller__
	 * 
	 * [jQuery.View $.View] and [jQuery.EJS EJS] makes adding model data 
	 * to elements easy.  We can implement the todos widget like the following:
	 * 
	 *     $.Controller('Todos',{
	 *       init: function(){
	 *         this.element.html('//todos/views/todos.ejs', Todo.findAll({}) ); 
	 *       },
	 *       "{Todo} destroyed": function(Todo, ev, todo) {
	 *         todo.elements( this.element ).remove()
	 *       }
	 *     })
	 * 
	 * In todos.ejs
	 * 
	 * @codestart html
	 * &lt;% for(var i =0; i &lt; todos.length; i++){ %>
	 *   &lt;li &lt;%= todos[i] %>>&lt;%= todos[i].name %>&lt;/li>
	 * &lt;% } %>
	 * @codeend
	 * 
	 * Notice how you can add a model to an element with <code>&lt;%= model %&gt;</code>
	 * 
	 * ## Lists
	 * 
	 * [$.Model.List $.Model.List] lets you handle multiple model instances
	 * with ease.  A List acts just like an <code>Array</code>, but you can add special properties 
	 * to it and listen to events on it.  
	 * 
	 * <code>$.Model.List</code> has become its own plugin, read about it
	 * [$.Model.List here].
	 * 
	 * ## Other Good Stuff
	 * 
	 * Model can make a lot of other common tasks much easier.
	 * 
	 * ### Type Conversion
	 * 
	 * Data from the server often needs massaging to make it more useful 
	 * for JavaScript.  A typical example is date data which is 
	 * commonly passed as
	 * a number representing the Julian date like:
	 * 
	 *     { name: 'take out trash', 
	 *       id: 1,
	 *       dueDate: 1303173531164 }
	 * 
	 * But instead, you want a JavaScript date object:
	 * 
	 *     date.attr('dueDate') //-> new Date(1303173531164)
	 *     
	 * By defining property-type pairs in [$.Model.attributes attributes],
	 * you can have model auto-convert values from the server into more useful types:
	 * 
	 *     $.Model('Todo',{
	 *       attributes : {
	 *         dueDate: 'date'
	 *       }
	 *     },{})
	 * 
	 * ### Associations
	 * 
	 * The [$.Model.attributes attributes] property also 
	 * supports associations. For example, todo data might come back with
	 * User data as an owner property like:
	 * 
	 *     { name: 'take out trash', 
	 *       id: 1, 
	 *       owner: { name: 'Justin', id: 3} }
	 * 
	 * To convert owner into a User model, set the owner type as the User's
	 * [$.Model.model model]<code>( data )</code> method:
	 * 
	 *     $.Model('Todo',{
	 *       attributes : {
	 *         owner: 'User.model'
	 *       }
	 *     },{})
	 * 
	 * ### Helper Functions
	 * 
	 * Often, you need to perform repeated calculations 
	 * with a model's data.  You can create methods in the model's 
	 * prototype and they will be available on 
	 * all model instances.  
	 * 
	 * The following creates a <code>timeRemaining</code> method that
	 * returns the number of seconds left to complete the todo:
	 * 
	 *     $.Model('Todo',{
	 *     },{
	 *        timeRemaining : function(){
	 *          return new Date() - new Date(this.dueDate)
	 *        }
	 *     })
	 *     
	 *     // create a todo
	 *     var todo = new Todo({dueDate: new Date()});
	 *     
	 *     // show off timeRemaining
	 *     todo.timeRemaining() //-> Number
	 * 
	 * ### Deferreds
	 * 
	 * Model methods that make requests to the server such as:
	 * [$.Model.findAll findAll], [$.Model.findOne findOne], 
	 * [$.Model.prototype.save save], and [$.Model.prototype.destroy destroy] return a
	 * [jquery.model.deferreds deferred] that resolves to the item(s)
	 * being retrieved or modified.  
	 * 
	 * Deferreds can make a lot of asynchronous code much easier.  For example, the following
	 * waits for all users and tasks before continuing :
	 * 
	 *     $.when(Task.findAll(), User.findAll())
	 *       .then(function( tasksRes, usersRes ){ ... })
	 * 
	 * ### Validations
	 * 
	 * [jquery.model.validations Validate] your model's attributes.
	 * 
	 *     $.Model("Contact",{
	 *     init : function(){
	 *         this.validate("birthday",function(){
	 *             if(this.birthday > new Date){
	 *                 return "your birthday needs to be in the past"
	 *             }
	 *         })
	 *     }
	 *     ,{});
	 * 
	 *     
	 */
	// methods that we'll weave into model if provided
	ajaxMethods =
	/** 
	 * @Static
	 */
	{
		create: function( str ) {
			/**
			 * @function create
			 * Create is used by [$.Model.prototype.save save] to create a model instance on the server. 
			 * 
			 * The easiest way to implement create is to give it the url to post data to:
			 * 
			 *     $.Model("Recipe",{
			 *       create: "/recipes"
			 *     },{})
			 *     
			 * This lets you create a recipe like:
			 *  
			 *     new Recipe({name: "hot dog"}).save();
			 *  
			 * You can also implement create by yourself.  Create gets called with:
			 * 
			 *  - `attrs` - the [$.Model.serialize serialized] model attributes.
			 *  - `success(newAttrs)` - a success handler.
			 *  - `error` - an error handler. 
			 *  
			 * You just need to call success back with
			 * an object that contains the id of the new instance and any other properties that should be
			 * set on the instance.
			 *  
			 * For example, the following code makes a request 
			 * to `POST /recipes.json {'name': 'hot+dog'}` and gets back
			 * something that looks like:
			 *  
			 *     { 
			 *       "id": 5,
			 *       "createdAt": 2234234329
			 *     }
			 * 
			 * The code looks like:
			 * 
			 *     $.Model("Recipe", {
			 *       create : function(attrs, success, error){
			 *         $.post("/recipes.json",attrs, success,"json");
			 *       }
			 *     },{})
			 * 
			 * 
			 * @param {Object} attrs Attributes on the model instance
			 * @param {Function} success(newAttrs) the callback function, it must be called with an object 
			 * that has the id of the new instance and any other attributes the service needs to add.
			 * @param {Function} error a function to callback if something goes wrong.  
			 */
			return function( attrs, success, error ) {
				return ajax(str || this._shortName, attrs, success, error, fixture(this, "Create", "-restCreate"))
			};
		},
		update: function( str ) {
			/**
			 * @function update
			 * Update is used by [$.Model.prototype.save save] to 
			 * update a model instance on the server. 
			 * 
			 * The easist way to implement update is to just give it the url to `PUT` data to:
			 * 
			 *     $.Model("Recipe",{
			 *       update: "/recipes/{id}"
			 *     },{})
			 *     
			 * This lets you update a recipe like:
			 *  
			 *     // PUT /recipes/5 {name: "Hot Dog"}
			 *     Recipe.update(5, {name: "Hot Dog"},
			 *       function(){
			 *         this.name //this is the updated recipe
			 *       })
			 *  
			 * If your server doesn't use PUT, you can change it to post like:
			 * 
			 *     $.Model("Recipe",{
			 *       update: "POST /recipes/{id}"
			 *     },{})
			 * 
			 * Your server should send back an object with any new attributes the model 
			 * should have.  For example if your server udpates the "updatedAt" property, it
			 * should send back something like:
			 * 
			 *     // PUT /recipes/4 {name: "Food"} ->
			 *     {
			 *       updatedAt : "10-20-2011"
			 *     }
			 * 
			 * You can also implement create by yourself.  You just need to call success back with
			 * an object that contains any properties that should be
			 * set on the instance.
			 *  
			 * For example, the following code makes a request 
			 * to '/recipes/5.json?name=hot+dog' and gets back
			 * something that looks like:
			 *  
			 *     { 
			 *       updatedAt: "10-20-2011"
			 *     }
			 * 
			 * The code looks like:
			 * 
			 *     $.Model("Recipe", {
			 *       update : function(id, attrs, success, error){
			 *         $.post("/recipes/"+id+".json",attrs, success,"json");
			 *       }
			 *     },{})
			 * 
			 * 
			 * @param {String} id the id of the model instance
			 * @param {Object} attrs Attributes on the model instance
			 * @param {Function} success(attrs) the callback function.  It optionally accepts 
			 * an object of attribute / value pairs of property changes the client doesn't already 
			 * know about. For example, when you update a name property, the server might 
			 * update other properties as well (such as updatedAt). The server should send 
			 * these properties as the response to updates.  Passing them to success will 
			 * update the model instance with these properties.
			 * 
			 * @param {Function} error a function to callback if something goes wrong.  
			 */
			return function( id, attrs, success, error ) {
				return ajax( str || this._shortName+"/{"+this.id+"}", addId(this, attrs, id), success, error, fixture(this, "Update", "-restUpdate"), "put")
			}
		},
		destroy: function( str ) {
			/**
			 * @function destroy
			 * Destroy is used to remove a model instance from the server.
			 * 
			 * You can implement destroy with a string like:
			 * 
			 *     $.Model("Thing",{
			 *       destroy : "POST /thing/destroy/{id}"
			 *     })
			 * 
			 * Or you can implement destroy manually like:
			 * 
			 *     $.Model("Thing",{
			 *       destroy : function(id, success, error){
			 *         $.post("/thing/destroy/"+id,{}, success);
			 *       }
			 *     })
			 * 
			 * You just have to call success if the destroy was successful.
			 * 
			 * @param {String|Number} id the id of the instance you want destroyed
			 * @param {Function} success the callback function, it must be called with an object 
			 * that has the id of the new instance and any other attributes the service needs to add.
			 * @param {Function} error a function to callback if something goes wrong.  
			 */
			return function( id, success, error ) {
				var attrs = {};
				attrs[this.id] = id;
				return ajax( str || this._shortName+"/{"+this.id+"}", attrs, success, error, fixture(this, "Destroy", "-restDestroy"), "delete")
			}
		},

		findAll: function( str ) {
			/**
			 * @function findAll
			 * FindAll is used to retrive a model instances from the server. 
			 * findAll returns a deferred ($.Deferred).
			 * 
			 * You can implement findAll with a string:
			 * 
			 *     $.Model("Thing",{
			 *       findAll : "/things.json"
			 *     },{})
			 * 
			 * Or you can implement it yourself.  The `dataType` attribute 
			 * is used to convert a JSON array of attributes
			 * to an array of instances.  It calls <code>[$.Model.models]\(raw\)</code>.  For example:
			 * 
			 *     $.Model("Thing",{
			 *       findAll : function(params, success, error){
			 *         return $.ajax({
			 *           url: '/things.json',
			 *           type: 'get',
			 *           dataType: 'json thing.models',
			 *           data: params,
			 *           success: success,
			 *           error: error})
			 *       }
			 *     },{})
			 * 
			 * 
			 * @param {Object} params data to refine the results.  An example might be passing {limit : 20} to
			 * limit the number of items retrieved.
			 * @param {Function} success(items) called with an array (or Model.List) of model instances.
			 * @param {Function} error
			 */
			return function( params, success, error ) {
				return ajax( str ||  this._shortName, params, success, error, fixture(this, "s"), "get", "json " + this._shortName + ".models");
			};
		},
		findOne: function( str ) {
			/**
			 * @function findOne
			 * FindOne is used to retrive a model instances from the server. By implementing 
			 * findOne along with the rest of the [jquery.model.services service api], your models provide an abstract
			 * service API.
			 * 
			 * You can implement findOne with a string:
			 * 
			 *     $.Model("Thing",{
			 *       findOne : "/things/{id}.json"
			 *     },{})
			 * 
			 * Or you can implement it yourself. 
			 * 
			 *     $.Model("Thing",{
			 *       findOne : function(params, success, error){
			 *         var self = this,
			 *             id = params.id;
			 *         delete params.id;
			 *         return $.get("/things/"+id+".json",
			 *           params,
			 *           success,
			 *           "json thing.model")
			 *       }
			 *     },{})
			 * 
			 * 
			 * @param {Object} params data to refine the results. This is often something like {id: 5}.
			 * @param {Function} success(item) called with a model instance
			 * @param {Function} error
			 */
			return function( params, success, error ) {
				return ajax(str || this._shortName+"/{"+this.id+"}", params, success, error, fixture(this), "get", "json " + this._shortName + ".model");
			};
		}
	};





	jQuery.Class("jQuery.Model", {
		setup: function( superClass, stat, proto ) {

			var self = this,
				fullName = this.fullName;
			//we do not inherit attributes (or validations)
			each(["attributes", "validations"], function( i, name ) {
				if (!self[name] || superClass[name] === self[name] ) {
					self[name] = {};
				}
			})

			//add missing converters and serializes
			each(["convert", "serialize"], function( i, name ) {
				if ( superClass[name] != self[name] ) {
					self[name] = extend({}, superClass[name], self[name]);
				}
			});

			this._fullName = underscore(fullName.replace(/\./g, "_"));
			this._shortName = underscore(this.shortName);

			if ( fullName.indexOf("jQuery") == 0 ) {
				return;
			}

			//add this to the collection of models
			//$.Model.models[this._fullName] = this;
			if ( this.listType ) {
				this.list = new this.listType([]);
			}
			
			each(ajaxMethods, function(name, method){
				var prop = self[name];
				if ( typeof prop !== 'function' ) {
					self[name] = method(prop);
				}
			});

			//add ajax converters
			var converters = {},
				convertName = "* " + this._shortName + ".model";

			converters[convertName + "s"] = this.proxy('models');
			converters[convertName] = this.proxy('model');

			$.ajaxSetup({
				converters: converters
			});
		},
		/**
		 * @attribute attributes
		 * Attributes contains a map of attribute names/types.  
		 * You can use this in conjunction with 
		 * [$.Model.convert] to provide automatic 
		 * [jquery.model.typeconversion type conversion] (including
		 * associations).  
		 * 
		 * The following converts dueDates to JavaScript dates:
		 * 
		 * 
		 *     $.Model("Contact",{
		 *       attributes : { 
		 *         birthday : 'date'
		 *       },
		 *       convert : {
		 *         date : function(raw){
		 *           if(typeof raw == 'string'){
		 *             var matches = raw.match(/(\d+)-(\d+)-(\d+)/)
		 *             return new Date( matches[1], 
		 *                      (+matches[2])-1, 
		 *                     matches[3] )
		 *           }else if(raw instanceof Date){
		 *               return raw;
		 *           }
		 *         }
		 *       }
		 *     },{})
		 * 
		 * ## Associations
		 * 
		 * Attribute type values can also represent the name of a 
		 * function.  The most common case this is used is for
		 * associated data. 
		 * 
		 * For example, a Deliverable might have many tasks and 
		 * an owner (which is a Person).  The attributes property might
		 * look like:
		 * 
		 *     attributes : {
		 *       tasks : "App.Models.Task.models"
		 *       owner: "App.Models.Person.model"
		 *     }
		 * 
		 * This points tasks and owner properties to use 
		 * <code>Task.models</code> and <code>Person.model</code>
		 * to convert the raw data into an array of Tasks and a Person.
		 * 
		 * Note that the full names of the models themselves are <code>App.Models.Task</code>
		 * and <code>App.Models.Person</code>. The _.model_ and _.models_ parts are appended
		 * for the benefit of [$.Model.convert convert] to identify the types as 
		 * models.
		 * 
		 * @demo jquery/model/pages/associations.html
		 * 
		 */
		attributes: {},
		/**
		 * $.Model.model is used as a [http://api.jquery.com/extending-ajax/#Converters Ajax converter] 
		 * to convert the response of a [$.Model.findOne] request 
		 * into a model instance.  
		 * 
		 * You will never call this method directly.  Instead, you tell $.ajax about it in findOne:
		 * 
		 *     $.Model('Recipe',{
		 *       findOne : function(params, success, error ){
		 *         return $.ajax({
		 *           url: '/services/recipes/'+params.id+'.json',
		 *           type: 'get',
		 *           
		 *           dataType : 'json recipe.model' //LOOK HERE!
		 *         });
		 *       }
		 *     },{})
		 * 
		 * This makes the result of findOne a [http://api.jquery.com/category/deferred-object/ $.Deferred]
		 * that resolves to a model instance:
		 * 
		 *     var deferredRecipe = Recipe.findOne({id: 6});
		 *     
		 *     deferredRecipe.then(function(recipe){
		 *       console.log('I am '+recipes.description+'.');
		 *     })
		 * 
		 * ## Non-standard Services
		 * 
		 * $.jQuery.model expects data to be name-value pairs like:
		 * 
		 *     {id: 1, name : "justin"}
		 *     
		 * It can also take an object with attributes in a data, attributes, or
		 * 'shortName' property.  For a App.Models.Person model the following will  all work:
		 * 
		 *     { data : {id: 1, name : "justin"} }
		 *     
		 *     { attributes : {id: 1, name : "justin"} }
		 *     
		 *     { person : {id: 1, name : "justin"} }
		 * 
		 * 
		 * ### Overwriting Model
		 * 
		 * If your service returns data like:
		 * 
		 *     {id : 1, name: "justin", data: {foo : "bar"} }
		 *     
		 * This will confuse $.Model.model.  You will want to overwrite it to create 
		 * an instance manually:
		 * 
		 *     $.Model('Person',{
		 *       model : function(data){
		 *         return new this(data);
		 *       }
		 *     },{})
		 *     
		 * 
		 * @param {Object} attributes An object of name-value pairs or an object that has a 
		 *  data, attributes, or 'shortName' property that maps to an object of name-value pairs.
		 * @return {Model} an instance of the model
		 */
		model: function( attributes ) {
			if (!attributes ) {
				return null;
			}
			if ( attributes instanceof this ) {
				attributes = attributes.serialize();
			}
			return new this(
			// checks for properties in an object (like rails 2.0 gives);
			isObject(attributes[this._shortName]) || isObject(attributes.data) || isObject(attributes.attributes) || attributes);
		},
		/**
		 * $.Model.models is used as a [http://api.jquery.com/extending-ajax/#Converters Ajax converter] 
		 * to convert the response of a [$.Model.findAll] request 
		 * into an array (or [$.Model.List $.Model.List]) of model instances.  
		 * 
		 * You will never call this method directly.  Instead, you tell $.ajax about it in findAll:
		 * 
		 *     $.Model('Recipe',{
		 *       findAll : function(params, success, error ){
		 *         return $.ajax({
		 *           url: '/services/recipes.json',
		 *           type: 'get',
		 *           data: params
		 *           
		 *           dataType : 'json recipe.models' //LOOK HERE!
		 *         });
		 *       }
		 *     },{})
		 * 
		 * This makes the result of findAll a [http://api.jquery.com/category/deferred-object/ $.Deferred]
		 * that resolves to a list of model instances:
		 * 
		 *     var deferredRecipes = Recipe.findAll({});
		 *     
		 *     deferredRecipes.then(function(recipes){
		 *       console.log('I have '+recipes.length+'recipes.');
		 *     })
		 * 
		 * ## Non-standard Services
		 * 
		 * $.jQuery.models expects data to be an array of name-value pairs like:
		 * 
		 *     [{id: 1, name : "justin"},{id:2, name: "brian"}, ...]
		 *     
		 * It can also take an object with additional data about the array like:
		 * 
		 *     {
		 *       count: 15000 //how many total items there might be
		 *       data: [{id: 1, name : "justin"},{id:2, name: "brian"}, ...]
		 *     }
		 * 
		 * In this case, models will return an array of instances found in 
		 * data, but with additional properties as expandos on the array:
		 * 
		 *     var people = Person.models({
		 *       count : 1500,
		 *       data : [{id: 1, name: 'justin'}, ...]
		 *     })
		 *     people[0].name // -> justin
		 *     people.count // -> 1500
		 * 
		 * ### Overwriting Models
		 * 
		 * If your service returns data like:
		 * 
		 *     {ballers: [{name: "justin", id: 5}]}
		 * 
		 * You will want to overwrite models to pass the base models what it expects like:
		 * 
		 *     $.Model('Person',{
		 *       models : function(data){
		 *         return this._super(data.ballers);
		 *       }
		 *     },{})
		 * 
		 * @param {Array} instancesRawData an array of raw name - value pairs.
		 * @return {Array} a JavaScript array of instances or a [$.Model.List list] of instances
		 *  if the model list plugin has been included.
		 */
		models: function( instancesRawData ) {
			if (!instancesRawData ) {
				return null;
			}
			// get the list type
			var res = getList(this.List),
				// did we get an array
				arr = isArray(instancesRawData),
				// cache model list
				ML = $.Model.List,
				// did we get a model list?
				ml = (ML && instancesRawData instanceof ML),
				// get the raw array of objects
				raw = arr ?
				// if an array, return the array
				instancesRawData :
				// otherwise if a model list
				(ml ?
				// get the raw objects from the list
				instancesRawData.serialize() :
				// get the object's data
				instancesRawData.data),
				// the number of items
				length = raw ? raw.length : null,
				i = 0;

			
			for (; i < length; i++ ) {
				res.push(this.model(raw[i]));
			}
			if (!arr ) { //push other stuff onto array
				each(instancesRawData, function(prop, val){
					if ( prop !== 'data' ) {
						res[prop] = val;
					}
				})
			}
			return res;
		},
		/**
		 * The name of the id field.  Defaults to 'id'. Change this if it is something different.
		 * 
		 * For example, it's common in .NET to use Id.  Your model might look like:
		 * 
		 * @codestart
		 * $.Model("Friends",{
		 *   id: "Id"
		 * },{});
		 * @codeend
		 */
		id: 'id',
		//if null, maybe treat as an array?
		/**
		 * Adds an attribute to the list of attributes for this class.
		 * @hide
		 * @param {String} property
		 * @param {String} type
		 */
		addAttr: function( property, type ) {
			var stub, attrs = this.attributes;

			stub = attrs[property] || (attrs[property] = type);
			return type;
		},
		/**
		 * @attribute convert
		 * @type Object
		 * An object of name-function pairs that are used to convert attributes.
		 * Check out [$.Model.attributes] or 
		 * [jquery.model.typeconversion type conversion]
		 * for examples.
		 * 
		 * Convert comes with the following types:
		 * 
		 *   - date - Converts to a JS date.  Accepts integers or strings that work with Date.parse
		 *   - number - an integer or number that can be passed to parseFloat
		 *   - boolean - converts "false" to false, and puts everything else through Boolean()
		 */
		convert: {
			"date": function( str ) {
				var type = typeof str;
				if ( type === "string" ) {
					return isNaN(Date.parse(str)) ? null : Date.parse(str)
				} else if ( type === 'number' ) {
					return new Date(str)
				} else {
					return str
				}
			},
			"number": function( val ) {
				return parseFloat(val);
			},
			"boolean": function( val ) {
				return Boolean(val === "false" ? 0 : val);
			},
			"default": function( val, error, type ) {
				var construct = getObject(type),
					context = window,
					realType;
				// if type has a . we need to look it up
				if ( type.indexOf(".") >= 0 ) {
					// get everything before the last .
					realType = type.substring(0, type.lastIndexOf("."));
					// get the object before the last .
					context = getObject(realType);
				}
				return typeof construct == "function" ? construct.call(context, val) : val;
			}
		},
		/**
		 * @attribute serialize
		 * @type Object
		 * An object of name-function pairs that are used to serialize attributes.
		 * Similar to [$.Model.convert], in that the keys of this object
		 * correspond to the types specified in [$.Model.attributes].
		 * 
		 * For example, to serialize all dates to ISO format:
		 * 
		 * 
		 *     $.Model("Contact",{
		 *       attributes : {
		 *         birthday : 'date'
		 *       },
		 *       serialize : {
		 *         date : function(val, type){
		 *           return new Date(val).toISOString();
		 *         }
		 *       }
		 *     },{})
		 *     
		 *     new Contact({ birthday: new Date("Oct 25, 1973") }).serialize()
		 *        // { "birthday" : "1973-10-25T05:00:00.000Z" }
		 * 
		 */
		serialize: {
			"default": function( val, type ) {
				return isObject(val) && val.serialize ? val.serialize() : val;
			},
			"date": function( val ) {
				return val && val.getTime()
			}
		},
		/**
		 * @function bind
		 */
		bind: bind,
		/**
		 * @function unbind
		 */
		unbind: unbind,
		_ajax: ajax
	},
	/**
	 * @Prototype
	 */
	{
		/**
		 * Setup is called when a new model instance is created.
		 * It adds default attributes, then whatever attributes
		 * are passed to the class.
		 * Setup should never be called directly.
		 * 
		 * @codestart
		 * $.Model("Recipe")
		 * var recipe = new Recipe({foo: "bar"});
		 * recipe.foo //-> "bar"
		 * recipe.attr("foo") //-> "bar"
		 * @codeend
		 * 
		 * @param {Object} attributes a hash of attributes
		 */
		setup: function( attributes ) {
			// so we know not to fire events
			this._init = true;
			this.attrs(extend({}, this.constructor.defaults, attributes));
			delete this._init;
		},
		/**
		 * Sets the attributes on this instance and calls save.
		 * The instance needs to have an id.  It will use
		 * the instance class's [$.Model.update update]
		 * method.
		 * 
		 * @codestart
		 * recipe.update({name: "chicken"}, success, error);
		 * @codeend
		 * 
		 * The model will also publish a _updated_ event with [jquery.model.events Model Events].
		 * 
		 * @param {Object} attrs the model's attributes
		 * @param {Function} success called if a successful update
		 * @param {Function} error called if there's an error
		 */
		update: function( attrs, success, error ) {
			this.attrs(attrs);
			return this.save(success, error); //on success, we should 
		},
		/**
		 * Runs the validations on this model.  You can
		 * also pass it an array of attributes to run only those attributes.
		 * It returns nothing if there are no errors, or an object
		 * of errors by attribute.
		 * 
		 * To use validations, it's suggested you use the 
		 * model/validations plugin.
		 * 
		 *     $.Model("Task",{
		 *       init : function(){
		 *         this.validatePresenceOf("dueDate")
		 *       }
		 *     },{});
		 * 
		 *     var task = new Task(),
		 *         errors = task.errors()
		 * 
		 *     errors.dueDate[0] //-> "can't be empty"
		 * 
		 * @param {Array} [attrs] an optional list of attributes to get errors for:
		 * 
		 *     task.errors(['dueDate']);
		 *     
		 * @return {Object} an object of attributeName : [errors] like:
		 * 
		 *     task.errors() // -> {dueDate: ["cant' be empty"]}
		 */
		errors: function( attrs ) {
			// convert attrs to an array
			if ( attrs ) {
				attrs = isArray(attrs) ? attrs : makeArray(arguments);
			}
			var errors = {},
				self = this,
				attr,
				// helper function that adds error messages to errors object
				// attr - the name of the attribute
				// funcs - the validation functions
				addErrors = function( attr, funcs ) {
					each(funcs, function( i, func ) {
						var res = func.call(self);
						if ( res ) {
							if (!errors[attr] ) {
								errors[attr] = [];
							}
							errors[attr].push(res);
						}

					});
				},
				validations = this.constructor.validations;

			// go through each attribute or validation and
			// add any errors
			each(attrs || validations || {}, function( attr, funcs ) {
				// if we are iterating through an array, use funcs
				// as the attr name
				if ( typeof attr == 'number' ) {
					attr = funcs;
					funcs = validations[attr];
				}
				// add errors to the 
				addErrors(attr, funcs || []);
			});
			// return errors as long as we have one
			return $.isEmptyObject(errors) ? null : errors;

		},
		/**
		 * Gets or sets an attribute on the model using setters and 
		 * getters if available.
		 * 
		 * @codestart
		 * $.Model("Recipe")
		 * var recipe = new Recipe();
		 * recipe.attr("foo","bar")
		 * recipe.foo //-> "bar"
		 * recipe.attr("foo") //-> "bar"
		 * @codeend
		 * 
		 * ## Setters
		 * 
		 * If you add a set<i>AttributeName</i> method on your model,
		 * it will be used to set the value.  The set method is called
		 * with the value and is expected to return the converted value.
		 * 
		 * @codestart
		 * $.Model("Recipe",{
		 *   setCreatedAt : function(raw){
		 *     return Date.parse(raw)
		 *   }
		 * })
		 * var recipe = new Recipe();
		 * recipe.attr("createdAt","Dec 25, 1995")
		 * recipe.createAt //-> Date
		 * @codeend
		 * 
		 * ## Asynchronous Setters
		 * 
		 * Sometimes, you want to perform an ajax request when 
		 * you set a property.  You can do this with setters too.
		 * 
		 * To do this, your setter should return undefined and
		 * call success with the converted value.  For example:
		 * 
		 * @codestart
		 * $.Model("Recipe",{
		 *   setTitle : function(title, success, error){
		 *     $.post(
		 *       "recipe/update/"+this.id+"/title",
		 *       title,
		 *       function(){
		 *         success(title);
		 *       },
		 *       "json")
		 *   }
		 * })
		 * 
		 * recipe.attr("title","fish")
		 * @codeend
		 * 
		 * ## Events
		 * 
		 * When you use attr, it can also trigger events.  This is
		 * covered in [$.Model.prototype.bind].
		 * 
		 * @param {String} attribute the attribute you want to set or get
		 * @param {String|Number|Boolean} [value] value the value you want to set.
		 * @param {Function} [success] an optional success callback.  
		 *    This gets called if the attribute was successful.
		 * @param {Function} [error] an optional success callback.  
		 *    The error function is called with validation errors.
		 */
		attr: function( attribute, value, success, error ) {
			// get the getter name getAttrName
			var cap = classize(attribute),
				get = "get" + cap;

			// if we are setting the property
			if ( value !== undefined ) {
				// the potential setter name
				var setName = "set" + cap,
					//the old value
					old = this[attribute],
					self = this,
					// if an error happens, this gets called
					// it calls back the error handler
					errorCallback = function( errors ) {
						var stub;
						stub = error && error.call(self, errors);
						trigger(self, "error." + attribute, errors);
					};

				// if we have a setter
				if ( this[setName] &&
				// call the setter, if returned value is undefined,
				// this means the setter is async so we 
				// do not call update property and return right away
				(value = this[setName](value,
				// a success handler we pass to the setter, it needs to call
				// this if it returns undefined
				this.proxy('_updateProperty', attribute, value, old, success, errorCallback), errorCallback)) === undefined ) {
					return;
				}
				// call update property which will actually update the property
				this._updateProperty(attribute, value, old, success, errorCallback);
				return this;
			}
			// get the attribute, check if we have a getter, otherwise, just get the data
			return this[get] ? this[get]() : this[attribute];
		},

		/**
		 * @function bind
		 * Binds to events on this model instance.  Typically 
		 * you'll bind to an attribute name.  Handler will be called
		 * every time the attribute value changes.  For example:
		 * 
		 * @codestart
		 * $.Model("School")
		 * var school = new School();
		 * school.bind("address", function(ev, address){
		 *   alert('address changed to '+address);
		 * })
		 * school.attr("address","1124 Park St");
		 * @codeend
		 * 
		 * You can also bind to attribute errors.
		 * 
		 * @codestart
		 * $.Model("School",{
		 *   setName : function(name, success, error){
		 *     if(!name){
		 *        error("no name");
		 *     }
		 *     return error;
		 *   }
		 * })
		 * var school = new School();
		 * school.bind("error.name", function(ev, mess){
		 *    mess // -> "no name";
		 * })
		 * school.attr("name","");
		 * @codeend
		 * 
		 * You can also bind to created, updated, and destroyed events.
		 * 
		 * @param {String} eventType the name of the event.
		 * @param {Function} handler a function to call back when an event happens on this model.
		 * @return {model} the model instance for chaining
		 */
		bind: bind,
		/**
		 * @function unbind
		 * Unbinds an event handler from this instance.
		 * Read [$.Model.prototype.bind] for 
		 * more information.
		 * @param {String} eventType
		 * @param {Function} handler
		 */
		unbind: unbind,
		// Actually updates a property on a model.  This
		// - Triggers events when a property has been updated
		// - uses converters to change the data type
		// propety - the attribute name
		// value - the new value
		// old - the old value
		// success - 
		_updateProperty: function( property, value, old, success, errorCallback ) {
			var Class = this.constructor,
				// the value that we will set
				val,
				// the type of the attribute
				type = Class.attributes[property] || Class.addAttr(property, "string"),
				//the converter
				converter = Class.convert[type] || Class.convert['default'],
				// errors for this property
				errors = null,
				// the event name prefix (might be error.)
				prefix = "",
				global = "updated.",
				args, globalArgs, callback = success,
				list = Class.list;

			// set the property value
			// notice that even if there's an error
			// property values get set
			val = this[property] =
				//if the value is null
				( value === null ?
				// it should be null
				null :
				// otherwise, the converters to make it something useful
				converter.call(Class, value, function() {}, type) );

			//validate (only if not initializing, this is for performance)
			if (!this._init ) {
				errors = this.errors(property);
			}
			// args triggered on the property event name
			args = [val];
			// args triggered on the 'global' event (updated.attr) 
			globalArgs = [property, val, old];
			
			// if there are errors, change props so we trigger error events
			if ( errors ) {
				prefix = global = "error.";
				callback = errorCallback;
				globalArgs.splice(1, 0, errors);
				args.unshift(errors)
			}
			// as long as we changed values, trigger events
			if ( (old !== val || value != val) && !this._init ) {
				!errors && trigger(this, prefix + property, args);
				trigger(this,global + "attr", globalArgs);
			}
			callback && callback.apply(this, args);

			//if this class has a global list, add / remove from the list.
			if ( property === Class.id && val !== null && list ) {
				// if we didn't have an old id, add ourselves
				if (!old ) {
					list.push(this);
				} else if ( old != val ) {
					// if our id has changed ... well this should be ok
					list.remove(old);
					list.push(this);
				}
			}

		},

		/**
		 * Removes an attribute from the list existing of attributes. 
		 * Each attribute is set with [$.Model.prototype.attr attr].
		 * 
		 * @codestart
		 * recipe.removeAttr('name')
		 * @codeend
		 * 
		 * @param {Object} [attribute]  the attribute to remove
		 */
		removeAttr: function( attr ) {
			var old = this[attr],
				deleted = false,
				attrs = this.constructor.attributes;

			//- pop it off the object
			if ( this[attr] ) {
				delete this[attr];
			}

			//- pop it off the Class attributes collection
			if ( attrs[attr] ) {
				delete attrs[attr];
				deleted = true;
			}

			//- trigger the update
			if (!this._init && deleted && old ) {
				trigger(this,"updated.attr", [attr, null, old]);
			}
		},

		/**
		 * Gets or sets a list of attributes. 
		 * Each attribute is set with [$.Model.prototype.attr attr].
		 * 
		 * @codestart
		 * recipe.attrs({
		 *   name: "ice water",
		 *   instructions : "put water in a glass"
		 * })
		 * @codeend
		 * 
		 * This can be used nicely with [jquery.model.events].
		 * 
		 * @param {Object} [attributes]  if present, the list of attributes to send
		 * @return {Object} the current attributes of the model
		 */
		attrs: function( attributes ) {
			var key, constructor = this.constructor,
				attrs = constructor.attributes;
			if (!attributes ) {
				attributes = {};
				for ( key in attrs ) {
					if ( attrs.hasOwnProperty(key) ) {
						attributes[key] = this.attr(key);
					}
				}
			} else {
				var idName = constructor.id;
				//always set the id last
				for ( key in attributes ) {
					if ( key != idName ) {
						this.attr(key, attributes[key]);
					}
				}
				if ( idName in attributes ) {
					this.attr(idName, attributes[idName]);
				}

			}
			return attributes;
		},
		/**
		 * Get a serialized object for the model. Serialized data is typically
		 * used to send back to a server. See [$.Model.serialize].
		 *
		 *     model.serialize() // -> { name: 'Fred' }
		 *
		 * @return {Object} a JavaScript object that can be serialized with
		 * `JSON.stringify` or other methods.
		 */
		serialize: function() {
			var Class = this.constructor,
				attrs = Class.attributes,
				type, converter, data = {},
				attr;

			attributes = {};

			for ( attr in attrs ) {
				if ( attrs.hasOwnProperty(attr) ) {
					type = attrs[attr];
					// the attribute's converter or the default converter for the class
					converter = Class.serialize[type] || Class.serialize['default'];
					data[attr] = converter.call(Class, this[attr], type);
				}
			}
			return data;
		},
		/**
		 * Returns if the instance is a new object.  This is essentially if the
		 * id is null or undefined.
		 * 
		 *     new Recipe({id: 1}).isNew() //-> false
		 * @return {Boolean} false if an id is set, true if otherwise.
		 */
		isNew: function() {
			var id = getId(this);
			return (id === undefined || id === null || id === ''); //if null or undefined
		},
		/**
		 * Creates or updates the instance using [$.Model.create] or
		 * [$.Model.update] depending if the instance
		 * [$.Model.prototype.isNew has an id or not].
		 * 
		 * When a save is successful, `success` is called and depending if the
		 * instance was created or updated, a created or updated event is fired.
		 * 
		 * ### Example
		 * 
		 *     $.Model('Recipe',{
		 *       created : "/recipes",
		 *       updated : "/recipes/{id}.json"
		 *     },{})
		 *     
		 *     // create a new instance
		 *     var recipe = new Recipe({name: "ice water"});
		 * 	   
		 *     // listen for when it is created or updated
		 *     recipe.bind('created', function(ev, recipe){
		 *       console.log('created', recipe.id)
		 *     }).bind('updated', function(ev, recipe){
		 *       console.log('updated', recipe.id );
		 *     })
		 *     
		 *     // create the recipe on the server
		 *     recipe.save(function(){
		 *       // update the recipe's name
		 *       recipe.attr('name','Ice Water');
		 *       
		 *       // update the recipe on the server
		 *       recipe.save();
		 *     }, error);
		 * 
		 * 
		 * @param {Function} [success] called with (instance,data) if a successful save.
		 * @param {Function} [error] error handler function called with (jqXHR) if the 
		 * save was not successful. It is passed the ajax request's jQXHR object.
		 * @return {$.Deferred} a jQuery deferred that resolves to the instance, but
		 * after it has been created or updated.
		 */
		save: function( success, error ) {
			return makeRequest(this, this.isNew() ? 'create' : 'update', success, error);
		},

		/**
		 * Destroys the instance by calling 
		 * [$.Model.destroy] with the id of the instance.
		 * 
		 * @codestart
		 * recipe.destroy(success, error);
		 * @codeend
		 * 
		 * If OpenAjax.hub is available, after a successful
		 * destroy "<i>modelName</i>.destroyed" is published
		 * with the model instance.
		 * 
		 * @param {Function} [success] called if a successful destroy
		 * @param {Function} [error] called if an unsuccessful destroy
		 */
		destroy: function( success, error ) {
			return makeRequest(this, 'destroy', success, error, 'destroyed');
		},


		/**
		 * Returns a unique identifier for the model instance.  For example:
		 * @codestart
		 * new Todo({id: 5}).identity() //-> 'todo_5'
		 * @codeend
		 * Typically this is used in an element's shortName property so you can find all elements
		 * for a model with [$.Model.prototype.elements elements].
		 * @return {String}
		 */
		identity: function() {
			var id = getId(this),
				constructor = this.constructor;
			return (constructor._fullName + '_' + (constructor.escapeIdentity ? encodeURIComponent(id) : id)).replace(/ /g, '_');
		},
		/**
		 * Returns elements that represent this model instance.  For this to work, your element's should
		 * us the [$.Model.prototype.identity identity] function in their class name.  Example:
		 * 
		 *     <div class='todo <%= todo.identity() %>'> ... </div>
		 * 
		 * This also works if you hooked up the model:
		 * 
		 *     <div <%= todo %>> ... </div>
		 *     
		 * Typically, you'll use this as a response to a Model Event:
		 * 
		 *     "{Todo} destroyed": function(Todo, event, todo){
		 *       todo.elements(this.element).remove();
		 *     }
		 * 
		 * 
		 * @param {String|jQuery|element} context If provided, only elements inside this element
		 * that represent this model will be returned.
		 * 
		 * @return {jQuery} Returns a jQuery wrapped nodelist of elements that have this model instances
		 *  identity in their class name.
		 */
		elements: function( context ) {
			var id = this.identity();
			if( this.constructor.escapeIdentity ) {
				id = id.replace(/([ #;&,.+*~\'%:"!^$[\]()=>|\/])/g,'\\$1')
			}
			
			return $("." + id, context);
		},
		hookup: function( el ) {
			var shortName = this.constructor._shortName,
				models = $.data(el, "models") || $.data(el, "models", {});
			$(el).addClass(shortName + " " + this.identity());
			models[shortName] = this;
		}
	});


	each([
	/**
	 * @function created
	 * @hide
	 * Called by save after a new instance is created.  Publishes 'created'.
	 * @param {Object} attrs
	 */
	"created",
	/**
	 * @function updated
	 * @hide
	 * Called by save after an instance is updated.  Publishes 'updated'.
	 * @param {Object} attrs
	 */
	"updated",
	/**
	 * @function destroyed
	 * @hide
	 * Called after an instance is destroyed.  
	 *   - Publishes "shortName.destroyed".
	 *   - Triggers a "destroyed" event on this model.
	 *   - Removes the model from the global list if its used.
	 * 
	 */
	"destroyed"], function( i, funcName ) {
		$.Model.prototype[funcName] = function( attrs ) {
			var stub, constructor = this.constructor;

			// remove from the list if instance is destroyed
			if ( funcName === 'destroyed' && constructor.list ) {
				constructor.list.remove(getId(this));
			}

			// update attributes if attributes have been passed
			stub = attrs && typeof attrs == 'object' && this.attrs(attrs.attrs ? attrs.attrs() : attrs);

			// call event on the instance
			trigger(this,funcName);
			
			

			// call event on the instance's Class
			trigger(constructor,funcName, this);
			return [this].concat(makeArray(arguments)); // return like this for this.proxy chains
		};
	});

	/**
	 *  @add jQuery.fn
	 */
	// break
	/**
	 * @function models
	 * Returns a list of models.  If the models are of the same
	 * type, and have a [$.Model.List], it will return 
	 * the models wrapped with the list.
	 * 
	 * @codestart
	 * $(".recipes").models() //-> [recipe, ...]
	 * @codeend
	 * 
	 * @param {jQuery.Class} [type] if present only returns models of the provided type.
	 * @return {Array|$.Model.List} returns an array of model instances that are represented by the contained elements.
	 */
	$.fn.models = function( type ) {
		//get it from the data
		var collection = [],
			kind, ret, retType;
		this.each(function() {
			each($.data(this, "models") || {}, function( name, instance ) {
				//either null or the list type shared by all classes
				kind = kind === undefined ? instance.constructor.List || null : (instance.constructor.List === kind ? kind : null);
				collection.push(instance);
			});
		});

		ret = getList(kind);

		ret.push.apply(ret, unique(collection));
		return ret;
	};
	/**
	 * @function model
	 * 
	 * Returns the first model instance found from [jQuery.fn.models] or
	 * sets the model instance on an element.
	 * 
	 *     //gets an instance
	 *     ".edit click" : function(el) {
	 *       el.closest('.todo').model().destroy()
	 *     },
	 *     // sets an instance
	 *     list : function(items){
	 *        var el = this.element;
	 *        $.each(item, function(item){
	 *          $('<div/>').model(item)
	 *            .appendTo(el)
	 *        })
	 *     }
	 * 
	 * @param {Object} [type] The type of model to return.  If a model instance is provided
	 * it will add the model to the element.
	 */
	$.fn.model = function( type ) {
		if ( type && type instanceof $.Model ) {
			type.hookup(this[0]);
			return this;
		} else {
			return this.models.apply(this, arguments)[0];
		}

	};
})(jQuery);
(function( $ ) {
	// ------- HELPER FUNCTIONS  ------
	
	// Binds an element, returns a function that unbinds
	var bind = function( el, ev, callback ) {
		var wrappedCallback,
			binder = el.bind && el.unbind ? el : $(isFunction(el) ? [el] : el);
		//this is for events like >click.
		if ( ev.indexOf(">") === 0 ) {
			ev = ev.substr(1);
			wrappedCallback = function( event ) {
				if ( event.target === el ) {
					callback.apply(this, arguments);
				} 
			};
		}
		binder.bind(ev, wrappedCallback || callback);
		// if ev name has >, change the name and bind
		// in the wrapped callback, check that the element matches the actual element
		return function() {
			binder.unbind(ev, wrappedCallback || callback);
			el = ev = callback = wrappedCallback = null;
		};
	},
		makeArray = $.makeArray,
		isArray = $.isArray,
		isFunction = $.isFunction,
		extend = $.extend,
		Str = $.String,
		each = $.each,
		
		STR_PROTOTYPE = 'prototype',
		STR_CONSTRUCTOR = 'constructor',
		slice = Array[STR_PROTOTYPE].slice,
		
		// Binds an element, returns a function that unbinds
		delegate = function( el, selector, ev, callback ) {
			var binder = el.delegate && el.undelegate ? el : $(isFunction(el) ? [el] : el)
			binder.delegate(selector, ev, callback);
			return function() {
				binder.undelegate(selector, ev, callback);
				binder = el = ev = callback = selector = null;
			};
		},
		
		// calls bind or unbind depending if there is a selector
		binder = function( el, ev, callback, selector ) {
			return selector ? delegate(el, selector, ev, callback) : bind(el, ev, callback);
		},
		
		// moves 'this' to the first argument, wraps it with jQuery if it's an element
		shifter = function shifter(context, name) {
			var method = typeof name == "string" ? context[name] : name;
			return function() {
				context.called = name;
    			return method.apply(context, [this.nodeName ? $(this) : this].concat( slice.call(arguments, 0) ) );
			};
		},
		// matches dots
		dotsReg = /\./g,
		// matches controller
		controllersReg = /_?controllers?/ig,
		//used to remove the controller from the name
		underscoreAndRemoveController = function( className ) {
			return Str.underscore(className.replace("jQuery.", "").replace(dotsReg, '_').replace(controllersReg, ""));
		},
		// checks if it looks like an action
		actionMatcher = /[^\w]/,
		// handles parameterized action names
		parameterReplacer = /\{([^\}]+)\}/g,
		breaker = /^(?:(.*?)\s)?([\w\.\:>]+)$/,
		basicProcessor,
		data = function(el, data){
			return $.data(el, "controllers", data)
		};
	/**
	 * @class jQuery.Controller
	 * @parent jquerymx
	 * @plugin jquery/controller
	 * @download  http://jmvcsite.heroku.com/pluginify?plugins[]=jquery/controller/controller.js
	 * @test jquery/controller/qunit.html
	 * @inherits jQuery.Class
	 * @description jQuery widget factory.
	 * 
	 * jQuery.Controller helps create organized, memory-leak free, rapidly performing
	 * jQuery widgets.  Its extreme flexibility allows it to serve as both
	 * a traditional View and a traditional Controller.  
	 * 
	 * This means it is used to
	 * create things like tabs, grids, and contextmenus as well as 
	 * organizing them into higher-order business rules.
	 * 
	 * Controllers make your code deterministic, reusable, organized and can tear themselves 
	 * down auto-magically. Read about [http://jupiterjs.com/news/writing-the-perfect-jquery-plugin 
	 * the theory behind controller] and 
	 * a [http://jupiterjs.com/news/organize-jquery-widgets-with-jquery-controller walkthrough of its features]
	 * on Jupiter's blog. [mvc.controller Get Started with jQueryMX] also has a great walkthrough.
	 * 
	 * Controller inherits from [jQuery.Class $.Class] and makes heavy use of 
	 * [http://api.jquery.com/delegate/ event delegation]. Make sure 
	 * you understand these concepts before using it.
	 * 
	 * ## Basic Example
	 * 
	 * Instead of
	 * 
	 * 
	 *     $(function(){
	 *       $('#tabs').click(someCallbackFunction1)
	 *       $('#tabs .tab').click(someCallbackFunction2)
	 *       $('#tabs .delete click').click(someCallbackFunction3)
	 *     });
	 * 
	 * do this
	 * 
	 *     $.Controller('Tabs',{
	 *       click: function() {...},
	 *       '.tab click' : function() {...},
	 *       '.delete click' : function() {...}
	 *     })
	 *     $('#tabs').tabs();
	 * 
	 * 
	 * ## Tabs Example
	 * 
	 * @demo jquery/controller/controller.html
	 * 
	 * ## Using Controller
	 * 
	 * Controller helps you build and organize jQuery plugins.  It can be used
	 * to build simple widgets, like a slider, or organize multiple
	 * widgets into something greater.
	 * 
	 * To understand how to use Controller, you need to understand 
	 * the typical lifecycle of a jQuery widget and how that maps to
	 * controller's functionality:
	 * 
	 * ### A controller class is created.
	 *       
	 *     $.Controller("MyWidget",
	 *     {
	 *       defaults :  {
	 *         message : "Remove Me"
	 *       }
	 *     },
	 *     {
	 *       init : function(rawEl, rawOptions){ 
	 *         this.element.append(
	 *            "<div>"+this.options.message+"</div>"
	 *           );
	 *       },
	 *       "div click" : function(div, ev){ 
	 *         div.remove();
	 *       }  
	 *     }) 
	 *     
	 * This creates a <code>$.fn.my_widget</code> jQuery helper function
	 * that can be used to create a new controller instance on an element. Find
	 * more information [jquery.controller.plugin  here] about the plugin gets created 
	 * and the rules around its name.
	 *       
	 * ### An instance of controller is created on an element
	 * 
	 *     $('.thing').my_widget(options) // calls new MyWidget(el, options)
	 * 
	 * This calls <code>new MyWidget(el, options)</code> on 
	 * each <code>'.thing'</code> element.  
	 *     
	 * When a new [jQuery.Class Class] instance is created, it calls the class's
	 * prototype setup and init methods. Controller's [jQuery.Controller.prototype.setup setup]
	 * method:
	 *     
	 *  - Sets [jQuery.Controller.prototype.element this.element] and adds the controller's name to element's className.
	 *  - Merges passed in options with defaults object and sets it as [jQuery.Controller.prototype.options this.options]
	 *  - Saves a reference to the controller in <code>$.data</code>.
	 *  - [jquery.controller.listening Binds all event handler methods].
	 *   
	 * 
	 * ### The controller responds to events
	 * 
	 * Typically, Controller event handlers are automatically bound.  However, there are
	 * multiple ways to [jquery.controller.listening listen to events] with a controller.
	 * 
	 * Once an event does happen, the callback function is always called with 'this' 
	 * referencing the controller instance.  This makes it easy to use helper functions and
	 * save state on the controller.
	 * 
	 * 
	 * ### The widget is destroyed
	 * 
	 * If the element is removed from the page, the 
	 * controller's [jQuery.Controller.prototype.destroy] method is called.
	 * This is a great place to put any additional teardown functionality.
	 * 
	 * You can also teardown a controller programatically like:
	 * 
	 *     $('.thing').my_widget('destroy');
	 * 
	 * ## Todos Example
	 * 
	 * Lets look at a very basic example - 
	 * a list of todos and a button you want to click to create a new todo.
	 * Your HTML might look like:
	 * 
	 * @codestart html
	 * &lt;div id='todos'>
	 *  &lt;ol>
	 *    &lt;li class="todo">Laundry&lt;/li>
	 *    &lt;li class="todo">Dishes&lt;/li>
	 *    &lt;li class="todo">Walk Dog&lt;/li>
	 *  &lt;/ol>
	 *  &lt;a class="create">Create&lt;/a>
	 * &lt;/div>
	 * @codeend
	 * 
	 * To add a mousover effect and create todos, your controller might look like:
	 * 
	 *     $.Controller('Todos',{
	 *       ".todo mouseover" : function( el, ev ) {
	 *         el.css("backgroundColor","red")
	 *       },
	 *       ".todo mouseout" : function( el, ev ) {
	 *         el.css("backgroundColor","")
	 *       },
	 *       ".create click" : function() {
	 *         this.find("ol").append("<li class='todo'>New Todo</li>"); 
	 *       }
	 *     })
	 * 
	 * Now that you've created the controller class, you've must attach the event handlers on the '#todos' div by
	 * creating [jQuery.Controller.prototype.setup|a new controller instance].  There are 2 ways of doing this.
	 * 
	 * @codestart
	 * //1. Create a new controller directly:
	 * new Todos($('#todos'));
	 * //2. Use jQuery function
	 * $('#todos').todos();
	 * @codeend
	 * 
	 * ## Controller Initialization
	 * 
	 * It can be extremely useful to add an init method with 
	 * setup functionality for your widget.
	 * 
	 * In the following example, I create a controller that when created, will put a message as the content of the element:
	 * 
	 *     $.Controller("SpecialController",
	 *     {
	 *       init: function( el, message ) {
	 *         this.element.html(message)
	 *       }
	 *     })
	 *     $(".special").special("Hello World")
	 * 
	 * ## Removing Controllers
	 * 
	 * Controller removal is built into jQuery.  So to remove a controller, you just have to remove its element:
	 * 
	 * @codestart
	 * $(".special_controller").remove()
	 * $("#containsControllers").html("")
	 * @codeend
	 * 
	 * It's important to note that if you use raw DOM methods (<code>innerHTML, removeChild</code>), the controllers won't be destroyed.
	 * 
	 * If you just want to remove controller functionality, call destroy on the controller instance:
	 * 
	 * @codestart
	 * $(".special_controller").controller().destroy()
	 * @codeend
	 * 
	 * ## Accessing Controllers
	 * 
	 * Often you need to get a reference to a controller, there are a few ways of doing that.  For the 
	 * following example, we assume there are 2 elements with <code>className="special"</code>.
	 * 
	 * @codestart
	 * //creates 2 foo controllers
	 * $(".special").foo()
	 * 
	 * //creates 2 bar controllers
	 * $(".special").bar()
	 * 
	 * //gets all controllers on all elements:
	 * $(".special").controllers() //-> [foo, bar, foo, bar]
	 * 
	 * //gets only foo controllers
	 * $(".special").controllers(FooController) //-> [foo, foo]
	 * 
	 * //gets all bar controllers
	 * $(".special").controllers(BarController) //-> [bar, bar]
	 * 
	 * //gets first controller
	 * $(".special").controller() //-> foo
	 * 
	 * //gets foo controller via data
	 * $(".special").data("controllers")["FooController"] //-> foo
	 * @codeend
	 * 
	 * ## Calling methods on Controllers
	 * 
	 * Once you have a reference to an element, you can call methods on it.  However, Controller has
	 * a few shortcuts:
	 * 
	 * @codestart
	 * //creates foo controller
	 * $(".special").foo({name: "value"})
	 * 
	 * //calls FooController.prototype.update
	 * $(".special").foo({name: "value2"})
	 * 
	 * //calls FooController.prototype.bar
	 * $(".special").foo("bar","something I want to pass")
	 * @codeend
	 * 
	 * These methods let you call one controller from another controller.
	 * 
	 */
	$.Class("jQuery.Controller",
	/** 
	 * @Static
	 */
	{
		/**
		 * Does 2 things:
		 * 
		 *   - Creates a jQuery helper for this controller.</li>
		 *   - Calculates and caches which functions listen for events.</li>
		 *    
		 * ### jQuery Helper Naming Examples
		 * 
		 * 
		 *     "TaskController" -> $().task_controller()
		 *     "Controllers.Task" -> $().controllers_task()
		 * 
		 */
		setup: function() {
			// Allow contollers to inherit "defaults" from superclasses as it done in $.Class
			this._super.apply(this, arguments);

			// if you didn't provide a name, or are controller, don't do anything
			if (!this.shortName || this.fullName == "jQuery.Controller" ) {
				return;
			}
			// cache the underscored names
			this._fullName = underscoreAndRemoveController(this.fullName);
			this._shortName = underscoreAndRemoveController(this.shortName);

			var controller = this,
				/**
				 * @attribute pluginName
				 * Setting the <code>pluginName</code> property allows you
				 * to change the jQuery plugin helper name from its 
				 * default value.
				 * 
				 *     $.Controller("Mxui.Layout.Fill",{
				 *       pluginName: "fillWith"
				 *     },{});
				 *     
				 *     $("#foo").fillWith();
				 */
				pluginname = this.pluginName || this._fullName,
				funcName, forLint;

			// create jQuery plugin
			if (!$.fn[pluginname] ) {
				$.fn[pluginname] = function( options ) {

					var args = makeArray(arguments),
						//if the arg is a method on this controller
						isMethod = typeof options == "string" && isFunction(controller[STR_PROTOTYPE][options]),
						meth = args[0];
					return this.each(function() {
						//check if created
						var controllers = data(this),
							//plugin is actually the controller instance
							plugin = controllers && controllers[pluginname];

						if ( plugin ) {
							if ( isMethod ) {
								// call a method on the controller with the remaining args
								plugin[meth].apply(plugin, args.slice(1));
							} else {
								// call the plugin's update method
								plugin.update.apply(plugin, args);
							}

						} else {
							//create a new controller instance
							controller.newInstance.apply(controller, [this].concat(args));
						}
					});
				};
			}

			// make sure listensTo is an array
			
			// calculate and cache actions
			this.actions = {};

			for ( funcName in this[STR_PROTOTYPE] ) {
				if (funcName == 'constructor' || !isFunction(this[STR_PROTOTYPE][funcName]) ) {
					continue;
				}
				if ( this._isAction(funcName) ) {
					this.actions[funcName] = this._action(funcName);
				}
			}
		},
		hookup: function( el ) {
			return new this(el);
		},

		/**
		 * @hide
		 * @param {String} methodName a prototype function
		 * @return {Boolean} truthy if an action or not
		 */
		_isAction: function( methodName ) {
			if ( actionMatcher.test(methodName) ) {
				return true;
			} else {
				return $.inArray(methodName, this.listensTo) > -1 || $.event.special[methodName] || processors[methodName];
			}

		},
		/**
		 * @hide
		 * This takes a method name and the options passed to a controller
		 * and tries to return the data necessary to pass to a processor
		 * (something that binds things).
		 * 
		 * For performance reasons, this called twice.  First, it is called when 
		 * the Controller class is created.  If the methodName is templated
		 * like : "{window} foo", it returns null.  If it is not templated
		 * it returns event binding data.
		 * 
		 * The resulting data is added to this.actions.
		 * 
		 * When a controller instance is created, _action is called again, but only
		 * on templated actions.  
		 * 
		 * @param {Object} methodName the method that will be bound
		 * @param {Object} [options] first param merged with class default options
		 * @return {Object} null or the processor and pre-split parts.  
		 * The processor is what does the binding/subscribing.
		 */
		_action: function( methodName, options ) {
			// reset the test index
			parameterReplacer.lastIndex = 0;
			
			//if we don't have options (a controller instance), we'll run this later
			if (!options && parameterReplacer.test(methodName) ) {
				return null;
			}
			// If we have options, run sub to replace templates "{}" with a value from the options
			// or the window
			var convertedName = options ? Str.sub(methodName, [options, window]) : methodName,
				
				// If a "{}" resolves to an object, convertedName will be an array
				arr = isArray(convertedName),
				
				// get the parts of the function = [convertedName, delegatePart, eventPart]
				parts = (arr ? convertedName[1] : convertedName).match(breaker),
				event = parts[2],
				processor = processors[event] || basicProcessor;
			return {
				processor: processor,
				parts: parts,
				delegate : arr ? convertedName[0] : undefined
			};
		},
		/**
		 * @attribute processors
		 * An object of {eventName : function} pairs that Controller uses to hook up events
		 * auto-magically.  A processor function looks like:
		 * 
		 *     jQuery.Controller.processors.
		 *       myprocessor = function( el, event, selector, cb, controller ) {
		 *          //el - the controller's element
		 *          //event - the event (myprocessor)
		 *          //selector - the left of the selector
		 *          //cb - the function to call
		 *          //controller - the binding controller
		 *       };
		 * 
		 * This would bind anything like: "foo~3242 myprocessor".
		 * 
		 * The processor must return a function that when called, 
		 * unbinds the event handler.
		 * 
		 * Controller already has processors for the following events:
		 * 
		 *   - change 
		 *   - click 
		 *   - contextmenu 
		 *   - dblclick 
		 *   - focusin
		 *   - focusout
		 *   - keydown 
		 *   - keyup 
		 *   - keypress 
		 *   - mousedown 
		 *   - mouseenter
		 *   - mouseleave
		 *   - mousemove 
		 *   - mouseout 
		 *   - mouseover 
		 *   - mouseup 
		 *   - reset 
		 *   - resize 
		 *   - scroll 
		 *   - select 
		 *   - submit  
		 * 
		 * Listen to events on the document or window 
		 * with templated event handlers:
		 * 
		 *
		 *     $.Controller('Sized',{
		 *       "{window} resize" : function(){
		 *         this.element.width(this.element.parent().width() / 2);
		 *       }
		 *     });
		 *     
		 *     $('.foo').sized();
		 */
		processors: {},
		/**
		 * @attribute listensTo
		 * An array of special events this controller 
		 * listens too.  You only need to add event names that
		 * are whole words (ie have no special characters).
		 * 
		 *     $.Controller('TabPanel',{
		 *       listensTo : ['show']
		 *     },{
		 *       'show' : function(){
		 *         this.element.show();
		 *       }
		 *     })
		 *     
		 *     $('.foo').tab_panel().trigger("show");
		 * 
		 */
		listensTo: [],
		/**
		 * @attribute defaults
		 * A object of name-value pairs that act as default values for a controller's 
		 * [jQuery.Controller.prototype.options options].
		 * 
		 *     $.Controller("Message",
		 *     {
		 *       defaults : {
		 *         message : "Hello World"
		 *       }
		 *     },{
		 *       init : function(){
		 *         this.element.text(this.options.message);
		 *       }
		 *     })
		 *     
		 *     $("#el1").message(); //writes "Hello World"
		 *     $("#el12").message({message: "hi"}); //writes hi
		 *     
		 * In [jQuery.Controller.prototype.setup setup] the options passed to the controller
		 * are merged with defaults.  This is not a deep merge.
		 */
		defaults: {}
	},
	/** 
	 * @Prototype
	 */
	{
		/**
		 * Setup is where most of controller's magic happens.  It does the following:
		 * 
		 * ### 1. Sets this.element
		 * 
		 * The first parameter passed to new Controller(el, options) is expected to be 
		 * an element.  This gets converted to a jQuery wrapped element and set as
		 * [jQuery.Controller.prototype.element this.element].
		 * 
		 * ### 2. Adds the controller's name to the element's className.
		 * 
		 * Controller adds it's plugin name to the element's className for easier 
		 * debugging.  For example, if your Controller is named "Foo.Bar", it adds
		 * "foo_bar" to the className.
		 * 
		 * ### 3. Saves the controller in $.data
		 * 
		 * A reference to the controller instance is saved in $.data.  You can find 
		 * instances of "Foo.Bar" like: 
		 * 
		 *     $("#el").data("controllers")['foo_bar'].
		 * 
		 * ### Binds event handlers
		 * 
		 * Setup does the event binding described in [jquery.controller.listening Listening To Events].
		 * 
		 * @param {HTMLElement} element the element this instance operates on.
		 * @param {Object} [options] option values for the controller.  These get added to
		 * this.options and merged with [jQuery.Controller.static.defaults defaults].
		 * @return {Array} return an array if you wan to change what init is called with. By
		 * default it is called with the element and options passed to the controller.
		 */
		setup: function( element, options ) {
			var funcName, ready, cls = this[STR_CONSTRUCTOR];

			//want the raw element here
			element = (typeof element == 'string' ? $(element) :
				(element.jquery ? element : [element]) )[0];

			//set element and className on element
			var pluginname = cls.pluginName || cls._fullName;

			//set element and className on element
			this.element = $(element).addClass(pluginname);

			//set in data
			(data(element) || data(element, {}))[pluginname] = this;

			
			/**
			 * @attribute options
			 * 
			 * Options are used to configure an controller.  They are
			 * the 2nd argument
			 * passed to a controller (or the first argument passed to the 
			 * [jquery.controller.plugin controller's jQuery plugin]).
			 * 
			 * For example:
			 * 
			 *     $.Controller('Hello')
			 *     
			 *     var h1 = new Hello($('#content1'), {message: 'World'} );
			 *     equal( h1.options.message , "World" )
			 *     
			 *     var h2 = $('#content2').hello({message: 'There'})
			 *                            .controller();
			 *     equal( h2.options.message , "There" )
			 * 
			 * Options are merged with [jQuery.Controller.static.defaults defaults] in
			 * [jQuery.Controller.prototype.setup setup].
			 * 
			 * For example:
			 * 
			 *     $.Controller("Tabs", 
			 *     {
			 *        defaults : {
			 *          activeClass: "ui-active-state"
			 *        }
			 *     },
			 *     {
			 *        init : function(){
			 *          this.element.addClass(this.options.activeClass);
			 *        }
			 *     })
			 *     
			 *     $("#tabs1").tabs()                         // adds 'ui-active-state'
			 *     $("#tabs2").tabs({activeClass : 'active'}) // adds 'active'
			 *     
			 * Options are typically updated by calling 
			 * [jQuery.Controller.prototype.update update];
			 *
			 */
			this.options = extend( true, extend(true, {}, cls.defaults), options);

			

			/**
			 * @attribute called
			 * String name of current function being called on controller instance.  This is 
			 * used for picking the right view in render.
			 * @hide
			 */
			this.called = "init";

			// bind all event handlers
			this.bind();

			/**
			 * @attribute element
			 * The controller instance's delegated element. This 
			 * is set by [jQuery.Controller.prototype.setup setup]. It 
			 * is a jQuery wrapped element.
			 * 
			 * For example, if I add MyWidget to a '#myelement' element like:
			 * 
			 *     $.Controller("MyWidget",{
			 *       init : function(){
			 *         this.element.css("color","red")
			 *       }
			 *     })
			 *     
			 *     $("#myelement").my_widget()
			 * 
			 * MyWidget will turn #myelement's font color red.
			 * 
			 * ## Using a different element.
			 * 
			 * Sometimes, you want a different element to be this.element.  A
			 * very common example is making progressively enhanced form widgets.
			 * 
			 * To change this.element, overwrite Controller's setup method like:
			 * 
			 *     $.Controller("Combobox",{
			 *       setup : function(el, options){
			 *          this.oldElement = $(el);
			 *          var newEl = $('<div/>');
			 *          this.oldElement.wrap(newEl);
			 *          this._super(newEl, options);
			 *       },
			 *       init : function(){
			 *          this.element //-> the div
			 *       },
			 *       ".option click" : function(){
			 *         // event handler bound on the div
			 *       },
			 *       destroy : function(){
			 *          var div = this.element; //save reference
			 *          this._super();
			 *          div.replaceWith(this.oldElement);
			 *       }
			 *     }
			 */
			return [this.element, this.options].concat(makeArray(arguments).slice(2));
			/**
			 * @function init
			 * 
			 * Implement this.
			 */
		},
		/**
		 * Bind attaches event handlers that will be 
		 * removed when the controller is removed.  
		 * 
		 * This used to be a good way to listen to events outside the controller's
		 * [jQuery.Controller.prototype.element element].  However,
		 * using templated event listeners is now the prefered way of doing this.
		 * 
		 * ### Example:
		 * 
		 *     init: function() {
		 *        // calls somethingClicked(el,ev)
		 *        this.bind('click','somethingClicked') 
		 *     
		 *        // calls function when the window is clicked
		 *        this.bind(window, 'click', function(ev){
		 *          //do something
		 *        })
		 *     },
		 *     somethingClicked: function( el, ev ) {
		 *       
		 *     }
		 * 
		 * @param {HTMLElement|jQuery.fn|Object} [el=this.element] 
		 * The element to be bound.  If an eventName is provided,
		 * the controller's element is used instead.
		 * 
		 * @param {String} eventName The event to listen for.
		 * @param {Function|String} func A callback function or the String name of a controller function.  If a controller
		 * function name is given, the controller function is called back with the bound element and event as the first
		 * and second parameter.  Otherwise the function is called back like a normal bind.
		 * @return {Integer} The id of the binding in this._bindings
		 */
		bind: function( el, eventName, func ) {
			if( el === undefined ) {
				//adds bindings
				this._bindings = [];
				//go through the cached list of actions and use the processor to bind
				
				var cls = this[STR_CONSTRUCTOR],
					bindings = this._bindings,
					actions = cls.actions,
					element = this.element;
					
				for ( funcName in actions ) {
					if ( actions.hasOwnProperty(funcName) ) {
						ready = actions[funcName] || cls._action(funcName, this.options);
						bindings.push(
							ready.processor(ready.delegate || element, 
							                ready.parts[2], 
											ready.parts[1], 
											funcName, 
											this));
					}
				}
	
	
				//setup to be destroyed ... don't bind b/c we don't want to remove it
				var destroyCB = shifter(this,"destroy");
				element.bind("destroyed", destroyCB);
				bindings.push(function( el ) {
					$(el).unbind("destroyed", destroyCB);
				});
				return bindings.length;
			}
			if ( typeof el == 'string' ) {
				func = eventName;
				eventName = el;
				el = this.element;
			}
			return this._binder(el, eventName, func);
		},
		_binder: function( el, eventName, func, selector ) {
			if ( typeof func == 'string' ) {
				func = shifter(this,func);
			}
			this._bindings.push(binder(el, eventName, func, selector));
			return this._bindings.length;
		},
		_unbind : function(){
			var el = this.element[0];
			each(this._bindings, function( key, value ) {
				value(el);
			});
			//adds bindings
			this._bindings = [];
		},
		/**
		 * Delegate will delegate on an elememt and will be undelegated when the controller is removed.
		 * This is a good way to delegate on elements not in a controller's element.<br/>
		 * <h3>Example:</h3>
		 * @codestart
		 * // calls function when the any 'a.foo' is clicked.
		 * this.delegate(document.documentElement,'a.foo', 'click', function(ev){
		 *   //do something
		 * })
		 * @codeend
		 * @param {HTMLElement|jQuery.fn} [element=this.element] the element to delegate from
		 * @param {String} selector the css selector
		 * @param {String} eventName the event to bind to
		 * @param {Function|String} func A callback function or the String name of a controller function.  If a controller
		 * function name is given, the controller function is called back with the bound element and event as the first
		 * and second parameter.  Otherwise the function is called back like a normal bind.
		 * @return {Integer} The id of the binding in this._bindings
		 */
		delegate: function( element, selector, eventName, func ) {
			if ( typeof element == 'string' ) {
				func = eventName;
				eventName = selector;
				selector = element;
				element = this.element;
			}
			return this._binder(element, eventName, func, selector);
		},
		/**
		 * Update extends [jQuery.Controller.prototype.options this.options] 
		 * with the `options` argument and rebinds all events.  It basically
		 * re-configures the controller.
		 * 
		 * For example, the following controller wraps a recipe form. When the form
		 * is submitted, it creates the recipe on the server.  When the recipe
		 * is `created`, it resets the form with a new instance.
		 * 
		 *     $.Controller('Creator',{
		 *       "{recipe} created" : function(){
		 *         this.update({recipe : new Recipe()});
		 *         this.element[0].reset();
		 *         this.find("[type=submit]").val("Create Recipe")
		 *       },
		 *       "submit" : function(el, ev){
		 *         ev.preventDefault();
		 *         var recipe = this.options.recipe;
		 *         recipe.attrs( this.element.formParams() );
		 *         this.find("[type=submit]").val("Saving...")
		 *         recipe.save();
		 *       }
		 *     });
		 *     $('#createRecipes').creator({recipe : new Recipe()})
		 * 
		 * 
		 * @demo jquery/controller/demo-update.html
		 * 
		 * Update is called if a controller's [jquery.controller.plugin jQuery helper] is 
		 * called on an element that already has a controller instance
		 * of the same type. 
		 * 
		 * For example, a widget that listens for model updates
		 * and updates it's html would look like.  
		 * 
		 *     $.Controller('Updater',{
		 *       // when the controller is created, update the html
		 *       init : function(){
		 *         this.updateView();
		 *       },
		 *       
		 *       // update the html with a template
		 *       updateView : function(){
		 *         this.element.html( "content.ejs",
		 *                            this.options.model ); 
		 *       },
		 *       
		 *       // if the model is updated
		 *       "{model} updated" : function(){
		 *         this.updateView();
		 *       },
		 *       update : function(options){
		 *         // make sure you call super
		 *         this._super(options);
		 *          
		 *         this.updateView();
		 *       }
		 *     })
		 * 
		 *     // create the controller
		 *     // this calls init
		 *     $('#item').updater({model: recipe1});
		 *     
		 *     // later, update that model
		 *     // this calls "{model} updated"
		 *     recipe1.update({name: "something new"});
		 *     
		 *     // later, update the controller with a new recipe
		 *     // this calls update
		 *     $('#item').updater({model: recipe2});
		 *     
		 *     // later, update the new model
		 *     // this calls "{model} updated"
		 *     recipe2.update({name: "something newer"});
		 * 
		 * _NOTE:_ If you overwrite `update`, you probably need to call
		 * this._super.
		 * 
		 * ### Example
		 * 
		 *     $.Controller("Thing",{
		 *       init: function( el, options ) {
		 *         alert( 'init:'+this.options.prop )
		 *       },
		 *       update: function( options ) {
		 *         this._super(options);
		 *         alert('update:'+this.options.prop)
		 *       }
		 *     });
		 *     $('#myel').thing({prop : 'val1'}); // alerts init:val1
		 *     $('#myel').thing({prop : 'val2'}); // alerts update:val2
		 * 
		 * @param {Object} options A list of options to merge with 
		 * [jQuery.Controller.prototype.options this.options].  Often, this method
		 * is called by the [jquery.controller.plugin jQuery helper function].
		 */
		update: function( options ) {
			extend(true, this.options, options);
			this._unbind();
			this.bind();
		},
		/**
		 * Destroy unbinds and undelegates all event handlers on this controller, 
		 * and prevents memory leaks.  This is called automatically
		 * if the element is removed.  You can overwrite it to add your own
		 * teardown functionality:
		 * 
		 *     $.Controller("ChangeText",{
		 *       init : function(){
		 *         this.oldText = this.element.text();
		 *         this.element.text("Changed!!!")
		 *       },
		 *       destroy : function(){
		 *         this.element.text(this.oldText);
		 *         this._super(); //Always call this!
		 *     })
		 * 
		 * Make sure you always call <code>_super</code> when overwriting
		 * controller's destroy event.  The base destroy functionality unbinds
		 * all event handlers the controller has created.
		 * 
		 * You could call destroy manually on an element with ChangeText
		 * added like:
		 * 
		 *     $("#changed").change_text("destroy");
		 * 
		 */
		destroy: function() {
			if ( this._destroyed ) {
				throw this[STR_CONSTRUCTOR].shortName + " controller already deleted";
			}
			var self = this,
				fname = this[STR_CONSTRUCTOR].pluginName || this[STR_CONSTRUCTOR]._fullName,
				controllers;
			
			// mark as destroyed
			this._destroyed = true;
			
			// remove the className
			this.element.removeClass(fname);

			// unbind bindings
			this._unbind();
			// clean up
			delete this._actions;

			delete this.element.data("controllers")[fname];
			
			$(this).triggerHandler("destroyed"); //in case we want to know if the controller is removed
			
			this.element = null;
		},
		/**
		 * Queries from the controller's element.
		 * @codestart
		 * ".destroy_all click" : function() {
		 *    this.find(".todos").remove();
		 * }
		 * @codeend
		 * @param {String} selector selection string
		 * @return {jQuery.fn} returns the matched elements
		 */
		find: function( selector ) {
			return this.element.find(selector);
		},
		//tells callback to set called on this.  I hate this.
		_set_called: true
	});

	var processors = $.Controller.processors,

	//------------- PROCESSSORS -----------------------------
	//processors do the binding.  They return a function that
	//unbinds when called.
	//the basic processor that binds events
	basicProcessor = function( el, event, selector, methodName, controller ) {
		return binder(el, event, shifter(controller, methodName), selector);
	};




	//set common events to be processed as a basicProcessor
	each("change click contextmenu dblclick keydown keyup keypress mousedown mousemove mouseout mouseover mouseup reset resize scroll select submit focusin focusout mouseenter mouseleave".split(" "), function( i, v ) {
		processors[v] = basicProcessor;
	});
	/**
	 *  @add jQuery.fn
	 */

	//used to determine if a controller instance is one of controllers
	//controllers can be strings or classes
	var i, isAControllerOf = function( instance, controllers ) {
		for ( i = 0; i < controllers.length; i++ ) {
			if ( typeof controllers[i] == 'string' ? instance[STR_CONSTRUCTOR]._shortName == controllers[i] : instance instanceof controllers[i] ) {
				return true;
			}
		}
		return false;
	};
	$.fn.extend({
		/**
		 * @function controllers
		 * Gets all controllers in the jQuery element.
		 * @return {Array} an array of controller instances.
		 */
		controllers: function() {
			var controllerNames = makeArray(arguments),
				instances = [],
				controllers, c, cname;
			//check if arguments
			this.each(function() {
	
				controllers = $.data(this, "controllers");
				for ( cname in controllers ) {
					if ( controllers.hasOwnProperty(cname) ) {
						c = controllers[cname];
						if (!controllerNames.length || isAControllerOf(c, controllerNames) ) {
							instances.push(c);
						}
					}
				}
			});
			return instances;
		},
		/**
		 * @function controller
		 * Gets a controller in the jQuery element.  With no arguments, returns the first one found.
		 * @param {Object} controller (optional) if exists, the first controller instance with this class type will be returned.
		 * @return {jQuery.Controller} the first controller.
		 */
		controller: function( controller ) {
			return this.controllers.apply(this, arguments)[0];
		}
	});
	

})(jQuery);
(function( $ ) {
	var keyBreaker = /[^\[\]]+/g,
		convertValue = function( value ) {
			if ( $.isNumeric( value )) {
				return parseFloat( value );
			} else if ( value === 'true') {
				return true;
			} else if ( value === 'false' ) {
				return false;
			} else if ( value === '' ) {
				return undefined;
			}
			return value;
		}, 
		nestData = function( elem, type, data, parts, value, seen ) {
			var name = parts.shift();

			if ( parts.length ) {
				if ( ! data[ name ] ) {
					data[ name ] = {};
				}
				// Recursive call
				nestData( elem, type, data[ name ], parts, value, seen );
			} else {

				// Handle same name case, as well as "last checkbox checked"
				// case
				if ( name in seen && type != "radio" && ! $.isArray( data[ name ] )) {
					if ( name in data ) {
						data[ name ] = [ data[name] ];
					} else {
						data[ name ] = [];
					}
				} else {
					seen[ name ] = true;
				}

				// Finally, assign data
				if ( ( type == "radio" || type == "checkbox" ) && ! elem.is(":checked") ) {
					return
				}

				if ( ! data[ name ] ) {
					data[ name ] = value;
				} else {
					data[ name ].push( value );
				}
				

			}

		};
		
	$.fn.extend({
		/**
		 * @parent dom
		 * @download http://jmvcsite.heroku.com/pluginify?plugins[]=jquery/dom/form_params/form_params.js
		 * @plugin jquery/dom/form_params
		 * @test jquery/dom/form_params/qunit.html
		 * 
		 * Returns an object of name-value pairs that represents values in a form.  
		 * It is able to nest values whose element's name has square brackets.
		 * 
		 * When convert is set to true strings that represent numbers and booleans will
		 * be converted and empty string will not be added to the object. 
		 * 
		 * Example html:
		 * @codestart html
		 * &lt;form>
		 *   &lt;input name="foo[bar]" value='2'/>
		 *   &lt;input name="foo[ced]" value='4'/>
		 * &lt;form/>
		 * @codeend
		 * Example code:
		 * 
		 *     $('form').formParams() //-> { foo:{bar:'2', ced: '4'} }
		 * 
		 * 
		 * @demo jquery/dom/form_params/form_params.html
		 * 
		 * @param {Object} [params] If an object is passed, the form will be repopulated
		 * with the values of the object based on the name of the inputs within
		 * the form
		 * @param {Boolean} [convert=false] True if strings that look like numbers 
		 * and booleans should be converted and if empty string should not be added 
		 * to the result. Defaults to false.
		 * @return {Object} An object of name-value pairs.
		 */
		formParams: function( params ) {

			var convert;

			// Quick way to determine if something is a boolean
			if ( !! params === params ) {
				convert = params;
				params = null;
			}

			if ( params ) {
				return this.setParams( params );
			} else {
				return this.getParams( convert );
			}
		},
		setParams: function( params ) {

			// Find all the inputs
			this.find("[name]").each(function() {
				
				var value = params[ $(this).attr("name") ],
					$this;
				
				// Don't do all this work if there's no value
				if ( value !== undefined ) {
					$this = $(this);
					
					// Nested these if statements for performance
					if ( $this.is(":radio") ) {
						if ( $this.val() == value ) {
							$this.attr("checked", true);
						}
					} else if ( $this.is(":checkbox") ) {
						// Convert single value to an array to reduce
						// complexity
						value = $.isArray( value ) ? value : [value];
						if ( $.inArray( $this.val(), value ) > -1) {
							$this.attr("checked", true);
						}
					} else {
						$this.val( value );
					}
				}
			});
		},
		getParams: function( convert ) {
			var data = {},
				// This is used to keep track of the checkbox names that we've
				// already seen, so we know that we should return an array if
				// we see it multiple times. Fixes last checkbox checked bug.
				seen = {},
				current;


			this.find("[name]").each(function() {
				var $this    = $(this),
					type     = $this.attr("type"),
					name     = $this.attr("name"),
					value    = $this.val(),
					parts;

				// Don't accumulate submit buttons and nameless elements
				if ( type == "submit" || ! name ) {
					return;
				}

				// Figure out name parts
				parts = name.match( keyBreaker );
				if ( ! parts.length ) {
					parts = [name];
				}

				// Convert the value
				if ( convert ) {
					value = convertValue( value );
				}

				// Assign data recursively
				nestData( $this, type, data, parts, value, seen );

			});

			return data;
		}
	});

})(jQuery);
(function( $ ) {

    // Helper methods used for matching routes.
	var 
		// RegEx used to match route variables of the type ':name'.
        // Any word character or a period is matched.
        matcher = /\:([\w\.]+)/g,
        // Regular expression for identifying &amp;key=value lists.
        paramsMatcher = /^(?:&[^=]+=[^&]*)+/,
        // Converts a JS Object into a list of parameters that can be 
        // inserted into an html element tag.
		makeProps = function( props ) {
			var html = [],
				name, val;
			each(props, function(name, val){
				if ( name === 'className' ) {
					name = 'class'
				}
				val && html.push(escapeHTML(name), "=\"", escapeHTML(val), "\" ");
			})
			return html.join("")
		},
        // Escapes ' and " for safe insertion into html tag parameters.
		escapeHTML = function( content ) {
			return content.replace(/"/g, '&#34;').replace(/'/g, "&#39;");
		},
		// Checks if a route matches the data provided. If any route variable
        // is not present in the data the route does not match. If all route
        // variables are present in the data the number of matches is returned 
        // to allow discerning between general and more specific routes. 
		matchesData = function(route, data) {
			var count = 0;
			for ( var i = 0; i < route.names.length; i++ ) {
				if (!data.hasOwnProperty(route.names[i]) ) {
					return -1;
				}
				count++;
			}
			return count;
		},
        // 
		onready = true,
		location = window.location,
		encode = encodeURIComponent,
		decode = decodeURIComponent,
		each = $.each,
		extend = $.extend;

	/**
	 * @class jQuery.route
	 * @inherits jQuery.Observe
	 * @plugin jquery/dom/route
	 * @parent dom
	 * @tag 3.2
	 * 
	 * jQuery.route helps manage browser history (and
	 * client state) by
	 * synchronizing the window.location.hash with
	 * an [jQuery.Observe].
	 * 
	 * ## Background Information
	 * 
	 * To support the browser's back button and bookmarking
	 * in an Ajax application, most applications use
	 * the <code>window.location.hash</code>.  By
	 * changing the hash (via a link or JavaScript), 
	 * one is able to add to the browser's history 
	 * without changing the page.  The [jQuery.event.special.hashchange event] allows
	 * you to listen to when the hash is changed.
	 * 
	 * Combined, this provides the basics needed to
	 * create history enabled Ajax websites.  However,
	 * jQuery.Route addresses several other needs such as:
	 * 
	 *   - Pretty Routes
	 *   - Keeping routes independent of application code
	 *   - Listening to specific parts of the history changing
	 *   - Setup / Teardown of widgets.
	 * 
	 * ## How it works
	 * 
	 * <code>$.route</code> is a [jQuery.Observe $.Observe] that represents the
	 * <code>window.location.hash</code> as an 
	 * object.  For example, if the hash looks like:
	 * 
	 *     #!type=videos&id=5
	 *     
	 * the data in <code>$.route</code> would look like:
	 * 
	 *     { type: 'videos', id: 5 }
	 * 
	 * 
	 * $.route keeps the state of the hash in-sync with the data in
	 * $.route.
	 * 
	 * ## $.Observe
	 * 
	 * $.route is a [jQuery.Observe $.Observe]. Understanding
	 * $.Observe is essential for using $.route correctly.
	 * 
	 * You can
	 * listen to changes in an Observe with bind and
	 * delegate and change $.route's properties with 
	 * attr and attrs.
	 * 
	 * ### Listening to changes in an Observable
	 * 
	 * Listen to changes in history 
	 * by [jQuery.Observe.prototype.bind bind]ing to
	 * changes in <code>$.route</code> like:
	 * 
	 *     $.route.bind('change', function(ev, attr, how, newVal, oldVal) {
	 *     
	 *     })
	 * 
     *  - attr - the name of the changed attribute
     *  - how - the type of Observe change event (add, set or remove)
     *  - newVal/oldVal - the new and old values of the attribute
     * 
	 * You can also listen to specific changes 
	 * with [jQuery.Observe.prototype.delegate delegate]:
	 * 
	 *     $.route.delegate('id','change', function(){ ... })
	 * 
	 * Observe lets you listen to the following events:
	 * 
	 *  - change - any change to the object
	 *  - add - a property is added
	 *  - set - a property value is added or changed
	 *  - remove - a property is removed
	 * 
	 * Listening for <code>add</code> is useful for widget setup
	 * behavior, <code>remove</code> is useful for teardown.
	 * 
	 * ### Updating an observable
	 * 
	 * Create changes in the route data like:
	 * 
	 *     $.route.attr('type','images');
	 * 
	 * Or change multiple properties at once with
	 * [jQuery.Observe.prototype.attrs attrs]:
	 * 
	 *     $.route.attr({type: 'pages', id: 5}, true)
	 * 
	 * When you make changes to $.route, they will automatically
	 * change the <code>hash</code>.
	 * 
	 * ## Creating a Route
	 * 
	 * Use <code>$.route(url, defaults)</code> to create a 
	 * route. A route is a mapping from a url to 
	 * an object (that is the $.route's state).
	 * 
	 * If no routes are added, or no route is matched, 
	 * $.route's data is updated with the [jQuery.String.deparam deparamed]
	 * hash.
	 * 
	 *     location.hash = "#!type=videos";
	 *     // $.route -> {type : "videos"}
	 *     
	 * Once routes are added and the hash changes,
	 * $.route looks for matching routes and uses them
	 * to update $.route's data.
	 * 
	 *     $.route( "content/:type" );
	 *     location.hash = "#!content/images";
	 *     // $.route -> {type : "images"}
	 *     
	 * Default values can also be added:
	 * 
	 *     $.route("content/:type",{type: "videos" });
	 *     location.hash = "#!content/"
	 *     // $.route -> {type : "videos"}
	 *     
	 * ## Delay setting $.route
	 * 
	 * By default, <code>$.route</code> sets its initial data
	 * on document ready.  Sometimes, you want to wait to set 
	 * this data.  To wait, call:
	 * 
	 *     $.route.ready(false);
	 * 
	 * and when ready, call:
	 * 
	 *     $.route.ready(true);
	 * 
	 * ## Changing the route.
	 * 
	 * Typically, you never want to set <code>location.hash</code>
	 * directly.  Instead, you can change properties on <code>$.route</code>
	 * like:
	 * 
	 *     $.route.attr('type', 'videos')
	 *     
	 * This will automatically look up the appropriate 
	 * route and update the hash.
	 * 
	 * Often, you want to create links.  <code>$.route</code> provides
	 * the [jQuery.route.link] and [jQuery.route.url] helpers to make this 
	 * easy:
	 * 
	 *     $.route.link("Videos", {type: 'videos'})
	 * 
	 * @param {String} url the fragment identifier to match.  
	 * @param {Object} [defaults] an object of default values
	 * @return {jQuery.route}
	 */
	$.route = function( url, defaults ) {
        // Extract the variable names and replace with regEx that will match an atual URL with values.
		var names = [],
			test = url.replace(matcher, function( whole, name ) {
				names.push(name)
				// TODO: I think this should have a +
				return "([^\\/\\&]*)"  // The '\\' is for string-escaping giving single '\' for regEx escaping
			});

		// Add route in a form that can be easily figured out
		$.route.routes[url] = {
            // A regular expression that will match the route when variable values 
            // are present; i.e. for :page/:type the regEx is /([\w\.]*)/([\w\.]*)/ which
            // will match for any value of :page and :type (word chars or period).
			test: new RegExp("^" + test+"($|&)"),
            // The original URL, same as the index for this entry in routes.
			route: url,
            // An array of all the variable names in this route
			names: names,
            // Default values provided for the variables.
			defaults: defaults || {},
            // The number of parts in the URL separated by '/'.
			length: url.split('/').length
		}
		return $.route;
	};

	extend($.route, {
		/**
		 * Parameterizes the raw JS object representation provided in data.
		 * If a route matching the provided data is found that URL is built
         * from the data. Any remaining data is added at the end of the
         * URL as &amp; separated key/value parameters.
		 * 
		 * @param {Object} data
         * @return {String} The route URL and &amp; separated parameters.
		 */
		param: function( data ) {
			// Check if the provided data keys match the names in any routes;
			// get the one with the most matches.
			var route,
				// need it to be at least 1 match
				matches = 0,
				matchCount,
				routeName = data.route;
			
			delete data.route;
			// if we have a route name in our $.route data, use it
			if(routeName && (route = $.route.routes[routeName])){
				
			} else {
				// otherwise find route
				each($.route.routes, function(name, temp){
					matchCount = matchesData(temp, data);
					if ( matchCount > matches ) {
						route = temp;
						matches = matchCount
					}
				});
			}
			// if this is match
			
			if ( route ) {
				var cpy = extend({}, data),
                    // Create the url by replacing the var names with the provided data.
                    // If the default value is found an empty string is inserted.
				    res = route.route.replace(matcher, function( whole, name ) {
                        delete cpy[name];
                        return data[name] === route.defaults[name] ? "" : encode( data[name] );
                    }),
                    after;
					// remove matching default values
					each(route.defaults, function(name,val){
						if(cpy[name] === val) {
							delete cpy[name]
						}
					})
					
					// The remaining elements of data are added as 
					// $amp; separated parameters to the url.
				    after = $.param(cpy);
				return res + (after ? "&" + after : "")
			}
            // If no route was found there is no hash URL, only paramters.
			return $.isEmptyObject(data) ? "" : "&" + $.param(data);
		},
		/**
		 * Populate the JS data object from a given URL.
		 * 
		 * @param {Object} url
		 */
		deparam: function( url ) {
			// See if the url matches any routes by testing it against the route.test regEx.
            // By comparing the URL length the most specialized route that matches is used.
			var route = {
				length: -1
			};
			each($.route.routes, function(name, temp){
				if ( temp.test.test(url) && temp.length > route.length ) {
					route = temp;
				}
			});
            // If a route was matched
			if ( route.length > -1 ) { 
				var // Since RegEx backreferences are used in route.test (round brackets)
                    // the parts will contain the full matched string and each variable (backreferenced) value.
                    parts = url.match(route.test),
                    // start will contain the full matched string; parts contain the variable values.
					start = parts.shift(),
                    // The remainder will be the &amp;key=value list at the end of the URL.
					remainder = url.substr(start.length - (parts[parts.length-1] === "&" ? 1 : 0) ),
                    // If there is a remainder and it contains a &amp;key=value list deparam it.
                    obj = (remainder && paramsMatcher.test(remainder)) ? $.String.deparam( remainder.slice(1) ) : {};

                // Add the default values for this route
				obj = extend(true, {}, route.defaults, obj);
                // Overwrite each of the default values in obj with those in parts if that part is not empty.
				each(parts,function(i, part){
					if ( part && part !== '&') {
						obj[route.names[i]] = decode( part );
					}
				});
				obj.route = route.route;
				return obj;
			}
            // If no route was matched it is parsed as a &amp;key=value list.
			if ( url.charAt(0) !== '&' ) {
				url = '&' + url;
			}
			return paramsMatcher.test(url) ? $.String.deparam( url.slice(1) ) : {};
		},
		/**
		 * @hide
		 * A $.Observe that represents the state of the history.
		 */
		data: new $.Observe({}),
        /**
         * @attribute
         * @type Object
		 * @hide
		 * 
         * A list of routes recognized by the router indixed by the url used to add it.
         * Each route is an object with these members:
         * 
 		 *  - test - A regular expression that will match the route when variable values 
         *    are present; i.e. for :page/:type the regEx is /([\w\.]*)/([\w\.]*)/ which
         *    will match for any value of :page and :type (word chars or period).
		 * 
         *  - route - The original URL, same as the index for this entry in routes.
         * 
		 *  - names - An array of all the variable names in this route
         * 
		 *  - defaults - Default values provided for the variables or an empty object.
         * 
		 *  - length - The number of parts in the URL separated by '/'.
         */
		routes: {},
		/**
		 * Indicates that all routes have been added and sets $.route.data
		 * based upon the routes and the current hash.
		 * 
		 * By default, ready is fired on jQuery's ready event.  Sometimes
		 * you might want it to happen sooner or earlier.  To do this call
		 * 
		 *     $.route.ready(false); //prevents firing by the ready event
		 *     $.route.ready(true); // fire the first route change
		 * 
		 * @param {Boolean} [start]
		 * @return $.route
		 */
		ready: function(val) {
			if( val === false ) {
				onready = false;
			}
			if( val === true || onready === true ) {
				if (typeof(setState) !== 'undefined') {
					setState();
				}
			}
			return $.route;
		},
		/**
		 * Returns a url from the options
		 * @param {Object} options
		 * @param {Boolean} merge true if the options should be merged with the current options
		 * @return {String} 
		 */
		url: function( options, merge ) {
			if (merge) {
				return "#!" + $.route.param(extend({}, curParams, options))
			} else {
				return "#!" + $.route.param(options)
			}
		},
		/**
		 * Returns a link
		 * @param {Object} name The text of the link.
		 * @param {Object} options The route options (variables)
		 * @param {Object} props Properties of the &lt;a&gt; other than href.
         * @param {Boolean} merge true if the options should be merged with the current options
		 */
		link: function( name, options, props, merge ) {
			return "<a " + makeProps(
			extend({
				href: $.route.url(options, merge)
			}, props)) + ">" + name + "</a>";
		},
		/**
		 * Returns true if the options represent the current page.
		 * @param {Object} options
         * @return {Boolean}
		 */
		current: function( options ) {
			return location.hash == "#!" + $.route.param(options)
		}
	});
	// onready
	$(function() {
		$.route.ready();
	});
	
    // The functions in the following list applied to $.route (e.g. $.route.attr('...')) will
    // instead act on the $.route.data Observe.
	each(['bind','unbind','delegate','undelegate','attr','attrs','serialize','removeAttr'], function(i, name){
		$.route[name] = function(){
			return $.route.data[name].apply($.route.data, arguments)
		}
	})

	var // A throttled function called multiple times will only fire once the
        // timer runs down. Each call resets the timer.
        throttle = function( func ) {
            var timer;
            return function() {
				var args = arguments,
					self = this;
                clearTimeout(timer);
                timer = setTimeout(function(){
					func.apply(self, args)
				}, 1);
            }
        },
        // Intermediate storage for $.route.data.
        curParams,
        // Deparameterizes the portion of the hash of interest and assign the
        // values to the $.route.data removing existing values no longer in the hash.
        setState = function() {
			var hash = location.hash.substr(1, 1) === '!' ? 
				location.hash.slice(2) : 
				location.hash.slice(1); // everything after #!
			curParams = $.route.deparam( hash );
			$.route.attrs(curParams, true);
		};

	// If the hash changes, update the $.route.data
	$(window).bind('hashchange', setState);

	// If the $.route.data changes, update the hash.
    // Using .serialize() retrieves the raw data contained in the observable.
    // This function is throttled so it only updates once even if multiple values changed.
	$.route.bind("change", throttle(function() {
		var hash = $.route.param($.route.serialize());
		// remove hash or hash bang
		var currentHash = location.hash.replace(/^#!?/, '');

		if (hash !== currentHash) {
			location.hash = "#!" + hash;
		}
	}));
})(jQuery);
(function() {
    // break
    /**
     * @function jQuery.cookie
     * @parent dom
     * @plugin jquery/dom/cookie
     * @author Klaus Hartl/klaus.hartl@stilbuero.de
     *
     *  JavaScriptMVC's packaged cookie plugin is written by
     *  Klaus Hartl (stilbuero.de)<br />
	 *  Dual licensed under the MIT and GPL licenses:<br />
	 *  http://www.opensource.org/licenses/mit-license.php<br />
	 *  http://www.gnu.org/licenses/gpl.html
	 *  </p>
	 *  <p>
	 *  Create a cookie with the given name and value and other optional parameters.
	 *  / Get the value of a cookie with the given name.
	 *  </p>
	 *  <h3>Quick Examples</h3>
	 * 
	 *  Set the value of a cookie.
	 *  
	 *     $.cookie('the_cookie', 'the_value');
	 * 
	 *  Create a cookie with all available options.
	 *  @codestart
	 *  $.cookie('the_cookie', 'the_value',
	 *  { expires: 7, path: '/', domain: 'jquery.com', secure: true });
	 *  @codeend
	 * 
	 *  Create a session cookie.
	 *  @codestart
	 *  $.cookie('the_cookie', 'the_value');
	 *  @codeend
	 * 
	 *  Delete a cookie by passing null as value. Keep in mind that you have to use the same path and domain
	 *  used when the cookie was set.
	 *  @codestart
	 *  $.cookie('the_cookie', null);
	 *  @codeend
	 * 
	 *  Get the value of a cookie.
	 *  @codestart
	 *  $.cookie('the_cookie');
	 *  @codeend
	 * 
     *
     * @param {String} [name] The name of the cookie.
     * @param {String} [value] The value of the cookie.
     * @param {Object} [options] An object literal containing key/value pairs to provide optional cookie attributes.<br />
     * @param {Number|Date} [expires] Either an integer specifying the expiration date from now on in days or a Date object.
     *                             If a negative value is specified (e.g. a date in the past), the cookie will be deleted.
     *                             If set to null or omitted, the cookie will be a session cookie and will not be retained
     *                             when the the browser exits.<br />
     * @param {String} [path] The value of the path atribute of the cookie (default: path of page that created the cookie).<br />
     * @param {String} [domain] The value of the domain attribute of the cookie (default: domain of page that created the cookie).<br />
     * @param {Boolean} secure If true, the secure attribute of the cookie will be set and the cookie transmission will
     *                        require a secure protocol (like HTTPS).<br />
     * @return {String} the value of the cookie or {undefined} when setting the cookie.
     */
    jQuery.cookie = function(name, value, options) {
        if (typeof value != 'undefined') { // name and value given, set cookie
            options = options ||
            {};
            if (value === null) {
                value = '';
                options.expires = -1;
            }
            if (typeof value == 'object' && jQuery.toJSON) {
                value = jQuery.toJSON(value);
            }
            var expires = '';
            if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
                var date;
                if (typeof options.expires == 'number') {
                    date = new Date();
                    date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
                }
                else {
                    date = options.expires;
                }
                expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
            }
            // CAUTION: Needed to parenthesize options.path and options.domain
            // in the following expressions, otherwise they evaluate to undefined
            // in the packed version for some reason...
            var path = options.path ? '; path=' + (options.path) : '';
            var domain = options.domain ? '; domain=' + (options.domain) : '';
            var secure = options.secure ? '; secure' : '';
            document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
        }
        else { // only name given, get cookie
            var cookieValue = null;
            if (document.cookie && document.cookie != '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = jQuery.trim(cookies[i]);
                    // Does this cookie string begin with the name we want?
                    if (cookie.substring(0, name.length + 1) == (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            if (jQuery.evalJSON && cookieValue && cookieValue.match(/^\s*\{/)) {
                try {
                    cookieValue = jQuery.evalJSON(cookieValue);
                }
                catch (e) {
                }
            }
            return cookieValue;
        }
    };

})(jQuery);
(function($){
	
var isArray = $.isArray,
	// essentially returns an object that has all the must have comparisons ...
	// must haves, do not return true when provided undefined
	cleanSet = function(obj, compares){
		var copy = $.extend({}, obj);
		for(var prop in copy) {
			var compare = compares[prop] === undefined ? compares["*"] : compares[prop];
			if( same(copy[prop], undefined, compare ) ) {
				delete copy[prop]
			}
		}
		return copy;
	},
	propCount = function(obj){
		var count = 0;
		for(var prop in obj) count++;
		return count;
	};

/**
 * @class jQuery.Object
 * @parent jquerymx.lang
 * 
 * Object contains several helper methods that 
 * help compare objects.
 * 
 * ## same
 * 
 * Returns true if two objects are similar.
 * 
 *     $.Object.same({foo: "bar"} , {bar: "foo"}) //-> false
 *   
 * ## subset
 * 
 * Returns true if an object is a set of another set.
 * 
 *     $.Object.subset({}, {foo: "bar"} ) //-> true
 * 
 * ## subsets
 * 
 * Returns the subsets of an object
 * 
 *     $.Object.subsets({userId: 20},
 *                      [
 *                       {userId: 20, limit: 30},
 *                       {userId: 5},
 *                       {}
 *                      ]) 
 *              //->    [{userId: 20, limit: 30}]
 */
$.Object = {};

/**
 * @function same
 * Returns if two objects are the same.  It takes an optional compares object that
 * can be used to make comparisons.
 * 
 * This function does not work with objects that create circular references.
 * 
 * ## Examples
 * 
 *     $.Object.same({name: "Justin"},
 *                   {name: "JUSTIN"}) //-> false
 *     
 *     // ignore the name property
 *     $.Object.same({name: "Brian"},
 *                   {name: "JUSTIN"},
 *                   {name: null})      //-> true
 *     
 *     // ignore case
 *     $.Object.same({name: "Justin"},
 *                   {name: "JUSTIN"},
 *                   {name: "i"})      //-> true
 *     
 *     // deep rule
 *     $.Object.same({ person : { name: "Justin" } },
 *                   { person : { name: "JUSTIN" } },
 *                   { person : { name: "i"      } }) //-> true
 *                   
 *     // supplied compare function
 *     $.Object.same({age: "Thirty"},
 *                   {age: 30},
 *                   {age: function( a, b ){
 *                           if( a == "Thirty" ) { 
 *                             a = 30
 *                           }
 *                           if( b == "Thirty" ) {
 *                             b = 30
 *                           }
 *                           return a === b;
 *                         }})      //-> true
 * 
 * @param {Object} a an object to compare
 * @param {Object} b an object to compare
 * @param {Object} [compares] an object that indicates how to 
 * compare specific properties. 
 * Typically this is a name / value pair
 * 
 *     $.Object.same({name: "Justin"},{name: "JUSTIN"},{name: "i"})
 *     
 * There are two compare functions that you can specify with a string:
 * 
 *   - 'i' - ignores case
 *   - null - ignores this property
 * 
 * @param {Object} [deep] used internally
 */
var same = $.Object.same = function(a, b, compares, aParent, bParent, deep){
	var aType = typeof a,
		aArray = isArray(a),
		comparesType = typeof compares,
		compare;
	
	if(comparesType == 'string' || compares === null ){
		compares = compareMethods[compares];
		comparesType = 'function'
	}
	if(comparesType == 'function'){
		return compares(a, b, aParent, bParent)
	} 
	compares = compares || {};
	
	if(deep === -1){
		return aType === 'object' || a === b;
	}
	if(aType !== typeof  b || aArray !== isArray(b)){
		return false;
	}
	if(a === b){
		return true;
	}
	if(aArray){
		if(a.length !== b.length){
			return false;
		}
		for(var i =0; i < a.length; i ++){
			compare = compares[i] === undefined ? compares["*"] : compares[i]
			if(!same(a[i],b[i], a, b, compare )){
				return false;
			}
		};
		return true;
	} else if(aType === "object" || aType === 'function'){
		var bCopy = $.extend({}, b);
		for(var prop in a){
			compare = compares[prop] === undefined ? compares["*"] : compares[prop];
			if(! same( a[prop], b[prop], compare , a, b, deep === false ? -1 : undefined )){
				return false;
			}
			delete bCopy[prop];
		}
		// go through bCopy props ... if there is no compare .. return false
		for(prop in bCopy){
			if( compares[prop] === undefined || 
			    ! same( undefined, b[prop], compares[prop] , a, b, deep === false ? -1 : undefined )){
				return false;
			}
		}
		return true;
	} 
	return false;
};

/**
 * @function subsets
 * Returns the sets in 'sets' that are a subset of checkSet
 * @param {Object} checkSet
 * @param {Object} sets
 */
$.Object.subsets = function(checkSet, sets, compares){
	var len = sets.length,
		subsets = [],
		checkPropCount = propCount(checkSet),
		setLength;
		
	for(var i =0; i < len; i++){
		//check this subset
		var set = sets[i];
		if( $.Object.subset(checkSet, set, compares) ){
			subsets.push(set)
		}
	}
	return subsets;
};
/**
 * @function subset
 * Compares if checkSet is a subset of set
 * @param {Object} checkSet
 * @param {Object} set
 * @param {Object} [compares]
 * @param {Object} [checkPropCount]
 */
$.Object.subset = function(subset, set, compares){
	// go through set {type: 'folder'} and make sure every property
	// is in subset {type: 'folder', parentId :5}
	// then make sure that set has fewer properties
	// make sure we are only checking 'important' properties
	// in subset (ones that have to have a value)
	
	var setPropCount =0,
		compares = compares || {};
			
	for(var prop in set){

		if(! same(subset[prop], set[prop], compares[prop], subset, set )  ){
			return false;
		} 
	}
	return true;
}


var compareMethods = {
	"null" : function(){
		return true;
	},
	i : function(a, b){
		return (""+a).toLowerCase() == (""+b).toLowerCase()
	}
}
	
	
})(jQuery);
(function($){
var isArray = $.isArray,
	propCount = function(obj){
		var count = 0;
		for(var prop in obj) count++;
		return count;
	},
	same = function(a, b, deep){
		var aType = typeof a,
			aArray = isArray(a);
		if(deep === -1){
			return aType === 'object' || a === b;
		}
		if(aType !== typeof  b || aArray !== isArray(b)){
			return false;
		}
		if(a === b){
			return true;
		}
		if(aArray){
			if(a.length !== b.length){
				return false;
			}
			for(var i =0; i < a.length; i ++){
				if(!same(a[i],b[i])){
					return false;
				}
			};
			return true;
		} else if(aType === "object" || aType === 'function'){
			var count = 0;
			for(var prop in a){
				if(!same(a[prop],b[prop], deep === false ? -1 : undefined )){
					return false;
				}
				count++;
			}
			return count === propCount(b)
		} 
		return false;
	},
	flatProps = function(a){
		var obj = {};
		for(var prop in a){
			if(typeof a[prop] !== 'object' || a[prop] === null){
				obj[prop] = a[prop]
			}
		}
		return obj;
	};
/**
@page jquerymx.model.backup Backup / Restore
@parent jQuery.Model
@plugin jquery/model/backup
@test jquery/model/backup/qunit.html
@download  http://jmvcsite.heroku.com/pluginify?plugins[]=jquery/model/backup/backup.js

You can backup and restore instance data with the jquery/model/backup
plugin.

To backup a model instance call [jQuery.Model.prototype.backup backup] like:

@codestart
var recipe = new Recipe({name: "cheese"});
recipe.backup()
@codeend

You can check if the instance is dirty with [jQuery.Model.prototype.isDirty isDirty]:

@codestart
recipe.name = 'blah'
recipe.isDirty() //-> true
@codeend

Finally, you can restore the original attributes with 
[jQuery.Model.prototype.backup backup].

@codestart
recipe.restore();
recipe.name //-> "cheese"
@codeend

See this in action:

@demo jquery/model/backup/backup.html
 */

	$.extend($.Model.prototype,{
		/**
		 * @function jQuery.Model.prototype.backup
		 * @parent jquerymx.model.backup
		 * Backs up an instance of a model, so it can be restored later.
		 * The plugin also adds an [jQuery.Model.prototype.isDirty isDirty]
		 * method for checking if it is dirty.
		 */
		backup: function() {
			this._backupStore = this.serialize();
			return this;
		},

	   /**
	    * @function jQuery.Model.prototype.isDirty
	    * @plugin jquery/model/backup
	    * @parent jquerymx.model.backup
	    * Returns if the instance needs to be saved.  This will go
	    * through associations too.
	    * @return {Boolean} true if there are changes, false if otherwise
	    */
	   isDirty: function(checkAssociations) {
			// check if it serializes the same
			if(!this._backupStore){
				return false;
			} else {
				return !same(this.serialize(), this._backupStore, !!checkAssociations);
			}
		},
		/**
		 * @function jQuery.Model.prototype.restore
		 * @parent jquery.model.backup
		 * restores this instance to its backup data.
		 * @return {model} the instance (for chaining)
		 */
		restore: function(restoreAssociations) {
			var props = restoreAssociations ? this._backupStore : flatProps(this._backupStore)
			this.attrs(props);   
			
			return this;
		}
	   
   })
})(jQuery);
(function( $ ) {

	var getArgs = function( args ) {
		if ( args[0] && ($.isArray(args[0])) ) {
			return args[0]
		} else if ( args[0] instanceof $.Model.List ) {
			return $.makeArray(args[0])
		} else {
			return $.makeArray(args)
		}
	},
		//used for namespacing
		id = 0,
		getIds = function( item ) {
			return item[item.constructor.id]
		},
		expando = jQuery.expando,
		each = $.each,
		ajax = $.Model._ajax,

		/**
		 * @class jQuery.Model.List
		 * @parent jQuery.Model
		 * @download  http://jmvcsite.heroku.com/pluginify?plugins[]=jquery/model/list/list.js
		 * @test jquery/model/list/qunit.html
		 * @plugin jquery/model/list
		 * 
		 * Model.Lists manage a lists (or arrays) of 
		 * model instances.  Similar to [jQuery.Model $.Model], 
		 * they are used to:
		 * 
		 *  - create events when a list changes 
		 *  - make Ajax requests on multiple instances
		 *  - add helper function for multiple instances (ACLs)
		 * 
		 * The [todo] app demonstrates using a $.Controller to 
		 * implement an interface for a $.Model.List.
		 * 
		 * ## Creating A List Class
		 * 
		 * Create a `$.Model.List [jQuery.Class class] for a $.Model
		 * like:
		 * 
		 *     $.Model('Todo')
		 *     $.Model.List('Todo.List',{
		 *       // static properties
		 *     },{
		 *       // prototype properties
		 *     })
		 * 
		 * This creates a `Todo.List` class for the `Todo` 
		 * class. This creates some nifty magic that we will see soon.
		 * 
		 * `static` properties are typically used to describe how 
		 * a list makes requests.  `prototype` properties are 
		 * helper functions that operate on an instance of 
		 * a list. 
		 * 
		 * ## Make a Helper Function
		 * 
		 * Often, a user wants to select multiple items on a
		 * page and perform some action on them (for example, 
		 * deleting them). The app
		 * needs to indicate if this is possible (for example,
		 * by enabling a "DELETE" button).
		 * 
		 * 
		 * If we get todo data back like:
		 * 
		 *     // GET /todos.json ->
		 *     [{
		 *       "id" : 1,
		 *       "name" : "dishes",
		 *       "acl" : "rwd"
		 *     },{
		 *       "id" : 2,
		 *       "name" : "laundry",
		 *       "acl" : "r"
		 *     }, ... ]
		 * 
		 * We can add a helper function to let us know if we can 
		 * delete all the instances:
		 * 
		 *     $.Model.List('Todo.List',{
		 *     
		 *     },{
		 *        canDelete : function(){
		 *          return this.grep(function(todo){
		 *            return todo.acl.indexOf("d") != 0
		 *          }).length == this.length
		 *        }
		 *     })
		 * 
		 * `canDelete` gets a list of all todos that have
		 * __d__ in their acl.  If all todos have __d__,
		 * then `canDelete` returns true.
		 * 
		 * ## Get a List Instance
		 * 
		 * You can create a model list instance by using
		 * `new Todo.List( instances )` like:
		 * 
		 *     var todos = new Todo.List([
		 *       new Todo({id: 1, name: ...}),
		 *       new Todo({id: 2, name: ...}),
		 *     ]);
		 * 
		 * And call `canDelete` on it like:
		 * 
		 *     todos.canDelete() //-> boolean
		 * 
		 * BUT! $.Model, [jQuery.fn.models $.fn.models], and $.Model.List are designed 
		 * to work with each other.
		 * 
		 * When you use `Todo.findAll`, it will callback with an instance
		 * of `Todo.List`:
		 * 
		 *     Todo.findAll({}, function(todos){
		 *        todos.canDelete() //-> boolean
		 *     })
		 * 
		 * If you are adding the model instance to elements and
		 * retrieving them back with `$().models()`, it will 
		 * return a instance of `Todo.List`.  The following
		 * returns if the checked `.todo` elements are
		 * deletable:
		 * 
		 *     // get the checked inputs
		 *     $('.todo input:checked')
		 *        // get the todo elements
		 *        .closest('.todo')
		 *        // get the model list
		 *        .models()
		 *        // check canDelete
		 *        .canDelete()
		 * 
		 * ## Make Ajax Requests with Lists
		 * 
		 * After checking if we can delete the todos,
		 * we should delete them from the server. Like 
		 * `$.Model`, we can add a 
		 * static [jQuery.Model.List.static.destroy destroy] url:
		 * 
		 *     $.Model.List('Todo.List',{
		 *        destroy : 'POST /todos/delete'
		 *     },{
		 *        canDelete : function(){
		 *          return this.grep(function(todo){
		 *            return todo.acl.indexOf("d") != 0
		 *          }).length == this.length
		 *        }
		 *     })
		 * 
		 * 
		 * and call [jQuery.Model.List.prototype.destroy destroy] on
		 * our list.  
		 * 
		 *     // get the checked inputs
		 *     var todos = $('.todo input:checked')
		 *        // get the todo elements
		 *        .closest('.todo')
		 *        // get the model list
		 *        .models()
		 *     
		 *     if( todos.canDelete() ) {
		 *        todos.destroy()
		 *     }
		 * 
		 * By default, destroy will create an AJAX request to 
		 * delete these instances on the server, when
		 * the AJAX request is successful, the instances are removed
		 * from the list and events are dispatched.
		 * 
		 * ## Listening to events on Lists
		 * 
		 * Use [jQuery.Model.List.prototype.bind bind]`(eventName, handler(event, data))` 
		 * to listen to __add__, __remove__, and __updated__ events on a 
		 * list.  
		 * 
		 * When a model instance is destroyed, it is removed from
		 * all lists.  In the todo example, we can bind to remove to know
		 * when a todo has been destroyed.  The following 
		 * removes all the todo elements from the page when they are removed
		 * from the list:
		 * 
		 *     todos.bind('remove', function(ev, removedTodos){
		 *       removedTodos.elements().remove();
		 *     })
		 * 
		 * ## Demo
		 * 
		 * The following demo illustrates the previous features with
		 * a contacts list.  Check
		 * multiple Contacts and click "DESTROY ALL"
		 * 
		 * @demo jquery/model/list/list.html
		 * 
		 * ## Other List Features
		 * 
		 *  - Store and retrieve multiple instances
		 *  - Fast HTML inserts
		 *
		 * ### Store and retrieve multiple instances
		 * 
		 * Once you have a collection of models, you often want to retrieve and update 
		 * that list with new instances.  Storing and retrieving is a powerful feature
		 * you can leverage to manage and maintain a list of models.
		 *
		 * To store a new model instance in a list...
		 *
		 *     listInstance.push(new Animal({ type: dog, id: 123 }))
		 * 
		 * To later retrieve that instance in your list...
		 * 
		 *     var animal = listInstance.get(123);
		 *
		 * 
		 * ### Faster Inserts
		 * 
		 * The 'easy' way to add a model to an element is simply inserting
		 * the model into the view like:
		 * 
		 * @codestart xml
		 * &lt;div &lt;%= task %>> A task &lt;/div>
		 * @codeend
		 * 
		 * And then you can use [jQuery.fn.models $('.task').models()].
		 * 
		 * This pattern is fast enough for 90% of all widgets.  But it
		 * does require an extra query.  Lists help you avoid this.
		 * 
		 * The [jQuery.Model.List.prototype.get get] method takes elements and
		 * uses their className to return matched instances in the list.
		 * 
		 * To use get, your elements need to have the instance's 
		 * identity in their className.  So to setup a div to reprsent
		 * a task, you would have the following in a view:
		 * 
		 * @codestart xml
		 * &lt;div class='task &lt;%= task.identity() %>'> A task &lt;/div>
		 * @codeend
		 * 
		 * Then, with your model list, you could use get to get a list of
		 * tasks:
		 * 
		 * @codestart
		 * taskList.get($('.task'))
		 * @codeend
		 * 
		 * The following demonstrates how to use this technique:
		 * 
		 * @demo jquery/model/list/list-insert.html
		 *
		 */
		ajaxMethods =
		/**
		 * @static
		 */
		{
			update: function( str ) {
				/**
				 * @function update
				 * Update is used to update a set of model instances on the server.  By implementing 
				 * update along with the rest of the [jquery.model.services service api], your models provide an abstract
				 * API for services.  
				 * 
				 * The easist way to implement update is to just give it the url to put data to:
				 * 
				 *     $.Model.List("Recipe",{
				 *       update: "PUT /thing/update/"
				 *     },{})
				 *
				 * Or you can implement update manually like:
				 * 
				 *     $.Model.List("Thing",{
				 *       update : function(ids, attrs, success, error){
				 * 		   return $.ajax({
				 * 		   	  url: "/thing/update/",
				 * 		      success: success,
				 * 		      type: "PUT",
				 * 		      data: { ids: ids, attrs : attrs }
				 * 		      error: error
				 * 		   });
				 *       }
				 *     })
				 *     
				 * Then you update models by calling the [jQuery.Model.List.prototype.update prototype update method].
				 *
				 *     listInstance.update({ name: "Food" })
				 *
				 *
				 * By default, the request will PUT an array of ids to be updated and
				 * the changed attributes of the model instances in the body of the Ajax request.
				 *
				 *     { 
				 *         ids: [5,10,20],
				 *         attrs: { 
				 *             name: "Food" 
				 *         } 
				 *     }
				 * 
				 * Your server should send back an object with any new attributes the model 
				 * should have.  For example if your server udpates the "updatedAt" property, it
				 * should send back something like:
				 * 
				 *     // PUT /recipes/4,25,20 { name: "Food" } ->
				 *     {
				 *       updatedAt : "10-20-2011"
				 *     }
				 * 
				 * @param {Array} ids the ids of the model instance
				 * @param {Object} attrs Attributes on the model instance
				 * @param {Function} success the callback function.  It optionally accepts 
				 * an object of attribute / value pairs of property changes the client doesn't already 
				 * know about. For example, when you update a name property, the server might 
				 * update other properties as well (such as updatedAt). The server should send 
				 * these properties as the response to updates.  Passing them to success will 
				 * update the model instances with these properties.
				 * @param {Function} error a function to callback if something goes wrong.  
				 */
				return function( ids, attrs, success, error ) {
					return ajax(str, {
						ids: ids,
						attrs: attrs
					}, success, error, "-updateAll", "put")
				}
			},
			destroy: function( str ) {
				/**
				 * @function destroy
				 * Destroy is used to remove a set of model instances from the server. By implementing 
				 * destroy along with the rest of the [jquery.model.services service api], your models provide an abstract
				 * service API.
				 * 
				 * You can implement destroy with a string like:
				 * 
				 *     $.Model.List("Thing",{
				 *       destroy : "POST /thing/destroy/"
				 *     })
				 * 
				 * Or you can implement destroy manually like:
				 * 
				 *     $.Model.List("Thing",{
				 *       destroy : function(ids, success, error){
				 * 		   return $.ajax({
				 * 		   	  url: "/thing/destroy/",
				 * 		      data: ids,
				 * 		      success: success,
				 * 		      error: error,
				 * 		      type: "POST"
				 * 		   });
				 *       }
				 *     })
				 *
				 * Then you delete models by calling the [jQuery.Model.List.prototype.destroy prototype delete method].
				 *
				 *     listInstance.destroy();
				 *
				 * By default, the request will POST an array of ids to be deleted in the body of the Ajax request.
				 *
				 *     { 
				 *         ids: [5,10,20]
				 *     }
				 * 
				 * @param {Array} ids the ids of the instances you want destroyed
				 * @param {Function} success the callback function
				 * @param {Function} error a function to callback if something goes wrong.  
				 */
				return function( ids, success, error ) {
					return ajax(str, ids, success, error, "-destroyAll", "post")
				}
			}
		};

	$.Class("jQuery.Model.List", {
		setup: function() {
			for ( var name in ajaxMethods ) {
				if ( typeof this[name] !== 'function' ) {
					this[name] = ajaxMethods[name](this[name]);
				}
			}
		}
	},
	/**
	 * @Prototype
	 */
	{
		init: function( instances, noEvents ) {
			this.length = 0;
			// a cache for quick lookup by id
			this._data = {};
			//a namespace so we can remove all events bound by this list
			this._namespace = ".list" + (++id), this.push.apply(this, $.makeArray(instances || []));
		},
		/**
		 * The slice method selects a part of an array, and returns another instance of this model list's class.
		 * 
		 *     list.slice(start, end)
		 *
		 * @param {Number} start the start index to select
		 * @param {Number} end the last index to select
		 */
		slice: function() {
			return new this.Class(Array.prototype.slice.apply(this, arguments));
		},
		/**
		 * Returns a list of all instances who's property matches the given value.
		 *
		 *     list.match('candy', 'snickers')
		 * 
		 * @param {String} property the property to match
		 * @param {Object} value the value the property must equal
		 */
		match: function( property, value ) {
			return this.grep(function( inst ) {
				return inst[property] == value;
			});
		},
		/**
		 * Finds the instances of the list which satisfy a callback filter function. The original array is not affected.
		 * 
		 *     var matchedList = list.grep(function(instanceInList, indexInArray){
		 *        return instanceInList.date < new Date();
		 *     });
		 * 
		 * @param {Function} callback the function to call back.  This function has the same call pattern as what jQuery.grep provides.
		 * @param {Object} args
		 */
		grep: function( callback, args ) {
			return new this.Class($.grep(this, callback, args));
		},
		_makeData: function() {
			var data = this._data = {};
			this.each(function( i, inst ) {
				data[inst[inst.constructor.id]] = inst;
			})
		},
		/**
		 * Gets a list of elements by ID or element.
		 *
		 * To fetch by id:
		 *
		 *     var match = list.get(23);
		 *
		 * or to fetch by element:
		 * 
		 *     var match = list.get($('#content')[0])
		 * 
		 * @param {Object} args elements or ids to retrieve.
         * @return {$.Model.List} A sub-Model.List with the elements that were queried.
		 */
		get: function() {
			if (!this.length ) {
				return new this.Class([]);
			}
			if ( this._changed ) {
				this._makeData();
			}
			var list = [],
				constructor = this[0].constructor,
				underscored = constructor._fullName,
				idName = constructor.id,
				test = new RegExp(underscored + "_([^ ]+)"),
				matches, val, args = getArgs(arguments);

			for ( var i = 0; i < args.length; i++ ) {
				if ( args[i].nodeName && (matches = args[i].className.match(test)) ) {
                // If this is a dom element
					val = this._data[matches[1]]
				} else {
                // Else an id was provided as a number or string.
					val = this._data[typeof args[i] == 'string' || typeof args[i] == 'number' ? args[i] : args[i][idName]]
				}
				val && list.push(val)
			}
			return new this.Class(list)
		},
		/**
		 * Removes instances from this list by id or by an element.
		 *
		 * To remove by id:
		 *
		 *     var match = list.remove(23);
		 *
		 * or to remove by element:
		 * 
		 *     var match = list.remove($('#content')[0])
		 *
		 * @param {Object} args elements or ids to remove.
         * @return {$.Model.List} A Model.List of the elements that were removed.
		 */
		remove: function( args ) {
			if (!this.length ) {
				return [];
			}
			var list = [],
				constructor = this[0].constructor,
				underscored = constructor._fullName,
				idName = constructor.id,
				test = new RegExp(underscored + "_([^ ]+)"),
				matches, val;
			args = getArgs(arguments)

			//for performance, we will go through each and splice it
			var i = 0;
			while ( i < this.length ) {
				//check 
				var inst = this[i],
					found = false
					for ( var a = 0; a < args.length; a++ ) {
						var id = (args[a].nodeName && (matches = args[a].className.match(test)) && matches[1]) || (typeof args[a] == 'string' || typeof args[a] == 'number' ? args[a] : args[a][idName]);
						if ( inst[idName] == id ) {
							list.push.apply(list, this.splice(i, 1));
							args.splice(a, 1);
							found = true;
							break;
						}
					}
					if (!found ) {
						i++;
					}
			}
			var ret = new this.Class(list);
			if ( ret.length ) {
				$([this]).trigger("remove", [ret])
			}

			return ret;
		},
		/**
		 * Returns elements that represent this list.  For this to work, your element's should
		 * us the [jQuery.Model.prototype.identity identity] function in their class name.  Example:
		 * 
		 *     <div class='todo <%= todo.identity() %>'> ... </div>
		 * 
		 * This also works if you hooked up the model:
		 * 
		 *     <div <%= todo %>> ... </div>
		 *     
		 * Typically, you'll use this as a response to a Model Event:
		 * 
		 *     "{Todo} destroyed": function(Todo, event, todo){
		 *       todo.elements(this.element).remove();
		 *     }
		 * 
		 * @param {String|jQuery|element} context If provided, only elements inside this element that represent this model will be returned.
		 * @return {jQuery} Returns a jQuery wrapped nodelist of elements that have these model instances identities in their class names.
		 */
		elements: function( context ) {
			// TODO : this can probably be done with 1 query.
			return $(
			this.map(function( item ) {
				return "." + item.identity()
			}).join(','), context);
		},
		model: function() {
			return this.constructor.namespace
		},
		/**
		 * Finds items and adds them to this list.  This uses [jQuery.Model.static.findAll]
		 * to find items with the params passed.
		 * 
		 * @param {Object} params options to refind the returned items
		 * @param {Function} success called with the list
		 * @param {Object} error
		 */
		findAll: function( params, success, error ) {
			var self = this;
			this.model().findAll(params, function( items ) {
				self.push(items);
				success && success(self)
			}, error)
		},
		/**
		 * Destroys all items in this list.  This will use the List's 
		 * [jQuery.Model.List.static.destroy static destroy] method.
		 * 
		 *     list.destroy(function(destroyedItems){
		 *         //success
		 *     }, function(){
		 *         //error
		 *     });
		 * 
		 * @param {Function} success a handler called back with the destroyed items.  The original list will be emptied.
		 * @param {Function} error a handler called back when the destroy was unsuccessful.
		 */
		destroy: function( success, error ) {
			var ids = this.map(getIds),
				items = this.slice(0, this.length);

			if ( ids.length ) {
				this.constructor.destroy(ids, function() {
					each(items, function() {
						this.destroyed();
					})
					success && success(items)
				}, error);
			} else {
				success && success(this);
			}

			return this;
		},
		/**
		 * Updates items in the list with attributes.  This makes a 
		 * request using the list class's [jQuery.Model.List.static.update static update].
		 *
		 *     list.update(function(updatedItems){
		 *         //success
		 *     }, function(){
		 *         //error
		 *     });
		 * 
		 * @param {Object} attrs attributes to update the list with.
		 * @param {Function} success a handler called back with the updated items.
		 * @param {Function} error a handler called back when the update was unsuccessful.
		 */
		update: function( attrs, success, error ) {
			var ids = this.map(getIds),
				items = this.slice(0, this.length);

			if ( ids.length ) {
				this.constructor.update(ids, attrs, function( newAttrs ) {
					// final attributes to update with
					var attributes = $.extend(attrs, newAttrs || {})
					each(items, function() {
						this.updated(attributes);
					})
					success && success(items)
				}, error);
			} else {
				success && success(this);
			}

			return this;
		},
		/**
		 * Listens for an events on this list.  The only useful events are:
		 * 
		 *   . add - when new items are added
		 *   . update - when an item is updated
		 *   . remove - when items are removed from the list (typically because they are destroyed).
		 *    
		 * ## Listen for items being added 
		 *  
		 *     list.bind('add', function(ev, newItems){
		 *     
		 *     })
		 *     
		 * ## Listen for items being removed
		 * 
		 *     list.bind('remove',function(ev, removedItems){
		 *     
		 *     })
		 *     
		 * ## Listen for an item being updated
		 * 
		 *     list.bind('update',function(ev, updatedItem){
		 *     
		 *     })
		 */
		bind: function() {
			if ( this[expando] === undefined ) {
				this.bindings(this);
				// we should probably remove destroyed models here
			}
			$.fn.bind.apply($([this]), arguments);
			return this;
		},
		/**
		 * Unbinds an event on this list.  Once all events are unbound,
		 * unbind stops listening to all elements in the collection.
		 * 
		 *     list.unbind("update") //unbinds all update events
		 */
		unbind: function() {
			$.fn.unbind.apply($([this]), arguments);
			if ( this[expando] === undefined ) {
				$(this).unbind(this._namespace)
			}
			return this;
		},
		// listens to destroyed and updated on instances so when an item is
		//  updated - updated is called on model
		//  destroyed - it is removed from the list
		bindings: function( items ) {
			var self = this;
			$(items).bind("destroyed" + this._namespace, function() {
				//remove from me
				self.remove(this); //triggers the remove event
			}).bind("updated" + this._namespace, function() {
				$([self]).trigger("updated", this)
			});
		},
		/**
		 * @function push
		 * Adds an instance or instances to the list
		 * 
		 *     list.push(new Recipe({id: 5, name: "Water"}))
         *     
         * @param args {Object} The instance(s) to push onto the list.
         * @return {Number} The number of elements in the list after the new element was pushed in.
		 */
		push: function() {
			var args = getArgs(arguments);
			//listen to events on this only if someone is listening on us, this means remove won't
			//be called if we aren't listening for removes
			if ( this[expando] !== undefined ) {
				this.bindings(args);
			}

			this._changed = true;
			var res = push.apply(this, args)
			//do this first so we could prevent?
			if ( this[expando] && args.length ) {
				$([this]).trigger("add", [args]);
			}

			return res;
		},
		serialize: function() {
			return this.map(function( item ) {
				return item.serialize()
			});
		}
	});

	var push = [].push,
		modifiers = {

			/**
			 * @function pop
			 * Removes the last instance of the list, and returns that instance.
			 *
			 *     list.pop()
			 * 
			 */
			pop: [].pop,
			/**
			 * @function shift
			 * Removes the first instance of the list, and returns that instance.
			 *
			 *     list.shift()
			 * 
			 */
			shift: [].shift,
			/**
			 * @function unshift
			 * Adds a new instance to the beginning of an array, and returns the new length.
			 *
			 *     list.unshift(element1,element2,...) 
			 *
			 */
			unshift: [].unshift,
			/**
			 * @function splice
			 * The splice method adds and/or removes instances to/from the list, and returns the removed instance(s).
			 *
			 *     list.splice(index,howmany)
			 * 
			 */
			splice: [].splice,
			/**
			 * @function indexOf
			 * Finds the index of the item in the list. Returns -1 if not found.
			 *
			 *     list.indexOf(item)
			 * 
			 */
			indexOf: [].indexOf,
			/**
			 * @function sort
			 * Sorts the instances in the list.
			 *
			 *     list.sort(sortfunc)
			 * 
			 */
			sort: [].sort,
			/**
			 * @function reverse
			 * Reverse the list in place
			 *
			 *     list.reverse()
			 * 
			 */
			reverse: [].reverse
		}

		each(modifiers, function( name, func ) {
			$.Model.List.prototype[name] = function() {
				this._changed = true;
				return func.apply(this, arguments);
			}
		})

		each([
		/**
		 * @function each
		 * Iterates through the list of model instances, calling the callback function on each iteration. 
		 *
		 *     list.each(function(indexInList, modelOfList){
		 *         ...
		 *     });
		 * 
		 * @param {Function} callback The function that will be executed on every object.
		 */
		'each',
		/**
		 * @function map
		 * Iterates through the list of model instances, calling the callback function on each iteration.
		 * 
		 *     list.map(function(modelOfList, indexInList){
		 *         ...
		 *     });
		 * 
		 * @param {Function} callback The function to process each item against.
		 */
		'map'], function( i, name ) {
			$.Model.List.prototype[name] = function( callback, args ) {
				return $[name](this, callback, args);
			}
		})


})(jQuery);
(function( $ ) {

	// a path like string into something that's ok for an element ID
	var toId = function( src ) {
		return src.replace(/^\/\//, "").replace(/[\/\.]/g, "_");
	},
		makeArray = $.makeArray,
		// used for hookup ids
		id = 1;
	// this might be useful for testing if html
	// htmlTest = /^[\s\n\r\xA0]*<(.|[\r\n])*>[\s\n\r\xA0]*$/
	/**
	 * @class jQuery.View
	 * @parent jquerymx
	 * @plugin jquery/view
	 * @test jquery/view/qunit.html
	 * @download dist/jquery.view.js
	 * 
	 * @description A JavaScript template framework.
	 * 
	 * View provides a uniform interface for using templates with 
	 * jQuery. When template engines [jQuery.View.register register] 
	 * themselves, you are able to:
	 * 
	 *  - Use views with jQuery extensions [jQuery.fn.after after], [jQuery.fn.append append],
	 *   [jQuery.fn.before before], [jQuery.fn.html html], [jQuery.fn.prepend prepend],
	 *   [jQuery.fn.replaceWith replaceWith], [jQuery.fn.text text].
	 *  - Template loading from html elements and external files.
	 *  - Synchronous and asynchronous template loading.
	 *  - [view.deferreds Deferred Rendering].
	 *  - Template caching.
	 *  - Bundling of processed templates in production builds.
	 *  - Hookup jquery plugins directly in the template.
	 * 
	 * The [mvc.view Get Started with jQueryMX] has a good walkthrough of $.View.
	 * 
	 * ## Use
	 * 
	 * 
	 * When using views, you're almost always wanting to insert the results 
	 * of a rendered template into the page. jQuery.View overwrites the 
	 * jQuery modifiers so using a view is as easy as: 
	 * 
	 *     $("#foo").html('mytemplate.ejs',{message: 'hello world'})
	 *
	 * This code:
	 * 
	 *  - Loads the template a 'mytemplate.ejs'. It might look like:
	 *    <pre><code>&lt;h2>&lt;%= message %>&lt;/h2></pre></code>
	 *  
	 *  - Renders it with {message: 'hello world'}, resulting in:
	 *    <pre><code>&lt;div id='foo'>"&lt;h2>hello world&lt;/h2>&lt;/div></pre></code>
	 *  
	 *  - Inserts the result into the foo element. Foo might look like:
	 *    <pre><code>&lt;div id='foo'>&lt;h2>hello world&lt;/h2>&lt;/div></pre></code>
	 * 
	 * ## jQuery Modifiers
	 * 
	 * You can use a template with the following jQuery modifiers:
	 * 
	 * <table>
	 * <tr><td>[jQuery.fn.after after]</td><td> <code>$('#bar').after('temp.jaml',{});</code></td></tr>
	 * <tr><td>[jQuery.fn.append append] </td><td>  <code>$('#bar').append('temp.jaml',{});</code></td></tr>
	 * <tr><td>[jQuery.fn.before before] </td><td> <code>$('#bar').before('temp.jaml',{});</code></td></tr>
	 * <tr><td>[jQuery.fn.html html] </td><td> <code>$('#bar').html('temp.jaml',{});</code></td></tr>
	 * <tr><td>[jQuery.fn.prepend prepend] </td><td> <code>$('#bar').prepend('temp.jaml',{});</code></td></tr>
	 * <tr><td>[jQuery.fn.replaceWith replaceWith] </td><td> <code>$('#bar').replaceWith('temp.jaml',{});</code></td></tr>
	 * <tr><td>[jQuery.fn.text text] </td><td> <code>$('#bar').text('temp.jaml',{});</code></td></tr>
	 * </table>
	 * 
	 * You always have to pass a string and an object (or function) for the jQuery modifier 
	 * to user a template.
	 * 
	 * ## Template Locations
	 * 
	 * View can load from script tags or from files. 
	 * 
	 * ## From Script Tags
	 * 
	 * To load from a script tag, create a script tag with your template and an id like: 
	 * 
	 * <pre><code>&lt;script type='text/ejs' id='recipes'>
	 * &lt;% for(var i=0; i &lt; recipes.length; i++){ %>
	 *   &lt;li>&lt;%=recipes[i].name %>&lt;/li>
	 * &lt;%} %>
	 * &lt;/script></code></pre>
	 * 
	 * Render with this template like: 
	 * 
	 * @codestart
	 * $("#foo").html('recipes',recipeData)
	 * @codeend
	 * 
	 * Notice we passed the id of the element we want to render.
	 * 
	 * ## From File
	 * 
	 * You can pass the path of a template file location like:
	 * 
	 *     $("#foo").html('templates/recipes.ejs',recipeData)
	 * 
	 * However, you typically want to make the template work from whatever page they 
	 * are called from.  To do this, use // to look up templates from JMVC root:
	 * 
	 *     $("#foo").html('//app/views/recipes.ejs',recipeData)
	 *     
	 * Finally, the [jQuery.Controller.prototype.view controller/view] plugin can make looking
	 * up a thread (and adding helpers) even easier:
	 * 
	 *     $("#foo").html( this.view('recipes', recipeData) )
	 * 
	 * ## Packaging Templates
	 * 
	 * If you're making heavy use of templates, you want to organize 
	 * them in files so they can be reused between pages and applications.
	 * 
	 * But, this organization would come at a high price 
	 * if the browser has to 
	 * retrieve each template individually. The additional 
	 * HTTP requests would slow down your app. 
	 * 
	 * Fortunately, [steal.static.views steal.views] can build templates 
	 * into your production files. You just have to point to the view file like: 
	 * 
	 *     steal.views('path/to/the/view.ejs');
	 *
	 * ## Asynchronous
	 * 
	 * By default, retrieving requests is done synchronously. This is 
	 * fine because StealJS packages view templates with your JS download. 
	 * 
	 * However, some people might not be using StealJS or want to delay loading 
	 * templates until necessary. If you have the need, you can 
	 * provide a callback paramter like: 
	 * 
	 *     $("#foo").html('recipes',recipeData, function(result){
	 *       this.fadeIn()
	 *     });
	 * 
	 * The callback function will be called with the result of the 
	 * rendered template and 'this' will be set to the original jQuery object.
	 * 
	 * ## Deferreds (3.0.6)
	 * 
	 * If you pass deferreds to $.View or any of the jQuery 
	 * modifiers, the view will wait until all deferreds resolve before 
	 * rendering the view.  This makes it a one-liner to make a request and 
	 * use the result to render a template. 
	 * 
	 * The following makes a request for todos in parallel with the 
	 * todos.ejs template.  Once todos and template have been loaded, it with
	 * render the view with the todos.
	 * 
	 *     $('#todos').html("todos.ejs",Todo.findAll());
	 * 
	 * ## Just Render Templates
	 * 
	 * Sometimes, you just want to get the result of a rendered 
	 * template without inserting it, you can do this with $.View: 
	 * 
	 *     var out = $.View('path/to/template.jaml',{});
	 *     
	 * ## Preloading Templates
	 * 
	 * You can preload templates asynchronously like:
	 * 
	 *     $.get('path/to/template.jaml',{},function(){},'view');
	 * 
	 * ## Supported Template Engines
	 * 
	 * JavaScriptMVC comes with the following template languages:
	 * 
	 *   - EmbeddedJS
	 *     <pre><code>&lt;h2>&lt;%= message %>&lt;/h2></code></pre>
	 *     
	 *   - JAML
	 *     <pre><code>h2(data.message);</code></pre>
	 *     
	 *   - Micro
	 *     <pre><code>&lt;h2>{%= message %}&lt;/h2></code></pre>
	 *     
	 *   - jQuery.Tmpl
	 *     <pre><code>&lt;h2>${message}&lt;/h2></code></pre>
	 
	 * 
	 * The popular <a href='http://awardwinningfjords.com/2010/08/09/mustache-for-javascriptmvc-3.html'>Mustache</a> 
	 * template engine is supported in a 2nd party plugin.
	 * 
	 * ## Using other Template Engines
	 * 
	 * It's easy to integrate your favorite template into $.View and Steal.  Read 
	 * how in [jQuery.View.register].
	 * 
	 * @constructor
	 * 
	 * Looks up a template, processes it, caches it, then renders the template
	 * with data and optional helpers.
	 * 
	 * With [stealjs StealJS], views are typically bundled in the production build.
	 * This makes it ok to use views synchronously like:
	 * 
	 * @codestart
	 * $.View("//myplugin/views/init.ejs",{message: "Hello World"})
	 * @codeend
	 * 
	 * If you aren't using StealJS, it's best to use views asynchronously like:
	 * 
	 * @codestart
	 * $.View("//myplugin/views/init.ejs",
	 *        {message: "Hello World"}, function(result){
	 *   // do something with result
	 * })
	 * @codeend
	 * 
	 * @param {String} view The url or id of an element to use as the template's source.
	 * @param {Object} data The data to be passed to the view.
	 * @param {Object} [helpers] Optional helper functions the view might use. Not all
	 * templates support helpers.
	 * @param {Object} [callback] Optional callback function.  If present, the template is 
	 * retrieved asynchronously.  This is a good idea if you aren't compressing the templates
	 * into your view.
	 * @return {String} The rendered result of the view or if deferreds 
	 * are passed, a deferred that will resolve to
	 * the rendered result of the view.
	 */
	var $view = $.View = function( view, data, helpers, callback ) {
		// if helpers is a function, it is actually a callback
		if ( typeof helpers === 'function' ) {
			callback = helpers;
			helpers = undefined;
		}

		// see if we got passed any deferreds
		var deferreds = getDeferreds(data);


		if ( deferreds.length ) { // does data contain any deferreds?
			// the deferred that resolves into the rendered content ...
			var deferred = $.Deferred();

			// add the view request to the list of deferreds
			deferreds.push(get(view, true))

			// wait for the view and all deferreds to finish
			$.when.apply($, deferreds).then(function( resolved ) {
				// get all the resolved deferreds
				var objs = makeArray(arguments),
					// renderer is last [0] is the data
					renderer = objs.pop()[0],
					// the result of the template rendering with data
					result; 
				
				// make data look like the resolved deferreds
				if ( isDeferred(data) ) {
					data = usefulPart(resolved);
				}
				else {
					// go through each prop in data again,
					// replace the defferreds with what they resolved to
					for ( var prop in data ) {
						if ( isDeferred(data[prop]) ) {
							data[prop] = usefulPart(objs.shift());
						}
					}
				}
				// get the rendered result
				result = renderer(data, helpers);

				//resolve with the rendered view
				deferred.resolve(result); 
				// if there's a callback, call it back with the result
				callback && callback(result);
			});
			// return the deferred ....
			return deferred.promise();
		}
		else {
			// no deferreds, render this bad boy
			var response, 
				// if there's a callback function
				async = typeof callback === "function",
				// get the 'view' type
				deferred = get(view, async);

			// if we are async, 
			if ( async ) {
				// return the deferred
				response = deferred;
				// and callback callback with the rendered result
				deferred.done(function( renderer ) {
					callback(renderer(data, helpers))
				})
			} else {
				// otherwise, the deferred is complete, so
				// set response to the result of the rendering
				deferred.done(function( renderer ) {
					response = renderer(data, helpers);
				});
			}

			return response;
		}
	}, 
		// makes sure there's a template, if not, has steal provide a warning
		checkText = function( text, url ) {
			if (!text.match(/[^\s]/) ) {
				
				throw "$.View ERROR: There is no template or an empty template at " + url;
			}
		},
		// returns a 'view' renderer deferred
		// url - the url to the view template
		// async - if the ajax request should be synchronous
		get = function( url, async ) {
			return $.ajax({
				url: url,
				dataType: "view",
				async: async
			});
		},
		// returns true if something looks like a deferred
		isDeferred = function( obj ) {
			return obj && $.isFunction(obj.always) // check if obj is a $.Deferred
		},
		// gets an array of deferreds from an object
		// this only goes one level deep
		getDeferreds = function( data ) {
			var deferreds = [];

			// pull out deferreds
			if ( isDeferred(data) ) {
				return [data]
			} else {
				for ( var prop in data ) {
					if ( isDeferred(data[prop]) ) {
						deferreds.push(data[prop]);
					}
				}
			}
			return deferreds;
		},
		// gets the useful part of deferred
		// this is for Models and $.ajax that resolve to array (with success and such)
		// returns the useful, content part
		usefulPart = function( resolved ) {
			return $.isArray(resolved) && resolved.length === 3 && resolved[1] === 'success' ? resolved[0] : resolved
		};



	// you can request a view renderer (a function you pass data to and get html)
	// Creates a 'view' transport.  These resolve to a 'view' renderer
	// a 'view' renderer takes data and returns a string result.
	// For example: 
	//
	//  $.ajax({dataType : 'view', src: 'foo.ejs'}).then(function(renderer){
	//     renderer({message: 'hello world'})
	//  })
	$.ajaxTransport("view", function( options, orig ) {
		// the url (or possibly id) of the view content
		var url = orig.url,
			// check if a suffix exists (ex: "foo.ejs")
			suffix = url.match(/\.[\w\d]+$/),
			type, 
			// if we are reading a script element for the content of the template
			// el will be set to that script element
			el, 
			// a unique identifier for the view (used for caching)
			// this is typically derived from the element id or
			// the url for the template
			id, 
			// the AJAX request used to retrieve the template content
			jqXHR, 
			// used to generate the response 
			response = function( text ) {
				// get the renderer function
				var func = type.renderer(id, text);
				// cache if if we are caching
				if ( $view.cache ) {
					$view.cached[id] = func;
				}
				// return the objects for the response's dataTypes 
				// (in this case view)
				return {
					view: func
				};
			};

		// if we have an inline template, derive the suffix from the 'text/???' part
		// this only supports '<script></script>' tags
		if ( el = document.getElementById(url) ) {
			suffix = "."+el.type.match(/\/(x\-)?(.+)/)[2];
		}

		// if there is no suffix, add one
		if (!suffix ) {
			suffix = $view.ext;
			url = url + $view.ext;
		}

		// convert to a unique and valid id
		id = toId(url);

		// if a absolute path, use steal to get it
		// you should only be using // if you are using steal
		if ( url.match(/^\/\//) ) {
			var sub = url.substr(2);
			url = typeof steal === "undefined" ? 
				url = "/" + sub : 
				steal.root.mapJoin(sub) +'';
		}

		//set the template engine type 
		type = $view.types[suffix];

		// return the ajax transport contract: http://api.jquery.com/extending-ajax/
		return {
			send: function( headers, callback ) {
				// if it is cached, 
				if ( $view.cached[id] ) {
					// return the catched renderer
					return callback(200, "success", {
						view: $view.cached[id]
					});
				
				// otherwise if we are getting this from a script elment
				} else if ( el ) {
					// resolve immediately with the element's innerHTML
					callback(200, "success", response(el.innerHTML));
				} else {
					// make an ajax request for text
					jqXHR = $.ajax({
						async: orig.async,
						url: url,
						dataType: "text",
						error: function() {
							checkText("", url);
							callback(404);
						},
						success: function( text ) {
							// make sure we got some text back
							checkText(text, url);
							// cache and send back text
							callback(200, "success", response(text))
						}
					});
				}
			},
			abort: function() {
				jqXHR && jqXHR.abort();
			}
		}
	})
	$.extend($view, {
		/**
		 * @attribute hookups
		 * @hide
		 * A list of pending 'hookups'
		 */
		hookups: {},
		/**
		 * @function hookup
		 * Registers a hookup function that can be called back after the html is 
		 * put on the page.  Typically this is handled by the template engine.  Currently
		 * only EJS supports this functionality.
		 * 
		 *     var id = $.View.hookup(function(el){
		 *            //do something with el
		 *         }),
		 *         html = "<div data-view-id='"+id+"'>"
		 *     $('.foo').html(html);
		 * 
		 * 
		 * @param {Function} cb a callback function to be called with the element
		 * @param {Number} the hookup number
		 */
		hookup: function( cb ) {
			var myid = ++id;
			$view.hookups[myid] = cb;
			return myid;
		},
		/**
		 * @attribute cached
		 * @hide
		 * Cached are put in this object
		 */
		cached: {},
		/**
		 * @attribute cache
		 * Should the views be cached or reloaded from the server. Defaults to true.
		 */
		cache: true,
		/**
		 * @function register
		 * Registers a template engine to be used with 
		 * view helpers and compression.  
		 * 
		 * ## Example
		 * 
		 * @codestart
		 * $.View.register({
		 * 	suffix : "tmpl",
		 *  plugin : "jquery/view/tmpl",
		 * 	renderer: function( id, text ) {
		 * 		return function(data){
		 * 			return jQuery.render( text, data );
		 * 		}
		 * 	},
		 * 	script: function( id, text ) {
		 * 		var tmpl = $.tmpl(text).toString();
		 * 		return "function(data){return ("+
		 * 		  	tmpl+
		 * 			").call(jQuery, jQuery, data); }";
		 * 	}
		 * })
		 * @codeend
		 * Here's what each property does:
		 * 
		 *    * plugin - the location of the plugin
		 *    * suffix - files that use this suffix will be processed by this template engine
		 *    * renderer - returns a function that will render the template provided by text
		 *    * script - returns a string form of the processed template function.
		 * 
		 * @param {Object} info a object of method and properties 
		 * 
		 * that enable template integration:
		 * <ul>
		 *   <li>plugin - the location of the plugin.  EX: 'jquery/view/ejs'</li>
		 *   <li>suffix - the view extension.  EX: 'ejs'</li>
		 *   <li>script(id, src) - a function that returns a string that when evaluated returns a function that can be 
		 *    used as the render (i.e. have func.call(data, data, helpers) called on it).</li>
		 *   <li>renderer(id, text) - a function that takes the id of the template and the text of the template and
		 *    returns a render function.</li>
		 * </ul>
		 */
		register: function( info ) {
			this.types["." + info.suffix] = info;

			if ( window.steal ) {
				steal.type(info.suffix + " view js", function( options, success, error ) {
					var type = $view.types["." + options.type],
						id = toId(options.rootSrc+'');

					options.text = type.script(id, options.text)
					success();
				})
			}
		},
		types: {},
		/**
		 * @attribute ext
		 * The default suffix to use if none is provided in the view's url.  
		 * This is set to .ejs by default.
		 */
		ext: ".ejs",
		/**
		 * Returns the text that 
		 * @hide 
		 * @param {Object} type
		 * @param {Object} id
		 * @param {Object} src
		 */
		registerScript: function( type, id, src ) {
			return "$.View.preload('" + id + "'," + $view.types["." + type].script(id, src) + ");";
		},
		/**
		 * @hide
		 * Called by a production script to pre-load a renderer function
		 * into the view cache.
		 * @param {String} id
		 * @param {Function} renderer
		 */
		preload: function( id, renderer ) {
			$view.cached[id] = function( data, helpers ) {
				return renderer.call(data, data, helpers);
			};
		}

	});
	if ( window.steal ) {
		steal.type("view js", function( options, success, error ) {
			var type = $view.types["." + options.type],
				id = toId(options.rootSrc+'');

			options.text = "steal(function($){" + "$.View.preload('" + id + "'," + options.text + ");\n})";
			success();
		})
	}

	//---- ADD jQUERY HELPERS -----
	//converts jquery functions to use views	
	var convert, modify, isTemplate, isHTML, isDOM, getCallback, hookupView, funcs,
		// text and val cannot produce an element, so don't run hookups on them
		noHookup = {'val':true,'text':true};

	convert = function( func_name ) {
		// save the old jQuery helper
		var old = $.fn[func_name];

		// replace it wiht our new helper
		$.fn[func_name] = function() {
			
			var args = makeArray(arguments),
				callbackNum, 
				callback, 
				self = this,
				result;
			
			// if the first arg is a deferred
			// wait until it finishes, and call
			// modify with the result
			if ( isDeferred(args[0]) ) {
				args[0].done(function( res ) {
					modify.call(self, [res], old);
				})
				return this;
			}
			//check if a template
			else if ( isTemplate(args) ) {

				// if we should operate async
				if ((callbackNum = getCallback(args))) {
					callback = args[callbackNum];
					args[callbackNum] = function( result ) {
						modify.call(self, [result], old);
						callback.call(self, result);
					};
					$view.apply($view, args);
					return this;
				}
				// call view with args (there might be deferreds)
				result = $view.apply($view, args);
				
				// if we got a string back
				if (!isDeferred(result) ) {
					// we are going to call the old method with that string
					args = [result];
				} else {
					// if there is a deferred, wait until it is done before calling modify
					result.done(function( res ) {
						modify.call(self, [res], old);
					})
					return this;
				}
			}
			return noHookup[func_name] ? old.apply(this,args) : 
				modify.call(this, args, old);
		};
	};

	// modifies the content of the element
	// but also will run any hookup
	modify = function( args, old ) {
		var res, stub, hooks;

		//check if there are new hookups
		for ( var hasHookups in $view.hookups ) {
			break;
		}

		//if there are hookups, get jQuery object
		if ( hasHookups && args[0] && isHTML(args[0]) ) {
			hooks = $view.hookups;
			$view.hookups = {};
			args[0] = $(args[0]);
		}
		res = old.apply(this, args);

		//now hookup the hookups
		if ( hooks
		/* && args.length*/
		) {
			hookupView(args[0], hooks);
		}
		return res;
	};

	// returns true or false if the args indicate a template is being used
	// $('#foo').html('/path/to/template.ejs',{data})
	// in general, we want to make sure the first arg is a string
	// and the second arg is data
	isTemplate = function( args ) {
		// save the second arg type
		var secArgType = typeof args[1];
		
		// the first arg is a string
		return typeof args[0] == "string" && 
				// the second arg is an object or function
		       (secArgType == 'object' || secArgType == 'function') && 
			   // but it is not a dom element
			   !isDOM(args[1]);
	};
	// returns true if the arg is a jQuery object or HTMLElement
	isDOM = function(arg){
		return arg.nodeType || arg.jquery
	};
	// returns whether the argument is some sort of HTML data
	isHTML = function( arg ) {
		if ( isDOM(arg) ) {
			// if jQuery object or DOM node we're good
			return true;
		} else if ( typeof arg === "string" ) {
			// if string, do a quick sanity check that we're HTML
			arg = $.trim(arg);
			return arg.substr(0, 1) === "<" && arg.substr(arg.length - 1, 1) === ">" && arg.length >= 3;
		} else {
			// don't know what you are
			return false;
		}
	};

	//returns the callback arg number if there is one (for async view use)
	getCallback = function( args ) {
		return typeof args[3] === 'function' ? 3 : typeof args[2] === 'function' && 2;
	};

	hookupView = function( els, hooks ) {
		//remove all hookups
		var hookupEls, len, i = 0,
			id, func;
		els = els.filter(function() {
			return this.nodeType != 3; //filter out text nodes
		})
		hookupEls = els.add("[data-view-id]", els);
		len = hookupEls.length;
		for (; i < len; i++ ) {
			if ( hookupEls[i].getAttribute && (id = hookupEls[i].getAttribute('data-view-id')) && (func = hooks[id]) ) {
				func(hookupEls[i], id);
				delete hooks[id];
				hookupEls[i].removeAttribute('data-view-id');
			}
		}
		//copy remaining hooks back
		$.extend($view.hookups, hooks);
	};

	/**
	 *  @add jQuery.fn
	 *  @parent jQuery.View
	 *  Called on a jQuery collection that was rendered with $.View with pending hookups.  $.View can render a 
	 *  template with hookups, but not actually perform the hookup, because it returns a string without actual DOM 
	 *  elements to hook up to.  So hookup performs the hookup and clears the pending hookups, preventing errors in 
	 *  future templates.
	 *  
	 * @codestart
	 * $($.View('//views/recipes.ejs',recipeData)).hookup()
	 * @codeend
	 */
	$.fn.hookup = function() {
		var hooks = $view.hookups;
		$view.hookups = {};
		hookupView(this, hooks);
		return this;
	};

	/**
	 *  @add jQuery.fn
	 */
	$.each([
	/**
	 *  @function prepend
	 *  @parent jQuery.View
	 *  
	 *  Extending the original [http://api.jquery.com/prepend/ jQuery().prepend()]
	 *  to render [jQuery.View] templates inserted at the beginning of each element in the set of matched elements.
	 *  
	 *  	$('#test').prepend('path/to/template.ejs', { name : 'javascriptmvc' });
	 *  
	 *  @param {String|Object|Function} content A template filename or the id of a view script tag 
	 *  or a DOM element, array of elements, HTML string, or jQuery object.
	 *  @param {Object} [data] The data to render the view with.
	 *  If rendering a view template this parameter always has to be present
	 *  (use the empty object initializer {} for no data).
	 */
	"prepend",
	/**
	 *  @function append
	 *  @parent jQuery.View
	 *  
	 *  Extending the original [http://api.jquery.com/append/ jQuery().append()]
	 *  to render [jQuery.View] templates inserted at the end of each element in the set of matched elements.
	 *  
	 *  	$('#test').append('path/to/template.ejs', { name : 'javascriptmvc' });
	 *  
	 *  @param {String|Object|Function} content A template filename or the id of a view script tag 
	 *  or a DOM element, array of elements, HTML string, or jQuery object.
	 *  @param {Object} [data] The data to render the view with.
	 *  If rendering a view template this parameter always has to be present
	 *  (use the empty object initializer {} for no data).
	 */
	"append",
	/**
	 *  @function after
	 *  @parent jQuery.View
	 *  
	 *  Extending the original [http://api.jquery.com/after/ jQuery().after()]
	 *  to render [jQuery.View] templates inserted after each element in the set of matched elements.
	 *  
	 *  	$('#test').after('path/to/template.ejs', { name : 'javascriptmvc' });
	 *  
	 *  @param {String|Object|Function} content A template filename or the id of a view script tag 
	 *  or a DOM element, array of elements, HTML string, or jQuery object.
	 *  @param {Object} [data] The data to render the view with.
	 *  If rendering a view template this parameter always has to be present
	 *  (use the empty object initializer {} for no data).
	 */
	"after",
	/**
	 *  @function before
	 *  @parent jQuery.View
	 *  
	 *  Extending the original [http://api.jquery.com/before/ jQuery().before()]
	 *  to render [jQuery.View] templates inserted before each element in the set of matched elements.
	 *  
	 *  	$('#test').before('path/to/template.ejs', { name : 'javascriptmvc' });
	 *  
	 *  @param {String|Object|Function} content A template filename or the id of a view script tag 
	 *  or a DOM element, array of elements, HTML string, or jQuery object.
	 *  @param {Object} [data] The data to render the view with.
	 *  If rendering a view template this parameter always has to be present
	 *  (use the empty object initializer {} for no data).
	 */
	"before",
	/**
	 *  @function text
	 *  @parent jQuery.View
	 *  
	 *  Extending the original [http://api.jquery.com/text/ jQuery().text()]
	 *  to render [jQuery.View] templates as the content of each matched element.
	 *  Unlike [jQuery.fn.html] jQuery.fn.text also works with XML, escaping the provided
	 *  string as necessary.
	 *  
	 *  	$('#test').text('path/to/template.ejs', { name : 'javascriptmvc' });
	 *  
	 *  @param {String|Object|Function} content A template filename or the id of a view script tag 
	 *  or a DOM element, array of elements, HTML string, or jQuery object.
	 *  @param {Object} [data] The data to render the view with.
	 *  If rendering a view template this parameter always has to be present
	 *  (use the empty object initializer {} for no data).
	 */
	"text",
	/**
	 *  @function html
	 *  @parent jQuery.View
	 *  
	 *  Extending the original [http://api.jquery.com/html/ jQuery().html()]
	 *  to render [jQuery.View] templates as the content of each matched element.
	 *  
	 *  	$('#test').html('path/to/template.ejs', { name : 'javascriptmvc' });
	 *  
	 *  @param {String|Object|Function} content A template filename or the id of a view script tag 
	 *  or a DOM element, array of elements, HTML string, or jQuery object.
	 *  @param {Object} [data] The data to render the view with.
	 *  If rendering a view template this parameter always has to be present
	 *  (use the empty object initializer {} for no data).
	 */
	"html",
	/**
	 *  @function replaceWith
	 *  @parent jQuery.View
	 *  
	 *  Extending the original [http://api.jquery.com/replaceWith/ jQuery().replaceWith()]
	 *  to render [jQuery.View] templates replacing each element in the set of matched elements.
	 *  
	 *  	$('#test').replaceWith('path/to/template.ejs', { name : 'javascriptmvc' });
	 *  
	 *  @param {String|Object|Function} content A template filename or the id of a view script tag 
	 *  or a DOM element, array of elements, HTML string, or jQuery object.
	 *  @param {Object} [data] The data to render the view with.
	 *  If rendering a view template this parameter always has to be present
	 *  (use the empty object initializer {} for no data).
	 */
	"replaceWith", "val"],function(i, func){
		convert(func);
	});

	//go through helper funcs and convert


})(jQuery);
(function( $ ) {
	/**
	 * @add jQuery.String
	 */
	$.String.
	/**
	 * Splits a string with a regex correctly cross browser
	 * 
	 *     $.String.rsplit("a.b.c.d", /\./) //-> ['a','b','c','d']
	 * 
	 * @param {String} string The string to split
	 * @param {RegExp} regex A regular expression
	 * @return {Array} An array of strings
	 */
	rsplit = function( string, regex ) {
		var result = regex.exec(string),
			retArr = [],
			first_idx, last_idx;
		while ( result !== null ) {
			first_idx = result.index;
			last_idx = regex.lastIndex;
			if ( first_idx !== 0 ) {
				retArr.push(string.substring(0, first_idx));
				string = string.slice(first_idx);
			}
			retArr.push(result[0]);
			string = string.slice(result[0].length);
			result = regex.exec(string);
		}
		if ( string !== '' ) {
			retArr.push(string);
		}
		return retArr;
	};
})(jQuery);
(function( $ ) {

	// HELPER METHODS ==============
	var myEval = function( script ) {
		eval(script);
	},
		// removes the last character from a string
		// this is no longer needed
		// chop = function( string ) {
		//	return string.substr(0, string.length - 1);
		//},
		rSplit = $.String.rsplit,
		extend = $.extend,
		isArray = $.isArray,
		// regular expressions for caching
		returnReg = /\r\n/g,
		retReg = /\r/g,
		newReg = /\n/g,
		nReg = /\n/,
		slashReg = /\\/g,
		quoteReg = /"/g,
		singleQuoteReg = /'/g,
		tabReg = /\t/g,
		leftBracket = /\{/g,
		rightBracket = /\}/g,
		quickFunc = /\s*\(([\$\w]+)\)\s*->([^\n]*)/,
		// escapes characters starting with \
		clean = function( content ) {
			return content.replace(slashReg, '\\\\').replace(newReg, '\\n').replace(quoteReg, '\\"').replace(tabReg, '\\t');
		},
		// escapes html
		// - from prototype  http://www.prototypejs.org/
		escapeHTML = function( content ) {
			return content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(quoteReg, '&#34;').replace(singleQuoteReg, "&#39;");
		},
		$View = $.View,
		bracketNum = function(content){
			var lefts = content.match(leftBracket),
				rights = content.match(rightBracket);
				
			return (lefts ? lefts.length : 0) - 
				   (rights ? rights.length : 0);
		},
		/**
		 * @class jQuery.EJS
		 * 
		 * @plugin jquery/view/ejs
		 * @parent jQuery.View
		 * @download  http://jmvcsite.heroku.com/pluginify?plugins[]=jquery/view/ejs/ejs.js
		 * @test jquery/view/ejs/qunit.html
		 * 
		 * 
		 * Ejs provides <a href="http://www.ruby-doc.org/stdlib/libdoc/erb/rdoc/">ERB</a> 
		 * style client side templates.  Use them with controllers to easily build html and inject
		 * it into the DOM.
		 * 
		 * ###  Example
		 * 
		 * The following generates a list of tasks:
		 * 
		 * @codestart html
		 * &lt;ul>
		 * &lt;% for(var i = 0; i < tasks.length; i++){ %>
		 *     &lt;li class="task &lt;%= tasks[i].identity %>">&lt;%= tasks[i].name %>&lt;/li>
		 * &lt;% } %>
		 * &lt;/ul>
		 * @codeend
		 * 
		 * For the following examples, we assume this view is in <i>'views\tasks\list.ejs'</i>.
		 * 
		 * 
		 * ## Use
		 * 
		 * ### Loading and Rendering EJS:
		 * 
		 * You should use EJS through the helper functions [jQuery.View] provides such as:
		 * 
		 *   - [jQuery.fn.after after]
		 *   - [jQuery.fn.append append]
		 *   - [jQuery.fn.before before]
		 *   - [jQuery.fn.html html], 
		 *   - [jQuery.fn.prepend prepend],
		 *   - [jQuery.fn.replaceWith replaceWith], and 
		 *   - [jQuery.fn.text text].
		 * 
		 * or [jQuery.Controller.prototype.view].
		 * 
		 * ### Syntax
		 * 
		 * EJS uses 5 types of tags:
		 * 
		 *   - <code>&lt;% CODE %&gt;</code> - Runs JS Code.
		 *     For example:
		 *     
		 *         <% alert('hello world') %>
		 *     
		 *   - <code>&lt;%= CODE %&gt;</code> - Runs JS Code and writes the _escaped_ result into the result of the template.
		 *     For example:
		 *     
		 *         <h1><%= 'hello world' %></h1>
		 *         
		 *   - <code>&lt;%== CODE %&gt;</code> - Runs JS Code and writes the _unescaped_ result into the result of the template.
		 *     For example:
		 *     
		 *         <h1><%== '<span>hello world</span>' %></h1>
		 *         
		 *   - <code>&lt;%%= CODE %&gt;</code> - Writes <%= CODE %> to the result of the template.  This is very useful for generators.
		 *     
		 *         <%%= 'hello world' %>
		 *         
		 *   - <code>&lt;%# CODE %&gt;</code> - Used for comments.  This does nothing.
		 *     
		 *         <%# 'hello world' %>
		 *        
		 * ## Hooking up controllers
		 * 
		 * After drawing some html, you often want to add other widgets and plugins inside that html.
		 * View makes this easy.  You just have to return the Contoller class you want to be hooked up.
		 * 
		 * @codestart
		 * &lt;ul &lt;%= Mxui.Tabs%>>...&lt;ul>
		 * @codeend
		 * 
		 * You can even hook up multiple controllers:
		 * 
		 * @codestart
		 * &lt;ul &lt;%= [Mxui.Tabs, Mxui.Filler]%>>...&lt;ul>
		 * @codeend
		 * 
		 * To hook up a controller with options or any other jQuery plugin use the
		 * [jQuery.EJS.Helpers.prototype.plugin | plugin view helper]:
		 * 
		 * @codestart
		 * &lt;ul &lt;%= plugin('mxui_tabs', { option: 'value' }) %>>...&lt;ul>
		 * @codeend
		 * 
		 * Don't add a semicolon when using view helpers.
		 * 
		 * 
		 * <h2>View Helpers</h2>
		 * View Helpers return html code.  View by default only comes with 
		 * [jQuery.EJS.Helpers.prototype.view view] and [jQuery.EJS.Helpers.prototype.text text].
		 * You can include more with the view/helpers plugin.  But, you can easily make your own!
		 * Learn how in the [jQuery.EJS.Helpers Helpers] page.
		 * 
		 * @constructor Creates a new view
		 * @param {Object} options A hash with the following options
		 * <table class="options">
		 *     <tbody><tr><th>Option</th><th>Default</th><th>Description</th></tr>
		 *     <tr>
		 *      <td>text</td>
		 *      <td>&nbsp;</td>
		 *      <td>uses the provided text as the template. Example:<br/><code>new View({text: '&lt;%=user%>'})</code>
		 *      </td>
		 *     </tr>
		 *     <tr>
		 *      <td>type</td>
		 *      <td>'<'</td>
		 *      <td>type of magic tags.  Options are '&lt;' or '['
		 *      </td>
		 *     </tr>
		 *     <tr>
		 *      <td>name</td>
		 *      <td>the element ID or url </td>
		 *      <td>an optional name that is used for caching.
		 *      </td>
		 *     </tr>
		 *    </tbody></table>
		 */
		EJS = function( options ) {
			// If called without new, return a function that 
			// renders with data and helpers like
			// EJS({text: '<%= message %>'})({message: 'foo'});
			// this is useful for steal's build system
			if ( this.constructor != EJS ) {
				var ejs = new EJS(options);
				return function( data, helpers ) {
					return ejs.render(data, helpers);
				};
			}
			// if we get a function directly, it probably is coming from
			// a steal-packaged view
			if ( typeof options == "function" ) {
				this.template = {
					fn: options
				};
				return;
			}
			//set options on self
			extend(this, EJS.options, options);
			this.template = compile(this.text, this.type, this.name);
		};
	// add EJS to jQuery if it exists
	window.jQuery && (jQuery.EJS = EJS);
	/** 
	 * @Prototype
	 */
	EJS.prototype.
	/**
	 * Renders an object with view helpers attached to the view.
	 * 
	 *     new EJS({text: "<%= message %>"}).render({
	 *       message: "foo"
	 *     },{helper: function(){ ... }})
	 *     
	 * @param {Object} object data to be rendered
	 * @param {Object} [extraHelpers] an object with view helpers
	 * @return {String} returns the result of the string
	 */
	render = function( object, extraHelpers ) {
		object = object || {};
		this._extra_helpers = extraHelpers;
		var v = new EJS.Helpers(object, extraHelpers || {});
		return this.template.fn.call(object, object, v);
	};
	/**
	 * @Static
	 */

	extend(EJS, {
		/**
		 * Used to convert what's in &lt;%= %> magic tags to a string
		 * to be inserted in the rendered output.
		 * 
		 * Typically, it's a string, and the string is just inserted.  However,
		 * if it's a function or an object with a hookup method, it can potentially be 
		 * be ran on the element after it's inserted into the page.
		 * 
		 * This is a very nice way of adding functionality through the view.
		 * Usually this is done with [jQuery.EJS.Helpers.prototype.plugin]
		 * but the following fades in the div element after it has been inserted:
		 * 
		 * @codestart
		 * &lt;%= function(el){$(el).fadeIn()} %>
		 * @codeend
		 * 
		 * @param {String|Object|Function} input the value in between the
		 * write magic tags: &lt;%= %>
		 * @return {String} returns the content to be added to the rendered
		 * output.  The content is different depending on the type:
		 * 
		 *   * string - the original string
		 *   * null or undefined - the empty string ""
		 *   * an object with a hookup method - the attribute "data-view-id='XX'", where XX is a hookup number for jQuery.View
		 *   * a function - the attribute "data-view-id='XX'", where XX is a hookup number for jQuery.View
		 *   * an array - the attribute "data-view-id='XX'", where XX is a hookup number for jQuery.View
		 */
		text: function( input ) {
			// if it's a string, return
			if ( typeof input == 'string' ) {
				return input;
			}
			// if has no value
			if ( input === null || input === undefined ) {
				return '';
			}

			// if it's an object, and it has a hookup method
			var hook = (input.hookup &&
			// make a function call the hookup method

			function( el, id ) {
				input.hookup.call(input, el, id);
			}) ||
			// or if it's a function, just use the input
			(typeof input == 'function' && input) ||
			// of it its an array, make a function that calls hookup or the function
			// on each item in the array
			(isArray(input) &&
			function( el, id ) {
				for ( var i = 0; i < input.length; i++ ) {
					input[i].hookup ? input[i].hookup(el, id) : input[i](el, id);
				}
			});
			// finally, if there is a funciton to hookup on some dom
			// pass it to hookup to get the data-view-id back
			if ( hook ) {
				return "data-view-id='" + $View.hookup(hook) + "'";
			}
			// finally, if all else false, toString it
			return input.toString ? input.toString() : "";
		},
		/**
		 * Escapes the text provided as html if it's a string.  
		 * Otherwise, the value is passed to EJS.text(text).
		 * 
		 * @param {String|Object|Array|Function} text to escape.  Otherwise,
		 * the result of [jQuery.EJS.text] is returned.
		 * @return {String} the escaped text or likely a $.View data-view-id attribute.
		 */
		clean: function( text ) {
			//return sanatized text
			if ( typeof text == 'string' ) {
				return escapeHTML(text);
			} else if ( typeof text == 'number' ) {
				return text;
			} else {
				return EJS.text(text);
			}
		},
		/**
		 * @attribute options
		 * Sets default options for all views.
		 * 
		 *     $.EJS.options.type = '['
		 * 
		 * Only one option is currently supported: type.
		 * 
		 * Type is the left hand magic tag.
		 */
		options: {
			type: '<',
			ext: '.ejs'
		}
	});
	// ========= SCANNING CODE =========
	// Given a scanner, and source content, calls block  with each token
	// scanner - an object of magicTagName : values
	// source - the source you want to scan
	// block - function(token, scanner), called with each token
	var scan = function( scanner, source, block ) {
		// split on /\n/ to have new lines on their own line.
		var source_split = rSplit(source, nReg),
			i = 0;
		for (; i < source_split.length; i++ ) {
			scanline(scanner, source_split[i], block);
		}

	},
		scanline = function( scanner, line, block ) {
			scanner.lines++;
			var line_split = rSplit(line, scanner.splitter),
				token;
			for ( var i = 0; i < line_split.length; i++ ) {
				token = line_split[i];
				if ( token !== null ) {
					block(token, scanner);
				}
			}
		},
		// creates a 'scanner' object.  This creates
		// values for the left and right magic tags
		// it's splitter property is a regexp that splits content
		// by all tags
		makeScanner = function( left, right ) {
			var scanner = {};
			extend(scanner, {
				left: left + '%',
				right: '%' + right,
				dLeft: left + '%%',
				dRight: '%%' + right,
				eeLeft: left + '%==',
				eLeft: left + '%=',
				cmnt: left + '%#',
				scan: scan,
				lines: 0
			});
			scanner.splitter = new RegExp("(" + [scanner.dLeft, scanner.dRight, scanner.eeLeft, scanner.eLeft, scanner.cmnt, scanner.left, scanner.right + '\n', scanner.right, '\n'].join(")|(").
			replace(/\[/g, "\\[").replace(/\]/g, "\\]") + ")");
			return scanner;
		},
		// compiles a template where
		// source - template text
		// left - the left magic tag
		// name - the name of the template (for debugging)
		// returns an object like: {out : "", fn : function(){ ... }} where
		//   out -  the converted JS source of the view
		//   fn - a function made from the JS source
		compile = function( source, left, name ) {
			// make everything only use \n
			source = source.replace(returnReg, "\n").replace(retReg, "\n");
			// if no left is given, assume <
			left = left || '<';

			// put and insert cmds are used for adding content to the template
			// currently they are identical, I am not sure why
			var put_cmd = "___v1ew.push(",
				insert_cmd = put_cmd,
				// the text that starts the view code (or block function)
				startTxt = 'var ___v1ew = [];',
				// the text that ends the view code (or block function)
				finishTxt = "return ___v1ew.join('')",
				// initialize a buffer
				buff = new EJS.Buffer([startTxt], []),
				// content is used as the current 'processing' string
				// this is the content between magic tags
				content = '',
				// adds something to be inserted into the view template
				// this comes out looking like __v1ew.push("CONENT")
				put = function( content ) {
					buff.push(put_cmd, '"', clean(content), '");');
				},
				// the starting magic tag
				startTag = null,
				// cleans the running content
				empty = function() {
					content = ''
				},
				// what comes after clean or text
				doubleParen = "));",
				// a stack used to keep track of how we should end a bracket }
				// once we have a <%= %> with a leftBracket
				// we store how the file should end here (either '))' or ';' )
				endStack =[];

			// start going token to token
			scan(makeScanner(left, left === '[' ? ']' : '>'), source || "", function( token, scanner ) {
				// if we don't have a start pair
				var bn;
				if ( startTag === null ) {
					switch ( token ) {
					case '\n':
						content = content + "\n";
						put(content);
						buff.cr();
						empty();
						break;
						// set start tag, add previous content (if there is some)
						// clean content
					case scanner.left:
					case scanner.eLeft:
					case scanner.eeLeft:
					case scanner.cmnt:
						// a new line, just add whatever content w/i a clean
						// reset everything
						startTag = token;
						if ( content.length > 0 ) {
							put(content);
						}
						empty();
						break;

					case scanner.dLeft:
						// replace <%% with <%
						content += scanner.left;
						break;
					default:
						content += token;
						break;
					}
				}
				else {
					//we have a start tag
					switch ( token ) {
					case scanner.right:
						// %>
						switch ( startTag ) {
						case scanner.left:
							// <%
							
							// get the number of { minus }
							bn = bracketNum(content);
							// how are we ending this statement
							var last = 
								// if the stack has value and we are ending a block
								endStack.length && bn == -1 ? 
								// use the last item in the block stack
								endStack.pop() : 
								// or use the default ending
								";";
							
							// if we are ending a returning block
							// add the finish text which returns the result of the
							// block 
							if(last === doubleParen) {
								buff.push(finishTxt)
							}
							// add the remaining content
							buff.push(content, last);
							
							// if we have a block, start counting 
							if(bn === 1 ){
								endStack.push(";")
							}
							break;
						case scanner.eLeft:
							// <%= clean content
							bn = bracketNum(content);
							if( bn ) {
								endStack.push(doubleParen)
							}
							if(quickFunc.test(content)){
								var parts = content.match(quickFunc)
								content = "function(__){var "+parts[1]+"=$(__);"+parts[2]+"}"
							}
							buff.push(insert_cmd, "jQuery.EJS.clean(", content,bn ? startTxt : doubleParen);
							break;
						case scanner.eeLeft:
							// <%== content
							
							// get the number of { minus } 
							bn = bracketNum(content);
							// if we have more {, it means there is a block
							if( bn ){
								// when we return to the same # of { vs } end wiht a doubleParen
								endStack.push(doubleParen)
							} 
							
							buff.push(insert_cmd, "jQuery.EJS.text(", content, 
								// if we have a block
								bn ? 
								// start w/ startTxt "var _v1ew = [])"
								startTxt : 
								// if not, add doubleParent to close push and text
								doubleParen
								);
							break;
						}
						startTag = null;
						empty();
						break;
					case scanner.dRight:
						content += scanner.right;
						break;
					default:
						content += token;
						break;
					}
				}
			})
			if ( content.length > 0 ) {
				// Should be content.dump in Ruby
				buff.push(put_cmd, '"', clean(content) + '");');
			}
			var template = buff.close(),
				out = {
					out: 'try { with(_VIEW) { with (_CONTEXT) {' + template + " "+finishTxt+"}}}catch(e){e.lineNumber=null;throw e;}"
				};
			//use eval instead of creating a function, b/c it is easier to debug
			myEval.call(out, 'this.fn = (function(_CONTEXT,_VIEW){' + out.out + '});\r\n//@ sourceURL="' + name + '.js"');

			return out;
		};


	// A Buffer used to add content to.
	// This is useful for performance and simplifying the 
	// code above.
	// We also can use this so we know line numbers when there
	// is an error.  
	// pre_cmd - code that sets up the buffer
	// post - code that finalizes the buffer
	EJS.Buffer = function( pre_cmd, post ) {
		// the current line we are on
		this.line = [];
		// the combined content added to this buffer
		this.script = [];
		// content at the end of the buffer
		this.post = post;
		// add the pre commands to the first line
		this.push.apply(this, pre_cmd);
	};
	EJS.Buffer.prototype = {
		// add content to this line
		// need to maintain your own semi-colons (for performance)
		push: function() {
			this.line.push.apply(this.line, arguments);
		},
		// starts a new line
		cr: function() {
			this.script.push(this.line.join(''), "\n");
			this.line = [];
		},
		//returns the script too
		close: function() {
			// if we have ending line content, add it to the script
			if ( this.line.length > 0 ) {
				this.script.push(this.line.join(''));
				this.line = [];
			}
			// if we have ending content, add it
			this.post.length && this.push.apply(this, this.post);
			// always end in a ;
			this.script.push(";");
			return this.script.join("");
		}

	};

	/**
	 * @class jQuery.EJS.Helpers
	 * @parent jQuery.EJS
	 * By adding functions to jQuery.EJS.Helpers.prototype, those functions will be available in the 
	 * views.
	 * 
	 * The following helper converts a given string to upper case:
	 * 
	 * 	$.EJS.Helpers.prototype.toUpper = function(params)
	 * 	{
	 * 		return params.toUpperCase();
	 * 	}
	 * 
	 * Use it like this in any EJS template:
	 * 
	 * 	<%= toUpper('javascriptmvc') %>
	 * 
	 * To access the current DOM element return a function that takes the element as a parameter:
	 * 
	 * 	$.EJS.Helpers.prototype.upperHtml = function(params)
	 * 	{
	 * 		return function(el) {
	 * 			$(el).html(params.toUpperCase());
	 * 		}
	 * 	}
	 * 
	 * In your EJS view you can then call the helper on an element tag:
	 * 
	 * 	<div <%= upperHtml('javascriptmvc') %>></div>
	 * 
	 * 
	 * @constructor Creates a view helper.  This function 
	 * is called internally.  You should never call it.
	 * @param {Object} data The data passed to the 
	 * view.  Helpers have access to it through this._data
	 */
	EJS.Helpers = function( data, extras ) {
		this._data = data;
		this._extras = extras;
		extend(this, extras);
	};
	/**
	 * @prototype
	 */
	EJS.Helpers.prototype = {
		/**
		 * Hooks up a jQuery plugin on.
		 * @param {String} name the plugin name
		 */
		plugin: function( name ) {
			var args = $.makeArray(arguments),
				widget = args.shift();
			return function( el ) {
				var jq = $(el);
				jq[widget].apply(jq, args);
			};
		},
		/**
		 * Renders a partial view.  This is deprecated in favor of <code>$.View()</code>.
		 */
		view: function( url, data, helpers ) {
			helpers = helpers || this._extras;
			data = data || this._data;
			return $View(url, data, helpers); //new EJS(options).render(data, helpers);
		}
	};

	// options for steal's build
	$View.register({
		suffix: "ejs",
		//returns a function that renders the view
		script: function( id, src ) {
			return "jQuery.EJS(function(_CONTEXT,_VIEW) { " + new EJS({
				text: src,
				name: id
			}).template.out + " })";
		},
		renderer: function( id, text ) {
			return EJS({
				text: text,
				name: id
			});
		}
	});
})(jQuery);
(function($){
/**
@page jquery.model.validations Validations
@plugin jquery/model/validations
@download  http://jmvcsite.heroku.com/pluginify?plugins[]=jquery/model/validations/validations.js
@test jquery/model/validations/qunit.html
@parent jQuery.Model

In many apps, it's important to validate data before sending it to the server. 
The jquery/model/validations plugin provides validations on models.

## Example

To use validations, you need to call a validate method on the Model class.
The best place to do this is in a Class's init function.

@codestart
$.Model("Contact",{
	init : function(){
		// validates that birthday is in the future
		this.validate("birthday",function(){
			if(this.birthday > new Date){
				return "your birthday needs to be in the past"
			}
		})
	}
},{});
@codeend

## Demo

Click a person's name to update their birthday.  If you put the date
in the future, say the year 2525, it will report back an error.

@demo jquery/model/validations/validations.html
 */

//validations object is by property.  You can have validations that
//span properties, but this way we know which ones to run.
//  proc should return true if there's an error or the error message
var validate = function(attrNames, options, proc) {
	if(!proc){
		proc = options;
		options = {};
	}
	options = options || {};
	attrNames = $.makeArray(attrNames)
	
	if(options.testIf && !options.testIf.call(this)){
		return;
	}
	
	var self = this;
	$.each(attrNames, function(i, attrName) {
		// Call the validate proc function in the instance context
		if(!self.validations[attrName]){
			self.validations[attrName] = [];
		}
		self.validations[attrName].push(function(){
			var res = proc.call(this, this[attrName], attrName);
			return res === undefined ? undefined : (options.message || res);
		})
	});
   
};

$.extend($.Model, {
   /**
    * @function jQuery.Model.static.validate
    * @parent jquery.model.validations
    * Validates each of the specified attributes with the given function.  See [jquery.model.validations validation] for more on validations.
    * @param {Array|String} attrNames Attribute name(s) to to validate
    * @param {Function} validateProc Function used to validate each given attribute. Returns nothing if valid and an error message otherwise. Function is called in the instance context and takes the value to validate.
    * @param {Object} options (optional) Options for the validations.  Valid options include 'message' and 'testIf'.
    */
   validate: validate,
   
   /**
    * @attribute jQuery.Model.static.validationMessages
    * @parent jquery.model.validations
    * The default validation error messages that will be returned by the builtin
    * validation methods. These can be overwritten by assigning new messages
    * to $.Model.validationMessages.&lt;message> in your application setup.
    * 
    * The following messages (with defaults) are available:
    * 
    *  * format - "is invalid"
    *  * inclusion - "is not a valid option (perhaps out of range)"
    *  * lengthShort - "is too short"
    *  * lengthLong - "is too long"
    *  * presence - "can't be empty"
    *  * range - "is out of range"
    * 
    * It is important to steal jquery/model/validations before 
    * overwriting the messages, otherwise the changes will
    * be lost once steal loads it later.
    * 
    * ## Example
    * 
    *     $.Model.validationMessages.format = "is invalid dummy!"
    */
   validationMessages : {
       format      : "is invalid",
       inclusion   : "is not a valid option (perhaps out of range)",
       lengthShort : "is too short",
       lengthLong  : "is too long",
       presence    : "can't be empty",
       range       : "is out of range"
   },

   /**
    * @function jQuery.Model.static.validateFormatOf
    * @parent jquery.model.validations
    * Validates where the values of specified attributes are of the correct form by
    * matching it against the regular expression provided.  See [jquery.model.validations validation] for more on validations.
    * @param {Array|String} attrNames Attribute name(s) to to validate
    * @param {RegExp} regexp Regular expression used to match for validation
    * @param {Object} options (optional) Options for the validations.  Valid options include 'message' and 'testIf'.
    *
    */
   validateFormatOf: function(attrNames, regexp, options) {
      validate.call(this, attrNames, options, function(value) {
         if(  (typeof value != 'undefined' && value != '')
         	&& String(value).match(regexp) == null )
         {
            return this.Class.validationMessages.format;
         }
      });
   },

   /**
    * @function jQuery.Model.static.validateInclusionOf
    * @parent jquery.model.validations
    * Validates whether the values of the specified attributes are available in a particular
    * array.   See [jquery.model.validations validation] for more on validations.
    * @param {Array|String} attrNames Attribute name(s) to to validate
    * @param {Array} inArray Array of options to test for inclusion
    * @param {Object} options (optional) Options for the validations.  Valid options include 'message' and 'testIf'.
    * 
    */
   validateInclusionOf: function(attrNames, inArray, options) {
      validate.call(this, attrNames, options, function(value) {
         if(typeof value == 'undefined')
            return;

         if($.grep(inArray, function(elm) { return (elm == value);}).length == 0)
            return this.Class.validationMessages.inclusion;
      });
   },

   /**
    * @function jQuery.Model.static.validateLengthOf
    * @parent jquery.model.validations
    * Validates that the specified attributes' lengths are in the given range.  See [jquery.model.validations validation] for more on validations.
    * @param {Array|String} attrNames Attribute name(s) to to validate
    * @param {Number} min Minimum length (inclusive)
    * @param {Number} max Maximum length (inclusive)
    * @param {Object} options (optional) Options for the validations.  Valid options include 'message' and 'testIf'.
    *
    */
   validateLengthOf: function(attrNames, min, max, options) {
      validate.call(this, attrNames, options, function(value) {
         if((typeof value == 'undefined' && min > 0) || value.length < min)
            return this.Class.validationMessages.lengthShort + " (min=" + min + ")";
         else if(typeof value != 'undefined' && value.length > max)
            return this.Class.validationMessages.lengthLong + " (max=" + max + ")";
      });
   },

   /**
    * @function jQuery.Model.static.validatePresenceOf
    * @parent jquery.model.validations
    * Validates that the specified attributes are not blank.  See [jquery.model.validations validation] for more on validations.
    * @param {Array|String} attrNames Attribute name(s) to to validate
    * @param {Object} options (optional) Options for the validations.  Valid options include 'message' and 'testIf'.
    *
    */
   validatePresenceOf: function(attrNames, options) {
      validate.call(this, attrNames, options, function(value) {
         if(typeof value == 'undefined' || value == "" || value === null)
            return this.Class.validationMessages.presence;
      });
   },

   /**
    * @function jQuery.Model.static.validateRangeOf
    * @parent jquery.model.validations
    * Validates that the specified attributes are in the given numeric range.  See [jquery.model.validations validation] for more on validations.
    * @param {Array|String} attrNames Attribute name(s) to to validate
    * @param {Number} low Minimum value (inclusive)
    * @param {Number} hi Maximum value (inclusive)
    * @param {Object} options (optional) Options for the validations.  Valid options include 'message' and 'testIf'.
    *
    */
   validateRangeOf: function(attrNames, low, hi, options) {
      validate.call(this, attrNames, options, function(value) {
         if(typeof value != 'undefined' && value < low || value > hi)
            return this.Class.validationMessages.range + " [" + low + "," + hi + "]";
      });
   }
});

})(jQuery);
(function($){

/**
 * @add jQuery.EJS.Helpers.prototype
 */
$.extend($.EJS.Helpers.prototype, {
	/**
	 * Converts response to text.
	 */
	text: function( input, null_text ) {
		if ( input == null || input === undefined ) return null_text || '';
		if ( input instanceof Date ) return input.toDateString();
		if ( input.toString ) return input.toString().replace(/\n/g, '<br />').replace(/''/g, "'");
		return '';
	},
	
	// treyk 06/11/2009 - Pulled from old MVC.Date plugin for now.  Will look for a suitable jQuery Date plugin
	 month_names: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
   
    /**
     * Creates a check box tag
     * @plugin view/helpers
     * @param {Object} name
     * @param {Object} value
     * @param {Object} options
     * @param {Object} checked
     */
	check_box_tag: function( name, value, options, checked ) {
        options = options || {};
        if(checked) options.checked = "checked";
        return this.input_field_tag(name, value, 'checkbox', options);
    },
    /**
     * @plugin view/helpers
     * @param {Object} name
     * @param {Object} value
     * @param {Object} html_options
     */
    date_tag: function( name, value , html_options ) {
	    if(! (value instanceof Date)) value = new Date();
       
		var years = [], months = [], days =[];
		var year = value.getFullYear(), month = value.getMonth(), day = value.getDate();
		for(var y = year - 15; y < year+15 ; y++) years.push({value: y, text: y});
		for(var m = 0; m < 12; m++) months.push({value: (m), text: $View.Helpers.month_names[m]});
		for(var d = 0; d < 31; d++) days.push({value: (d+1), text: (d+1)});
		
		var year_select = this.select_tag(name+'[year]', year, years, {id: name+'[year]'} );
		var month_select = this.select_tag(name+'[month]', month, months, {id: name+'[month]'});
		var day_select = this.select_tag(name+'[day]', day, days, {id: name+'[day]'});
		
	    return year_select+month_select+day_select;
	},
    /**
     * @plugin view/helpers
     * @param {Object} name
     * @param {Object} value
     * @param {Object} html_options
     * @param {Object} interval - specified in minutes
     */
	time_tag: function( name, value, html_options, interval ) {	
		var times = [];
		
		if (interval == null || interval == 0)
			interval = 60;

		for(var h = 0; h < 24 ; h++)
			for(var m = 0; m < 60; m+=interval)
			{
				var time = (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
				times.push({ text: time, value: time });
			}

		return this.select_tag(name, value, times, html_options );
	},
    /**
     * @plugin view/helpers
     * @param {Object} name
     * @param {Object} value
     * @param {Object} html_options
     */
	file_tag: function( name, value, html_options ) {
	    return this.input_field_tag(name+'[file]', value , 'file', html_options);
	},
    /**
     * @plugin view/helpers
     * @param {Object} url_for_options
     * @param {Object} html_options
     */
	form_tag: function( url_for_options, html_options ) {
	    html_options = html_options  || {};
		if(html_options.multipart == true) {
	        html_options.method = 'post';
	        html_options.enctype = 'multipart/form-data';
	    }
		html_options.action = url_for_options;
	    return this.start_tag_for('form', html_options);
	},
    /**
     * @plugin view/helpers
     */
	form_tag_end: function() { return this.tag_end('form'); },
	/**
	 * @plugin view/helpers
	 * @param {Object} name
	 * @param {Object} value
	 * @param {Object} html_options
	 */
    hidden_field_tag: function( name, value, html_options ) { 
	    return this.input_field_tag(name, value, 'hidden', html_options); 
	},
    /**
     * @plugin view/helpers
     * @param {Object} name
     * @param {Object} value
     * @param {Object} inputType
     * @param {Object} html_options
     */
	input_field_tag: function( name, value , inputType, html_options ) {
	    html_options = html_options || {};
	    html_options.id  = html_options.id  || name;
	    html_options.value = value || '';
	    html_options.type = inputType || 'text';
	    html_options.name = name;
	    return this.single_tag_for('input', html_options);
	},
    /**
	 * @plugin view/helpers
	 * @param {Object} text
	 * @param {Object} html_options
	 */
	label_tag: function( text, html_options ) {
		html_options = html_options || {};
		return this.start_tag_for('label', html_options) + text + this.tag_end('label');
	},
	/**
     * @plugin view/helpers
     * @param {Object} name
     * @param {Object} url
     * @param {Object} html_options
     */
	link_to: function( name, url, html_options ) {
	    if(!name) var name = 'null';
	    if(!html_options) var html_options = {};
		this.set_confirm(html_options);
		html_options.href=url;
		return this.start_tag_for('a', html_options)+name+ this.tag_end('a');
	},
    /**
     * @plugin view/helpers
     * @param {Object} condition
     * @param {Object} name
     * @param {Object} url
     * @param {Object} html_options
     */
    link_to_if: function( condition, name, url, html_options ) {
		return this.link_to_unless((!condition), name, url, html_options);
	},
    /**
     * @plugin view/helpers
     * @param {Object} condition
     * @param {Object} name
     * @param {Object} url
     * @param {Object} html_options
     */
    link_to_unless: function( condition, name, url, html_options ) {
        if(condition) return name;
        return this.link_to(name, url, html_options);
    },
    /**
     * @plugin view/helpers
     * @param {Object} html_options
     */
	set_confirm: function( html_options ) {
		if(html_options.confirm){
			html_options.onclick = html_options.onclick || '';
			html_options.onclick = html_options.onclick+
			"; var ret_confirm = confirm(\""+html_options.confirm+"\"); if(!ret_confirm){ return false;} ";
			html_options.confirm = null;
		}
	},
    /**
     * @plugin view/helpers
     * @param {Object} name
     * @param {Object} options
     * @param {Object} html_options
     * @param {Object} post
     */
	submit_link_to: function( name, options, html_options, post ) {
		if(!name) var name = 'null';
	    if(!html_options) html_options = {};
		html_options.type = 'submit';
	    html_options.value = name;
		this.set_confirm(html_options);
		html_options.onclick=html_options.onclick+';window.location="'+options+'"; return false;';
		return this.single_tag_for('input', html_options);
	},
    /**
     * @plugin view/helpers
     * @param {Object} name
     * @param {Object} value
     * @param {Object} html_options
     */
	password_field_tag: function( name, value, html_options ) { return this.input_field_tag(name, value, 'password', html_options); },
	/**
	 * @plugin view/helpers
	 * @param {Object} name
	 * @param {Object} value
	 * @param {Object} choices
	 * @param {Object} html_options
	 */
    select_tag: function( name, value, choices, html_options ) {     
	    html_options = html_options || {};
	    html_options.id  = html_options.id  || name;
	    //html_options.value = value;
		html_options.name = name;
	    var txt = '';
	    txt += this.start_tag_for('select', html_options);
	    for(var i = 0; i < choices.length; i++)
	    {
	        var choice = choices[i];
	        if(typeof choice == 'string') choice = {value: choice};
			if(!choice.text) choice.text = choice.value;
			if(!choice.value) choice.text = choice.text;
			
			var optionOptions = {value: choice.value};
	        if(choice.value == value)
	            optionOptions.selected ='selected';
	        txt += this.start_tag_for('option', optionOptions )+choice.text+this.tag_end('option');
	    }
	    txt += this.tag_end('select');
	    return txt;
	},
    /**
     * @plugin view/helpers
     * @param {Object} tag
     * @param {Object} html_options
     */
	single_tag_for: function( tag, html_options ) { return this.tag(tag, html_options, '/>');},
	/**
	 * @plugin view/helpers
	 * @param {Object} tag
	 * @param {Object} html_options
	 */
    start_tag_for: function( tag, html_options ) { return this.tag(tag, html_options); },
	/**
	 * @plugin view/helpers
	 * @param {Object} name
	 * @param {Object} html_options
	 */
    submit_tag: function( name, html_options ) {  
	    html_options = html_options || {};
	    html_options.type = html_options.type  || 'submit';
	    html_options.value = name || 'Submit';
	    return this.single_tag_for('input', html_options);
	},
    /**
     * @plugin view/helpers
     * @param {Object} tag
     * @param {Object} html_options
     * @param {Object} end
     */
	tag: function( tag, html_options, end ) {
	    end = end || '>';
	    var txt = ' ';
	    for(var attr in html_options) { 
	       if(html_options.hasOwnProperty(attr)){
			   value = html_options[attr] != null ? html_options[attr].toString() : '';

		       if(attr == "Class" || attr == "klass") attr = "class";
		       if( value.indexOf("'") != -1 )
		            txt += attr+'=\"'+value+'\" ' ;
		       else
		            txt += attr+"='"+value+"' " ;
		   }
	    }
	    return '<'+tag+txt+end;
	},
    /**
     * @plugin view/helpers
     * @param {Object} tag
     */
	tag_end: function( tag ) { return '</'+tag+'>'; },
	/**
	 * @plugin view/helpers
	 * @param {Object} name
	 * @param {Object} value
	 * @param {Object} html_options
	 */
    text_area_tag: function( name, value, html_options ) { 
	    html_options = html_options || {};
	    html_options.id  = html_options.id  || name;
	    html_options.name  = html_options.name  || name;
		value = value || '';
	    if(html_options.size) {
	        html_options.cols = html_options.size.split('x')[0];
	        html_options.rows = html_options.size.split('x')[1];
	        delete html_options.size;
	    }
	    html_options.cols = html_options.cols  || 50;
	    html_options.rows = html_options.rows  || 4;
	    return  this.start_tag_for('textarea', html_options)+value+this.tag_end('textarea');
	},
	/**
	 * @plugin view/helpers
	 * @param {Object} name
	 * @param {Object} value
	 * @param {Object} html_options
	 */
    text_field_tag: function( name, value, html_options ) { return this.input_field_tag(name, value, 'text', html_options); },
	/**
	 * @plugin view/helpers
	 * @param {Object} image_location
	 * @param {Object} options
	 */
    img_tag: function( image_location, options ) {
		options = options || {};
		options.src = steal.root.join("resources/images/"+image_location)+'';
		return this.single_tag_for('img', options);
	}
	
});

$.EJS.Helpers.prototype.text_tag = $.EJS.Helpers.prototype.text_area_tag;

// Private variables (in the (function($){})(jQuery) scope)   
var data = {};
var name = 0;

$.EJS.Helpers.link_data = function(store){
	var functionName = name++;
	data[functionName] = store;	
	return "_data='"+functionName+"'";
};
$.EJS.Helpers.get_data = function(el){
	if(!el) return null;
	var dataAt = el.getAttribute('_data');
	if(!dataAt) return null;
	return data[parseInt(dataAt)];
};
$.EJS.Helpers.prototype.link_data = function(store){
	return $.EJS.Helpers.link_data(store)
};
$.EJS.Helpers.prototype.get_data = function(el){
	return $.EJS.Helpers.get_data(el)
};

})(jQuery)