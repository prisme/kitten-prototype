/**
 *  HOME SLIDESHOW
 */


const slideshowContainer = document.getElementsByClassName('kitten__home_slideshow-container')[0];
const captions = Array.prototype.slice.call(document.getElementsByClassName('kitten__home_slideshow-item-title'));
const slideshowItems = Array.prototype.slice.call(document.getElementsByClassName('kitten__home_slideshow-item'))


let dimensions = []
let currentSlide
let ctnrWidth 
let edges 

// handle global variables's values on init and resize
let handleDimension = function() {
  dimensions = []
  slideshowItems.forEach(function(e,i) {
    dimensions.push(e.offsetWidth)
  })
  edges = dimensions.map((elem, index) => dimensions.slice(0,index + 1).reduce((a, b) => a + b))
  edges.unshift(0)
  ctnrWidth = dimensions.reduce((prev, a) => prev + a, 0)
}

window.onresize = handleDimension


// handle slide's title display
slideshowContainer.addEventListener(
  'scroll',
  function() {
    let scrollLeft = slideshowContainer.scrollLeft

    edges.forEach(function(e, i) {
      if(Math.ceil(scrollLeft) == e) {
        currentSlide = i
        captions[currentSlide].classList.add('active')
      } else if (Math.ceil(scrollLeft) !== 0 && edges[currentSlide] !== Math.ceil(scrollLeft)) {
        captions.forEach(function(e) {
          e.classList.remove('active')
        })
      }
    })
  }
)



// initialisation
captions[0].classList.add('active')
handleDimension()




// handle image rotation

const ctnrRotateLeft = Array.prototype.slice.call(document.getElementsByClassName('kitten__home_slideshow-item--rotate-left'))
const ctnrRotateRight = Array.prototype.slice.call(document.getElementsByClassName('kitten__home_slideshow-item--rotate-right'))

const setImageContainerWidth = function(e) {
  var img = e.firstElementChild
  var ctnr = e.closest('li')

  e.style['width'] = `${img.offsetWidth}px`
  const imgWidth = img.getBoundingClientRect().width
  ctnr.style['width'] = `${imgWidth}px`
}

ctnrRotateLeft.forEach(setImageContainerWidth)
ctnrRotateRight.forEach(setImageContainerWidth)
