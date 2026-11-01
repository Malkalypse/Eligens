const safeUtils = {

  applyResizeBehavior( dragBar, panel) {

    dragBar.addEventListener( 'mousedown', (e) => {
      e.preventDefault();

      const startX      = e.clientX;
      const startWidth  = panel.offsetWidth;

      const onMouseMove = ( moveEvent ) => {
        const delta     = startX - moveEvent.clientX;
        const newWidth  = startWidth + delta;

        // Minimum width
        panel.style.width = Math.max( newWidth, 150 ) + 'px';

        // Shift chain bar dynamically
        const chainBar = EligensInspector.chainBar?.bar  
        if( chainBar ) {
          chainBar.style.right = panel.style.width;
        }
      };

      const onMouseUp = () => {
        document.removeEventListener( 'mousemove', onMouseMove );
        document.removeEventListener( 'mouseup', onMouseUp );
      };

      document.addEventListener( 'mousemove', onMouseMove );
      document.addEventListener( 'mouseup', onMouseUp );
    } );
  }
};
