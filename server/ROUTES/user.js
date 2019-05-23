// returns information on currently logged in user 
exports.info = function() {
        res.json({ response: req.session.user });
}; 