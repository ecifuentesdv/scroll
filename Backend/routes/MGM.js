const { Router } = require('express');
const router = Router();
const { check } = require('express-validator');

//Constructor
const { addMoneyThor, addMoneyThorAlerta } = require('../controllers/MGM');

router.post('/', [

], addMoneyThor )



router.post('/Alerta', [

], addMoneyThorAlerta )

module.exports = router;