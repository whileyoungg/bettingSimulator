package io.persistence;

import io.businessLogic.BusinessLogicException;
import io.datarecords.Action;
import io.datarecords.Event;
import io.datarecords.Participation;
import io.datarecords.User;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

public class ParticipationRepository {

    public void addParticipation(Participation participation) throws PersistenceException {
        String insertParticipation = """
            INSERT INTO participations (actionId, username, stake, potentialWin, hasWon)
            VALUES (?, ?, ?, ?, ?)
        """;
        String updateEventBudget = """
            UPDATE events SET budget = budget + ? 
            WHERE eventId = (
                SELECT eventId FROM actions WHERE actionId = ?
            )
        """;
        String updateUserBalance = "UPDATE users SET balance = balance - ? WHERE username = ?";

        try (Connection con = DBConnect.getConnection()) {
            con.setAutoCommit(false);

            try (
                    PreparedStatement pstm = con.prepareStatement(insertParticipation);
                    PreparedStatement pstm2 = con.prepareStatement(updateEventBudget);
                    PreparedStatement pstm3 = con.prepareStatement(updateUserBalance)
            ) {
                pstm.setInt(1, participation.action().actionId());
                pstm.setString(2, participation.user().username());
                pstm.setDouble(3, participation.stake());
                pstm.setDouble(4, participation.potentialWin());
                pstm.setBoolean(5, participation.hasWon());
                pstm.executeUpdate();
                pstm2.setDouble(1, participation.stake());
                pstm2.setInt(2, participation.action().actionId());
                pstm2.executeUpdate();
                pstm3.setDouble(1, participation.stake());
                pstm3.setString(2, participation.user().username());
                pstm3.executeUpdate();

                con.commit();
            } catch (SQLException e) {
                e.printStackTrace();
                con.rollback();
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new PersistenceException("Failed to create a participation");
        }
    }

    public ArrayList<Participation> getAll() throws PersistenceException {
        String sql = """
            SELECT p.*, a.action, a.coefficient, a.eventId 
            FROM participations p
            JOIN actions a ON p.actionId = a.actionId
        """;

        ArrayList<Participation> participations = new ArrayList<>();

        try (Connection con = DBConnect.getConnection()) {
            con.setAutoCommit(false);

            try (PreparedStatement pstm = con.prepareStatement(sql)) {
                ResultSet rs = pstm.executeQuery();

                UserRepository userRepository = Repository.getUserRepository();
                EventRepository eventRepository = Repository.getEventRepository();
                while (rs.next()) {
                    int actionId = rs.getInt("actionId");
                    String actionName = rs.getString("action");
                    double coefficient = rs.getDouble("coefficient");
                    int eventId = rs.getInt("eventId");

                    String username = rs.getString("username");
                    double stake = rs.getDouble("stake");
                    double potentialWin = rs.getDouble("potentialWin");
                    boolean hasWon = rs.getBoolean("hasWon");

                    User user = userRepository.getAll().stream()
                            .filter(u -> u.username().equals(username))
                            .findFirst()
                            .orElse(null);

                    Action action = new Action(actionId, actionName, coefficient, eventRepository.getEventById(eventId));
                    participations.add(new Participation(action, user, stake, potentialWin, hasWon));
                }

                con.commit();
            } catch (SQLException e) {
                e.printStackTrace();
                con.rollback();
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new PersistenceException("Failed to get all participations");
        }

        return participations;
    }
}

