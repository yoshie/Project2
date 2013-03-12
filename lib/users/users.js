// # Users Module
// This is a module for accessing user data. We are using
// [Docker](https://github.com/jbt/docker), a documentation generation
// library, that will convert the inline documentation in [Markdown
// format](http://daringfireball.net/projects/markdown/syntax) into
// HTML that can be used to display documentation alongside the source
// code. You will use this to document your projects.

// ## In Memory User Database
// We will use a simple array `users` to record user data.
// We could easily replace this with calls to a *database layer*
var userdb = [
  {name: 'Weini Yu', 
 username: 'weini', 
 email: 'ysasaki2014@gmail.com', 
 password: 'weini_pw', 
 location: 'weini_location', 
 website: 'weini_website', 
 profileImage: 'weini_image.jpg', 
 follower: ['rae', 'yoshie'], 
 following: ['rae', 'yoshie'], 
 tweets: [0] },
{name: 'Rae Recto', 
 username: 'rae', 
 email: 'aqua_manga@yahoo.com', 
 password: 'rae_pw', 
 location: 'rae_location', 
 website: 'rae_website', 
 profileImage: 'rae_image.jpg', 
 follower: ['weini', 'yoshie'], 
 following: ['weini', 'yoshie'], 
 tweets: [1] },
 {name: 'Yoshie Sasaki', 
 username: 'yoshie', 
 email: 'ysasaki@smith.edu', 
 password: 'yoshie_pw', 
 location: 'yoshie_location', 
 website: 'yoshie_website', 
 profileImage: 'yoshie_image.jpg', 
 follower: ['weini'], 
 following: ['weini', 'rae'], 
 tweets: [2]}
];
exports.userdb = userdb;

function User(name, username, password, uid, email, location, website, profileImage, follower, following, tweets) {
  this.name     = name;
  this.username = username;
  this.password = password;
  this.email    = email; 
  this.location = location;
  this.website  = website;
  this.profileImage =  profileImage;
  this.follower = follower;
  this.following = following;
  this.tweets   = tweets;
}

//List of usernames that are pending verification codes
var codeUserList = [];
exports.codeUserList = codeUserList;

//Contains objects with username and matching code
var emailVerUsers = []
exports.emailVerUsers = emailVerUsers;
// ## Exported Functions

// ### *function*: addUser
/**
 * Adds a user to the "database". The `userData` is an object with
 * the following properties:
 *
 * - `fname` The user's first name
 * - `lname` The user's last name
 * - `pass` The user's password
 * - `sex` The user's gender (male|female)
 *
 * @param {object} userData The user data
 */
 //****
//
//
function flash(req, res, name, value) {
  // If `value` is not undefined we are *setting* a flash
  // value (i.e., setting a cookie).
  if (value !== undefined) {
    res.cookie(name, value);
    // We return the `value` to be consistent with the
    // alternative call - to retrieve the value.
    return value;
  }
  else {
    // Grab the `value` from the cookies sent along with
    // the request.
    value = req.cookies[name];
    // Clear the cookie in the response.
    res.clearCookie(name);
    // Return the `value`.
    return value;
  }
};
exports.flash = flash;

//Function to delete a user from the codeUserList
function delFromCodeList(username){
    for(var i = 0; i < codeUserList.length; i++){
        if(codeUserList[i] === username){
            delete codeUserList[i];
            codeUserList.splice(i,1);
            break;
        }
    }
}
exports.delFromCodeList = delFromCodeList; 

//Function to delete a user from the codeUserList
function delFromForgotUsers(username){
    for(var i = 0; i < codeUserList.length; i++){
        if(codeUserList[i] === username){
            delete codeUserList[i];
            codeUserList.splice(i,1);
            break;
        }
    }
}
exports.delFromForgotUsers = delFromForgotUsers; 
 //*****
//Function to get the user
function get_user(user) {
    var u = undefined;
    for (var i = 0; i < userdb.length; i++) {
        if (userdb[i].username === user) {
            u = userdb[i];
            break;
        }
    }
    return u;
}

exports.get_user = get_user;

//Function to lookup username and password for login/logout
exports.lookup = function(username, password, cb) {
  var len = userdb.length;
  console.log(cb);
  console.log(username);
  console.log(password);
  if ((username == '' || password == '')){
       cb('Enter both the username and password.');
  }else{
     for (var i = 0; i < len; i++) {
       var u = userdb[i];
       if (u.username === username) {
         if (u.password === password) {
            cb(undefined, u);
         }
         else {
            cb('Password is not correct.');
         }
         return;
       }
     }
     cb('User not found');
  }
};

exports.lookupForgotLoginInfo = function(email, cb){
   if(email.length > 0){
     for(var i = 0; i < userdb.length; i++){
        console.log("Userdb email:"+userdb[i].email+" email:"+email);
        console.log("Type1 "+typeof userdb[i] + "Type2: "+email);
        console.log(userdb[i].email === email);
        if(userdb[i].email === email){
           var name = userdb[i].username;
           var username = userdb[i].username;
           var password = userdb[i].password;
           //emailLoginInfo(name, username, email, password);
           cb("An email has been sent out with the information.");
          break;
        }else if(i == userdb.length-1 && userdb[i].email != email){
           cb("The email is not associated with any Tweetee account.");
        }
    }
   }else{
     cb("Please make sure that all of the required  are filled");
   }
};


/*Register Requirements - 
    *   1. The fields of: Name, Username, E-mail, Password, Retype P are filled (astarisk indicated)
    *   2. The username is not already taken and no spaces
    *   3. The email is valid (with @ symbol at least?)
    *   4. The password is a minimum of 6 characters and the retype matches
    *   People can reference any location and website
    * If requirements are not fulfiled then the respective error message is displayed
*/
exports.lookupRegistrationParams = function(name, username, email, password, retypeP, location, website, cb){
    if(name.length == 0 || username.length == 0 || email.length == 0 || password.length == 0){
      //If at least one of the necessary parameters do not exist, error posted
        cb("Please make sure that all of the required fields are filled");
    }else if(checkUsername(username)){
        //If the username is taken, error. end
        cb("The username is currently taken. Please chose another and try again.");
    }else if(checkEmail(email)){
        //Email missing a @?
        cb("The email is invalid. Please try again.");
    }else if(checkPassword(password, retypeP)){
        //Password is less than 6 characters and match
        cb("The passwords must match and be at least 6 characters long.");
    }else{
        //Form passed the check, so the registration code is gained
        //Construct the code
        cb(undefined);
        var randVarCode = makeCode();
        var userVerObj = {
               name: name, username: username,
               password: password, 
               email:email, 
               code:randVarCode, 
               location:location, 
               website:website
        }; //Store the code and url for the user
        emailVerUsers.push(userVerObj);
        //Send an email to the person with link and code
        //emailCode(name, username, password, email, randVarCode);
        console.log("Email Sent!");
        codeUserList.push(username);
    }
};

exports.lookupCodeCheck = function(code, cb){
    var b = false;
    for(var i=0;i<users.emailVerUsers.length;i++){
        if(users.emailVerUsers[i].code == formCode){
          b = true;
          var userToVerify = users.emailVerUsers[i];
          break;
        }
    }
    if(!b){
      //Create the new user
      users.delFromCodeList(userToVerify);
      var newUser = {
        name: userToVerify.name,
        username: userToVerify.username,
        password: userToVerify.password,
        email: userToVerify.email,
        location: userToVerify.location,
        website: userToVerify.website,
      };
      users.userdb.push(newUser);
      cb("The code is incorrect! Try Again.");
    }
    cb(undefined);
};

function addUser(userData) {
    userData.date = new Date();
    userdb.push(userData);
    userdb.sort(function (u1, u2) {
	return u1.lname < u2.lname;
    });
}

// Export the `addUser` function.
exports.addUser = addUser;

// ### *function*: getUserInfo
/**
 * Gets the information for all users. This function expects a callback
 * to be received with the signature: `function (array)`, where the `array`
 * is a populated array of strings containing each user's information.
 * @param {array} list An empty list
 * @param {callback} callback function to receive the populated array
 */
function getUserInfo(list, callback) {
    var len = userdb.length;
    for (var i = 0; i < len; i++) {
	var u = userdb[i];
	list.push(u.fname + ' ' + u.lname);
    }
    callback(list);
}

// Export the `getUserInfo` function.
exports.getUserInfo = getUserInfo;

////////////

//function that checks to see if the username is already existant in the userlist
function checkUsername(username){
    var b = false;
    for (var i=0;i<userdb.length;i++){
        if(userdb[i].username==username || containsChar(username,' ')){
            //if a usrename is found that is already in the database
            b = true;
            break;
        }
    }
    for (var j=0;j<userdb.length;j++){
        if(codeUserList[j]==username){
            //if a username is found that is already in the pending verification list
            b = true;
            break;
        }
    }
    return b
    //returns boolean true or false depending on whether it exists
}
exports.checkUsername = checkUsername;

//function that checks if the email is valid
function checkEmail(email){
    var b = containsChar(email, '@')
    return !b;
  //returns boolean true false if the email is existant
}
exports.checkEmail = checkEmail;

//function that checks if the password is long enough
function checkPassword(password,retypeP){
    var b = false
    if(password != retypeP || password.length < 6){ b=true };
    return b;
}
exports.checkPassword = checkPassword

function containsChar(string, char){
   var b = false;
   for(var i=0; i<string.length; i++){
      var l = string.charAt(i);
      if(l == char){
         b = true;
      }
    }
    return b
}
//Creates a random 10 char code for verification
function makeCode(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
};
exports.makeCode = makeCode;

//Sends tweetee verification email for registration with Alpha Mail (node_modules -> alphamail)
function emailCode(name, username, password, email, code){
    var alphamail = require('alphamail');
    var emailService = new alphamail.EmailService("513cedbd564467-24442067");
    var message = {
       "name": name,
       "username": username,
       "code": code,
       "url": "http:\/\/localhost:3000/verifyCode\/"
    };
    var payload = new alphamail.EmailMessagePayload()
       .setProjectId(1452) // ID of "Tweetee Registration Code" project
       .setSender(new alphamail.EmailContact("ysasaki2014@gmail.com", "ysasaki2014@gmail.com"))
       .setReceiver(new alphamail.EmailContact(email, email))
       .setBodyObject(message);

    emailService.queue(payload, function(error, result){
       if(error){
           console.log("Error! " + result + " (" + error + ")");
       }else{
           console.log("Mail successfully sent! ID = " + result);
       }
    });
};
//Sends tweetee login information with Alpha Mail (node_modules -> alphamail)
function emailLoginInfo(name, username, email, password){
    var alphamail = require('alphamail');
    var emailService = new alphamail.EmailService("513cedbd564467-24442067");
    var message = {
        "name": name,
        "username": username,
        "password": password,
        "url": "http:\/\/localhost:3000\/"
    };
    var payload = new alphamail.EmailMessagePayload()
        .setProjectId(1456) // ID of "Tweetee Login Assistance" project
        .setSender(new alphamail.EmailContact("ysasaki2014@gmail.com", "ysasaki2014@gmail.com"))
        .setReceiver(new alphamail.EmailContact(email, email))
        .setBodyObject(message);
    emailService.queue(payload, function(error, result){
        if(error){
            console.log("Error! " + result + " (" + error + ")");
        }else{
            console.log("Mail successfully sent! ID = " + result);
        }
    });
};
/////////////////////////////////////////////////
/* 
 * Find @username and #hashtag in a tweet message and convert them to a html href link.
 * In order to be recognized as a @username mention, @ symbol must be the start
 * of a word. And @username@username is considered invalid and is ignored.
 * #hashtag starts with # and end before a space. #ford! is considered a hashtag.
 * (used in home page and )
 */
function msgToHtml(msg) {
  msg = msg.split(" ");
  var content = '';
  var len = msg.length;
  for (var i=0; i < len; i++) {
    var word = msg[i];
    console.log("");
    if (word.charAt(0) === "@" && word.split("\@").length === 2) {
      content += ' <a href="/'+word.substring(1)+'/profile">'+word+'</a> ';
    } else if (word.charAt(0) === "#" && word.split("\#").length === 2) { //#ford! <- !
      content += ' <a href="/search/'+word.substring(1)+'">'+word+'</a> ';
    } else {
      content += word+" ";
    } 
  }
  console.log("html content: "+content);
  return content;
};
exports.msgToHtml = msgToHtml;

function userToHtml(userlist) {
  //console.log("userlist: ", userlist);
  var content = '';
  var len = userlist.length-1;
  //console.log("len ",len);
  for (var i=len; i >= 0; i--) {
    //console.log("userlist[i]: ",userlist[i]);
    var u = users.getUserById(userlist[i]);
    //console.log("u: ",u);
    content += '<p><b>'+u.name+'</b> <a href="/'+u.username+'/profile">@'+u.username+'</a><br>';
    content += '<button onclick="deleteFollower()">Delete</button></p>';
  }
  return content;
};
exports.userToHtml = userToHtml;

function getUserById(username) {
    var len = userdb.length;
    for (i=0; i < len; i++) {
        if (userdb[i].username === username) {
            //console.log(ul[i].username);
            break;
        }
    }
    return userdb[i];
}
exports.getUserById = getUserById;

function addUserT(username, id) {
    getUserById(username).tweets.push(id);
}
exports.addUserT = addUserT;

