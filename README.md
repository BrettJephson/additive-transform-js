additive-transform-js
=====================

Small Javascript utility for CSS transforms.

Based on my answer to this stackoverflow question: http://stackoverflow.com/questions/20167239/how-to-mix-css3-transform-properties-without-overriding-in-realtime/20200863/#20200863. 

Takes a set of CSS transform rules and applies them to a node one by one - to create complicated transforms from simple rules. Rather than the CSS default behaviour of overriding previously applied transforms.

For example:
CSS:
.transform-1 {
	transform: scale(1.5, 1.5);
}
.transform-2 {
	transform: translate(5, 5);
}
.transform-3 {
	transform: rotate(90deg);
}

HTML:
<div id="test-case" class="add-transforms transform-1 transform-2 transform-3">TEST CASE</div>

Without the Javascript, this would result in #test-case rotating 90 degrees. With the Javascript, #test-case is scaled, translated and then rotated.
