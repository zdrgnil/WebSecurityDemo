var mongoose = require('mongoose');

mongoose.connect('ds049854.mlab.com:49854/csc309', {
  user: 'websecurity',
  pass: 'websecurity'
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback (){console.log('Connected to MongoDB');});  


var userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  coin: Number,
  profile: String
});

var User = mongoose.model('User', userSchema);

exports.addUser = function (name, pwd, email,resp){
	var user = User.findOne({ username: name },function(err, user) {
		if (err) return console.error(err);
		if(user != null){
			resp(false);
			return;
		}else{
			var newUser = User({ username: name, password: pwd, email:email, coin: 100, profile: 'this person has no description' });
			newUser.save(function (err) {
				if(err) result = false;
				resp(true);
			});
		}
	});
}

exports.findUser = function(name, pwd, resp){
	User.findOne({ username: name, password:pwd }, function(err, user){
        if (err) return console.error(err);
        if(user!=null){
        	resp(true);
        }else{
        	resp(false);
        }
    });
}

exports.getInfo = function(name, resp){
	User.findOne({ username: name }, function(err, data){
        if (err) return console.error(err);
        resp(data);
    });
}

exports.transCoin = function(sender, receiver, amount, resp){
	User.findOne({ username: sender}, function(err, SenderData){
        if (err) return console.error(err);
        if(SenderData != null && SenderData.coin >= amount){
        	User.findOne({ username: receiver}, function(err, ReceiverData){
		        if (err) return console.error(err);
		        if(ReceiverData != null){
		        	console.log(receiver+':' + SenderData.coin+' v.s.' + amount +' v.s.'+ReceiverData.coin);
		        	//Let's hope this won't go wrong >_<
		        	User.update({ username: receiver}, {$inc: { coin: amount }}, function(err){
		        		if (err) return console.error(err);});
		        	User.update({ username: sender}, {$set: { coin: SenderData.coin-amount }}, function(err){
		        		if (err) return console.error(err);});
		        	resp(true);
	        	}else{
	        		resp(false);
	        	}
        	});
        }else{
        	resp(false);
        }
    });
}


function abc(){
	console.log('tiggered!');
}