var mysql = require("mysql2");

var connection_config = require("./connection_config.json");

var pool = mysql.createPool(connection_config);

async function query(sql, params) {
    return new Promise((resolve, reject) => {
        pool.query(sql, params, (err, result, fields) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

let sql = `EXPLAIN SELECT devices.mac,devices.nrmag,devices.magazin,
 IFNULL((SELECT nrBalot FROM stat_baloti WHERE data <= '2023-02-28 23:59:59' AND stat_baloti.mac=devices.mac ORDER BY data DESC LIMIT 1),
          (SELECT nrBalot FROM stat_baloti WHERE data >= '2023-02-28 23:59:59' AND stat_baloti.mac=devices.mac ORDER BY data ASC LIMIT 1)) -
          (IFNULL((SELECT nrBalot FROM stat_baloti WHERE data < '2023-02-01 01:00:00' AND devices.mac = stat_baloti.mac ORDER BY data DESC LIMIT 1),
          (SELECT nrBalot FROM stat_baloti WHERE data > '2023-02-01 01:00:00' AND devices.mac = stat_baloti.mac ORDER BY data ASC LIMIT 1))) AS 'feb. 2023',
 IFNULL((SELECT nrBalot FROM stat_baloti WHERE data <= '2023-03-31 23:59:59' AND stat_baloti.mac=devices.mac ORDER BY data DESC LIMIT 1),
          (SELECT nrBalot FROM stat_baloti WHERE data >= '2023-03-31 23:59:59' AND stat_baloti.mac=devices.mac ORDER BY data ASC LIMIT 1)) -
          (IFNULL((SELECT nrBalot FROM stat_baloti WHERE data < '2023-03-01 01:00:00' AND devices.mac = stat_baloti.mac ORDER BY data DESC LIMIT 1),
          (SELECT nrBalot FROM stat_baloti WHERE data > '2023-03-01 01:00:00' AND devices.mac = stat_baloti.mac ORDER BY data ASC LIMIT 1))) AS 'mar. 2023',
 IFNULL((SELECT nrBalot FROM stat_baloti WHERE data <= '2023-04-30 23:59:59' AND stat_baloti.mac=devices.mac ORDER BY data DESC LIMIT 1),
          (SELECT nrBalot FROM stat_baloti WHERE data >= '2023-04-30 23:59:59' AND stat_baloti.mac=devices.mac ORDER BY data ASC LIMIT 1)) -
          (IFNULL((SELECT nrBalot FROM stat_baloti WHERE data < '2023-04-01 01:00:00' AND devices.mac = stat_baloti.mac ORDER BY data DESC LIMIT 1),
          (SELECT nrBalot FROM stat_baloti WHERE data > '2023-04-01 01:00:00' AND devices.mac = stat_baloti.mac ORDER BY data ASC LIMIT 1))) AS 'apr. 2023',
 IFNULL((SELECT nrBalot FROM stat_baloti WHERE data <= '2023-05-31 23:59:59' AND stat_baloti.mac=devices.mac ORDER BY data DESC LIMIT 1),
          (SELECT nrBalot FROM stat_baloti WHERE data >= '2023-05-31 23:59:59' AND stat_baloti.mac=devices.mac ORDER BY data ASC LIMIT 1)) -
          (IFNULL((SELECT nrBalot FROM stat_baloti WHERE data < '2023-05-01 01:00:00' AND devices.mac = stat_baloti.mac ORDER BY data DESC LIMIT 1),
          (SELECT nrBalot FROM stat_baloti WHERE data > '2023-05-01 01:00:00' AND devices.mac = stat_baloti.mac ORDER BY data ASC LIMIT 1))) AS 'mai 2023',
 IFNULL((SELECT nrBalot FROM stat_baloti WHERE data <= '2023-06-30 23:59:59' AND stat_baloti.mac=devices.mac ORDER BY data DESC LIMIT 1),
          (SELECT nrBalot FROM stat_baloti WHERE data >= '2023-06-30 23:59:59' AND stat_baloti.mac=devices.mac ORDER BY data ASC LIMIT 1)) -
          (IFNULL((SELECT nrBalot FROM stat_baloti WHERE data < '2023-06-01 01:00:00' AND devices.mac = stat_baloti.mac ORDER BY data DESC LIMIT 1),
          (SELECT nrBalot FROM stat_baloti WHERE data > '2023-06-01 01:00:00' AND devices.mac = stat_baloti.mac ORDER BY data ASC LIMIT 1))) AS 'iun. 2023',
 IFNULL((SELECT nrBalot FROM stat_baloti WHERE data <= '2023-07-31 23:59:59' AND stat_baloti.mac=devices.mac ORDER BY data DESC LIMIT 1),
          (SELECT nrBalot FROM stat_baloti WHERE data >= '2023-07-31 23:59:59' AND stat_baloti.mac=devices.mac ORDER BY data ASC LIMIT 1)) -
          (IFNULL((SELECT nrBalot FROM stat_baloti WHERE data < '2023-07-01 01:00:00' AND devices.mac = stat_baloti.mac ORDER BY data DESC LIMIT 1),
          (SELECT nrBalot FROM stat_baloti WHERE data > '2023-07-01 01:00:00' AND devices.mac = stat_baloti.mac ORDER BY data ASC LIMIT 1))) AS 'iul. 2023',
 IFNULL((SELECT nrBalot FROM stat_baloti WHERE data <= '2023-08-31 23:59:59' AND stat_baloti.mac=devices.mac ORDER BY data DESC LIMIT 1),
          (SELECT nrBalot FROM stat_baloti WHERE data >= '2023-08-31 23:59:59' AND stat_baloti.mac=devices.mac ORDER BY data ASC LIMIT 1)) -
          (IFNULL((SELECT nrBalot FROM stat_baloti WHERE data < '2023-08-01 01:00:00' AND devices.mac = stat_baloti.mac ORDER BY data DESC LIMIT 1),
          (SELECT nrBalot FROM stat_baloti WHERE data > '2023-08-01 01:00:00' AND devices.mac = stat_baloti.mac ORDER BY data ASC LIMIT 1))) AS 'aug. 2023',
 IFNULL((SELECT nrBalot FROM stat_baloti WHERE data <= '2023-09-30 23:59:59' AND stat_baloti.mac=devices.mac ORDER BY data DESC LIMIT 1),
          (SELECT nrBalot FROM stat_baloti WHERE data >= '2023-09-30 23:59:59' AND stat_baloti.mac=devices.mac ORDER BY data ASC LIMIT 1)) -
          (IFNULL((SELECT nrBalot FROM stat_baloti WHERE data < '2023-09-01 01:00:00' AND devices.mac = stat_baloti.mac ORDER BY data DESC LIMIT 1),
          (SELECT nrBalot FROM stat_baloti WHERE data > '2023-09-01 01:00:00' AND devices.mac = stat_baloti.mac ORDER BY data ASC LIMIT 1))) AS 'sept. 2023',
 IFNULL((SELECT nrBalot FROM stat_baloti WHERE data <= '2023-10-31 23:59:59' AND stat_baloti.mac=devices.mac ORDER BY data DESC LIMIT 1),
          (SELECT nrBalot FROM stat_baloti WHERE data >= '2023-10-31 23:59:59' AND stat_baloti.mac=devices.mac ORDER BY data ASC LIMIT 1)) -
          (IFNULL((SELECT nrBalot FROM stat_baloti WHERE data < '2023-10-01 01:00:00' AND devices.mac = stat_baloti.mac ORDER BY data DESC LIMIT 1),
          (SELECT nrBalot FROM stat_baloti WHERE data > '2023-10-01 01:00:00' AND devices.mac = stat_baloti.mac ORDER BY data ASC LIMIT 1))) AS 'oct. 2023',
 IFNULL((SELECT nrBalot FROM stat_baloti WHERE data <= '2023-11-30 23:59:59' AND stat_baloti.mac=devices.mac ORDER BY data DESC LIMIT 1),
          (SELECT nrBalot FROM stat_baloti WHERE data >= '2023-11-30 23:59:59' AND stat_baloti.mac=devices.mac ORDER BY data ASC LIMIT 1)) -
          (IFNULL((SELECT nrBalot FROM stat_baloti WHERE data < '2023-11-01 01:00:00' AND devices.mac = stat_baloti.mac ORDER BY data DESC LIMIT 1),
          (SELECT nrBalot FROM stat_baloti WHERE data > '2023-11-01 01:00:00' AND devices.mac = stat_baloti.mac ORDER BY data ASC LIMIT 1))) AS 'nov. 2023',
 IFNULL((SELECT nrBalot FROM stat_baloti WHERE data <= '2023-12-31 23:59:59' AND stat_baloti.mac=devices.mac ORDER BY data DESC LIMIT 1),
          (SELECT nrBalot FROM stat_baloti WHERE data >= '2023-12-31 23:59:59' AND stat_baloti.mac=devices.mac ORDER BY data ASC LIMIT 1)) -
          (IFNULL((SELECT nrBalot FROM stat_baloti WHERE data < '2023-12-01 01:00:00' AND devices.mac = stat_baloti.mac ORDER BY data DESC LIMIT 1),
          (SELECT nrBalot FROM stat_baloti WHERE data > '2023-12-01 01:00:00' AND devices.mac = stat_baloti.mac ORDER BY data ASC LIMIT 1))) AS 'dec. 2023',
 IFNULL((SELECT nrBalot FROM stat_baloti WHERE data <= '2024-01-31 23:59:59' AND stat_baloti.mac=devices.mac ORDER BY data DESC LIMIT 1),
          (SELECT nrBalot FROM stat_baloti WHERE data >= '2024-01-31 23:59:59' AND stat_baloti.mac=devices.mac ORDER BY data ASC LIMIT 1)) -
          (IFNULL((SELECT nrBalot FROM stat_baloti WHERE data < '2024-01-01 01:00:00' AND devices.mac = stat_baloti.mac ORDER BY data DESC LIMIT 1),
          (SELECT nrBalot FROM stat_baloti WHERE data > '2024-01-01 01:00:00' AND devices.mac = stat_baloti.mac ORDER BY data ASC LIMIT 1))) AS 'ian. 2024',
 IFNULL((SELECT nrBalot FROM stat_baloti WHERE data <= '2024-02-29 23:59:00' AND stat_baloti.mac=devices.mac ORDER BY data DESC LIMIT 1),
          (SELECT nrBalot FROM stat_baloti WHERE data >= '2024-02-29 23:59:00' AND stat_baloti.mac=devices.mac ORDER BY data ASC LIMIT 1)) -
          (IFNULL((SELECT nrBalot FROM stat_baloti WHERE data < '2024-02-01 01:00:00' AND devices.mac = stat_baloti.mac ORDER BY data DESC LIMIT 1),
          (SELECT nrBalot FROM stat_baloti WHERE data > '2024-02-01 01:00:00' AND devices.mac = stat_baloti.mac ORDER BY data ASC LIMIT 1))) AS 'feb. 2024',
(IFNULL((SELECT nrBalot FROM stat_baloti WHERE data <= '2024-02-29 23:59' AND stat_baloti.mac=devices.mac ORDER BY data DESC LIMIT 1),
        (SELECT nrBalot FROM stat_baloti WHERE data >= '2024-02-29 23:59' AND stat_baloti.mac=devices.mac ORDER BY data ASC LIMIT 1))) -
        (IFNULL((SELECT nrBalot FROM stat_baloti WHERE data < '2023-02-01 00:00' AND devices.mac = stat_baloti.mac ORDER BY data DESC LIMIT 1),
        (SELECT nrBalot FROM stat_baloti WHERE data > '2023-02-01 00:00' AND devices.mac = stat_baloti.mac ORDER BY data ASC LIMIT 1))) AS blc
            FROM devices 
            LEFT JOIN stat_baloti ON devices.mac = stat_baloti.mac AND 
            stat_baloti.data BETWEEN '2023-02-01 00:00' AND '2024-02-29 23:59'
            WHERE
                devices.mac IN ('80646FABC8D1', '80646FADCAA2', '80646FABCA2F', '80646FA92793', '80646FABDA8C', '80646FA92AC7', '80646FA929F3', '80646FABC998', '80646FA92A88', '80646FAE080A', '80646FAF0824', '80646FABC83C')
            GROUP BY devices.mac;`;


// Function to execute the query and print the results
async function executeQueryAndPrint() {
    try {
        // Execute the query
        const results = await query(sql, []);

        // Print the results
        console.log("Query Results:", results);
    } catch (error) {
        // Handle any errors
        console.error("An error occurred:", error);
    }
}

// Call the function to execute the query and print the results
executeQueryAndPrint();
