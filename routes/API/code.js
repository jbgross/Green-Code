var express = require('express');
var router = express.Router();
var mysql = require('mysql');
const fileUpload = require('express-fileupload');
router.use(fileUpload());

// gets the config settings for the db
const sqlConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
}
// creates a pool to handle query requests.
const pool = mysql.createPool(sqlConfig);

/**
 * Gets all the orders if there is no id in query
 * @Returns json object containing all code files in DB
 */
router.get('/', async function(req, res, next) {
    var codes = await new Promise(function (resolve, reject) {
        const query = 'SELECT * FROM Code';
        pool.query(query, function (error, results) {
            if (error) {
                req.err = error;
                reject(error);
            } else {
                resolve(results);
            }
        });
    });

    res.send(codes);
});

/**
 * Gets all columns info for given submissionId
 */
router.get('/searchById/:id', async function (req, res) {
    const rows = await new Promise (function (resolve, reject) {
        const query = 'SELECT * FROM Code WHERE submissionId = ?';
        const values = [req.params.id];

        pool.query(query, values, function (error, results) {
            if(error) {
                req.err = error;
                reject(error);
            } else {
                resolve(results);
            }
        });
    }); 

    const code = rows[0];

    return code;
});

router.get('/downloadById/:id', async function (req, res) {
    const rows = await new Promise (function (resolve, reject) {
        const query = 'SELECT * FROM Code WHERE submissionId = ?';
        const values = [req.params.id];

        pool.query(query, values, function (error, results) {
            if(error) {
                req.err = error;
                reject(error);
            } else {
                resolve(results);
            }
        });
    }); 

    const code = rows[0];

    res.attachment(code.codeName);
    res.type(code.mimetype);
    res.send(code.codeString);
});

// // Gets file by given id and file extension 
// router.get('/searchByIdAndExt/:id.:ext', async function (req, res) {
//     var x;
//     var code = await new Promise (function (resolve, reject) {
//         const query = 'SELECT codeString FROM Code WHERE submissionId = ? AND mimeType = ?' ;
//         const values = [req.params.id, req.params.ext];
//         console.log(values);

//         pool.query(query, values, function (error, results) {
//             if(error) {
//                 req.err = error;
//                 reject(error);
//             } else {
//                 resolve(results);
//             }
//         });
//     }); 
//     x = code[0]["codeString"];
//     res.send(x);
// });

/**
 * Uploads code file into database 
 */
router.post('/upload', function (req, res) {
    let sampleFile;
    let ext;

    if(!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    sampleFile = req.files.sampleFile;
    ext = sampleFile.name.split('.');
    
    console.log(sampleFile);
    console.log(ext[1]);
    pool.query('INSERT INTO User VALUES (NULL, ?)', ['ahelman@csumb.edu']);

    pool.query('INSERT INTO Code VALUES (NULL, ?, ?, ?, ?, NULL, NULL)', [1, sampleFile.name, ext[1], sampleFile.data], (err, codes) => {
        if(!err) {
            // res.send("file Uploaded");
            const query = 'SELECT * FROM Code';
            pool.query(query, [sampleFile.name, ext[1], sampleFile.data], (err, codes) => {
                if(!err) {
                    // res.send("file Uploaded");
                    res.render('codeListing', { data: codes });
                } else {
                    console.log(err);
                }
            });
        } else {
            console.log(err);
        }
    });

});

router.put('/uploadJson/:id', function (req, res) {
    pool.query('UPDATE Code SET jsonString = ? WHERE submissionId = ? ', [JSON.stringify(req.body), req.params.id], (err, codes) => {
        if(!err) {
            console.log(codes);
            res.status(204).send('Json uploaded successfully');
        } else {
            console.log(err);
        }
    });

});

module.exports = router;

