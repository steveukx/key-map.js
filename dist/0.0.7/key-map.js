(function (root, factory) {
   if (typeof define === "function" && define.amd) {
      define(['jquery'], factory);
   }
   else {
      factory(window.jQuery);
   }
}(this, function(jQuery) {

   var GETTER = 0;
   var EVENTS = 1;
   var CONFIG = 2;

   var TERMINAL_EVENT = 0;
   var ACTIVE_EVENT = 1;
   var FUTURE_EVENT = 2;

   var KeyUpSpecials = {
      27: "ESCAPE",
      8:  "BKSPACE",
      46: "DELETE",
      37: "LEFT",
      38: "UP",
      39: "RIGHT",
      40: "DOWN"
   };

   var KeyPressSpecials = {
      13: "ENTER"
   };

   var KeyPressFilter = /[A-Z0-9 \/\\\-,\.;:]/i;

   function KeyMap(element) {
      this._combos = {};
      this._combo = [];
      this._isDoc = element.nodeType === 9;

      jQuery(element)
               .on('keypress', (this._isDoc ? this._onDocumentKeyPress : this._onKeyPress).bind(this))
               .on('keyup', this._onKeyUp.bind(this));
   }

   Object.defineProperty(KeyMap.prototype, 'duration', {
      get: function() { return this._duration; },
      set: function(value) { if(typeof value == 'number' && value >= 1) this._duration = value; }
   });

   /**
    * @type {Number}
    */
   KeyMap.prototype._duration = 400;

   KeyMap.prototype._getEventType = function() {
      var current = this._combo.join(' ');
      var eventType = TERMINAL_EVENT;

      for(var combo in this._combos) {
         if(combo.indexOf(current) === 0) {
            eventType = combo === current ? ACTIVE_EVENT : FUTURE_EVENT;
         }
         if(eventType === FUTURE_EVENT) {
            break;
         }
      }
      return eventType;
   };

   KeyMap.prototype._addStep = function(step, e) {
      var shift = e.shiftKey;
      var ctrl = e.ctrlKey;

      this._combo.push(((shift ? 'SHIFT-' : '') + (ctrl ? 'CTRL-' : '') + step).toLowerCase());

      clearTimeout(this._timeoutId);

      var isActiveEvent = this._getEventType() === ACTIVE_EVENT;
      if(isActiveEvent && !this._isDoc) {
         this._trigger(e);
      }
      else {
         this._timeoutId = setTimeout(this._trigger.bind(this), isActiveEvent ? 1 : this._duration);
      }
   };

   KeyMap.prototype._onDocumentKeyPress = function(e) {
      if(' INPUT SELECT TEXTAREA '.indexOf(' ' + e.currentTarget.nodeName + ' ') < 0) {
         this._onKeyPress(e);
      }
   };

   KeyMap.prototype._onKeyPress = function(e) {
      var char = KeyPressSpecials[e.which] || String.fromCharCode(e.which);
      if(KeyPressFilter.test(char)) {
         this._addStep(char, e);
      }
   };

   KeyMap.prototype._onKeyUp = function(e) {
      var keyUpSpecial = KeyUpSpecials[e.which];
      if(keyUpSpecial) {
         this._addStep(keyUpSpecial, e);
      }
   };

   KeyMap.prototype._trigger = function(evt) {
      clearTimeout(this._timeoutId);
      var combo = this._combo.splice(0).join(' ');
      var handlers = this._combos[combo];

      for(var i = 0, l = handlers && handlers.length; i < l; i++) {
         try {
            handlers[i][0].call(handlers[i][1], evt);
         }
         catch (e) {
            typeof console !== "undefined" && console.error(e);
         }
      }
   };

   KeyMap.prototype.one = function(combo, handler, scope) {
      return this.on(combo, handler, scope, true);
   };

   KeyMap.prototype.on = function(_combo, handler, scope, once) {
      var combo = _combo.toLowerCase();
      (this._combos[combo] = this._combos[combo] || []).push([handler, scope, !!once]);
      return this;
   };

   KeyMap.prototype.off = function(search, qualifierA, qualifierB) {
      var searchType = typeof search;

      if(searchType === 'undefined') {
         this._combos = {};
      }
      else if(searchType === 'string') {
         if(qualifierA === undefined) {
            delete this._combos[search.toUpperCase()];
         }
         else {
            var combos = this._combos[search.toUpperCase()];
            var searchIndex = typeof qualifierA !== 'function';

            for(var i = combos.length - 1; i >= 0; i--) {
               if(combos[i][+searchIndex] === qualifierA && (!qualifierB || qualifierB === combos[i][1])) {
                  combos.splice(i, 1);
               }
            }
         }
      }
      else {
         Object.keys(this._combos).forEach(function(combo) {
            this.off(combo, search, qualifierA);
         }, this);
      }

      return this;
   };

   function keyMapForElement(el) {
      var keyMap = jQuery.data(el, 'keyMap');
      if(!keyMap) {
         jQuery.data(el, 'keyMap', keyMap = new KeyMap(el));
      }
      return keyMap;
   }

   function applyEvents(el, config) {
      var keyMap = keyMapForElement(el);
      for(var event in config) {
         if(config.hasOwnProperty(event)) {
            keyMap.on(event.toUpperCase(), config[event], el);
         }
      }
   }

   var jQueryKeyMap = function(a, b, c) {

      var variant = arguments.length;

      if(variant == GETTER) {
         return this.length ? keyMapForElement(this[0]) : null;
      }
      else if(variant == EVENTS) {
         this.each(function(index, el) {
            applyEvents(el, a);
         });
      }
      else if(typeof b == 'function') {
         this.each(function(index, el) {
            keyMapForElement(el).on(a, b, c || el);
         });
      }
      else if(variant == CONFIG) {
         this.each(function(index, el) {
            var keyMap = keyMapForElement(el);
            if(keyMap['set' + a]) {
               keyMap['set' + a](b);
            }
            else if(keyMap[a] !== undefined) {
               keyMap[a] = b;
            }
         });
      }

      return this;
   };

   /**
    * Adds key map functionality to the current selection.
    *
    * @param {Object|String} [config] When an object, treated as a map of events
    * @param {Function|Object|String} [handler] When a function, treated as the handler for the event named in argument[0]
    * @param {Object} [scope] When an object, treated as the scope for the handler for in argument[1]
    *
    * @function
    * @name jQuery#keyMap
    */
   jQuery.fn.keyMap = jQueryKeyMap;

   /**
    * Adds key map functionality to the document as a whole
    */
   jQuery.keyMap = function(a, b, c) {
      return jQueryKeyMap.apply(jQuery(document), arguments);
   }

}));
