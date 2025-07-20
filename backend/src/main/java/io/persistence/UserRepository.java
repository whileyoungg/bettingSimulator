package io.persistence;

import io.datarecords.Event;
import io.datarecords.MonoBankDeposit;
import io.datarecords.User;
import io.datarecords.Verification;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;

public class UserRepository {




    public ArrayList<User> getAll() throws PersistenceException {
        ArrayList<User> users = new ArrayList<>();

        String sql = "SELECT * FROM users";

        try (Connection conn = DBConnect.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                String username = rs.getString("username");
                String password = rs.getString("password");
                String email = rs.getString("email");
                double balance = rs.getDouble("balance");
                boolean isVerified = rs.getBoolean("isVerified");

                users.add(new User(username, email,isVerified,balance,password));
            }

        } catch (SQLException e) {
            e.printStackTrace();
            throw new PersistenceException("Failed to get users");
        }

        return users;
    }
    public void addUser(User user) throws PersistenceException {
        String sql = "INSERT INTO users(username,email,password) values(?,?,?)";
        try(Connection con = DBConnect.getConnection()){
            con.setAutoCommit(false);
            try(PreparedStatement pstm = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);){
                pstm.setString(1,user.username());
                pstm.setString(2,user.email());
                pstm.setString(3,user.password());
                pstm.executeUpdate();
                con.commit();
            } catch (SQLException e) {
                e.printStackTrace();
                con.rollback();
                throw new PersistenceException("Statement is not executed");
            }
        }catch(SQLException e){
            e.printStackTrace();
            throw new PersistenceException("User is not added");
        }

    }
    public void verificationRequest(Verification verification) throws PersistenceException {
        String sql = "insert into verification(username,firstname,lastname,bsn,iban,address,postalcode,phonenumber) values(?,?,?,?,?,?,?,?)";
        try(Connection connection = DBConnect.getConnection()){
            connection.setAutoCommit(false);
            try(PreparedStatement pstm = connection.prepareStatement(sql)) {
                pstm.setString(1,verification.user().username());
                pstm.setString(2, verification.firstName());
                pstm.setString(3, verification.lastName());
                pstm.setString(4,verification.bsn());
                pstm.setString(5, verification.iban());
                pstm.setString(6, verification.address());
                pstm.setString(7, verification.postalCode());
                pstm.setString(8,verification.phoneNumber());
                pstm.executeUpdate();
                connection.commit();
            }
        } catch (SQLException e) {
            throw new PersistenceException("Request failed");
        }
    }
    public void monoDeposit(MonoBankDeposit mbd) throws PersistenceException {
        String[] name = mbd.description().split(" ");

        String sql = "update users\n" +
                "set balance = balance + ?\n" +
                "where username = (\n" +
                "    select v.username from verification v\n" +
                "    where v.firstname = ? and v.lastname = ?\n" +
                "    and v.username = users.username\n" +
                ")";
        try(Connection con = DBConnect.getConnection()){
            con.setAutoCommit(false);
            try(PreparedStatement pstm = con.prepareStatement(sql)) {
                pstm.setDouble(1,mbd.amount());
                pstm.setString(2,name[2]);
                pstm.setString(3,name[1]);
                pstm.executeUpdate();
                con.commit();
            } catch (SQLException e) {
                con.rollback();
            }
        }catch (SQLException e){
            throw new PersistenceException("Deposit failed");
        }
    }
    public void monoWithdraw(MonoBankDeposit mbd) throws PersistenceException {
        String[] name = mbd.description().split(" ");

        String sql = "update users\n" +
                "set balance = balance + ?\n" +
                "where username = (\n" +
                "    select v.username from verification v\n" +
                "    where v.firstname = ? and v.lastname = ?\n" +
                "    and v.username = users.username\n" +
                ")";
        try(Connection con = DBConnect.getConnection()){
            con.setAutoCommit(false);
            try(PreparedStatement pstm = con.prepareStatement(sql)) {
                pstm.setDouble(1,mbd.amount());
                pstm.setString(2,name[2]);
                pstm.setString(3,name[1]);
                pstm.executeUpdate();
                con.commit();
            } catch (SQLException e) {
                con.rollback();
            }
        }catch (SQLException e){
            throw new PersistenceException("Withdraw failed");
        }
    }

}
