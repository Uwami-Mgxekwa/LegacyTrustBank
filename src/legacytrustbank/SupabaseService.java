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