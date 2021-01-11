var chunkSize = 1024 * 1024;
var timeout = 10;
var fileName = document.getElementById("fileName");
var hash = document.getElementById("hash");


function handleFiles() {
    var file = document.getElementById("file").files[0];
    if (file === undefined) {
        return;
    }
    var SHA256 = CryptoJS.algo.SHA256.create();
    var counter = 0;
    fileName.value = file.name;
    loading(file,
        function (data) {
            var wordBuffer = CryptoJS.lib.WordArray.create(data);
            SHA256.update(wordBuffer);
            counter += data.byteLength;
            console.log(((counter / file.size) * 100).toFixed(0) + '%');
        }, function (data) {
            //console.log('100%');
            var encrypted = SHA256.finalize().toString();
            hash.value = encrypted;
            console.log(encrypted);
            PostFile(encrypted, file);
        });

}

function PostFile(hash, file) {
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    var XHR = new XMLHttpRequest();
    var form = new FormData();
    form.append("hash", hash);
    form.append("file", file);
    form.append("csrfmiddlewaretoken", csrftoken);
    // 定义发生错误时执行的操作
    XHR.addEventListener('error', function (event) {
        alert('Oops! 出错了。');
    });

    // 设置请求地址和方法
    XHR.open('POST', '/');
    XHR.onload = function () {
        var jsonResponse = JSON.parse(XHR.responseText);
       console.log(jsonResponse)
        alert(jsonResponse.msg)
    };
    // 发送这个formData对象,HTTP请求头会自动设置
    XHR.send(form);

}

function loading(file, callbackProgress, callbackFinal) {
    var offset = 0;
    var size = chunkSize;
    var partial;
    var index = 0;
    if (file.size === 0) {
        callbackFinal();
    }
    while (offset < file.size) {
        partial = file.slice(offset, offset + size);
        var reader = new FileReader;
        reader.size = chunkSize;
        reader.offset = offset;
        reader.index = index;
        reader.onload = function (evt) {
            callbackRead(this, file, evt, callbackProgress, callbackFinal);
        };
        reader.readAsArrayBuffer(partial);
        offset += chunkSize;
        index += 1;
    }
}

function callbackRead(obj, file, evt, callbackProgress, callbackFinal) {
    callbackRead_buffered(obj, file, evt, callbackProgress, callbackFinal);
}

var lastOffset = 0;
var chunkReorder = 0;
var chunkTotal = 0;

function callbackRead_waiting(reader, file, evt, callbackProgress, callbackFinal) {
    if (lastOffset === reader.offset) {
        console.log("[", reader.size, "]", reader.offset, '->', reader.offset + reader.size, "");
        lastOffset = reader.offset + reader.size;
        callbackProgress(evt.target.result);
        if (reader.offset + reader.size >= file.size) {
            lastOffset = 0;
            callbackFinal();
        }
        chunkTotal++;
    } else {
        console.log("[", reader.size, "]", reader.offset, '->', reader.offset + reader.size, "wait");
        setTimeout(function () {
            callbackRead_waiting(reader, file, evt, callbackProgress, callbackFinal);
        }, timeout);
        chunkReorder++;
    }
}

// memory reordering
var previous = [];

function callbackRead_buffered(reader, file, evt, callbackProgress, callbackFinal) {
    chunkTotal++;

    if (lastOffset !== reader.offset) {
        // out of order
        console.log("[", reader.size, "]", reader.offset, '->', reader.offset + reader.size, ">>buffer");
        previous.push({offset: reader.offset, size: reader.size, result: reader.result});
        chunkReorder++;
        return;
    }

    function parseResult(offset, size, result) {
        lastOffset = offset + size;
        callbackProgress(result);
        if (offset + size >= file.size) {
            lastOffset = 0;
            callbackFinal();
        }
    }

    // in order
    console.log("[", reader.size, "]", reader.offset, '->', reader.offset + reader.size, "");
    parseResult(reader.offset, reader.size, reader.result);

    // resolve previous buffered
    var buffered = [{}];
    while (buffered.length > 0) {
        buffered = previous.filter(function (item) {
            return item.offset === lastOffset;
        });
        buffered.forEach(function (item) {
            console.log("[", item.size, "]", item.offset, '->', item.offset + item.size, "<<buffer");
            parseResult(item.offset, item.size, item.result);
            previous.remove(item);
        })
    }

}

Array.prototype.remove = Array.prototype.remove || function (val) {
    var i = this.length;
    while (i--) {
        if (this[i] === val) {
            this.splice(i, 1);
        }
    }
};

// Human file size
function humanFileSize(bytes, si) {
    var thresh = si ? 1000 : 1024;
    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    var units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + ' ' + units[u];
}