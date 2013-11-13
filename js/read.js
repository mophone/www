var read = {
    currentBookID: 0,
    openBook: function () {
        alert("");
        var ref = window.open('http://192.168.2.77:1000/epub-oku/' + read.currentBookID, '_self', 'location=no');
        ref.addEventListener('loadstop', function () { alert(""); });
        ref.addEventListener('exit', function () { alert(""); });

    }
}