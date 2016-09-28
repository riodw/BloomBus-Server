module.exports = function(app, passport) {

   /*************************************************************
    * SHOW MAIN PAGE
    *************************************************************/
   app.get('/', function(req, res) {
      res.render('index.ejs');
      // console.log("/ - Main Page");
   });
   
};