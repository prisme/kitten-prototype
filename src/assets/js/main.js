console.log('js loaded');

const slideshowContainer = document.getElementsByClassName('kitten__home_slideshow-container')[0];
const slideshowItems = document.getElementsByClassName('kitten__home_slideshow-item');
const cartons = Array.prototype.slice.call(document.getElementsByClassName('kitten__home_slideshow-item-title'));

// initialize slideshow
cartons[0].classList.add('active')

slideshowContainer.addEventListener(
  'scroll',
  function() {
    var scrollLeft = slideshowContainer.scrollLeft
    var itemWidth = slideshowContainer.clientWidth
    var ctnrWidth = itemWidth * slideshowItems.length
    var currentSlide = scrollLeft / (ctnrWidth / slideshowItems.length)

    if(Number.isInteger(currentSlide)) {
      cartons[currentSlide].classList.add('active')
    } else {
      cartons.forEach(function(e) {
        e.classList.remove('active')
      })
    }

    

    
    console.log([scrollLeft, itemWidth, ctnrWidth, currentSlide, cartons])



  }
)