package legacytrustbank;

import java.awt.Color;
import java.awt.Image;
import javax.swing.ImageIcon;


public class Login extends javax.swing.JFrame {

    public Login() {
        initComponents();
        supabaseService = new SupabaseService();
        supabaseService.initializeDatabase(); // Create tables on first run
        Image icon = new ImageIcon(getClass().getResource("/images/newLogo.png")).getImage(); 
        this.setIconImage(icon);  
    }
    
    private final SupabaseService supabaseService;
    private static int currentUserId = -1;
    
    public static int getCurrentUserId() {
        return currentUserId;
    }
    
    @SuppressWarnings("unchecked")
    // <editor-fold defaultstate="collapsed" desc="Generated Code">//GEN-BEGIN:initComponents
    private void initComponents() {

        jLabel1 = new javax.swing.JLabel();
        jLabel3 = new javax.swing.JLabel();
        jButton1 = new javax.swing.JButton();
        jButton2 = new javax.swing.JButton();
        jButton4 = new javax.swing.JButton();
        username = new javax.swing.JTextField();
        message2 = new javax.swing.JLabel();
        message1 = new javax.swing.JLabel();
        jLabel4 = new javax.swing.JLabel();
        password = new javax.swing.JPasswordField();
        rem = new javax.swing.JRadioButton();
        jButton3 = new javax.swing.JButton();
        jLabel2 = new javax.swing.JLabel();

        setDefaultCloseOperation(javax.swing.WindowConstants.EXIT_ON_CLOSE);
        setTitle("Login");
        setResizable(false);
        getContentPane().setLayout(new org.netbeans.lib.awtextra.AbsoluteLayout());

        jLabel1.setFont(new java.awt.Font("Segoe UI Black", 1, 14)); // NOI18N
        jLabel1.setForeground(new java.awt.Color(0, 0, 0));
        jLabel1.setText("USERNAME :");
        getContentPane().add(jLabel1, new org.netbeans.lib.awtextra.AbsoluteConstraints(90, 60, -1, 20));

        jLabel3.setFont(new java.awt.Font("Segoe UI Black", 0, 14)); // NOI18N
        jLabel3.setForeground(new java.awt.Color(0, 0, 0));
        jLabel3.setText("PASSWORD :");
        getContentPane().add(jLabel3, new org.netbeans.lib.awtextra.AbsoluteConstraints(90, 150, 100, 20));

        jButton1.setBackground(new java.awt.Color(255, 255, 255));
        jButton1.setFont(new java.awt.Font("Segoe UI Black", 1, 14)); // NOI18N
        jButton1.setForeground(new java.awt.Color(0, 0, 0));
        jButton1.setIcon(new javax.swing.ImageIcon(getClass().getResource("/images/tap-ezgif.com-resize.gif"))); // NOI18N
        jButton1.setText("LOGIN");
        jButton1.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                jButton1ActionPerformed(evt);
            }
        });
        getContentPane().add(jButton1, new org.netbeans.lib.awtextra.AbsoluteConstraints(90, 280, 190, 40));

        jButton2.setBackground(new java.awt.Color(255, 255, 255));
        jButton2.setFont(new java.awt.Font("Segoe UI Black", 1, 14)); // NOI18N
        jButton2.setForeground(new java.awt.Color(0, 0, 0));
        jButton2.setIcon(new javax.swing.ImageIcon(getClass().getResource("/images/clean-up-ezgif.com-resize.gif"))); // NOI18N
        jButton2.setText("CLEAR");
        jButton2.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                jButton2ActionPerformed(evt);
            }
        });
        getContentPane().add(jButton2, new org.netbeans.lib.awtextra.AbsoluteConstraints(90, 330, 190, 40));

        jButton4.setBackground(new java.awt.Color(255, 255, 255));
        jButton4.setFont(new java.awt.Font("Segoe UI Black", 1, 14)); // NOI18N
        jButton4.setForeground(new java.awt.Color(0, 0, 0));
        jButton4.setIcon(new javax.swing.ImageIcon(getClass().getResource("/images/add-ezgif.com-resize.gif"))); // NOI18N
        jButton4.setText("SIGNUP");
        jButton4.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                jButton4ActionPerformed(evt);
            }
        });
        getContentPane().add(jButton4, new org.netbeans.lib.awtextra.AbsoluteConstraints(90, 430, 190, 40));

        username.addKeyListener(new java.awt.event.KeyAdapter() {
            public void keyPressed(java.awt.event.KeyEvent evt) {
                usernameKeyPressed(evt);
            }
        });
        getContentPane().add(username, new org.netbeans.lib.awtextra.AbsoluteConstraints(90, 80, 190, 30));

        message2.setFont(new java.awt.Font("Segoe UI Black", 0, 14)); // NOI18N
        message2.setForeground(new java.awt.Color(0, 0, 0));
        getContentPane().add(message2, new org.netbeans.lib.awtextra.AbsoluteConstraints(100, 200, 180, 20));

        message1.setFont(new java.awt.Font("Segoe UI Black", 0, 14)); // NOI18N
        message1.setForeground(new java.awt.Color(0, 0, 0));
        getContentPane().add(message1, new org.netbeans.lib.awtextra.AbsoluteConstraints(100, 110, 180, 30));

        jLabel4.setIcon(new javax.swing.ImageIcon(getClass().getResource("/images/side.png"))); // NOI18N
        getContentPane().add(jLabel4, new org.netbeans.lib.awtextra.AbsoluteConstraints(310, 0, 430, 460));

        password.addKeyListener(new java.awt.event.KeyAdapter() {
            public void keyPressed(java.awt.event.KeyEvent evt) {
                passwordKeyPressed(evt);
            }
        });
        getContentPane().add(password, new org.netbeans.lib.awtextra.AbsoluteConstraints(90, 170, 190, 30));

        rem.setFont(new java.awt.Font("Segoe UI", 0, 16)); // NOI18N
        rem.setForeground(new java.awt.Color(0, 0, 0));
        rem.setText("Remember me ?");
        rem.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseClicked(java.awt.event.MouseEvent evt) {
                remMouseClicked(evt);
            }
        });
        rem.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                remActionPerformed(evt);
            }
        });
        getContentPane().add(rem, new org.netbeans.lib.awtextra.AbsoluteConstraints(90, 230, 190, -1));

        jButton3.setBackground(new java.awt.Color(255, 255, 255));
        jButton3.setFont(new java.awt.Font("Segoe UI Black", 1, 14)); // NOI18N
        jButton3.setForeground(new java.awt.Color(0, 0, 0));
        jButton3.setIcon(new javax.swing.ImageIcon(getClass().getResource("/images/personnel-ezgif.com-resize.gif"))); // NOI18N
        jButton3.setText("ADMIN");
        jButton3.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                jButton3ActionPerformed(evt);
            }
        });
        getContentPane().add(jButton3, new org.netbeans.lib.awtextra.AbsoluteConstraints(90, 380, 190, 40));

        jLabel2.setIcon(new javax.swing.ImageIcon(getClass().getResource("/images/Background.png"))); // NOI18N
        getContentPane().add(jLabel2, new org.netbeans.lib.awtextra.AbsoluteConstraints(0, 0, 770, 500));

        pack();
        setLocationRelativeTo(null);
    }// </editor-fold>//GEN-END:initComponents

    private void jButton1ActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_jButton1ActionPerformed
        String user = username.getText().trim();
        String pass = new String(password.getPassword());

        if(user.isEmpty() || pass.isEmpty()){
            message1.setText("Can't be empty");
            message2.setText("Can't be empty");
            message1.setForeground(Color.red);
            message2.setForeground(Color.red);
            return;
        }

        int userId = supabaseService.validateLogin(user, pass);

        if (userId != -1) {
            currentUserId = userId;
            message1.setText("Login successful!");
            message1.setForeground(Color.GREEN);
            message2.setText("Login successful!");
            message2.setForeground(Color.GREEN);
            new checkLogin().setVisible(true);
            dispose();
        } else {
            message1.setText("Invalid username or password.");
            message1.setForeground(Color.RED);
            message2.setText("Invalid username or password.");
            message2.setForeground(Color.RED);
            new incorrectLogin().setVisible(true);
        }
    }//GEN-LAST:event_jButton1ActionPerformed

    private void usernameKeyPressed(java.awt.event.KeyEvent evt) {//GEN-FIRST:event_usernameKeyPressed
        // TODO add your handling code here:
        message1.setText("No longer empty");
        message1.setForeground(Color.green);
    }//GEN-LAST:event_usernameKeyPressed

    private void passwordKeyPressed(java.awt.event.KeyEvent evt) {//GEN-FIRST:event_passwordKeyPressed
        // TODO add your handling code here:
        message2.setText("No longer empty");
        message2.setForeground(Color.green);
    }//GEN-LAST:event_passwordKeyPressed

    private void jButton2ActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_jButton2ActionPerformed
        // TODO add your handling code here:
        message1.setText("");
        message2.setText("");
        username.setText("");
        password.setText("");
        rem.setSelected(false);
    }//GEN-LAST:event_jButton2ActionPerformed

    private void remMouseClicked(java.awt.event.MouseEvent evt) {//GEN-FIRST:event_remMouseClicked
        // TODO add your handling code here:
        
    }//GEN-LAST:event_remMouseClicked

    private void remActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_remActionPerformed
        // TODO add your handling code here:
        if(rem.isSelected()){
            username.setText("Owami");
            password.setText("1234");
        }
    }//GEN-LAST:event_remActionPerformed

    private void jButton4ActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_jButton4ActionPerformed
        // TODO add your handling code here:
        new SignUp().setVisible(true);
        dispose();
    }//GEN-LAST:event_jButton4ActionPerformed

    private void jButton3ActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_jButton3ActionPerformed
        // TODO add your handling code here:
        new AdminLogin().setVisible(true);
        dispose();
    }//GEN-LAST:event_jButton3ActionPerformed

    public static void main(String args[]) {
        /* Set the Nimbus look and feel */
        //<editor-fold defaultstate="collapsed" desc=" Look and feel setting code (optional) ">
        /* If Nimbus (introduced in Java SE 6) is not available, stay with the default look and feel.
         * For details see http://download.oracle.com/javase/tutorial/uiswing/lookandfeel/plaf.html 
         */
        try {
            for (javax.swing.UIManager.LookAndFeelInfo info : javax.swing.UIManager.getInstalledLookAndFeels()) {
                if ("Nimbus".equals(info.getName())) {
                    javax.swing.UIManager.setLookAndFeel(info.getClassName());
                    break;
                }
            }
        } catch (ClassNotFoundException ex) {
            java.util.logging.Logger.getLogger(Login.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        } catch (InstantiationException ex) {
            java.util.logging.Logger.getLogger(Login.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        } catch (IllegalAccessException ex) {
            java.util.logging.Logger.getLogger(Login.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        } catch (javax.swing.UnsupportedLookAndFeelException ex) {
            java.util.logging.Logger.getLogger(Login.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        }
        //</editor-fold>

        /* Create and display the form */
        java.awt.EventQueue.invokeLater(new Runnable() {
            public void run() {
                new Login().setVisible(true);
            }
        });
    }

    // Variables declaration - do not modify//GEN-BEGIN:variables
    private javax.swing.JButton jButton1;
    private javax.swing.JButton jButton2;
    private javax.swing.JButton jButton3;
    private javax.swing.JButton jButton4;
    private javax.swing.JLabel jLabel1;
    private javax.swing.JLabel jLabel2;
    private javax.swing.JLabel jLabel3;
    private javax.swing.JLabel jLabel4;
    private javax.swing.JLabel message1;
    private javax.swing.JLabel message2;
    private javax.swing.JPasswordField password;
    private javax.swing.JRadioButton rem;
    private javax.swing.JTextField username;
    // End of variables declaration//GEN-END:variables
}
