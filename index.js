var extend = require('xtend/mutable'),
	css = require('mucss/css'),
	getMargins = require('mucss/margins');

function Cascade(element, options) {

	if (!(this instanceof Cascade)) return new Cascade(element, options);

	var defaults = {
		childrenSelector: null,
		minWidth: 300,
		autoResize: true
	};

	//apply options
	extend(this, defaults, options);

	//get DOM elements
	this.element = element;
	if (this.childrenSelector) {
		this.children = this.element.querySelectorAll(childrenSelector);
	} else {
		this.children = this.element.children;
	}

	//init DOM elements
	if (getComputedStyle(this.element).position == 'static') {
		css(this.element, 'position', 'relative');
	}

	Array.prototype.forEach.call(this.children, function(child) {
		css(child, {
			position: 'absolute',
			'box-sizing': 'border-box'
		});
	});

	this.flow();

	if (this.autoResize) {
		window.addEventListener('resize', this.flow.bind(this));
	}

}

extend(Cascade.prototype, {

	flow: function() {
		var self = this,
			elementWidth = self.element.offsetWidth,
			columnsNumber = Math.floor(elementWidth/self.minWidth),
			columnWidth = elementWidth / columnsNumber,
			//create array with zeros to monitor columns current height
			columnsHeights = [];

		for (var i=0; i<columnsNumber; i++) {
			columnsHeights[i] = 0;
		}

		Array.prototype.forEach.call(self.children, function(child) {

			//get the index of the array with minimum height
			var columnIndex = columnsHeights.indexOf(Math.min.apply(Math, columnsHeights)),
				margins = getMargins(child),
				//TODO: fix when box-sizing is border-box
				// horizontal and vertical sums of box model properties for the child
				horizontalSpace = 
					margins.left + margins.right,
				verticalSpace = 
					margins.top + margins.bottom;
			
			css(child, {
				//width is the column width excluding paddings, margins and borders
				width: columnWidth - horizontalSpace,
				//top is under the bottom element
				top: columnsHeights[columnIndex],
				//left is width of column and index production
				left: columnWidth*columnIndex
			});

			//add current element's height to the column height
			columnsHeights[columnIndex] += child.clientHeight + verticalSpace;

		});

		//set the highest column height to the container
		css(self.element, 'height', Math.max.apply(Math, columnsHeights));
	}

});

module.exports = Cascade;