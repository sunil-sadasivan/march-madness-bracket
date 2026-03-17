mod data;

use axum::{http, routing::get, Json, Router};
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::ServeDir;

async fn get_bracket() -> Json<data::BracketData> {
    Json(data::get_bracket_data())
}

async fn health() -> Json<serde_json::Value> {
    Json(serde_json::json!({"status": "ok"}))
}

#[tokio::main]
async fn main() {
    let cors = CorsLayer::new()
        .allow_origin("http://localhost:5173".parse::<http::HeaderValue>().unwrap())
        .allow_methods(Any)
        .allow_headers(Any);

    let serve_dir = ServeDir::new("frontend/dist")
        .fallback(tower_http::services::ServeFile::new("frontend/dist/index.html"));

    let app = Router::new()
        .route("/api/bracket", get(get_bracket))
        .route("/api/health", get(health))
        .layer(cors)
        .fallback_service(serve_dir);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    println!("Server running on http://localhost:3000");
    axum::serve(listener, app).await.unwrap();
}
