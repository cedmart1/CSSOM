//.CommonJS
var CSSOM = {};
///CommonJS


/**
 * @constructor
 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration
 */
 
//modifew
// blabla
var Proxy = exports.Proxy = require("node-proxy");
   // evaluateStyleAttribute=require('jsdom').style.evaluateStyleAttribute;
 
Function.prototype.De=function(obj) { var f=this;return function() {return f.apply(obj,arguments); }};

//taken from domtohtml.js
 
var singleTags = {
    area: 1,
    base: 1,
    basefont: 1,
    br: 1,
    col: 1,
    frame: 1,
    hr: 1,
    img: 1,
    input: 1,
    isindex: 1,
    link: 1,
    meta: 1,
    param: 1,
    embed: 1
};

var uncanon = function(str, letter) {
    return '-' + letter.toLowerCase();
};

createProxy = function(handlers) {

      return Proxy.create({
	  
	  //handlers is the CSSStyleDeclaration
	  
	  get: function (receiver, name){
	  if (name=='cssText') { //modifew
	  //console.log('cssText');
	  var properties = [];
		for (var i=0, length=handlers.length; i < length; ++i) {
			var name = handlers[i];
			if (name!='__starts') //remove __starts property used in cssom parser
			{
			var value = handlers.getPropertyValue(name);
			var priority = handlers.getPropertyPriority(name);
			if (priority) {
				priority = " !" + priority;
			}
			properties[i] = name + ": " + value + priority + ";";
			}
		}
		return properties.join(" ")
		
		//modif ew
		}
		else if (!(name in handlers)) {
            return false;
          } else  return (handlers[name]|| false);
        },
	  
        set: function (receiver, name, val){
		  if (name=='prototype') {
		  // Case <Tag style="xxx">
		  // style processed as dom argument
		  // add style medthods to handlers
		  // pass handlers to call the methods
		  
		  for (var n in val) {

		  if (typeof(val[n])=="function")
		  {
		  handlers[n]=val[n].De(handlers);
		  }
		  }
		  } else {
		  // Case node.style.attribute='xxx' in js
		  if (name!='cssText')
		  {
		  try {	
		  handlers.setProperty(name.replace(/([A-Z])/g, uncanon),val);	//modifew
		  } catch(ee) {};
		  } else {
		  CSSOM.CSSStyleDeclaration.evaluateStyleAttribute.call(handlers,val);
		  }
		  }
		  
          return true;
        }
      });
    }

CSSOM.CSSStyleDeclaration=function() {

var tmp=createProxy({length:0,_importants:{}});

 
//CSSOM.CSSStyleDeclaration = function CSSStyleDeclaration(){
//	this.length = 0;

	// NON-STANDARD
	//this._importants = {};
//};


tmp.prototype = {

	constructor: CSSOM.CSSStyleDeclaration,

	/**
	 *
	 * @param {string} name
	 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration-getPropertyValue
	 * @return {string} the value of the property if it has been explicitly set for this declaration block. 
	 * Returns the empty string if the property has not been set.
	 */
	getPropertyValue: function(name) {
	return this[name] || ""
	},

	/**
	 *
	 * @param {string} name
	 * @param {string} value
	 * @param {string} [priority=null] "important" or null
	 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration-setProperty
	 */
	setProperty: function(name, value, priority) {
	//modifew
	if (typeof(priority)=="undefined") {priority='';};
	
		if (this[name]) {
			// Property already exist. Overwrite it.
			var index = Array.prototype.indexOf.call(this, name);
			if (index < 0) {
				this[this.length] = name;
				this.length++;
			}
		} else {
			// New property.
			this[this.length] = name;
			this.length++;
		}
		this[name] = value;
		this._importants[name] = priority;
		console.log('setProperty '+name+' '+value+' '+priority);
	},

	/**
	 *
	 * @param {string} name
	 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration-removeProperty
	 * @return {string} the value of the property if it has been explicitly set for this declaration block.
	 * Returns the empty string if the property has not been set or the property name does not correspond to a known CSS property.
	 */
	removeProperty: function(name) {
		if (!(name in this)) {
			return ""
		}
		var index = Array.prototype.indexOf.call(this, name);
		if (index < 0) {
			return ""
		}
		var prevValue = this[name];
		this[name] = "";

		// That's what WebKit and Opera do
		Array.prototype.splice.call(this, index, 1);

		// That's what Firefox does
		//this[index] = ""

		return prevValue
	},

	getPropertyCSSValue: function() {
		//FIXME
	},

	/**
	 *
	 * @param {String} name
	 */
	getPropertyPriority: function(name) {
		return this._importants[name] || "";
	},


	/**
	 *   element.style.overflow = "auto"
	 *   element.style.getPropertyShorthand("overflow-x")
	 *   -> "overflow"
	 */
	getPropertyShorthand: function() {
		//FIXME
	},

	isPropertyImplicit: function() {
		//FIXME
	},

	// Doesn't work in IE < 9
	//get cssText(){
	//	var properties = [];
	//	for (var i=0, length=this.length; i < length; ++i) {
	//		var name = this[i];
	//		var value = this.getPropertyValue(name);
	//		var priority = this.getPropertyPriority(name);
	//		if (priority) {
	//			priority = " !" + priority;
	//		}
	//		properties[i] = name + ": " + value + priority + ";";
	//	}
	//	return properties.join(" ")
	//}

};

return tmp;

};


//.CommonJS
exports.CSSStyleDeclaration = CSSOM.CSSStyleDeclaration;
///CommonJS
