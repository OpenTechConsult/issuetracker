"use strict";

var continents = ['Africa', 'America', 'Asia', 'Australia', 'Europa'];
var helloContinents = Array.from(continents, function (c) {
  return "Hello ".concat(c, "!");
});
var message = helloContinents.join( /*#__PURE__*/React.createElement("br", null));
var element = /*#__PURE__*/React.createElement("div", {
  title: "Outer div"
}, /*#__PURE__*/React.createElement("h1", null, message));
ReactDOM.render(element, document.getElementById('contents'));