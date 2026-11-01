// eligens/src/content/managers/PseudoclassManager.js

/** Manages structural pseudoclasses for DOM elements */
class PseudoclassManager {

	// #region Structural Pseudoclasses
	/** Get structural pseudoclasses for an element
	 * @param {HTMLElement} element - The DOM element
	 * @returns {Array<string>} Array of pseudoclass strings
	 */
	static getStructuralPseudoclasses(element) {
		const parent = element.parentElement;
		if( !parent ) return [];

		return [
			...this._getChildAxisPseudoclasses( element, parent ),
			...this._getTypeAxisPseudoclasses( element, parent )
		];
	}

  /** Get pseudoclasses based on element position */
	static _getChildAxisPseudoclasses( element, parent ) {
		const children   = this._getChildren( parent );
		const nthChild   = children.indexOf( element ) + 1;
		const childCount = children.length;

		const items = [];

		if( nthChild === childCount ) {
			items.push( ':last-child' );
		}

		items.push( `:nth-child(${nthChild})` );

		return items;
	}

  /** Get pseudoclasses based on element type */
	static _getTypeAxisPseudoclasses( element, parent ) {
		const children   = this._getChildren( parent );
		const sameType   = children.filter( c => c.tagName === element.tagName );
		const nthOfType  = sameType.indexOf( element ) + 1;
		const typeCount  = sameType.length;

		const items = [];

    // Add nth-of-type pseudoclass
		items.push( `:nth-of-type(${nthOfType})` );

    // Add last-of-type pseudoclass
		if( nthOfType === typeCount ) {
			items.push( ':last-of-type' );
		}

		return items;
	}
	// #endregion Structural Pseudoclasses

	// #region Functional Pseudoclasses
	static getValidIsOptions( el, mainSelector ) {
		return this.getValidOptions( el, mainSelector, 'is' );
	}

	static getValidHasOptions( el, mainSelector ) {
		return this.getValidOptions( el, mainSelector, 'has' );
	}

	static getValidNotOptions( el, mainSelector ) {
		return this.getValidOptions( el, mainSelector, 'not' );
	}

	/** Get valid options for pseudoclasses
	 * @param {HTMLElement}	el						- The DOM element
	 * @param {string}			mainSelector	- The main selector
	 * @param {string}			type					- The type of pseudoclass
	 * @returns {Array<string>} Array of valid options
	 */
	static getValidOptions( el, mainSelector, type ) {
		const candidates  = new Set();
		const peers       = DomUtils.getAllSafe( mainSelector ); // elements matching main selector

		// Collect candidates
		const addCandidatesFromElement = ( element ) => {

			// Add tag if it exists
			if( element.tagName ) {
				candidates.add( DomUtils.getTagName( element ) );
			}

			// Add classes if they exist
			element.classList.forEach(
				cls => candidates.add( `.${cls}` )
			);

			// Add id if it exists
			if( element.id ) {
				candidates.add( `#${element.id}` );
			}

			// Add attributes if they exist
			for( const attr of element.attributes ) {
				candidates.add( `[${attr.name}]` );
			}
		};

		// Add structural peer candidates
		const addStructuralCandidates = ( element ) => {
			const parent = element.parentElement;

			// Collect sibling pseudoclasses
			if( parent ) {
				const children	= this._getChildren( parent );
				const index			= children.indexOf( element ) + 1;
				candidates.add( `:nth-child(${index})` );

				const sameType	= children.filter( c => c.tagName === element.tagName );
				const typeIndex	= sameType.indexOf( element ) + 1;
				candidates.add( `:nth-of-type(${typeIndex})` );
			}
		};

		// Filter out options that don't distinguish peers
		const filterOptions = ( isNegation = false ) => {

			// Only keep selectors that distinguish peers from each other
			return [...candidates].filter(sel => { 
				let matches			= 0;
				let nonMatches	= 0;

				peers.forEach( peer => {
					try {

						// Check if peer matches selector
						const condition = isNegation
							? !peer.matches( sel )
							: peer.matches( sel );

						// Count matches
						if( condition ) matches++;
						else nonMatches++;
					} catch {}
				} );

				return matches > 0 && nonMatches > 0;
			} );
		};

		// Define collection strategies for :is(), :has(), and :not()
		const strategies = {
			is: {
				collect() {
					addCandidatesFromElement( el );
					addStructuralCandidates( el );
				},
				negation: false,
				wrap( sel ) {
					return `:is(${sel})`;
				}
			},

			has: {
				collect() {
					const descendants = el.querySelectorAll( "*" );
					descendants.forEach( node => addCandidatesFromElement( node ) );
				},
				negation: false,
				wrap( sel ) {
					return `:has(${sel})`;
				}
			},

			not: {
				collect() {
					peers.forEach( peer => {
						if( peer === el ) return;
						addCandidatesFromElement( peer );
						addStructuralCandidates( peer );
					} );
				},
				negation: true,
				wrap( sel ) {
					return `:not(${sel})`;
				}
			}
		};

		const strategy = strategies[type];	// get strategy
		if( !strategy ) return [];					// return empty array if no strategy found

		strategy.collect(); // collect candidates

		const options = filterOptions( strategy.negation );	// filter out non-distinguishing options
		return options.map( strategy.wrap );								// return wrapped options
	}
	// #endregion Functional Pseudoclasses

	static _getChildren( parent ) {
		return [...parent.children];
	}

	/** Apply pseudoclass to a selector unit
	 * @param {HTMLElement}	unit				- The selector unit element
	 * @param {string}			pseudoclass	- The pseudoclass to apply
	 */
	static applyPseudoclassToUnit( unit, pseudoclass ) {
		const segment = unit.querySelector( '.selector-segment' );

		// If the segment doesn't have a base selector, create one from the text
		const ensureBaseSelector = seg => {
			if( !seg.dataset.baseSelector ) {
				seg.dataset.baseSelector = seg.textContent;
			}
		};

		const hasPseudo			= seg => seg.textContent.includes( pseudoclass );
		const removePseudo	= seg => seg.textContent = seg.textContent.replace( pseudoclass, '' );
		const addPseudo			= seg => seg.textContent += pseudoclass;

		ensureBaseSelector( segment );

		// Toggle the pseudoclass
		if( hasPseudo( segment ) ) {
			removePseudo( segment );
		} else {
			addPseudo( segment );
		}
	}

	/** Clear all pseudoclasses from a selector unit */
	static clearPseudoclasses( unit ) {
		const segment = unit.querySelector( '.selector-segment' );

		if( segment.dataset.baseSelector ) {
			segment.textContent = segment.dataset.baseSelector;
		}
	}
}

// Export for use in other modules
if( typeof module !== 'undefined' && module.exports) {
	module.exports = PseudoclassManager;
}