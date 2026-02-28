from flask import Flask, render_template, request, redirect, url_for
import sqlite3
import random
import threading
import time

app = Flask(__name__)

def init_db():
    conn = sqlite3.connect("database.db")
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            url TEXT,
            current_price REAL,
            target_price REAL,
            status TEXT DEFAULT 'Tracking'
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS price_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER,
            price REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Seed initial data if empty
    c.execute("SELECT COUNT(*) FROM products")
    if c.fetchone()[0] == 0:
        products = [
            ("Wireless Headphones", "https://techstore.com", 2499, 2500, "Price Dropped"),
            ("Skincare Kit", "https://beautyhub.com", 1499, 1200, "Tracking"),
            ("Smart Watch Series X", "https://gadgets.com", 4999, 4200, "Tracking")
        ]

        c.executemany(
            "INSERT INTO products (name, url, current_price, target_price, status) VALUES (?, ?, ?, ?, ?)",
            products
        )
        
        # Seed initial history based on products
        for idx in range(1, 4):
             c.execute("INSERT INTO price_history (product_id, price) VALUES (?, ?)", (idx, products[idx-1][2]))

    conn.commit()
    conn.close()

def simulate_price_changes():
    while True:
        time.sleep(30)

        conn = sqlite3.connect("database.db")
        c = conn.cursor()

        c.execute("SELECT id, current_price, target_price FROM products")
        products = c.fetchall()

        for product in products:
            product_id = product[0]
            current_price = product[1]
            target_price = product[2]

            # Simulate price volatility
            change = random.randint(-300, 300)
            new_price = current_price + change

            if new_price < 100:
                new_price = 100

            status = "Tracking"
            if new_price <= target_price:
                status = "Price Dropped"

            c.execute("""
                UPDATE products
                SET current_price = ?, status = ?
                WHERE id = ?
            """, (new_price, status, product_id))

            c.execute("""
                INSERT INTO price_history (product_id, price)
                VALUES (?, ?)
            """, (product_id, new_price))

        conn.commit()
        conn.close()

@app.route('/')
@app.route('/dashboard')
def dashboard():
    conn = sqlite3.connect("database.db")
    c = conn.cursor()

    c.execute("SELECT * FROM products")
    products = c.fetchall()
    
    # Calculate simple stats
    total_savings = 0
    for p in products:
        # Assuming original price could be higher, for demo purposes we spoof savings
        if p[5] == 'Price Dropped':
            total_savings += (p[4] - p[3]) # Target - Current 
    
    # Ensure savings isn't negative for UI
    total_savings = max(0, total_savings) + 4325.50 # Adding base savings

    conn.close()
    return render_template("index.html", products=products, tracked_count=len(products), total_savings=total_savings)

@app.route('/add-product', methods=['GET', 'POST'])
def add_product():
    if request.method == 'POST':
        url = request.form['url']
        name = request.form['name']
        current_price = float(request.form['current_price']) if request.form['current_price'] else 0.0
        target_price = float(request.form['target_price'])

        conn = sqlite3.connect("database.db")
        c = conn.cursor()

        status = "Tracking"
        if current_price > 0 and current_price <= target_price:
            status = "Price Dropped"

        c.execute("""
            INSERT INTO products (name, url, current_price, target_price, status)
            VALUES (?, ?, ?, ?, ?)
        """, (name, url, current_price, target_price, status))

        product_id = c.lastrowid

        if current_price > 0:
            c.execute("""
                INSERT INTO price_history (product_id, price)
                VALUES (?, ?)
            """, (product_id, current_price))

        conn.commit()
        conn.close()

        return redirect(url_for('dashboard'))

    return render_template("add-product.html")

if __name__ == "__main__":
    init_db()
    
    # Start background simulator thread
    threading.Thread(target=simulate_price_changes, daemon=True).start()
    
    app.run(debug=True, port=5000)
