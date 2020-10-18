const router = require('express').Router();
const passport = require("passport");

router.get('/', passport.authenticate("discord"));
router.get('/red',passport.authenticate("discord",
	{
		failureRedirect:'failed',
	}
), function(req, res) {
    res.redirect('success') // Successful auth
});
router.get('/failed', (req,res)=>{

	res.send("sad face :(");
});
router.get('/success', (req,res)=>{
	//res.send("happy face :)<br/><img src="+req.user.image+">");
	res.redirect(req.session.redirectTo);
	//console.log(req);
});
module.exports = router;
