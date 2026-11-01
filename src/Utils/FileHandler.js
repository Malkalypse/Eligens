class FileHandler {

  /** Open a file */
	async openFile() {
		const [handle] = await window.showOpenFilePicker( {
			types: [{
				description:  "JSON Files",
				accept:       {"application/json": [".json"]}
			}]
		} );
		return handle;
	}

  /* Read a file */
	async readFile( handle ) {
		const file = await handle.getFile();
		const text = await file.text();
		return text.trim() === ""
      ? {}
      : JSON.parse( text );
	}

  /* Save a file */
	async saveFile( suggestedName ) {
		return await window.showSaveFilePicker( {
			suggestedName,
			types: [{
				description:  "JSON Files",
				accept:       {"application/json": [".json"]}
			}]
		} );
	}

  /* Write a file */
	async writeFile( handle, jsonObject ) {
		const writable = await handle.createWritable();
		await writable.write( JSON.stringify( jsonObject, null, 2 ) );
		await writable.close();
	}
}