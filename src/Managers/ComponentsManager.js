// eligens/src/content/managers/ComponentsManager.js

/** Manages structural components for segments */
class ComponentsManager {
	constructor( unit, target ) {
		this.unit   = unit;
		this.target = target;

		this.ensureState();
	}

	/** Create the segment state if it doesn't exist
   * @param {HTMLElement} unit    - The chain bar segment unit
   * @param {HTMLElement} target  - The target to which the segment unit refers
   */
	ensureState() {
		if( !this.unit.segmentState ) {
			const classes = [...this.target.classList];

			this.unit.segmentState = {
				tagActive:      true,
				classStates:    Object.fromEntries( classes.map( c => [c, true] ) ),
				pseudoclasses:  []
			};
		}
	}

  /** Get segment state */
	get state() {
		return this.unit.segmentState;
	}

  /** Toggle tag component */
	toggleTag() {
		this.state.tagActive = !this.state.tagActive;
		this.apply();
	}

  /** Toggle class component */
	toggleClass( cls ) {
		this.state.classStates[cls] = !this.state.classStates[cls];
		this.apply();
	}

  /** Toggle pseudoclass component */
	togglePseudoclass( pseudo ) {
		if( typeof pseudo !== "string" ) {
			console.warn( "togglePseudoclass received non-string:", pseudo );
			return;
		}

		const idx = this.state.pseudoclasses.indexOf( pseudo );

		if (idx === -1) this.state.pseudoclasses.push( pseudo );
		else this.state.pseudoclasses.splice( idx, 1 );

		this.apply();
	}

  /** Apply segment state */
	apply() {
		const string  = this.buildString();                             // build segment string
		const segment = this.unit.querySelector( ".selector-segment" ); // get segment element

		segment.textContent = string || "(space)";  // get segment text

    // Handle empty state
		const isEmpty = !string;
		this.unit.classList.toggle( "segment-empty", isEmpty );
		this.unit.classList.toggle( "dimmed", isEmpty );

		//SelectorChainBar.updateCombinators(); // update combinator visibility
    EligensInspector.chainBar.updateCombinators();
	}

  /** Create segment string */
	buildString() {
		const state = this.state;

    // Get active tag
		const tag = state.tagActive
			? DomUtils.getTagName( this.target )
			: "";

    // Collect active classes
		const classes = Object.entries( state.classStates )
			.filter( ( [cls, active] ) => active )
			.map( ( [cls] ) => cls );

		let string = "";
		if( !tag && classes.length === 0 ) return "";   // no tag and no classes: return empty string

		else if( !tag) string = classes.join( "." );    // no tag: collect classes
		else if( classes.length === 0 ) string = tag;   // no classes: get tag
		else string = `${tag}.${classes.join( "." )}`;  // tag and classes: concatenate

    // Append pseudoclasses
		if( state.pseudoclasses.length ) {
			string += state.pseudoclasses.join( "" );
		}

		return string;
	}
}
