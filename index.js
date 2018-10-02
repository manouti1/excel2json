var http = require('http');
var fs = require('fs');
var formidable = require('formidable');
var xlsxj = require("xlsx-to-json");

// html file containing upload form
var upload_html = fs.readFileSync("upload.html");

// replace this with the location to save uploaded files
var upload_path = "./uploads/";

http.createServer(function (req, res) {
    if (req.url == '/') {
        res.writeHead(200);
        res.write(upload_html);
        return res.end();
    } else if (req.url == '/fileupload') {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            // oldpath : temporary folder to which file is saved to
            var oldpath = files.filetoupload.path;
            var filename = files.filetoupload.name.replace(/\s/g, '');
            var newpath = upload_path + filename;
            fs.readFile(oldpath, function (err, data) {
                if (err) throw err;
                console.log('File read!');

                // Write the file
                fs.writeFile(newpath, data, function (err) {
                    if (err) throw err;
                    xlsxj({
                        input: newpath,
                        output: "output.json",
                    }, function (err, result) {
                        if (err) {
                            console.error(err);
                        } else {

                            console.log('File written!');
                            console.log('------------------------------');
                            let formatedResult = [];
                            for (let i = 0; i < result.length; i++) {
                                formatedResult.push({
                                    "text": result[i].Name,
                                    "value": result[i].Name
                                });
                            }

                            fs.writeFile('test.json', JSON.stringify(formatedResult), (err) => {
                                // throws an error, you could also catch it here
                                if (err) throw err;

                                // success case, the file was saved
                                console.log('Lyric saved!');
                            });
                            // fs.writeFile('file.json', JSON.stringify(formatedResult), (err) => {
                            //     // throws an error, you could also catch it here
                            //     if (err) throw err;

                            //     // success case, the file was saved
                            //     res.write('File uploaded and moved!');
                            //     res.end();
                            // });

                            console.log(formatedResult);
                        }
                    });

                });

                // Delete the file
                fs.unlink(oldpath, function (err) {
                    if (err) throw err;
                    console.log('File deleted!');
                });
            });

        });
    }
}).listen(8086);