//commandExecutor??
//pobranie polecen z wewnetrznej bazy
//wykonanie polecen
//oznaczenie jako wykonane i wyslanie wyniku na serwer


//get all nne execuded and not sended
//inside filter: send again, execute and send

function getCommands () {
    var container;
    mongo.execute(function (db) {
        var collection = db.collection('rpiasCommand');
        collection.find({command_id: 3}).toArray(function(err, docs) {
            if (err) {

            }

            console.log(docs);
            container = docs;
        });
    });
}

// exports.insert = function (collection, data) {
//     db.collection.insert({var: 1});
// };
//
// exports.select = function (collectionName, col, data, container) {
//     this.execute(function (db) {
//         collection = db.collection(collectionName);
//         collection.find({command_id: data}).toArray(function(err, docs) {
//             if (err) {
//
//             }
//
//             console.log(docs);
//             container = docs;
//         });
//     });
// };
//
// exports.update = function (collection, col, search, newVal) {
//     //db.testCollection.update({"var": 1}, {$set: {"var": 5}})
// };
//
// exports.delete = function (id) {
//     //db.testCollection.remove({"var": 2})
// };
//
// exports.useDb = function (id) {
//     //use database
// };

//db rpias
//db.rpiasCommand.insert( { command_id: '2', command: 'df -h', to_be_exec: null } )
//dodac czas zapisu do bazy, output, status (czy wykonano) czas wykonania, czas trwania?

//items.find({
// created_at: {
//     $gte: ISODate("2010-04-29T00:00:00.000Z"),
//         $lt: ISODate("2010-05-01T00:00:00.000Z")
// }
// })


// exports.connect = function (mainConfig) {
//     var url = 'mongodb://localhost:27017/rpias';
//     config = mainConfig;
//
//     mongo.connect(url, function(err, dbObject) {
//         if (err) {
//             console.log('Connection error.');
//             console.log(err.message);
//         } else {
//             console.log(db);
//             db = dbObject;
//             collection = db.collection('rpiasCommand');
//             // console.log(collection.find({command_id: 3}).toArray(function(err, docs) {
//             //     console.log(err);
//             //     console.log(docs);
//             // }));
//            
//             //convert to synchronus
//             // console.log("Connected correctly to server.");
//         }
//         // assert.equal(null, err);
//        
//         //db.close();
//     });
// };


// var insertDocuments = function(db, callback) {
//   // Get the documents collection 
//   var collection = db.collection('documents');
//   // Insert some documents 
//   collection.insertMany([
//     {a : 1}, {a : 2}, {a : 3}
//   ], function(err, result) {
//     assert.equal(err, null);
//     assert.equal(3, result.result.n);
//     assert.equal(3, result.ops.length);
//     console.log("Inserted 3 documents into the document collection");
//     callback(result);
//   });
// }
// function getConnection() {
//     var currentTime = Date.now();
//
//     while (true) {
//         var timeout = Date.now();
//         var diff = timeout - currentTime;
//         var configTimeout = config.get('app.mongo_connection_timeout');
//         // console.log(diff);
//
//         if (db) {
//             console.log('ok');
//             return db;
//         }
//
//         if (diff > configTimeout) {
//             break;
//             // console.log('dupa');
//             //throw 'Mongo DB connection timeout: ' + configTimeout/1000 + 's';
//         }
//     }
// }