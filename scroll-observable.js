function ScrollObservable(cont) {
  const container = cont;
  this._observers = [];
  // using RAF as a petty debounce
  let inProgress = false;
  const handler = () => {
    if (inProgress) return;
    inProgress = true;
    window.requestAnimationFrame(() => {
      this._process(container);
      inProgress = false;
    });
  };
  window.addEventListener("scroll", handler);
}
//
ScrollObservable.prototype._process = function (cont) {
  //
  const viewportHeight = document.documentElement.clientHeight;
  // THIS IS THE PASSED THROUGH ELEMENT CONTAINER
  const containerHeight = cont;
  // !! TRIGGER !! WILL START PLAYING VIDEO ONCE THE TRIGGER - SET TO TOP OF CONTAINER - IS TRIGGERED
  if (
    containerHeight.getBoundingClientRect().top >=
    containerHeight.clientHeight * -1
  ) {
    // VARIABLE TO REGISTER SCROLL ON
    const scrolled = Math.max(containerHeight.getBoundingClientRect().top * -1);
    //
    const scrolledPercentage =
      Math.round(
        (100 * (100 * scrolled)) /
          (containerHeight.clientHeight - viewportHeight)
      ) / 100;
    // console.log(scrolledPercentage, "scrolled percetnge");
    this.publish(scrolledPercentage);
  } else {
    this.publish(0);
  }
};

ScrollObservable.prototype.subscribe = function (observer) {
  this._observers.push(observer);
};

ScrollObservable.prototype.publish = function (value) {
  this._observers.forEach((observer) => {
    observer.next(value);
  });
};
