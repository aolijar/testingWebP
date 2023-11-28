const FrameUnpacker = (() => {
  const unpack = async (options) => {
    const urlPattern = options.urlPattern,
      start = options.start, // STARTING FRAME
      end = options.end, // ENDING FRAME
      padding = options.padding; // HOW MANY NUMBERS IN STRING IT LOOKS FOR - ALL MUST BE THE SAME 001 002 003 ETC ETC. NOT LIKE 1 02 03. NEEDS SAME AMOUNT STRING.LENGTH

    const bitmaps = [];
    const calls = [];
    // download each frame image and prep it up
    for (let index = start; index <= end; index++) {
      // console.log(Math.floor((index / end) * 100)); // CAN USE THIS FOR LOADING
      // xhr.loaded / xhr.total * 100
      const id = index.toString().padStart(padding, "0"); // THIS SETS PADDING # - COULD BE ADJUSTED
      const url = urlPattern.replace("{{id}}", id);
      calls.push(
        fetch(url).then((res) =>
          res
            .blob()
            .then((blob) =>
              createImageBitmap(blob).then((bitmap) =>
                bitmaps.push({ id: index, bitmap: bitmap })
              )
            )
        )
      );
    }
    // wait for all the downloads to finish... (a more eager implementation that starts putting
    // the scrubbing as soon as the first few frames are downloaded can also be done, but we'll
    // keep things simple for now)

    // EXPLORE THIS /\  -- MAYBE ONLY TAKEN A CERTAIN AMOUNT OF PROMISES THEN GO AHEAD LIKE A CERTAIN AMOUNT - COULD BREAK IF LATER FRAMES HAVE ERRORS
    // console.log(calls);
    await Promise.all(calls); // HOLD ALL BACK UNTIL FINISHED LOADING ALL IMAGES
    // console.log(calls, bitmaps);

    // sort the downloaded frame bitmaps in order, they could have been downloaded haphazardly
    bitmaps.sort((a, b) => {
      return a.id - b.id;
    });

    // once that's done, construct an array of just frames that would be returned
    const frames = [];
    bitmaps.map((bitmap) => frames.push(bitmap.bitmap));
    return frames;
  };
  return {
    unpack: unpack,
  };
})();

// MAIN FUNCTION ------------------------------------------------------------------------------------
(async () => {
  // #1 DECLARE CANVAS CONTAINERS
  const videoContainer = document.getElementById(
    "section__hero-canvas-container"
  );
  // #2 DELCARE INPUTS - THESE INPUT ELEMENTS HOLD CRUCIAL DATA TO FRAME/MOVIE INFO - MAYBE PLACE THESE AS VARIABLES INSIDE FUNCTION?
  const framesUrlElement = document.querySelector('input[name="frames-url"]');
  // ERROR IF NOTHING FOUND
  if (!videoContainer || !framesUrlElement) {
    throw new Error("Element missing!");
  }

  // ----------------------------------------------------------------------------
  // #3 SET VALUES FROM #2 INPUTS DECLARED
  const framesUrlPattern = framesUrlElement.value;
  const framesUrlStart = parseInt(framesUrlElement.dataset.frameStart, 10);
  const framesUrlEnd = parseInt(framesUrlElement.dataset.frameEnd, 10);
  const framesIdPadding = parseInt(framesUrlElement.dataset.frameIdPadding, 10);

  // #4 RUNNING DATA THROUGHT FRAMEUNPACKER FUNCTION ----------------------------------------------------------------------------
  const frames = await FrameUnpacker.unpack({
    urlPattern: framesUrlPattern,
    start: framesUrlStart,
    end: framesUrlEnd,
    padding: framesIdPadding,
  });

  // #5 CREATING CANVAS ---------------------------------------------------------
  const canvas = document.getElementById("section__hero-canvas");
  canvas.height = frames[0].height;
  canvas.width = frames[0].width;
  var context = canvas.getContext("2d");
  context.drawImage(frames[0], 0, 0);
  //
  const scrolled = Math.max(
    document.getElementById("section__hero").getBoundingClientRect().top * -1
  );
  //
  const scrolledPercentage =
    Math.round(
      (100 * (100 * scrolled)) /
        (document.getElementById("section__hero").clientHeight -
          document.documentElement.clientHeight)
    ) / 100;
  //
  var frameIndex = Math.floor((scrolledPercentage * (frames.length - 1)) / 100);
  //

  // SETS CANVAS WHEN PAGE LOADED =========== = = = = = =
  // console.log("loaded");
  //
  document
    .getElementById("section__hero-canvas-container")
    .setAttribute("data-percent", scrolledPercentage);
  document
    .getElementById("section__hero-canvas-container")
    .setAttribute("data-frame", frameIndex);
  //
  if (frameIndex <= 0) frameIndex = 0;
  //
  if (frameIndex >= frames.length) {
    document
      .getElementById("section__hero-canvas-container")
      .setAttribute("data-percent", 100);
    frameIndex = frames.length - 1;
  }
  //
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(frames[frameIndex], 0, 0);
  //

  // THIS WILL SET THE PROPER TEXT FOR WHEN IT LOADS
  // heroTextOnLoad(frameIndex);

  // #6 ASSIGN TO SCRUBBER -> OBSERVER - THIS WILL SCALE VIDEO FRAMES TO HEIGHT OF SECTIONS IT IS AND ADJUST TO VIEWPORT
  //
  // OBSERVE HERO
  const observer = CanvasFrameScrubber.create(
    frames,
    document.getElementById("section__hero-canvas") // NEED TO OBSERVE CANVAS TO PUT NEW FRAMES
  );
  //
  const observable = new ScrollObservable(
    document.getElementById("section__hero")
  ); //NEED TO PASS IN CONTAINER OF CANVAS/CANVAS DIRECT PARENT
  observable.subscribe(observer);
})();
