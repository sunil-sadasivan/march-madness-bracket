.PHONY: build dev run clean

# Build everything for production
build:
	cd frontend && npm install && npm run build
	cargo build --release

# Development: run backend and frontend dev server concurrently
dev:
	@echo "Starting Rust backend on :3000 and Vite dev server on :5173..."
	@(cargo run &) && cd frontend && npm install && npm run dev

# Run the production server (serves frontend from frontend/dist)
run:
	cargo run

# Clean build artifacts
clean:
	cargo clean
	rm -rf frontend/dist frontend/node_modules
