// eligens/src/UI/StoragePanel/StoragePanelEvents.js

/** Handles storage panel events */
class StoragePanelEvents {
	constructor( panel ) {
		this.panel        = panel; // StoragePanel instance
		this.fileHandler  = panel.fileHandler;
	}

	/** Wire events */
	wire() {
		this._wireFilepathEvents();
		this._wireCreateButton();
		this._wireSaveButton();
		this._wireClearButton();
	}

	 /** Load an existing file */
	_wireFilepathEvents() {
		this.panel.filepathField.onclick = async( event ) => {

			if( event.target === this.panel.clearBtn ) return;

			try {
				const handle = await this.fileHandler.openFile();
				this.panel.currentFileHandle = handle;
				this.panel.filepathField.firstChild.textContent = handle.name;

				const json = await this.fileHandler.readFile( handle );
        this.panel.loadJson( json );
				this.panel.switchToSaveMode();

			} catch( e ) {
				console.error( "Error opening file:", e );
			}
		};
	}

	/** Create a new file */
	_wireCreateButton() {
		this.panel.createBtn.onclick = async () => {
			try {
				const handle = await this.fileHandler.saveFile( "selectors.json" );
				this.panel.currentFileHandle = handle;
				this.panel.filepathField.firstChild.textContent = handle.name;

        this.panel.loadJson( {} );
				this.panel.switchToSaveMode();

			} catch( e ) {
				console.error( "Error creating file:", e );
			}
		};
	}

	/** Save selectors to current file */
	_wireSaveButton() {
		this.panel.saveBtn.onclick = async () => {
			if( !this.panel.currentFileHandle ) return;

			const selectors   = this.panel.getSelectors();
			const jsonObject  = this._createJsonObject( selectors );

			await this.fileHandler.writeFile( this.panel.currentFileHandle, jsonObject );
			this.panel.markSelectorsAsSaved();
		};
	}
	_createJsonObject( selectors ) {
		return selectors.reduce( ( acc, { slug, selector } ) => {
			if( slug ) acc[slug] = selector;
			return acc;
		}, {} );
	}

	/** Clear current file from storage panel */
	_wireClearButton() {
		this.panel.clearBtn.onclick = () => {
			this.panel.currentFileHandle = null;
			this.panel.filepathField.firstChild.textContent = 'No file selected';
			this.panel.switchToCreateMode();
		};
	}
}
