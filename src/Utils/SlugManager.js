class SlugManager {
	constructor( {
		forbiddenChars = /[\\\/\*\:\?\<\>\|"']/g,	// default forbidden chars
		controlCharPattern = /[\u0000-\u001F]/		// default control chars
	} = {} ) {
		this.forbiddenChars     = forbiddenChars;
		this.controlCharPattern = controlCharPattern;
	}

	/** Sanitize slug by removing forbidden characters */
	sanitize( slug ) {
		if( !slug ) return "";
		return slug.replace( this.forbiddenChars, "" );
	}

	/** Validate slug (non-empty, no control chars) */
	isValid( slug ) {
		if( !slug || !slug.trim() ) return false;
		if( this.controlCharPattern.test( slug ) ) return false;
		return true;
	}

	/** Generate slug from selector text */
	resolveSlug( selector, override ) {
		return override || this.makeSlug( selector );
	}

	/** Generate slug from selector text */
	makeSlug( selector ) {
		if( !selector ) return "";

		return selector
			.replace( /[^a-zA-Z0-9]+/g, "_" )	// collapse non-alphanumerics
			.replace( /^_+|_+$/g, "" )				// trim underscores
			.toLowerCase();
	}
}
