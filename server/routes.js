module.exports = function(app, path) {

    var views_path = path.join(__dirname + '/../client/views/');

    /*************************************************************
     * SHOW MAIN PAGE
     *************************************************************/
    app.get('/', function(req, res) {
        res.sendFile(views_path + 'index.html');
        // console.log("/ - Main Page");
    });

};
