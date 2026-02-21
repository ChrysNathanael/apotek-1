import { MD5 } from "crypto-js";

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

const validURL = (str) => {
  var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
  return !!pattern.test(str);
}

function validEmail(mail) {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
    return (true)
  }
  return (false)
}

function generateTRXID(length) {
  var result = [];
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result.push(characters.charAt(Math.floor(Math.random() *
      charactersLength)));
  }

  var date = new Date();
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  var d = date.getDate();
  var trxdate = y + "" + m + "" + d;

  return trxdate + "" + result.join('');
}

const getBase64 = (file, cb) => {
  let reader = new FileReader();
  // reader.readAsDataURL(file);
  reader.onload = function () {
    cb(btoa(reader.result))
  };
  reader.readAsBinaryString(file)
  reader.onerror = function (error) {
  };
}

const historyConfig = {
  basename: ''
};

const fetchStatus = (response) => {
  if (response.status === 200) {

    return Promise.resolve(response)
  } else if (response.status === 401) {

    // alert("Maaf anda tidak memiliki ijin untuk mengakses halaman ini.")
    // window.location.href = 'admin/login';
    return Promise.reject(new Error(response.status))
  } else {

    return Promise.reject(new Error(response.status))
  }
}

const fetchStatus2 = (response) => {
  if (response.status === 200) {

    return Promise.resolve(response)
  } else if (response.status === 401) {

    return Promise.reject(new Error(response.status))
  } else {

    return Promise.reject(new Error(response.status))
  }
}

function FormatNumberBy3(num, decpoint, sep) {
  num = Math.round(num);
  if (num !== null && num !== "") {
    if (arguments.length === 2) {
      sep = ",";
    }
    if (arguments.length === 1) {
      sep = ",";
      decpoint = ",";
    }

    num = num.toString().replace(/\D+/g, '').replace(/^0+/, '');
    var a = num.split(decpoint);
    var x = a[0];
    var y = a[1];
    var z = "";
    var i = "";

    if (typeof (x) !== "undefined") {
      for (i = x.length - 1; i >= 0; i--)
        z += x.charAt(i);

      z = z.replace(/(\d{3})/g, "$1" + sep);
      if (z.slice(-sep.length) === sep)
        z = z.slice(0, -sep.length);
      x = "";

      for (i = z.length - 1; i >= 0; i--)
        x += z.charAt(i);

      if (typeof (y) !== "undefined" && y.length > 0)
        x += decpoint + y;
    }
    return x;
  } else {
    return 0;
  }

}

function FormatNumberComma(num) {
  num = parseFloat(num).toFixed(4)
  var withCommas = Number(num).toLocaleString('id-ID');
  return withCommas;
}

const generateSignature = (enckey, requestBody) => {
  // var requestBodyEnc = window.btoa(requestBody);
  var requestBodyEnc = btoa(unescape(encodeURIComponent(requestBody)))
  var Signature = MD5(enckey + requestBodyEnc);
  return Signature;
}

function isInt(value) {
  var x;
  if (isNaN(value)) {
    return false;
  }
  x = parseFloat(value);
  return (x | 0) === x;
}


const formatDate = (date, format) => {

  var vdate = "";
  var time = "";
  if (date !== "" && date !== null) {
    if (format === "dd MM yyyy") {
      if (date.length > 10) {
        time = "Jam :" + date.substring(11)
        vdate = date.substring(0, 10)
      } else {
        vdate = date;
        time = "";
      }

      var event = new Date(vdate);
      var options = { year: 'numeric', month: 'long', day: 'numeric' };
      var d = event.toLocaleString('ind', options);
      return d + " " + time;
    } else {
      if (date.length > 10) {
        time = " " + date.substring(11)
        vdate = date.substring(0, 10)
      } else {
        vdate = date;
        time = "";
      }

      var d = new Date(vdate),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

      if (month.length < 2)
        month = '0' + month;
      if (day.length < 2)
        day = '0' + day;

      return [day, month, year].join('/') + " " + time;
    }
  } else {
    return "";
  }
}

function selisih(jam1, jam2) {

  // var Mulai = new Date(today + " " + date1).getHours();
  // var Akhir = new Date(today + " " + date2).getHours();

  // var selisihJam = Akhir - Mulai; 
  // return selisihJam;
}


export {
  getParameterByName,
  validURL,
  validEmail,
  generateTRXID,
  getBase64,
  historyConfig,
  fetchStatus,
  fetchStatus2,
  FormatNumberBy3,
  FormatNumberComma,
  generateSignature,
  formatDate,
  selisih,
  isInt
}