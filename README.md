# Key Map

A quick and easy key mapping plugin for jQuery

# Loading

Load the [latest version](https://github.com/steveukx/key-map.js/tree/master/dist) of the plugin using require or
download a copy and add as a script tag.

When loading with require, jQuery should be available as a dependency in the require config with the name `jquery`.

    // set the config to load jQuery with the name "jquery" and export the jQuery global once loaded
    requirejs.config({
      shim: { jquery: { exports: 'jQuery' } },
      paths: {
         jquery: '//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min'
      }
    });

    // then boot up require either with the local path to key map at the start, or just add as a dependency in any
    // file where it will specifically be required.
    requirejs(['local/path-to/key-map', 'your-application-main']);

To use script tags, you just need to ensure that jQuery is loaded first:

    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js"></script>
    <script src="local/path-to/key-map.js"></script>

# How to use

Use the key map as any other plugin. To map a key sequence, use:

    jQuery("selector").keyMap({
       "A B C": function() {
          // to be called when the user preses the keys A, B then C in sequence.
       },
       "SHIFT-A CTRL-B SHIFT-CTRL-C": function() {
          // modifier keys are prepended to the key you are listening to
       }
    });

To listen for keyboard events on any element, use `jQuery.keyMap()` without supplying a selector.

Adding listeners can be done in any of the following ways:

    var sequence = "A B";
    var handler = function() {};
    var handlerScope = {some: "object"};

    jQuery("selector").keyMap(sequence, handler); // handler will be called with this as the element being bound to
    jQuery("selector").keyMap(sequence, handler, handlerScope); // handler will be called with this as handlerScope object
    jQuery("selector").keyMap({
      "A B": handler // handler will be called with this as the element being bound to
    });
    jQuery("selector").keyMap().on(sequence, handler); // handler called in global scope
    jQuery("selector").keyMap().on(sequence, handler, handlerScope); // handler called in handlerScope scope

Removing a handler is achieved by:

    jQuery("selector").keyMap().off();          // removes all handlers
    jQuery("selector").keyMap().off(sequence);  // removes all handlers for the sequence
    jQuery("selector").keyMap().off(handler);   // removes all sequences where handler is the function handler
    jQuery("selector").keyMap().off(handlerScope); // removes all sequences where handlerScope is the scope of the handler

or any combination where the sequence is optional and can be followed by optionally the handler function
and optionally the scope.



