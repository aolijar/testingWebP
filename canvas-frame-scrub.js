const CanvasFrameScrubber = (() => {
  const create = (frames, containerName) => {
    const observer = {
      next: (percentage) => {
        var frameIndex = Math.floor((percentage * (frames.length - 1)) / 100);
        //------------------------------
        // ENSURES FRAMES/PERCENTAGE WON'T GO NEGATIVE AND ERROR
        if (frameIndex <= 0) frameIndex = 0;
        if (percentage >= 100) percentage = 100;
        // ENSURES VIDEO TRIGGER WON'T PLAY PAST CERTANIN POINT
        if (frameIndex >= frames.length) frameIndex = frames.length;
        // SETS DATA ATTRIBUTES THAT TRIGGER CONTENT CHANGES
        document
          .getElementById("section__hero-canvas-container")
          .setAttribute("data-percent", percentage);
        document
          .getElementById("section__hero-canvas-container")
          .setAttribute("data-frame", frameIndex);
        // BUILDS NEWS FRAMES
        window.requestAnimationFrame(() => {
          const canvas = containerName;
          const context = canvas.getContext("2d");
          if (frameIndex >= frames.length) {
            // !! IMPORTANT -> KEEPS CANVAS AT LAST FRAME DESPITE BEING OFF SCREEN !!
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(frames[frames.length - 1], 0, 0);
            return;
          }
          // IMPORTANT -> TO CLEAR LAST FRAME FROM SCREEN BEFORE REPAINT
          context.clearRect(0, 0, canvas.width, canvas.height);
          // DRAWS NEW FRAME ----------------------------------
          context.drawImage(frames[frameIndex], 0, 0);
        });
      },
    };
    return observer;
  };
  return {
    create: create,
  };
})();
