/**
 * Created by Brett on 26/11/13.
 */
(function(exports,document,undefined){
    "use strict";

    var IDENTITY_MATRIX = {
        a: 1.0,
        b: 0.0,
        c: 0.0,
        d: 1.0,
        tx: 0.0,
        ty: 0.0
    };

    function CSSParser() {
        var DEGREES_TO_RADIANS = Math.PI/180;
        var GRADIANS_TO_RADIANS = Math.PI/200;
        var TURNS_TO_RADIANS = 2*Math.PI;

        var REGEXP_ALL_LETTERS_AND_BRACKETS = /[a-zA-Z\(\)]/g;

        var REGEXP_MATRIX = /matrix/;
        var REGEXP_TRANSLATE = /translate[X|Y]?/;
        var REGEXP_SCALE = /scale[X|Y]?/;
        var REGEXP_ROTATE = /rotate/;
        var REGEXP_SKEW = /skew[X|Y]?/;

        var cachedTransformPropertyName = null;

        var isUndefined = function(value) {
            return typeof value === "undefined";
        };

        this.getSupportedTransform = function() {
            if( cachedTransformPropertyName ) { return cachedTransformPropertyName; }
            var transformPropertyName = null;
            var vendorTransformOptions = [
                'transform',
                'WebkitTransform',
                'MozTransform',
                'msTransform',
                'Otransform'
            ];
            var dummy = document.createElement('div');

            vendorTransformOptions.some(function(element, index, array){
                if(!isUndefined(dummy.style[element])) {
                    transformPropertyName = element;
                    return true;
                }
                return false;
            });
            dummy = null;
            cachedTransformPropertyName = transformPropertyName;
            return cachedTransformPropertyName;
        };

        this.cssMatrixToObject = function(cssMatrix) {
            var matrixValues = cssMatrix.replace(/matrix/gi, "").replace(/[ \(\)]+/g,"").split(",");
            return {
                a: parseFloat( matrixValues[0] ),
                b: parseFloat( matrixValues[1] ),
                c: parseFloat( matrixValues[2] ),
                d: parseFloat( matrixValues[3] ),
                tx: parseFloat( matrixValues[4] ),
                ty: parseFloat( matrixValues[5] )
            };
        };

        this.matrixObjectToCSS = function(matrixObject){
            return "matrix("+
                matrixObject.a.toFixed(2)+
                ", "+matrixObject.b.toFixed(2)+
                ", "+matrixObject.c.toFixed(2)+
                ", "+matrixObject.d.toFixed(2)+
                ", "+matrixObject.tx.toFixed(2)+
                ", "+matrixObject.ty.toFixed(2)+")";
        };

        var parseCSSValue = function(value, numericValue, outputFormat, unitIdentifiers, isError, errorMessage){
            var result,
                unitIdentifier,
                item;
            for(unitIdentifier in unitIdentifiers) {
                item = unitIdentifiers[unitIdentifier];
                if(item.check(value)){
                    result = item.parse[outputFormat].call(this, numericValue);
                    break;
                }
            }
            if(isError(result)){ throw errorMessage(value); }
            return result;
        };

        var parseRotateToRadians = function(value){
            var numericValues = value.replace( REGEXP_ALL_LETTERS_AND_BRACKETS, "").replace(/ /g, "").split(",").map(function(item){ return parseFloat(item); });
            return parseCSSValue(value, numericValues[0], "toRadians", angleUnitIdentifiers, isUndefined, function(value){
                return "Angle unit identifier not recognised for value: "+value;
            });
        };

        var parseScaleToXY = function(value){
            var numericValues = value.replace( REGEXP_ALL_LETTERS_AND_BRACKETS, "").replace(/ /g, "").split(",").map(function(item){ return parseFloat(item); });
            if(numericValues.length == 1) {
                if(/scaleX/.exec(value)) {
                    numericValues[1] = 1.0;
                } else if (/scaleY/.exec(value)) {
                    numericValues[1] = numericValues[0];
                    numericValues[0] = 1.0;
                } else {
                    numericValues[1] = numericValues[0];
                }
            }
            return {x: numericValues[0], y: numericValues[1]};
        };

        var parseTranslateToXY = function(value){
            var numericValues = value.replace( REGEXP_ALL_LETTERS_AND_BRACKETS, "").replace(/ /g, "").split(",").map(function(item){ return parseFloat(item); });
            var parsedNumericValues = [];
            for(var i=0;i<numericValues.length;++i) {
                parsedNumericValues[parsedNumericValues.length] = parseCSSValue(value, numericValues[i], "toPixels", lengthUnitIdentifiers, isUndefined, function(value){
                    return "Translate unit identifier not recognised for value: "+value;
                });
            }
            if(parsedNumericValues.length == 1) {
                if(/translateX/.exec(value)) {
                    parsedNumericValues[1] = 0.0;
                } else if(/translateY/.exec(value)) {
                    parsedNumericValues[1] = parsedNumericValues[0];
                    parsedNumericValues[0] = 0.0;
                } else {
                    parsedNumericValues[1] = 0.0;
                }
            }
            return {x: parsedNumericValues[0] , y:  parsedNumericValues[1] };
        };

        var parseSkewToXY = function(value){
            var numericValues = value.replace( REGEXP_ALL_LETTERS_AND_BRACKETS, "").replace(/ /g, "").split(",").map(function(item){ return parseFloat(item); });
            var parsedNumericValues = [];
            for(var i=0;i<numericValues.length;++i) {
                parsedNumericValues[parsedNumericValues.length] = parseCSSValue(value, numericValues[i], "toRadians", angleUnitIdentifiers, isUndefined, function(value){
                  return "Skew unit identifier not recognised for value: "+value;
                });
            }
            if(parsedNumericValues.length == 1)
            {
                if(/skewX/.exec(value)) {
                    parsedNumericValues[1] = 0.0;
                } else if(/skewY/.exec(value)) {
                    parsedNumericValues[1] = parsedNumericValues[0];
                    parsedNumericValues[0] = 0.0;
                } else {
                    parsedNumericValues[1] = 0.0;
                }
            }
            return { x: parsedNumericValues[0], y: parsedNumericValues[1] };
        };

        this.transformFunctions2D = {
            matrix: {
                check: function(testValue){
                    return REGEXP_MATRIX.exec(testValue);
                },
                parse: function(value) {

                },
                transform: function(value, matrix){

                }
            },
            translate: {
                check: function(testValue){
                    return REGEXP_TRANSLATE.exec(testValue);
                },
                parse: function(value){
                    return parseTranslateToXY(value);
                },
                transform: function(value, matrix){
                    matrix.tx += value.x;
                    matrix.ty += value.y;
                    return matrix;
                }
            },
            scale: {
                check: function(testValue){
                    return REGEXP_SCALE.exec(testValue);
                },
                parse: function(value){
                    return parseScaleToXY(value);
                },
                transform: function(value, matrix){
                    matrix.a *= value.x;
                    matrix.b *= value.y;
                    matrix.c *= value.x;
                    matrix.d *= value.y;
                    matrix.tx *= value.x;
                    matrix.ty *= value.y;
                    return matrix;
                }
            },
            rotate: {
               check: function(testValue){
                   return REGEXP_ROTATE.exec(testValue);
               },
               parse: function(value){
                   return parseRotateToRadians(value);
               },
                transform: function(value, matrix) {
                    var cosValue = Math.cos( value );
                    var sinValue = Math.sin( value );
                    var a = matrix.a;
                    var b = matrix.b;
                    var c = matrix.c;
                    var d = matrix.d;
                    var tx = matrix.tx;
                    var ty = matrix.ty;
                    matrix.a = a*cosValue - b*sinValue;
                    matrix.b = a*sinValue + b*cosValue;
                    matrix.c = c*cosValue - d*sinValue;
                    matrix.d = c*sinValue + d*cosValue;
                    matrix.tx = tx*cosValue - ty*sinValue;
                    matrix.ty = tx*sinValue + ty*cosValue;
                    return matrix;
                }
            },
            skew: {
                check: function(testValue){
                    return REGEXP_SKEW.exec(testValue);
                },
                parse: function(value){
                    return parseSkewToXY(value);
                },
                transform: function(value, matrix){
                    matrix.b +=  Math.tan( value.y );
                    matrix.c += Math.tan( value.x );
                    return matrix;
                }
            }
        };

        ///TODO Add 3D transforms
        /**
        this.transformFunctions3D = {

        };
        **/

        var lengthUnitIdentifiers = {
            px: {
                check: function(testValue){
                    return /px/.exec(testValue);
                },
                parse: {
                    toPixels: function(value){
                        return value;
                    }
                }
            }
        };

        var angleUnitIdentifiers = {
            deg:{
                check: function(testValue){
                    return /deg/.exec(testValue);
                },
                parse: {
                    toRadians: function(value){
                        return value * DEGREES_TO_RADIANS;
                    }
                }
            },
            grad:{
                check: function(testValue){
                    return /grad/.exec(testValue);
                },
                parse: {
                    toRadians: function(value){
                        return value * GRADIANS_TO_RADIANS;
                    }
                }
            },
            rad:{
                check: function(testValue){
                    return /(!g)rad/.exec(testValue);
                },
                parse: {
                    toRadians: function(value){
                        return value;
                    }
                }
            },
            turn:{
                check: function(testValue){
                    return /turn/.exec(testValue);
                },
                parse: {
                    toRadians: function(value){
                        return value * TURNS_TO_RADIANS;
                    }
                }
            }
        };
    }

    var AdditiveTransform = {
        _config: {
            selector: ".add-transforms",
            dataAttribute: "data-transforms"
        },
        _cssParser: new CSSParser(),
        configure: function( config ){
            for( var property in this._config ) {
                if( this._config.hasOwnProperty(property) && property in config ) {
                    this._config[property] = config[property];
                }
            }
        },
        transform: function(){
            var allNodesToTransform = document.querySelectorAll( this._config.selector);

            var i = 0,
                len = allNodesToTransform.length,
                nodeToTransform;
            for(i;i<len;++i){
                nodeToTransform = allNodesToTransform[i];
                this.transformNode( nodeToTransform );
            }
        },
        transformNode: function(node){
            var transformationSelectors = this.getNodeSelectors(node),
                nodeState = this.getNodeInitialState(node);
            var i = 0,
                len = transformationSelectors.length,
                transformationSelector;
            for(i;i<len;++i){
                transformationSelector = transformationSelectors[i];
                nodeState = this.addTransform(node,nodeState,transformationSelector);
            }
        },
        getNodeSelectors: function(node){
            return node.getAttribute(this._config.dataAttribute).replace(/ /g, "").split(",");
        },
        getNodeInitialState: function(node){
            var initialStateCSS = getComputedStyle(node, null)[this._cssParser.getSupportedTransform()];
            return (initialStateCSS === "none") ?
                IDENTITY_MATRIX :
                this._cssParser.cssMatrixToObject( initialStateCSS );
        },
        addTransform: function(node,nodeState,selector){
            var cssTransformationRules = this.getCSSRulesFor( selector );
            var i = 0,
                len = cssTransformationRules.length,
                rule;
            for(i; i<len; ++i){
                rule = cssTransformationRules[i];
                if(/transform/.exec(rule.property)){
                    var matrix = this.transformMatrix( nodeState, rule.value );
                    node.style[this._cssParser.getSupportedTransform()] = this._cssParser.matrixObjectToCSS(matrix);
                    nodeState = matrix;
                }
            }
            return nodeState;
        },
        getCSSRulesFor: function(selector) {
            var sheets = document.styleSheets;
            var cssRules = [];
            for (var i = 0; i<sheets.length; ++i) {
                var sheet = sheets[i];
                if( !sheet.cssRules ) { continue; }
                for (var j = 0; j < sheet.cssRules.length; ++j ) {
                    var rule = sheet.cssRules[j];
                    if (rule.selectorText && rule.selectorText.split(',').indexOf(selector) !== -1) {
                        var styles = rule.style;
                        for( var k = 0; k<styles.length; ++k ) {
                            var style = styles[k];
                            cssRules.push( {
                                property: style,
                                value: styles[style]
                            } );
                        }
                    }
                }
            }
            return cssRules;
        },
        transformMatrix: function( source, transform ) {
            var values = transform.split(") "); // split into array if multiple values
            var matrix = Object.create( source );
            var i = 0,
                len = values.length,
                value;
            for (i; i<len; ++i) {
                value = values[i];

                var transformFunction,
                    transformFunctionName;
                for(transformFunctionName in this._cssParser.transformFunctions2D)
                {
                    transformFunction = this._cssParser.transformFunctions2D[transformFunctionName];
                    if(transformFunction.check(value)){
                        var transformValue = transformFunction.parse(value);
                        matrix = transformFunction.transform(transformValue, matrix);
                        break;
                    }
                }
            }
            return matrix;
        }
    };

    exports["AdditiveTransform"] = exports["AdditiveTransform"] || AdditiveTransform;
})(window,document);