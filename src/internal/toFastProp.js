'use strict';

let fastProto = null;
//%HasFastProperties
// --allow-natives-syntax to check whether an object has fast properties.
function FastObject(o) {
	if (fastProto !== null && typeof fastProto.property) {
		const result = fastProto;
		fastProto = FastObject.prototype = null;
		return result;
	}
	fastProto = FastObject.prototype = o == null ? Object.create(null) : o;
	return new FastObject;
}

// Initialize the inline property cache of FastObject
FastObject();

export function toFastProperties(o) {
	return FastObject(o);
};