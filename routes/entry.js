var users = require('../lib/users');
var tweets = require('../lib/tweets');
// Records the logged in user:
var userids = 0;
// A logged in "database":
var online = {};
exports.online = online; //needed if newTweet?

// # User Server-Side Routes

//GET rsegister
exports.register = function(req, res){
  res.render('register',{title: 'Tweetee', message: req.flash("error")});
};

//GET forgotlogin
exports.forgotlogin = function(req, res){
  res.render('forgotlogin',{title: 'Tweetee', message: ""});
};

/* 
 * Post forgotlogin page with respective error message if 
 *
 */
exports.forgotloginProcess = function(req, res){
  var email = req.body.email;
  users.lookupForgotLoginInfo(email, function(message) {
      req.flash('message', message);
      res.render('forgotlogin',{title: 'Tweetee', message: req.flash("message")});
  });
};

exports.verifyCode = function(req, res){
  res.render('verifyCode',{title: 'Tweetee', message: req.flash("message")});
};

//Registration
exports.verify = function(req, res){
    var name = req.body.name;
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var retypeP = req.body.retypeP;
    var location = req.body.location;
    var website = req.body.website;
    users.lookupRegistrationParams(name, username, email, password, retypeP, location, website, function(message) {
        if(message){
            req.flash('message', message);
            res.render('register',{title: 'Tweetee', message: req.flash("message")});
        }else{
            req.flash('message', "A code has been sent out to the email provided."
              +"Submit it to confirm the account and complete the registration.");
            res.render('verifyCode',{title:"Tweetee", message: req.flash("message"), email:email}); 
        }
    });
}

exports.codeCheck = function(req,res){
    users.lookupCodeCheck(req.body.code, function(message){
        if(message){
            req.flash('message', message);
            res.render('verifyCode',{title:"Tweetee", message:req.flash("message")});
        }else{
            req.flash("msg", "The code is correct! Login to begin.");
            res.redirect('/');
        }
  });
}

//Send the following to the client (user's page)
exports.home = function (req, res) {
    var userid=req.cookies.userid;
    var onlineUser=online[userid];
    console.log(req.params.user);
    if (onlineUser.username == req.params.user){
        var username = onlineUser.username;
        var u = users.getUserById(username);
        var j = tweets.tweets.length-1;
        var content='';
        // display timeline tweets
        for (var i=j; i >= j-10 && i >= 0; i--) {
    //console.log("i="+i);
          var t = tweets.tweets[i];
          var usr = users.getUserById(t.username);
          var a = t.msg.split(" ");
          console.log("split: "+a);
          content += '<p><b>'+usr.name+'</b> <a href="/'+t.username+'/profile">@'+t.username+'</a><br>'
                 +users.msgToHtml(t.msg)+'<br>'
                 +t.date+'</p>';
        }
        res.render('home', 
               { title: 'Home',
                name: u.name,
                username: username,
                followerN: u.follower.length,
                followingN: u.following.length,
                tweets: content } );
    }else{
        res.send('Page Access Not Authorized.');
    }
};


// ## login
// Provides a user login/register view. Based on cookies example
// in lecture 18 by Timothy Richards.
exports.login = function(req, res){
  // Grab any messages being sent to use from redirect.
  var authmessage = users.flash(req, res, 'userAuth') || '';

  // TDR: redirect if logged in:
  var userid  = req.cookies.userid;
  console.log("Cookie userid:"+req.cookies.userid);

  // TDR: If the user is already logged in - we redirect to the
  // main application view. We must check both that the `userid`
  // and the `online[userid]` are undefined. The reason is that
  // the cookie may still be stored on the client even if the
  // server has been restarted.
  if (userid !== undefined && online[userid] !== undefined) {
    var onlineUser=online[userid] 
    res.redirect('/'+onlineUser.username+'/home');
  }
  else {
    // Render the login view if this is a new login.
    res.render('login', { title   : 'Tweetee',
                          message : authmessage,
                          msg: req.flash("msg") });//For login username and password
  }
};

// ## authentication
// Performs **basic** user authentication. Based on cookies example
// in lecture 18 by Timothy Richards. 
exports.userAuth = function(req, res) {
  // TDR: redirect if logged in:
  var userid = req.cookies.userid;

  // TDR: do the check as described in the `exports.login` function.
  if (userid !== undefined && online[userid] !== undefined) {
    var onlineUser=online[userid] 
    res.redirect('/'+onlineUser.username+'/home');
  }
  else {
    // Pull the values from the form.
    var username = req.body.username;
    var password = req.body.password;
    // Perform the user lookup.
    users.lookup(username, password, function(error, user) {
      if (error) {
        // If there is an error we "flash" a message to the
        // redirected route `/user/login`.
        users.flash(req, res, 'userAuth', error);
        res.redirect('/');
      }
      else {
        // TDR: use cookie to record stateful connection. Here
        // we record the generated userid as a cookie to be
        // passed back and forth between client and server.
        userid = ++userids;
        res.cookie('userid',
                   userid+'',
                   { maxAge : 900000 }); // 15 minutes
        // Store the user in our in memory database.
        online[userid] = user;
        // Redirect to main.
        var onlineUser=online[userid] 
        res.redirect('/'+onlineUser.username+'/home');
      }
    });
  }
};

// ## logout
// Deletes user info & cookies - then redirects to login.
exports.logout = function(req, res) {
  // TDR: handle cookies
  var userid = req.cookies.userid;
  if (online[userid] !== undefined) {
    res.clearCookie('userid');
    delete online[userid];
  }
  res.redirect('/');
};

