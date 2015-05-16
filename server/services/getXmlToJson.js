var http = require("http");
var https = require("https");
var parser = require('xml-stream');
var saxStream = require('sax').createStream();

/**
 * Based on
 * http://stackoverflow.com/questions/9577611/http-get-request-in-node-js-express
 * getJSON:  REST get request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */
exports.getXmlToJson = function(onResult) {
    console.log("from Nginx::getXmlToJson");
    var options = {
        host: 'localhost',
        port: '8089',
        path: '/stat',
        method: 'GET'
    };

    var req = http.request(options, function(res) {
        var output = '';
        res.setEncoding('utf8');

        var xml = new parser(res);
        // xml.preserve('application', true);
        var applications = [];
        xml.collect('stream');
        xml.on('endElement: application', function(item) {
            applications.push(item.live.stream);
        });
        
        xml.on('end', function() {
            onResult(applications);
        });


        // xml.on('end', function(data) {
        //     // console.log(JSON.stringify(xml));
        //     onResult(res.statusCode, xml);
        // });
        // var outStream = require('fs').createWriteStream("out.txt");
        //         res.pipe(saxStream).pipe(outStream);

        // res.on('data', function(chunk) {
        //     output += chunk;
        // });
        // res.on('end', function() {
        //     var json = JSON.parse(xml);
        //     onResult(res.statusCode, json);
        // });
    });
    req.end();
};
