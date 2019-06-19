
const loadJs = src => {
  let script = document.createElement("script");
  script.src = src
  script.async = true;
  document.body.appendChild(script);
  console.log(script);
}

const loadCss = href => {
  var link = document.createElement("link");
  link.href = href;
  link.type = "text/css";
  link.rel = "stylesheet";
  link.media = "screen,print";

  document.getElementsByTagName("head")[0].appendChild(link);
}

const loadToolKit = () => loadJs("/assets/toolkit/scripts/toolkit.js")
const loadAfterHomeMount = () => loadJs("/assets/toolkit/scripts/afterMountHome.js")

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
  console.log(data1,223,data2)
    // time difference
    var timeDiff = Math.abs(data1.getTime() - data2.getTime());

    // days difference
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays
}

const handleUploadPhotoInput = (element, node) => {
  var file = element.files[0];
  var reader = new FileReader();
  reader.onloadend = function () {
    element.base64 = reader.result
    console.log(reader.result);
    if (node){
      node.style.backgroundImage = `url("${element.base64}")`
    }
  }
  try {
    reader.readAsDataURL(file);
  } catch (e) {
    console.log("Failed to get dataurl");
  }
}

export {
  loadToolKit,
  loadAfterHomeMount,
	getQueryParams,
  daysDifference,
  handleUploadPhotoInput
}