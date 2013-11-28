additive-transform-js
=====================

Small Javascript utility for CSS transforms.

Based on my answer to this Stack Overflow question: http://stackoverflow.com/questions/20167239/how-to-mix-css3-transform-properties-without-overriding-in-realtime/20200863/#20200863.

Takes a set of CSS transform rules and applies them to a node one by one - to create complicated transforms from simple rules. Rather than the CSS default behaviour of overriding previously applied transforms.

For example:

CSS:
```css
.transform-1 {
	transform: scale(1.5, 1.5);
}
.transform-2 {
	transform: translate(5px, 5px);
}
.transform-3 {
	transform: rotate(90deg);
}
```

HTML:
```html
<div id="test-case" class="add-transforms transform-1 transform-2 transform-3">TEST CASE</div>
```

Without the Javascript, this would result in #test-case rotating 90 degrees. With the Javascript, #test-case is scaled, translated and then rotated.

To use:
---------

Simply add the script and call transform to run it:

```
<script src="additive-transform.js"></script>
<script>
    AdditiveTransform.transform();
</script>
```

There is a configure function where you can change:
* selector - default is '.add-transforms' - script looks for all instances of the selector on the page using document.querySelectorAll.
* dataAttribute - default is 'data-transforms' - script applies all the transforms listed in this data attribute (must be a comma-separated list).

```
AdditiveTransform.configure({ selector: "#my-transform", dataAttribute: "data-my-transform-list" });
```