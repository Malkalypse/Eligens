// eligens/src/content/classes/SelectorBuilder.js

/** Build CSS selectors for DOM elements */
class SelectorBuilder {

	/** Build a CSS selector for a single DOM node
	 * @param {HTMLElement} element - The DOM element to build selector for
	 * @returns {string} CSS selector string
	 */
	static buildSelectorSegment( element ) {
		return element.id
			? this._getIdSelector( element )					// use id if present
			: this._buildTagClassSelector( element );	// otherwise use tag and classes
	}
	static _getIdSelector(element) {
		return `#${element.id}`;
	}
	static _buildTagClassSelector(element) {
		const tag			= DomUtils.getTagName( element);	// start with tag
		const classes	= [...element.classList];					// add classes
		return classes.length
			? `${tag}.${classes.join( '.' )}`
			: tag;
	}

	/** Build full selector chain from element to root
	 * @param {HTMLElement} element - The starting DOM element
	 * @returns {Array<HTMLElement>} Array of elements from root to target
	 */
	static buildSelectorChain(element) {
		const selectorChain = [];
		let el = element;
		
		while( el ) {
			selectorChain.push( el );
			el = el.parentElement;
		}
		
		selectorChain.reverse();
		return selectorChain;
	}
}

// Export for use in other modules
if( typeof module !== 'undefined' && module.exports ) {
	module.exports = SelectorBuilder;
}
