// eligens/src/content/managers/PanelStateManager.js

/** Manages storage panel state */
class PanelStateManager {
	constructor( panel ) {
		this.panel = panel; // StoragePanel instance
	}

	/** Update invalid and duplicate states */
	refresh() {
		this.updateInvalidStates();
		this.updateDuplicateStates();
		this._updateFooter();
	}

  // #region Mark Invalid Slugs
  /** Check all storage item containers for invalid slugs and mark them */
	updateInvalidStates() {
		const containers = this._getAllContainers();
		this._applyStateClass(
      containers, 'invalid', slug => !this.panel.slugManager.isValid( slug )
    );
	}
  /** Add or remove class based on predicate function */
	_applyStateClass( containers, className, predicate ) {
		containers.forEach( container => {
			const slug = this._getSlugFromContainer( container );                   // get slug
			container.classList.toggle( className, predicate( slug, container ) );  // toggle class
		} );
	}
  // #endregion Mark Invalid Slugs

  // #region Mark Duplicate Slugs
  /** Check all storage item containers for duplicate slugs and mark them */
	updateDuplicateStates() {
		const containers  = this._getAllContainers();
		const slugMap     = this._groupContainersBySlug( containers );

		// Clear existing duplicate flags
		containers.forEach( c => c.classList.remove( 'duplicate' ) );

		// Apply new duplicate flags
		slugMap.forEach( group => {
			if( group.length > 1 ) {
				group.forEach( c => c.classList.add( 'duplicate' ) );
			}
		} );
	}

  /** Sort storage item containers into groups by slug */
	_groupContainersBySlug( containers ) {
		const map = new Map();

		containers.forEach( container => {
			const slug = this._getSlugFromContainer( container ); // get slug
			if( !slug ) return;

			if( !map.has( slug ) ) map.set( slug, [] ); // create new group if needed
			map.get( slug ).push( container );          // add container to group
		} );

		return map;
	}
  // #endregion Mark Duplicate Slugs

	/** Switch footer between create mode and save mode */
	_updateFooter() {
		const hasFile = !!this.panel.currentFileHandle; // check if current file exists

		if( hasFile ) {
			this.panel.switchToSaveMode();
		} else {
			this.panel.switchToCreateMode();
		}
	}

  /** Get all storage item containers */
	_getAllContainers() {
		return DomUtils.getAll( '.selector-container' );
	}

  /** Get slug from storage item container */
	_getSlugFromContainer( container ) {
		const input = container.querySelector( '.selector-key' );
		return input ? input.value.trim() : "";
	}
}
