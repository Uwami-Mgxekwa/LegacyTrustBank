package legacytrustbank;


import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;

public class SupabaseService {

    // --- CRITICAL ---
    // Make sure the host (the part after @ and before :) is copied EXACTLY from your Supabase dashboard.
    private static final String DB_URL = "jdbc:postgresql://aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?user=postgres.qujmowmhvpzssrrkysub&password=aXbiqRFn8QNiRtCv&sslmode=require";
    private static final String DB_USER = "postgres";
    private static final String DB_PASSWORD = "aXbiqRFn8QNiRtCv";

    /**
     * Establishes a connection to the Supabase database.
     * @return A Connection object.
     * @throws SQLException if a database access error occurs.
     */
    private Connection connect() throws SQLException {
        return DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
    }
    
    /**
    * Fetches all transactions for a specific user's account.
    * @param userId The ID of the user.
    * @param accountType The type of account (e.g., "Current", "Savings").
    * @return A list of transaction data as Object arrays.
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
               Timestamp timestamp = rs.getTimestamp("transaction_date");
               String date = timestamp.toLocalDateTime().toLocalDate().toString();
               String description = rs.getString("description");
               String transactionType = rs.getString("transaction_type");
               double amount = rs.getDouble("amount");

               transactions.add(new Object[]{date, description, transactionType, String.format("%.2f", amount)});
           }

       } catch (SQLException e) {
           System.out.println("Error fetching transactions: " + e.getMessage());
           e.printStackTrace();
       }

       return transactions;
   }
   /**
    * Validates user credentials for login.
    * @param username The username to validate.
    * @param password The plain text password to validate.
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
               // For now, we'll do plain text comparison
               // In production, you should hash the input password and compare hashes
               if (password.equals(storedHash)) {
                   return rs.getInt("user_id");
               }
           }

       } catch (SQLException e) {
           System.out.println("Error validating login: " + e.getMessage());
           e.printStackTrace();
       }

       return -1; // Invalid credentials
   }

   /**
    * Checks if a username or email already exists.
    * @param username The username to check.
    * @param email The email to check.
    * @return true if either username or email exists, false otherwise.
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
           e.printStackTrace();
       }

       return false;
   }

   /**
    * Creates a new user account.
    * @param username The username for the new account.
    * @param email The email for the new account.
    * @param password The password for the new account.
    * @param fullName The full name of the user.
    * @return The new user ID if successful, -1 if failed.
    */
   public int createUser(String username, String email, String password, String fullName) {
       String sql = "INSERT INTO users (username, email, password_hash, full_name, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP) RETURNING user_id";

       try (Connection conn = connect();
            PreparedStatement pstmt = conn.prepareStatement(sql)) {

           pstmt.setString(1, username);
           pstmt.setString(2, email);
           pstmt.setString(3, password); // In production, hash this password
           pstmt.setString(4, fullName);

           ResultSet rs = pstmt.executeQuery();
           if (rs.next()) {
               int userId = rs.getInt("user_id");
               // Create default accounts for the new user
               createDefaultAccounts(userId);
               return userId;
           }

       } catch (SQLException e) {
           System.out.println("Error creating user: " + e.getMessage());
           e.printStackTrace();
       }

       return -1;
   }

   /**
    * Creates default Current and Savings accounts for a new user.
    * @param userId The ID of the user to create accounts for.
    */
   private void createDefaultAccounts(int userId) {
       String sql = "INSERT INTO accounts (user_id, account_type, balance) VALUES (?, ?, ?)";

       try (Connection conn = connect();
            PreparedStatement pstmt = conn.prepareStatement(sql)) {

           // Create Current Account
           pstmt.setInt(1, userId);
           pstmt.setString(2, "Current");
           pstmt.setDouble(3, 0.0);
           pstmt.executeUpdate();

           // Create Savings Account
           pstmt.setInt(1, userId);
           pstmt.setString(2, "Savings");
           pstmt.setDouble(3, 0.0);
           pstmt.executeUpdate();

       } catch (SQLException e) {
           System.out.println("Error creating default accounts: " + e.getMessage());
           e.printStackTrace();
       }
   }

   /**
    * Gets the full name of a user by their ID.
    * @param userId The ID of the user.
    * @return The full name of the user, or "User" if not found.
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
           e.printStackTrace();
       }

       return "User";
   }
   
   
   

   /**
    * Fetches all transactions for all of a user's accounts combined.
    * @param userId The ID of the user.
    * @return A list of transaction data as Object arrays.
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
               Timestamp timestamp = rs.getTimestamp("transaction_date");
               String date = timestamp.toLocalDateTime().toLocalDate().toString();
               String description = rs.getString("description") + " (" + rs.getString("account_type") + ")";
               String transactionType = rs.getString("transaction_type");
               double amount = rs.getDouble("amount");

               transactions.add(new Object[]{date, description, transactionType, String.format("%.2f", amount)});
           }

       } catch (SQLException e) {
           System.out.println("Error fetching all transactions: " + e.getMessage());
           e.printStackTrace();
       }

       return transactions;
   }

    /**
     * Fetches the balance for a specific account type for a given user.
     * @param userId The ID of the user.
     * @param accountType The type of account (e.g., "Current", "Savings").
     * @return The account balance.
     */
    public double getAccountBalance(int userId, String accountType) {
        String sql = "SELECT balance FROM accounts WHERE user_id = ? AND account_type = ?";
        double balance = 0.0;

        try (Connection conn = connect();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, userId);
            pstmt.setString(2, accountType);

            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                balance = rs.getDouble("balance");
            }

        } catch (SQLException e) {
            System.out.println("Error fetching account balance: " + e.getMessage());
            e.printStackTrace(); // Print full error for better debugging
        }
        return balance;
    }

    /**
     * Updates the balance of a specific account.
     * @param userId The ID of the user.
     * @param accountType The type of account.
     * @param newBalance The new balance to set.
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
            e.printStackTrace();
        }
    }

    /**
     * Records a new transaction in the database.
     * @param userId The ID of the user performing the transaction.
     * @param accountType The type of account for the transaction.
     * @param transactionType The type of transaction (e.g., "Sent").
     * @param amount The transaction amount.
     * @param description A brief description of the transaction.
     */
    public void recordTransaction(int userId, String accountType, String transactionType, double amount, String description) {
        String findAccountIdSql = "SELECT account_id FROM accounts WHERE user_id = ? AND account_type = ?";
        String insertTransactionSql = "INSERT INTO transactions(account_id, transaction_type, amount, description, transaction_date) VALUES(?, ?, ?, ?, ?)";

        try (Connection conn = connect()) {
            int accountId = -1;
            try (PreparedStatement findPstmt = conn.prepareStatement(findAccountIdSql)) {
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

            try (PreparedStatement insertPstmt = conn.prepareStatement(insertTransactionSql)) {
                insertPstmt.setInt(1, accountId);
                insertPstmt.setString(2, transactionType);
                insertPstmt.setDouble(3, amount);
                insertPstmt.setString(4, description);
                insertPstmt.setTimestamp(5, Timestamp.valueOf(LocalDateTime.now()));
                insertPstmt.executeUpdate();
            }

        } catch (SQLException e) {
            System.out.println("Error recording transaction: " + e.getMessage());
            e.printStackTrace();
        }
    }
}