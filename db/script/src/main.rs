use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use rusqlite::Connection;
use serde::Deserialize;
use std::sync::Mutex;

// Import your functions.
use script::dbhandler::{decrypt, insert_data, withdraw};

/// Structure for the API request payload.
#[derive(Deserialize)]
struct TransactionRequest {
    wallet: String,
    amount: u64,
}

/// Shared application state containing the SQLite connection.
struct AppState {
    conn: Mutex<Connection>,
}

/// Endpoint to record a credit (insert with debit = 0).
async fn credit_handler(
    req: web::Json<TransactionRequest>,
    data: web::Data<AppState>,
) -> impl Responder {
    let conn = data.conn.lock().unwrap();
    insert_data(&conn, 0, req.amount, &req.wallet);
    HttpResponse::Ok().body("Credit operation successful")
}

/// Endpoint to record a debit (insert with credit = 0).
async fn debit_handler(
    req: web::Json<TransactionRequest>,
    data: web::Data<AppState>,
) -> impl Responder {
    let conn = data.conn.lock().unwrap();
    insert_data(&conn, req.amount, 0, &req.wallet);
    HttpResponse::Ok().body("Debit operation successful")
}

/// Endpoint to perform a withdraw.
async fn withdraw_handler(
    req: web::Json<TransactionRequest>,
    data: web::Data<AppState>,
) -> impl Responder {
    let conn = data.conn.lock().unwrap();
    let result = withdraw(&req.wallet, req.amount, &conn);
    HttpResponse::Ok().body(format!("Withdraw operation successful: {:?}", result))
}

/// Endpoint to perform a decrypt operation.
async fn decrypt_handler(
    req: web::Json<TransactionRequest>,
    data: web::Data<AppState>,
) -> impl Responder {
    let conn = data.conn.lock().unwrap();
    let result = decrypt(&req.wallet, req.amount, &conn);
    HttpResponse::Ok().body(format!("{:?}", result))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Open (or create) the database.
    let conn = Connection::open("wallets.db").expect("Failed to open database");

    // Create the table if it does not exist.
    conn.execute(
        "CREATE TABLE IF NOT EXISTS wallet_txs (
            id INTEGER PRIMARY KEY,
            wallet TEXT NOT NULL,
            debit INTEGER NOT NULL,
            credit INTEGER NOT NULL,
            net INTEGER NOT NULL
        )",
        [],
    )
    .expect("table creation failed");

    // Wrap the connection in application state.
    let app_state = web::Data::new(AppState {
        conn: Mutex::new(conn),
    });

    // Start the HTTP server.
    HttpServer::new(move || {
        App::new()
            .app_data(app_state.clone())
            .route("/credit", web::post().to(credit_handler))
            .route("/debit", web::post().to(debit_handler))
            .route("/withdraw", web::post().to(withdraw_handler))
            .route("/decrypt", web::post().to(decrypt_handler))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
