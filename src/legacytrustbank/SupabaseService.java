package legacytrustbank;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDateTime;

/**
 * Database service using SQLite.
 * The database file (bankdata.db) is created automatically on first run.
 */
public class SupabaseService {

    private static final String DB_DIR  = "C:\\ProgramData\\LegacyTrustBank";
    private static final String DB_URL  = "jdbc:sqlite:" + DB_DIR + "\\bankdata.db";

    /**
     * Establishes a connection to the shared SQLite database.
     * Creates the ProgramData directory automatically on first run.
     */
    private Connection connect() throws SQLException {
        java.io.File dir = new java.io.File(DB_DIR);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        Connection conn = DriverManager.getConnection(DB_URL);
        try (Statement st = conn.createStatement()) {
            st.execute("PRAGMA foreign_keys = ON");
        }
        return conn;
    }

    /**
     * Creates all required tables if they do not already exist.
     * Call this once at application startup (e.g. from Login or main).
     */
    public void initializeDatabase() {
        String createUsers = """
            CREATE TABLE IF NOT EXISTS users (
                user_id   INTEGER PRIMARY KEY AUTOINCREMENT,
                username  TEXT    NOT NULL UNIQUE,
                email     TEXT    NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                full_name TEXT    NOT NULL,
                created_at TEXT   NOT NULL
            )
            """;

        String createAccounts = """
            CREATE TABLE IF NOT EXISTS accounts (
                account_id   INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id      INTEGER NOT NULL,
                account_type TEXT    NOT NULL,
                balance      REAL    NOT NULL DEFAULT 0.0,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
            """;

        String createTransactions = """
            CREATE TABLE IF NOT EXISTS transactions (
                transaction_id   INTEGER PRIMARY KEY AUTOINCREMENT,
                account_id       INTEGER NOT NULL,
                transaction_type TEXT    NOT NULL,
                amount           REAL    NOT NULL,
                description      TEXT,
                transaction_date TEXT    NOT NULL,
                FOREIGN KEY (account_id) REFERENCES accounts(account_id)
            )
            """;

        try (Connection conn = connect();
             Statement st = conn.createStatement()) {
            st.execute(createUsers);
            st.execute(createAccounts);
            st.execute(createTransactions);
        } catch (SQLException e) {
            System.out.println("Error initializing database: " + e.getMessage());
        }
    }

    /**
     * Validates user credentials for login.
     * @return The user ID if valid, -1 if invalid.
     */
    public int validateLogin(String username, String password) {
        String sql = "SELECT user_id, password_hash FROM users WHERE username = ?";

        try (Connection conn = connect();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, username);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                String storedHash = rs.getString("password_hash");
                if (password.equals(storedHash)) {
                    return rs.getInt("user_id");
                }
            }

        } catch (SQLException e) {
            System.out.println("Error validating login: " + e.getMessage());
        }

        return -1;
    }

    /**
     * Checks if a username or email already exists.
     */
    public boolean userExists(String username, String email) {
        String sql = "SELECT COUNT(*) FROM users WHERE username = ? OR email = ?";

        try (Connection conn = connect();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, username);
            pstmt.setString(2, email);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                return rs.getInt(1) > 0;
            }

        } catch (SQLException e) {
            System.out.println("Error checking if user exists: " + e.getMessage());
        }

        return false;
    }

    /**
     * Creates a new user and their default Current and Savings accounts.
     * @return The new user ID if successful, -1 if failed.
     */
    public int createUser(String username, String email, String password, String fullName) {
        String sql = "INSERT INTO users (username, email, password_hash, full_name, created_at) VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = connect();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            pstmt.setString(1, username);
            pstmt.setString(2, email);
            pstmt.setString(3, password);
            pstmt.setString(4, fullName);
            pstmt.setString(5, LocalDateTime.now().toString());
            pstmt.executeUpdate();

            ResultSet keys = pstmt.getGeneratedKeys();
            if (keys.next()) {
                int userId = keys.getInt(1);
                createDefaultAccounts(conn, userId);
                return userId;
            }

        } catch (SQLException e) {
            System.out.println("Error creating user: " + e.getMessage());
        }

        return -1;
    }

    /**
     * Creates default Current and Savings accounts for a new user.
     * Reuses the existing connection to run in the same transaction.
     */
    private void createDefaultAccounts(Connection conn, int userId) {
        String sql = "INSERT INTO accounts (user_id, account_type, balance) VALUES (?, ?, ?)";

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, userId);
            pstmt.setString(2, "Current");
            pstmt.setDouble(3, 0.0);
            pstmt.executeUpdate();

            pstmt.setInt(1, userId);
            pstmt.setString(2, "Savings");
            pstmt.setDouble(3, 0.0);
            pstmt.executeUpdate();

        } catch (SQLException e) {
            System.out.println("Error creating default accounts: " + e.getMessage());
        }
    }

    /**
     * Gets the full name of a user by their ID.
     */
    public String getUserFullName(int userId) {
        String sql = "SELECT full_name FROM users WHERE user_id = ?";

        try (Connection conn = connect();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, userId);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                return rs.getString("full_name");
            }

        } catch (SQLException e) {
            System.out.println("Error getting user full name: " + e.getMessage());
        }

        return "User";
    }

    /**
     * Fetches transactions for a specific account type for the given user.
     */
    public java.util.List<Object[]> getUserTransactions(int userId, String accountType) {
        java.util.List<Object[]> transactions = new java.util.ArrayList<>();
        String sql = """
            SELECT t.transaction_date, t.description, t.transaction_type, t.amount
            FROM transactions t
            JOIN accounts a ON t.account_id = a.account_id
            WHERE a.user_id = ? AND a.account_type = ?
            ORDER BY t.transaction_date DESC
            """;

        try (Connection conn = connect();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, userId);
            pstmt.setString(2, accountType);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                String date = rs.getString("transaction_date").substring(0, 10);
                String description = rs.getString("description");
                String transactionType = rs.getString("transaction_type");
                double amount = rs.getDouble("amount");
                transactions.add(new Object[]{date, description, transactionType, String.format("%.2f", amount)});
            }

        } catch (SQLException e) {
            System.out.println("Error fetching transactions: " + e.getMessage());
        }

        return transactions;
    }

    /**
     * Fetches all transactions across all accounts for the given user.
     */
    public java.util.List<Object[]> getAllUserTransactions(int userId) {
        java.util.List<Object[]> transactions = new java.util.ArrayList<>();
        String sql = """
            SELECT t.transaction_date, t.description, t.transaction_type, t.amount, a.account_type
            FROM transactions t
            JOIN accounts a ON t.account_id = a.account_id
            WHERE a.user_id = ?
            ORDER BY t.transaction_date DESC
            """;

        try (Connection conn = connect();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, userId);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                String date = rs.getString("transaction_date").substring(0, 10);
                String description = rs.getString("description") + " (" + rs.getString("account_type") + ")";
                String transactionType = rs.getString("transaction_type");
                double amount = rs.getDouble("amount");
                transactions.add(new Object[]{date, description, transactionType, String.format("%.2f", amount)});
            }

        } catch (SQLException e) {
            System.out.println("Error fetching all transactions: " + e.getMessage());
        }

        return transactions;
    }

    /**
     * Fetches the balance for a specific account type for the given user.
     */
    public double getAccountBalance(int userId, String accountType) {
        String sql = "SELECT balance FROM accounts WHERE user_id = ? AND account_type = ?";

        try (Connection conn = connect();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, userId);
            pstmt.setString(2, accountType);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                return rs.getDouble("balance");
            }

        } catch (SQLException e) {
            System.out.println("Error fetching account balance: " + e.getMessage());
        }

        return 0.0;
    }

    /**
     * Updates the balance of a specific account.
     */
    public void updateAccountBalance(int userId, String accountType, double newBalance) {
        String sql = "UPDATE accounts SET balance = ? WHERE user_id = ? AND account_type = ?";

        try (Connection conn = connect();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setDouble(1, newBalance);
            pstmt.setInt(2, userId);
            pstmt.setString(3, accountType);
            pstmt.executeUpdate();

        } catch (SQLException e) {
            System.out.println("Error updating account balance: " + e.getMessage());
        }
    }

    /**
     * Records a new transaction in the database.
     */
    public void recordTransaction(int userId, String accountType, String transactionType, double amount, String description) {
        String findAccountSql = "SELECT account_id FROM accounts WHERE user_id = ? AND account_type = ?";
        String insertSql = "INSERT INTO transactions (account_id, transaction_type, amount, description, transaction_date) VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = connect()) {
            int accountId = -1;

            try (PreparedStatement findPstmt = conn.prepareStatement(findAccountSql)) {
                findPstmt.setInt(1, userId);
                findPstmt.setString(2, accountType);
                ResultSet rs = findPstmt.executeQuery();
                if (rs.next()) {
                    accountId = rs.getInt("account_id");
                }
            }

            if (accountId == -1) {
                System.out.println("Could not find account for user " + userId + " of type " + accountType);
                return;
            }

            try (PreparedStatement insertPstmt = conn.prepareStatement(insertSql)) {
                insertPstmt.setInt(1, accountId);
                insertPstmt.setString(2, transactionType);
                insertPstmt.setDouble(3, amount);
                insertPstmt.setString(4, description);
                insertPstmt.setString(5, LocalDateTime.now().toString());
                insertPstmt.executeUpdate();
            }

        } catch (SQLException e) {
            System.out.println("Error recording transaction: " + e.getMessage());
        }
    }
}
