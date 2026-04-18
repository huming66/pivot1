import * as duckdb from 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@latest/+esm';
export async function exportCsv(data) {
    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'data.csv';
    link.click();
}
var db;
async function initDuckDB() {
    try {
        // receive the bundles of files required to run duckdb in the browser
        // this is the compiled wasm code, the js and worker scripts
        // worker scripts are js scripts ran in background threads (not the same thread as the ui)
        const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
        // select bundle is a function that selects the files that will work with your browser
        const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
    
        // creates storage and an address for the main worker
        const worker_url = URL.createObjectURL(
          new Blob([`importScripts("${bundle.mainWorker}");`], {
            type: "text/javascript",
          })
        );
    
        // creates the worker and logger required for an instance of duckdb
        const worker = new Worker(worker_url);
        const logger = new duckdb.ConsoleLogger();
        db = new duckdb.AsyncDuckDB(logger, worker);
    
        // loads the web assembly module into memory and configures it
        await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    
        // revoke the object url now no longer needed
        URL.revokeObjectURL(worker_url);
        console.log("DuckDB-Wasm initialized successfully.");
      } catch (error) {
        console.error("Error initializing DuckDB-Wasm:", error);
      }
    }
export async function exportDuckDB(data) {
    await initDuckDB()
    try {
        if (!db) {
            console.error("DuckDB-Wasm is not initialized");
            return;
        } else console.log("==============")  
        const conn = await db.connect();  
        // Sample data to insert into DuckDB
        const sampleData = [
            ['id', 'name', 'age'],
            [1, 'Alice', 30],
            [2, 'Bob', 25],
            [3, 'Charlie', 35]
        ];
        // Create a table in DuckDB
        const createTableQuery = `
            CREATE TABLE my_table AS 
            SELECT * FROM (VALUES ${sampleData.map(row => `(${row.map(val => `'${val}'`).join(',')})`).join(', ')})
        `;
        await conn.query(createTableQuery)
        let a = await conn.query('select * from my_table')
        const exportedFile = await conn.exportDuckDB() //conn.exportDuckDB()
        const link = document.createElement('a');
        link.href = URL.createObjectURL(exportedFile);
        link.download = 'data_' + d3.time.format("%Y%m%d%H%M%S")(new Date()) + '.ddb'
        link.click();
        await conn.close()





        // // Export the DuckDB database to a .duckdb file
        // const exportedFile = await db.export();

        // // Trigger a download of the .duckdb file
        // const link = document.createElement('a');
        // link.href = URL.createObjectURL(exportedFile);
        // link.download = 'data.duckdb';
        // link.click();

        // console.log("Exported DuckDB database as .duckdb file.");

    } catch (error) {
        console.error("Error exporting DuckDB:", error);
    }
}


// export async function exportDuckDB(data) {
//     const createTableQuery = `CREATE TABLE my_table AS SELECT * FROM (VALUES ${data.map(row => `(${row.map(val => `'${val}'`).join(',')})`).join(', ')})`;
//     // Query to create table
//     const result = await duckdb.query(createTableQuery);

//     // Export the DuckDB database to a file
//     const exportedFile = await duckdb.export();

//     // Trigger download of the DuckDB file
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(exportedFile);
//     // link.download = 'data.duckdb';
//     link.download = 'data_' + d3.time.format("%Y%m%d%H%M%S")(new Date()) + '.ddb'
//     link.click();
// }
// // Sample data to export (you can replace this with your actual data)
// const sampleData = [
//     ['id', 'name', 'age'],
//     [1, 'Alice', 30],
//     [2, 'Bob', 25],
//     [3, 'Charlie', 35]
// ];

// // Event listeners for the buttons
// document.getElementById('exportCsvButton').addEventListener('click', () => {
//     exportCsv(sampleData);
// });

document.getElementById('saveDDB').addEventListener('click', () => {
    exportDuckDB(spa.data);
    // initDuckDB()
});