class ToastNotification extends Toast {
	static containerId    = 'eligens-toast';
	static containerClass = '';
	static messageClass   = 'eligens-toast-message';
	static typePrefix     = 'eligens-toast-';

	static referenceElement = null;

  /** Initialize toast container */
	static init() {
		super.init( {
			containerId:		this.containerId,
			position:				'bottom',
			containerClass: this.containerClass
		} );

    this.referenceElement = EligensInspector.chainBar.bar
	}

  /** Callback before showing toast */
	static _beforeShow() {
		this._positionToast( this.referenceElement);
		this._clearExistingToast();
	}
	static _positionToast( bar ) {
		const barHeight             = bar ? bar.offsetHeight : 40;
		const toastBottom           = barHeight + 12;
		this.container.style.bottom = toastBottom + 'px';
	}

	static _buildToastMessage( selectorText, type ) {

    const msg = DomUtils.create( this.messageClass );
    const selectorSpan = DomUtils.create(
      'eligens-toast-selector', null, selectorText, 'span'
    );
    const statusSpan = DomUtils.create(
      'eligens-toast-status', null, 'copied to clipboard', 'span'
    );

    msg.append(selectorSpan, statusSpan);
    return msg;
	}
}
