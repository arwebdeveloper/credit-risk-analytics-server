import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs/promises";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize express app
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Data file path
const dataFilePath = join(__dirname, "data", "customers.json");

// Ensure data directory exists
const ensureDataDir = async () => {
  try {
    await fs.mkdir(join(__dirname, "data"), { recursive: true });
  } catch (error) {
    console.error("Error creating data directory:", error);
  }
};

// Initialize data if it doesn't exist
const initializeData = async () => {
  try {
    await ensureDataDir();

    try {
      await fs.access(dataFilePath);
    } catch (error) {
      // File doesn't exist, create it with sample data
      const sampleData = [
        {
          customerId: "CUST1001",
          name: "Alice Johnson",
          monthlyIncome: 6200,
          monthlyExpenses: 3500,
          creditScore: 710,
          outstandingLoans: 15000,
          loanRepaymentHistory: [1, 0, 1, 1, 1, 1, 0, 1],
          accountBalance: 12500,
          status: "Review",
        },
        {
          customerId: "CUST1002",
          name: "Bob Smith",
          monthlyIncome: 4800,
          monthlyExpenses: 2800,
          creditScore: 640,
          outstandingLoans: 20000,
          loanRepaymentHistory: [1, 1, 1, 0, 0, 1, 0, 0],
          accountBalance: 7300,
          status: "Approved",
        },
        {
          customerId: "CUST1003",
          name: "Charlie Brown",
          monthlyIncome: 7500,
          monthlyExpenses: 4200,
          creditScore: 780,
          outstandingLoans: 8000,
          loanRepaymentHistory: [1, 1, 1, 1, 1, 1, 1, 1],
          accountBalance: 25000,
          status: "Review",
        },
        {
          customerId: "CUST1004",
          name: "Diana Prince",
          monthlyIncome: 5300,
          monthlyExpenses: 3800,
          creditScore: 620,
          outstandingLoans: 30000,
          loanRepaymentHistory: [1, 0, 0, 1, 0, 1, 0, 1],
          accountBalance: 4500,
          status: "Rejected",
        },
        {
          customerId: "CUST1005",
          name: "Edward Norton",
          monthlyIncome: 9200,
          monthlyExpenses: 5100,
          creditScore: 750,
          outstandingLoans: 22000,
          loanRepaymentHistory: [1, 1, 1, 1, 0, 1, 1, 1],
          accountBalance: 18000,
          status: "Approved",
        },
      ];

      await fs.writeFile(dataFilePath, JSON.stringify(sampleData, null, 2));
      console.log("Sample data initialized");
    }
  } catch (error) {
    console.error("Error initializing data:", error);
  }
};

// Read data from file
const readData = async () => {
  try {
    const data = await fs.readFile(dataFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading data:", error);
    return [];
  }
};

// Write data to file
const writeData = async (data) => {
  try {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing data:", error);
    throw error;
  }
};

// Initialize data
initializeData();

// API Routes

// Get all customers
app.get("/api/test", async (req, res) => {
  console.log("App is working");
  res.json({ message: "App is working" });
});
app.get("/api/customers", async (req, res) => {
  try {
    const customers = await readData();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// Get customer by ID
app.get("/api/customers/:id", async (req, res) => {
  try {
    const customers = await readData();
    const customer = customers.find((c) => c.customerId === req.params.id);

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch customer" });
  }
});

// Update customer status
app.patch("/api/customers/:id", async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !["Review", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const customers = await readData();
    const customerIndex = customers.findIndex(
      (c) => c.customerId === req.params.id
    );

    if (customerIndex === -1) {
      return res.status(404).json({ error: "Customer not found" });
    }

    customers[customerIndex].status = status;
    await writeData(customers);

    res.json(customers[customerIndex]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update customer status" });
  }
});

// Create alert for high-risk customer
app.post("/api/alerts", (req, res) => {
  try {
    const { customerId, riskScore } = req.body;

    if (!customerId || !riskScore) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // In a real application, this would save to a database or trigger notifications
    console.log(
      `ALERT: High-risk customer ${customerId} with risk score ${riskScore} was approved`
    );

    res.status(201).json({ message: "Alert created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to create alert" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
