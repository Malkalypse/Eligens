class DomUtils {

  // #region Basic Lookup
	static byId( id ) {
		return document.getElementById( id );
	}

	static getAll( selector ) {
		return [...document.querySelectorAll( selector )];
	}

	static getAllSafe( selector ) {
		try {
			return this.getAll( selector );
		} catch {
			return []; // fail gracefully for invalid selectors
		}
	}

	static exists( id ) {
		return !!document.getElementById( id );
	}
  // #endregion Basic Lookup

  // #region Element Inspection
	static getTagName( el ) {
		return el.tagName.toLowerCase();
	}
  // #endregion Element Inspection

  // #region DOM Manipulation
	static create(
    className = null, id = null,
    textContent = null, tag = 'div'
  ) {
	  const el = document.createElement( tag );

	  if( className ) el.className = className;
	  if( id ) el.id = id;
	  if( textContent ) el.textContent = textContent;

	  return el;
	}

	static removeAll( selector) {
		this.getAll( selector ).forEach( el => el.remove() );
	}
  // #endregion DOM Manipulation
}
