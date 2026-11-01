/** Simple toast */
class Toast {
	static containerId    = 'toast-container';
	static containerClass = 'toast-container';
	static positionClass  = 'toast-bottom';
	static messageClass   = 'toast-message';
	static typePrefix     = 'toast-';

  static container = null;

	static defaultDuration = 2000;

  /** Initialize toast container */
	static init( {
		containerId			= this.containerId,
		position				= 'bottom',
		containerClass	= this.containerClass
	} = {} ) {
		this.containerId		= containerId;
		this.positionClass	= `toast-${position}`;
		this.containerClass	= containerClass;

		let container = document.getElementById( containerId );

    // Create the container if it doesn't exist
		if( !container ) {
			container						= document.createElement( 'div' );
			container.id				= containerId;
			container.className	= `${containerClass} ${this.positionClass}`;
			document.body.appendChild( container );
		}

    this.container = container;
	}

  /** Show toast message */
	static show(
		message,
		{duration = this.defaultDuration, type = 'default'} = {}
	) {
		const container = this.container; // get container
		if( !container ) return;

		this._beforeShow( container ); // perform callback

    // Build and display the message
		const toast = this._buildToastMessage( message, type );
		container.append( toast );

		this._animateToast( toast, duration ); // animate
	}

  /** Callback before showing toast */
  static _beforeShow() {}

  /** Build the message to display */
	static _buildToastMessage( message, type ) {
		const toast       = document.createElement( 'div' );
		toast.className   = `${this.messageClass} ${this.typePrefix}${type}`;
		toast.textContent = message;
		return toast;
	}

  /** Animate toast */
	static _animateToast( toast, duration ) {
		requestAnimationFrame( () => {
			toast.style.opacity = '1';
		} );

		setTimeout( () => {
			toast.style.opacity = '0';
			setTimeout( () => toast.remove(), 250 );
		}, duration );
	}

  /* Empty toast container */
	static _clearExistingToast() {
		this.container.innerHTML = '';
	}
}