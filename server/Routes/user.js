// returns information on currently logged in user 
exports.info = function(req, res) {
    res.json({ response: req.session.user });
}