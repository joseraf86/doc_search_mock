// common variables
var iBytesUploaded = 0;
var iBytesTotal = 0;
var iPreviousBytesLoaded = 0;
var iMaxFilesize = 10485760; // 10MB
var oTimer = 0;
var sResultFileSize = '';

function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();

  if ("withCredentials" in xhr) {
    // Check if the XMLHttpRequest object has a "withCredentials" property.
    // "withCredentials" only exists on XMLHTTPRequest2 objects.

    xhr.open(method, url, true);
    xhr.setRequestHeader('X-Custom-Header', 'value');

  } else if (typeof XDomainRequest != "undefined") {

    // Otherwise, check if XDomainRequest.
    // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
    xhr = new XDomainRequest();
    xhr.open(method, url);

  } else {

    // Otherwise, CORS is not supported by the browser.
    xhr = null;

  }
  return xhr;
}

function secondsToTime(secs) { // we will use this function to convert seconds in normal time format
    var hr = Math.floor(secs / 3600);
    var min = Math.floor((secs - (hr * 3600))/60);
    var sec = Math.floor(secs - (hr * 3600) -  (min * 60));

    if (hr < 10) {hr = "0" + hr; }
    if (min < 10) {min = "0" + min;}
    if (sec < 10) {sec = "0" + sec;}
    if (hr) {hr = "00";}
    return hr + ':' + min + ':' + sec;
};

function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB'];
    if (bytes == 0) return 'n/a';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};

function fileSelected() {

    // hide different warnings
    document.getElementById('upload_response').style.display = 'none';
    document.getElementById('error').style.display = 'none';
    document.getElementById('error2').style.display = 'none';
    document.getElementById('abort').style.display = 'none';
    document.getElementById('warnsize').style.display = 'none';

    // get selected file element
    var oFile = document.getElementById('documento_publicacion').files[0];

    // filter for pdf files
    var rFilter = /^(application\/pdf)$/i;
    if (! rFilter.test(oFile.type)) {
        document.getElementById('error').style.display = 'block';
        return;
    }

    // little test for filesize
    if (oFile.size > iMaxFilesize) {
        document.getElementById('warnsize').style.display = 'block';
        return;
    }

    // get preview element
    var oImage = document.getElementById('preview');

    // prepare HTML5 FileReader
    var oReader = new FileReader();
    oReader.onload = function(e){};

    // read selected file as DataURL
    oReader.readAsDataURL(oFile);
}

function startUploading(doc_id) {
    // cleanup all temp states
    iPreviousBytesLoaded = 0;
    document.getElementById('upload_response').style.display = 'none';
    document.getElementById('error').style.display = 'none';
    document.getElementById('error2').style.display = 'none';
    document.getElementById('abort').style.display = 'none';
    document.getElementById('warnsize').style.display = 'none';
    document.getElementById('progress_percent').innerHTML = '';
    var oProgress = document.getElementById('progress');
    oProgress.style.display = 'block';
    oProgress.style.width = '0px';

    // get form data for POSTing
    //var vFD = document.getElementById('upload_form').getFormData(); // for FF3
    //var vFD = new FormData(document.getElementById('upload_form')); 
    //var form_tag = document.getElementById('new_documento');
    //if ( form_tag == null )
    form_tag = document.getElementById('formulario');
    var vFD = new FormData( form_tag  ); 
    vFD.append("id", doc_id);
    //vFD.append("utf8", "â");
    //vFD.append("method", "put");
    //vFD.append("id", doc_id);
    //vFD.append("utf8", "â");
    //vFD.append("method", "put");

    //name="documento[publicacion]"; filename="prueba2.pdf" Content-Type: application/pdf

    // alert(doc_id);

    // create XMLHttpRequest object, adding few event listeners, and POSTing our data
    var oXHR = new XMLHttpRequest();
    //var oXHR = createCORSRequest('POST', 'localhost:3001/guardar_archivo_conest');        

    oXHR.upload.addEventListener('progress', uploadProgress, false);
    oXHR.addEventListener('load', uploadFinish, false);
    oXHR.addEventListener('error', uploadError, false);
    oXHR.addEventListener('abort', uploadAbort, false);
    //oxhr.setRequestHeader('X-Custom-Header', 'value');
    oXHR.open('POST', 'http://127.0.0.1:3001/guardar_archivo_conest.json', true);
    oXHR.send(vFD);

    // set inner timer
    oTimer = setInterval(doInnerUpdates, 300);
    // Evita que se mande el formulario 2 veces!
    return false;
}


function doInnerUpdates() { // we will use this function to display upload speed
    var iCB = iBytesUploaded;
    var iDiff = iCB - iPreviousBytesLoaded;

    // if nothing new loaded - exit
    if (iDiff == 0)
        return;

    iPreviousBytesLoaded = iCB;
    iDiff = iDiff * 2;
    var iBytesRem = iBytesTotal - iPreviousBytesLoaded;
    var secondsRemaining = iBytesRem / iDiff;

    // update speed info
    var iSpeed = iDiff.toString() + 'B/s';
    if (iDiff > 1024 * 1024) {
        iSpeed = (Math.round(iDiff * 100/(1024*1024))/100).toString() + 'MB/s';
    } else if (iDiff > 1024) {
        iSpeed =  (Math.round(iDiff * 100/1024)/100).toString() + 'KB/s';
    }

    document.getElementById('speed').innerHTML = iSpeed;
    document.getElementById('remaining').innerHTML = '| ' + secondsToTime(secondsRemaining);        
}

function uploadProgress(e) { // upload process in progress
    if (e.lengthComputable) {
        iBytesUploaded = e.loaded;
        iBytesTotal = e.total;
        var iPercentComplete = Math.round(e.loaded * 100 / e.total);
        var iBytesTransfered = bytesToSize(iBytesUploaded);

        document.getElementById('progress_percent').innerHTML = iPercentComplete.toString() + '%';
        document.getElementById('progress').style.width = (iPercentComplete * 4).toString() + 'px';
        document.getElementById('b_transfered').innerHTML = iBytesTransfered;
        if (iPercentComplete == 100) {
            var oUploadResponse = document.getElementById('upload_response');
            oUploadResponse.innerHTML = '<h1>Por favor espere... procesando</h1>';
            oUploadResponse.style.display = 'block';
        }
    } else {
        document.getElementById('progress').innerHTML = 'unable to compute';
    }
}

function uploadFinish(e) { // upload successfully finished
  $.ajax({ data: {
                  "ci":$('#ci').val(),
                  "ci_p":$('#ci_p').val(),
                  "titulo":$('#titulo').val()
                  },
           url: '/registrar_teg.json', 
           type:'post',
           beforeSend: function () {},
           success: function (response) {
                     var oUploadResponse = document.getElementById('upload_response');
                     //Create jQuery object from the response HTML.
                     //var $response=$(response);
                     //Query the jQuery object for the values
                     //var oneval = $response.filter('#one').text();
                     //var subval = $response.filter('#sub').text();
                     //alert(oneval+" "+subval);
                     //alert(JSON.stringify(response))

                     oUploadResponse.innerHTML = "El documento fue subido exitosamente.";
                     //e.target.responseText;
                     oUploadResponse.style.display = 'block';

                     document.getElementById('progress_percent').innerHTML = '100%';
                     document.getElementById('progress').style.width = '400px';
                     document.getElementById('filesize').innerHTML = sResultFileSize;
                     document.getElementById('remaining').innerHTML = '| 00:00:00';
                     clearInterval(oTimer);
                    },
                    error: function () {
                      document.getElementById('error2').style.display = 'block';
                      clearInterval(oTimer)            
                    }
         });


}

function uploadError(e) { // upload error
    //alert( e.lengthComputable );
    document.getElementById('error2').style.display = 'block';
    clearInterval(oTimer);
}  

function uploadAbort(e) { // upload abort
    document.getElementById('abort').style.display = 'block';
    clearInterval(oTimer);
}
