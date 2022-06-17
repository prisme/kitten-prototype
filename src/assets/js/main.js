/**
 *  HOME SLIDESHOW
 */

const slideshowContainer = document.getElementsByClassName(
  "kitten__home_slideshow-container"
)[0];
const captions = Array.prototype.slice.call(
  document.getElementsByClassName("kitten__home_slideshow-item-title")
);
const slideshowItems = Array.prototype.slice.call(
  document.getElementsByClassName("kitten__home_slideshow-item")
);

const imagesLeft = document.querySelectorAll(
  ".kitten__home_slideshow-item--rotate-left img"
);

window.resizeLeft = function () {
  for (let i = 0; i < imagesLeft.length; i++) {
    const img = imagesLeft[i];
    const wrap = img.parentElement;
    const item = wrap.parentElement;

    wrap.style.width = img.offsetWidth + "px";
    item.style.width = img.getBoundingClientRect().width + "px";
  }
};

window.onload = function () {
  resizeLeft();
  resizeRight();
};

const imagesRight = document.querySelectorAll(
  ".kitten__home_slideshow-item--rotate-right img"
);

window.resizeRight = function () {
  for (let i = 0; i < imagesRight.length; i++) {
    const img = imagesRight[i];
    const wrap = img.parentElement;
    const item = wrap.parentElement;

    wrap.style.width = img.offsetWidth + "px";
    item.style.width = img.getBoundingClientRect().width + "px";
    wrap.style.left =
      -1 * (img.offsetWidth - img.getBoundingClientRect().width) + "px";
  }
};

let dimensions = [];
let currentSlide;
let ctnrWidth;
let edges;

// handle global variables's values on init and resize
let handleDimension = function () {
  dimensions = [];
  slideshowItems.forEach(function (e, i) {
    dimensions.push(e.offsetWidth);
  });
  edges = dimensions.map((elem, index) =>
    dimensions.slice(0, index + 1).reduce((a, b) => a + b)
  );
  edges.unshift(0);
  ctnrWidth = dimensions.reduce((prev, a) => prev + a, 0);
};

window.onresize = () => {
  handleDimension();
  resizeLeft();
  resizeRight();
};

// handle slide's title display
slideshowContainer.addEventListener("scroll", function () {
  let scrollLeft = slideshowContainer.scrollLeft;

  edges.forEach(function (e, i) {
    if (Math.ceil(scrollLeft) == e) {
      currentSlide = i;
      captions[currentSlide].classList.add("active");
    } else if (
      Math.ceil(scrollLeft) !== 0 &&
      edges[currentSlide] !== Math.ceil(scrollLeft)
    ) {
      captions.forEach(function (e) {
        e.classList.remove("active");
      });
    }
  });
});

// initialisation
captions[0].classList.add("active");
handleDimension();

/* istanbul ignore next */
function trueVhCalc() {
  window.requestAnimationFrame(() => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
    document.documentElement.style.setProperty("--vhh", `${vh}`);
  });
}

function goTrueVhCalc(i, height0) {
  if (window.innerHeight !== height0 || i >= 120) {
    trueVhCalc();
  } else {
    window.requestAnimationFrame(() => {
      goTrueVhCalc(i + 1, height0);
    });
  }
}

trueVhCalc();
let trueVhCalcTick;
window.addEventListener("orientationchange", () => {
  goTrueVhCalc(0, window.innerHeight);
});
window.addEventListener("resize", () => {
  window.cancelAnimationFrame(trueVhCalcTick);
  trueVhCalcTick = window.requestAnimationFrame(trueVhCalc);
});
