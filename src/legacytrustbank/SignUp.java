package legacytrustbank;

import java.awt.Color;
import java.awt.Image;
import javax.swing.ImageIcon;
import javax.swing.JOptionPane;

public class SignUp extends javax.swing.JFrame {

    public SignUp() {
        initComponents();
        supabaseService = new SupabaseService();
        Image icon = new ImageIcon(getClass().getResource("/images/newLogo.png")).getImage(); 
        this.setIconImage(icon); 
    }
    
    private final SupabaseService supabaseService;


    @SuppressWarnings("unchecked")
    // <editor-fold defaultstate="collapsed" desc="Generated Code">//GEN-BEGIN:initComponents
    private void initComponents() {

        jLabel2 = new javax.swing.JLabel();
        userName = new javax.swing.JTextField();
        jLabel4 = new javax.swing.JLabel();
        Password = new javax.swing.JTextField();
        jLabel6 = new javax.swing.JLabel();
        Email = new javax.swing.JTextField();
        box = new javax.swing.JCheckBox();
        displayP = new javax.swing.JLabel();
        displayE = new javax.swing.JLabel();
        displayU = new javax.swing.JLabel();
        jButton1 = new javax.swing.JButton();
        jButton2 = new javax.swing.JButton();
        jLabel8 = new javax.swing.JLabel();
        displayUU = new javax.swing.JLabel();
        displayEE = new javax.swing.JLabel();
        displayPP = new javax.swing.JLabel();
        jLabel14 = new javax.swing.JLabel();

        setDefaultCloseOperation(javax.swing.WindowConstants.EXIT_ON_CLOSE);
        setTitle("SignUp");
        setResizable(false);
        getContentPane().setLayout(new org.netbeans.lib.awtextra.AbsoluteLayout());

        jLabel2.setFont(new java.awt.Font("Segoe UI Black", 1, 18)); // NOI18N
        jLabel2.setForeground(new java.awt.Color(0, 0, 0));
        jLabel2.setText("Username");
        getContentPane().add(jLabel2, new org.netbeans.lib.awtextra.AbsoluteConstraints(520, 50, -1, -1));
        getContentPane().add(userName, new org.netbeans.lib.awtextra.AbsoluteConstraints(520, 80, 204, -1));

        jLabel4.setFont(new java.awt.Font("Segoe UI Black", 1, 18)); // NOI18N
        jLabel4.setForeground(new java.awt.Color(0, 0, 0));
        jLabel4.setText("Password : ");
        getContentPane().add(jLabel4, new org.netbeans.lib.awtextra.AbsoluteConstraints(520, 240, -1, -1));
        getContentPane().add(Password, new org.netbeans.lib.awtextra.AbsoluteConstraints(520, 270, 204, -1));

        jLabel6.setFont(new java.awt.Font("Segoe UI Black", 1, 18)); // NOI18N
        jLabel6.setForeground(new java.awt.Color(0, 0, 0));
        jLabel6.setText("Email :");
        getContentPane().add(jLabel6, new org.netbeans.lib.awtextra.AbsoluteConstraints(520, 150, -1, -1));
        getContentPane().add(Email, new org.netbeans.lib.awtextra.AbsoluteConstraints(520, 180, 204, -1));

        box.setForeground(new java.awt.Color(0, 0, 0));
        box.setText("I agree to the Terms & Conditions");
        box.setBorder(new javax.swing.border.LineBorder(new java.awt.Color(0, 0, 0), 1, true));
        getContentPane().add(box, new org.netbeans.lib.awtextra.AbsoluteConstraints(520, 340, -1, -1));
        getContentPane().add(displayP, new org.netbeans.lib.awtextra.AbsoluteConstraints(362, 210, -1, -1));
        getContentPane().add(displayE, new org.netbeans.lib.awtextra.AbsoluteConstraints(362, 210, -1, -1));
        getContentPane().add(displayU, new org.netbeans.lib.awtextra.AbsoluteConstraints(362, 210, -1, -1));

        jButton1.setBackground(new java.awt.Color(0, 204, 204));
        jButton1.setFont(new java.awt.Font("Segoe UI Black", 1, 14)); // NOI18N
        jButton1.setForeground(new java.awt.Color(0, 0, 0));
        jButton1.setText("SIGN UP");
        jButton1.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                jButton1ActionPerformed(evt);
            }
        });
        getContentPane().add(jButton1, new org.netbeans.lib.awtextra.AbsoluteConstraints(520, 400, 210, -1));

        jButton2.setBackground(new java.awt.Color(0, 204, 204));
        jButton2.setFont(new java.awt.Font("Segoe UI Black", 1, 14)); // NOI18N
        jButton2.setForeground(new java.awt.Color(0, 0, 0));
        jButton2.setText("LOGIN");
        jButton2.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                jButton2ActionPerformed(evt);
            }
        });
        getContentPane().add(jButton2, new org.netbeans.lib.awtextra.AbsoluteConstraints(520, 450, 210, -1));

        jLabel8.setIcon(new javax.swing.ImageIcon(getClass().getResource("/images/leftSide.png"))); // NOI18N
        getContentPane().add(jLabel8, new org.netbeans.lib.awtextra.AbsoluteConstraints(34, 0, 410, -1));
        getContentPane().add(displayUU, new org.netbeans.lib.awtextra.AbsoluteConstraints(530, 110, 200, 20));
        getContentPane().add(displayEE, new org.netbeans.lib.awtextra.AbsoluteConstraints(530, 210, 190, 20));
        getContentPane().add(displayPP, new org.netbeans.lib.awtextra.AbsoluteConstraints(530, 300, 190, 20));

        jLabel14.setIcon(new javax.swing.ImageIcon(getClass().getResource("/images/Background.png"))); // NOI18N
        getContentPane().add(jLabel14, new org.netbeans.lib.awtextra.AbsoluteConstraints(-7, 0, 780, 500));

        pack();
        setLocationRelativeTo(null);
    }// </editor-fold>//GEN-END:initComponents

    private void jButton1ActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_jButton1ActionPerformed
        String username = userName.getText().trim();
        String email = Password.getText().trim();
        String password = Email.getText().trim();
        boolean hasError = false;

        // Clear previous messages
        displayUU.setText("");
        displayEE.setText("");
        displayPP.setText("");

        if (username.isEmpty()) {
            displayUU.setText("Username blank");
            displayUU.setForeground(Color.red);
            hasError = true;
        }

        if (email.isEmpty()) {
            displayEE.setText("Email is blank");
            displayEE.setForeground(Color.red);
            hasError = true;
        }

        if (password.isEmpty()) {
            displayPP.setText("Password is blank");
            displayPP.setForeground(Color.red);
            hasError = true;
        }

        if (!hasError) { 
            if (!box.isSelected()) {
                JOptionPane.showMessageDialog(null, "Please agree to our terms and conditions to proceed");
            }
            else {
                if (supabaseService.userExists(username, email)) {
                    displayUU.setText("Username already exists");
                    displayUU.setForeground(Color.red);
                    displayEE.setText("Email already exists");
                    displayEE.setForeground(Color.red);
                    JOptionPane.showMessageDialog(null, "Account already exists!");
                }
                else {
                    // Use username as full name for now, or add a separate field
                    int userId = supabaseService.createUser(username, email, password, username);

                    if (userId != -1) {
                        displayUU.setText("Valid");
                        displayUU.setForeground(Color.green);
                        displayEE.setText("Valid");
                        displayEE.setForeground(Color.green);
                        displayPP.setText("Valid");
                        displayPP.setForeground(Color.green);

                        new Correct().setVisible(true);

                        // Clear form
                        userName.setText("");
                        Password.setText("");
                        Email.setText("");
                        box.setSelected(false);
                    } else {
                        JOptionPane.showMessageDialog(null, "Error creating account. Please try again.");
                    }
                }
            }
        }      
    }//GEN-LAST:event_jButton1ActionPerformed

    private void jButton2ActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_jButton2ActionPerformed
        // TODO add your handling code here:
        new Login().setVisible(true);
        dispose();
    }//GEN-LAST:event_jButton2ActionPerformed

    /**
     * @param args the command line arguments
     */
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
            java.util.logging.Logger.getLogger(SignUp.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        } catch (InstantiationException ex) {
            java.util.logging.Logger.getLogger(SignUp.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        } catch (IllegalAccessException ex) {
            java.util.logging.Logger.getLogger(SignUp.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        } catch (javax.swing.UnsupportedLookAndFeelException ex) {
            java.util.logging.Logger.getLogger(SignUp.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        }
        //</editor-fold>

        /* Create and display the form */
        java.awt.EventQueue.invokeLater(new Runnable() {
            public void run() {
                new SignUp().setVisible(true);
            }
        });
    }

    // Variables declaration - do not modify//GEN-BEGIN:variables
    private javax.swing.JTextField Email;
    private javax.swing.JTextField Password;
    private javax.swing.JCheckBox box;
    private javax.swing.JLabel displayE;
    private javax.swing.JLabel displayEE;
    private javax.swing.JLabel displayP;
    private javax.swing.JLabel displayPP;
    private javax.swing.JLabel displayU;
    private javax.swing.JLabel displayUU;
    private javax.swing.JButton jButton1;
    private javax.swing.JButton jButton2;
    private javax.swing.JLabel jLabel14;
    private javax.swing.JLabel jLabel2;
    private javax.swing.JLabel jLabel4;
    private javax.swing.JLabel jLabel6;
    private javax.swing.JLabel jLabel8;
    private javax.swing.JTextField userName;
    // End of variables declaration//GEN-END:variables
}
