
const loadToolKit = () => {
      let script = document.createElement("script");
      script.src = "/assets/toolkit/scripts/toolkit.js"
      script.async = true;
      document.body.appendChild(script);
      console.log(script);
}

var getQueryParams = (url) => {
  var params = {};
  var parser = document.createElement('a');
  parser.href = url;
  var query = parser.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    params[pair[0]] = decodeURIComponent(pair[1]);
  }
  return params;
};

var daysDifference = (data1,data2) => {
    // time difference
    var timeDiff = Math.abs(data1.getTime() - data2.getTime());

    // days difference
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays
}
export {
	loadToolKit,
	getQueryParams,
  daysDifference
}