const { connectDB, closeDB, getDB } = require('./database');

async function resetProducts() {
    try {
        console.log("🔄 Resetting Product Catalog...");
        const db = await connectDB();
        const productsCollection = db.collection('products');

        // Remove existing products
        await productsCollection.deleteMany({});
        console.log("🗑️ Existing products cleared.");

        // New Car Dealership Products
        const dealershipProducts = [
            {
                name: "Full Service Maintenance",
                price: 250,
                active: true,
                description: "Comprehensive vehicle health check and service",
                createdAt: new Date()
            },
            {
                name: "Synthetic Oil Change",
                price: 89,
                active: true,
                description: "High-performance synthetic oil and filter",
                createdAt: new Date()
            },
            {
                name: "Exterior Ceramic Coating",
                price: 450,
                active: true,
                description: "Premium paint protection and shine",
                createdAt: new Date()
            },
            {
                name: "Luxury Interior Valet",
                price: 120,
                active: true,
                description: "Deep clean and leather treatment",
                createdAt: new Date()
            },
            {
                name: "Brake System Overhaul",
                price: 350,
                active: true,
                description: "Pad and rotor replacement for all wheels",
                createdAt: new Date()
            }
        ];

        await productsCollection.insertMany(dealershipProducts);
        console.log("✅ Car Dealership products initialized!");

        await closeDB();
        process.exit(0);
    } catch (error) {
        console.error("❌ Reset failed:", error.message);
        process.exit(1);
    }
}

resetProducts();
