//.CommonJS
var CSSOM = {};
///CommonJS


/**
 * @constructor
 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration
 */
 
//modifew
var Proxy = exports.Proxy = require("node-proxy");

var resourceLoader = require("jsdom").dom.level3.core.resourceLoader;

var im		  = require('imagemagick');
//modifew
 
Function.prototype.De=function(obj,_name,_node) {
var f=this;
if (typeof(_name)=="undefined")
{
	return function() {
	return f.apply(obj,arguments);
}
} else {
//wrap setProperty to access node element when it exists
	return function() {
	if (_name=='setProperty') {
		var args = Array.prototype.slice.call(arguments);
		args.unshift(_node);
		return f.apply(obj,args);
		} else {
		return f.apply(obj,arguments);
		}
	}
}
};


//taken from domtohtml.js
 
var uncanon = function(str, letter) {
    return '-' + letter.toLowerCase();
};

createProxy = function(handlers,_node) {

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
		  handlers[n]=val[n].De(handlers,n,_node);
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

var tmp=createProxy({length:0,_importants:{}},this);

 
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
	setProperty: function(_node,name, value, priority) {
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
		//console.log('setProperty '+name+' '+value+' '+priority);
		//modif ew
		//if CSSStyleDeclaration called from an element node
		if (typeof(_node.nodeName)!="undefined")
		{
		//console.log(_node.nodeName+'setpropnode '+name);
		if ((name=='background-image')&&(!this['background-repeat'])&&(this[name]!='none'))
		{
			var fn=function(output) {
			//console.log(output);
				var tmp=output.split('x');
				this.setProperty('width',tmp[0]);
				this.setProperty('height',tmp[1]);
			};
		
			var callback=fn.De(this);
		
			var z_b = new RegExp("url\\((.[^)]*?)\\)","gi");
			var href =  z_b.exec(this[name])[1].replace(/'|"/g,'');
		
			//if no size defined for image,load it and set real width height of image
			if (!((_node.getAttribute('width')&&(_node.getAttribute('height')))||(this.getPropertyValue('width')&&(this.getPropertyValue('height')))))
			{
				//console.log('load bgimage'+href);
				_node._bgimage=true;
				resourceLoader.load(_node, href, callback);
			}
	//modif ew
		}
	  }
   
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
