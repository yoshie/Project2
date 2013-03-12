var users = require('../lib/users');
var tweets = require('../lib/tweets');

exports.profile = function(req, res) {
  var username = req.params.user;
  var u = users.getUserById(username);
  if (u !== undefined ) {
    var tl = tweets.getTByUser(username);
    //console.log("profile tl: "+tl);
    var j = tl.length-1;
    //console.log(j);
    var content='';
    for (var i=j; i >= j-10 && i >= 0; i--) {
      //console.log("i="+i);
      var t = tl[i];
      var usr = users.getUserById(t.username);
      //console.log(usr.name);
      //console.log(i+" la");
      content += '<p><b>'+usr.name+'</b> <a href="/'+username+'">@'+username+'</a><br>'
                //+t.msg+'<br>'
                +users.msgToHtml(t.msg)+'<br>'
                +t.date+'</p>';
      //console.log("finish "+i);
    }
    res.render('profile',
              {title: 'Profile',
               name: u.name,
               username: username,
               followerN: u.follower.length,
               followingN: u.following.length,
               tweets: content
               }
      );
  } else {
    res.render('error',
               {title: 'Error',
                msg: "Oops, this user does not exist."});
  }
};

exports.user = function(req, res) {
  res.redirect('/'+req.params.user+'/profile');
};

exports.follower = function(req, res) {
	//console.log(req.params);
  var username = req.params.user;
  var user = users.getUserById(username);
  var followerlist = user.follower;
  var content = '';
  //console.log("followerlist: ",followerlist);
  if (followerlist.length !== 0) {
    content += users.userToHtml(followerlist);
  }
  //console.log("content: ", content);
	res.render('follower', 
  			{ title: 'Follower',
  			  name: user.name,
  			  username: username,
  			  content: content
  			   } );
};
exports.following = function(req, res) {
	var username = req.params.user;
    var user = users.getUserById(username);
    var followinglist = user.following;
    var content = '';
    //console.log("followinglist: ",followinglist);
    if (followinglist.length !== 0) {
      content += users.userToHtml(followinglist);
    }
    //console.log("content: ", content);
    res.render('following', 
         { title: 'Following',
          name: user.name,
          username: username,
          content: content
           } );
};

exports.newtweet = function(req, res) {
  var user = req.params.user;
  tweets.addTweet(tweets.tweets.length, user, req.body.message, null, null);
  users.addUserT(user, tweets.tweets.length-1);
  res.redirect('/'+user+'/home');
};