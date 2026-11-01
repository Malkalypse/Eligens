// eligens/src/content/classes/Highlighter.js

/** Highlight elements that match selectors */
class Highlighter {

	/** Clear all highlight overlays */
	static clearHighlights() {
		DomUtils.removeAll( '.selector-overlay' );
	}

	/** Highlight all elements matching a selector */
	static highlightMatches( selector ) {
		this.clearHighlights();

		// Skip invalid selectors caused by empty segments
		if( !selector || selector.includes( "(space)" ) ) {
			console.warn( "Skipping invalid selector:", selector );
			return;
		}

		const matches = DomUtils.getAllSafe( selector );
		if( !matches.length ) return;

		matches.forEach( el => this.createOverlayFor( el ) );
	}

  /** Create an overlay for an element */
	static createOverlayFor( el ) {
		const rect		= el.getBoundingClientRect();
		const overlay	= DomUtils.create( "selector-overlay" );

		overlay.style.top			= rect.top + window.scrollY + "px";
		overlay.style.left		= rect.left + window.scrollX + "px";
		overlay.style.width		= rect.width + "px";
		overlay.style.height	= rect.height + "px";

		document.body.appendChild( overlay );
	}
}

// Export for use in other modules
if( typeof module !== 'undefined' && module.exports ) {
	module.exports = Highlighter;
}
