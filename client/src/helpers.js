
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
  if (!query) return params;
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var separator = vars[i].indexOf("=") !== -1 ? "=" : ":";
    var pair = vars[i].split(separator);
    if (!pair[0]) continue;
    params[pair[0]] = pair[1] ? decodeURIComponent(pair[1]) : "";
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

const getLogo = job => {
  let backgroundImage;
  if (job.company) {
    if (job.company.logo && job.company.logo.url) {
      backgroundImage = `url("${job.company.logo.url}")`
    } else {
      backgroundImage = 'url("/assets/toolkit/images/	014-copany.svg")';
    }
  } else if (job.company_logo && job.company_logo.url) {
    backgroundImage = `url("${job.company_logo.url}")`
  } else {
    backgroundImage = 'url("/assets/toolkit/images/	014-compay.svg")';
  }
  return backgroundImage
}

const getJobTypes = jobTypes => {
  for (var x in jobTypes) {
    if (jobTypes[x] === "FULL_TIME") {
      jobTypes[x] = "Full Time";
    } else if (jobTypes[x] === "PART_TIME") {
      jobTypes[x] = "Part Time";
    } else if (jobTypes[x] === "CONTRACT") {
      jobTypes[x] = "Contract";
    } else if (jobTypes[x] === "FREELANCE") {
      jobTypes[x] = "Freelance";
    } else if (jobTypes[x] === "UNSPECIFIED") {
      jobTypes[x] = "Unspecified";
    }
  }
  return jobTypes.join(",");
}

const getAbsoluteUrl = url => {
  if (url.indexOf("http") === -1) {
    const protocol =
      typeof window !== "undefined" && window.location && window.location.protocol
        ? window.location.protocol
        : "https:";
    let tmp = `${protocol}//${url}`;
    return tmp;
  }
  return url;
}

const formatSalary = (number,currency) => {
  let type = currency === "DOLLAR" ? "USD" : "EUR"
  return new Intl.NumberFormat(undefined, { maximumSignificantDigits: 3, style: 'currency', currency: type }).format(number);
}

export {
  loadToolKit,
  loadAfterHomeMount,
	getQueryParams,
  daysDifference,
  handleUploadPhotoInput,
  getLogo,
  getJobTypes,
  getAbsoluteUrl,
  formatSalary
}
