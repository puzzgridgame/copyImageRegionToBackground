      function copyImageRegionToBackground(SrcImageElement, SrcSelectionElement, DstElement){
        if ( SrcImageElement == null || SrcSelectionElement == null || DstElement == null ){
          return;
        }

        // get absolute locations of img against sel rect to do relative comparison to select the right region in the image
        const srcRect = SrcImageElement.getBoundingClientRect();
        const selRect = SrcSelectionElement.getBoundingClientRect();

        // getting the scaling factor is NOT the actual scale, need to compare against the natural (original values)
        const scaleXp = srcRect.width / SrcImageElement.naturalWidth;
        const scaleYp = srcRect.height / SrcImageElement.naturalHeight;
        //console.log('Extra Scaling: ' + scaleXp + ',' + scaleYp);

        // determine the offset using the outlined 'selection' element against where the image is relatively
        const offsetX = parseInt(selRect.left - srcRect.left);
        const offsetY = parseInt(selRect.top - srcRect.top);

        // create canvas to copy from the source img
        const dstCanvas = document.createElement('canvas');
        dstCanvas.width = SrcImageElement.width;
        dstCanvas.height = SrcImageElement.height;
        const dstCtx = dstCanvas.getContext('2d');
        
        // fill the canvas for debug purposes (probably not necessary if everything always works right)
        dstCtx.fillStyle = "rgba(0, 0, 0, 0)";
        dstCtx.fillRect(0,0,dstCanvas.width,dstCanvas.height);
        // set the proper parameters to get the source image
        // TODO: do more math to only copy just the specific region
        //       instead of the entire image to avoid unnecessary
        //       scaling (cpu / gpu waste)
        dstCtx.scale(scaleXp,scaleYp);
        dstCtx.drawImage(SrcImageElement, 0, 0);
        // select the scaled and specific region within the src image to be saved / used
        const dstImageData = dstCtx.getImageData(offsetX,offsetY,200,200);

        // get the specific data
        createImageBitmap(dstImageData).then((imageBitmap) => {
          // create a 'smaller' canvas to 'convert' the bitmap image to a useable format (cannot directly create)
          const rndCanvas = document.createElement('canvas');
          rndCanvas.width = imageBitmap.width;
          rndCanvas.height = imageBitmap.height;
          const rndCtx = rndCanvas.getContext('2d');
          // draw the bitmap to another canvas in order to create a data URL to transfer to another element
          rndCtx.drawImage(imageBitmap,0,0);
          // Process the ImageBitmap here
          const imgURL = rndCanvas.toDataURL('image/png');
          //console.log('Image URL:', imgURL);
          // Append the imageElement to the desired location in the DOM
          DstElement.style.backgroundRepeat = 'no-repeat';
          DstElement.style.backgroundPosition = 'center center';
          DstElement.style.backgroundImage = 'url(' + imgURL + ')';
          // make sure the item is cleaned up
          imageBitmap.close();
        }).catch((error) => {
          // Handle the error here
          console.error('Error creating ImageBitmap:', error);
        });
      }
