package io.persistence;

import io.datarecords.Action;
import io.datarecords.Event;
import io.datarecords.Participation;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class EventRepository {

    public Event createEvent(Event event) throws PersistenceException {
        String insertEventSQL = """
                INSERT INTO events (
                    event, budget, stakeLimit, playerLimit,
                    isOpen, isFinished, isPublic,
                    creator, password, initialbudget
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                RETURNING eventId;
                """;
        String insertActionSQL = """
                INSERT INTO actions (action, coefficient, eventId)
                VALUES (?, ?, ?)
                """;
        String updateUserBalanceSQL = """
                UPDATE users SET balance = balance - ? WHERE username = ?
                """;
        try (Connection con = DBConnect.getConnection()) {
            con.setAutoCommit(false);

            try (
                    PreparedStatement insertEventStmt = con.prepareStatement(insertEventSQL);
                    PreparedStatement insertActionStmt = con.prepareStatement(insertActionSQL);
                    PreparedStatement updateUserBalanceStmt = con.prepareStatement(updateUserBalanceSQL)
            ) {
                insertEventStmt.setString(1, event.event());
                insertEventStmt.setDouble(2, event.budget());
                insertEventStmt.setDouble(3, event.stakeLimit());
                insertEventStmt.setInt(4, event.playerLimit());
                insertEventStmt.setBoolean(5, event.isOpen());
                insertEventStmt.setBoolean(6, event.isFinished());
                insertEventStmt.setBoolean(7, event.isPublic());
                insertEventStmt.setString(8, event.creator());
                insertEventStmt.setString(9, event.password());
                insertEventStmt.setDouble(10, event.initialBudget());
                ResultSet rs = insertEventStmt.executeQuery();
                int eventId;
                if (rs.next()) {
                    eventId = rs.getInt("eventId");
                } else {
                    throw new PersistenceException("Failed to create event.");
                }
                for (Action action : event.actions()) {
                    insertActionStmt.setString(1, action.action());
                    insertActionStmt.setDouble(2, action.coefficient());
                    insertActionStmt.setInt(3, eventId);
                    insertActionStmt.addBatch();
                }
                insertActionStmt.executeBatch();
                updateUserBalanceStmt.setDouble(1, event.budget());
                updateUserBalanceStmt.setString(2, event.creator());
                updateUserBalanceStmt.executeUpdate();

                con.commit();
                return new Event(
                        event.event(),
                        eventId,
                        event.budget(),
                        event.stakeLimit(),
                        event.playerLimit(),
                        event.isOpen(),
                        event.isFinished(),
                        event.isPublic(),
                        event.creator(),
                        event.password(),
                        event.initialBudget(),
                        LocalDateTime.now(),
                        null,
                        event.actions()
                );

            } catch (SQLException e) {
                con.rollback();
                throw new PersistenceException("Error creating event: " + e.getMessage());
            }

        } catch (SQLException e) {
            e.printStackTrace();
            throw new PersistenceException("Could not create event");
        }
    }

    public void setPrivate(int eventId, String password) throws PersistenceException {
        String sql = "UPDATE events SET isPublic=?, password=? WHERE eventId=?";

        try(Connection con = DBConnect.getConnection()){
            con.setAutoCommit(false);
            try(PreparedStatement pstm = con.prepareStatement(sql)){
                pstm.setBoolean(1,false);
                pstm.setString(2,password);
                pstm.setInt(3,eventId);
                pstm.executeUpdate();
                con.commit();
            } catch (SQLException e) {
                e.printStackTrace();
                con.rollback();
            }
        } catch (SQLException s){
            s.printStackTrace();
            throw new PersistenceException("Failed to set private");
        }
    }
    public void setPublic(int eventId) throws PersistenceException {
        String sql = "UPDATE events SET isPublic=?, password=? WHERE eventId=?";
        try(Connection con = DBConnect.getConnection()){
            con.setAutoCommit(false);
            try(PreparedStatement pstm = con.prepareStatement(sql)){
                pstm.setBoolean(1,true);
                pstm.setString(2,"");
                pstm.setInt(3,eventId);
                pstm.executeUpdate();
                con.commit();
            } catch (SQLException e) {
                e.printStackTrace();
                con.rollback();
            }
        } catch (SQLException s){
            s.printStackTrace();
            throw new PersistenceException("Failed to set public");
        }
    }
    public void setFinished(int eventId, String winnersAction) throws PersistenceException {
        String markEventFinishedSQL = "UPDATE events SET isFinished = true WHERE eventId = ?";
        String markWinnersSQL = """
        UPDATE participations SET hasWon = true
        WHERE actionId IN (
            SELECT actionId FROM actions WHERE eventId = ? AND action = ?
        )
    """;
        String markLosersSQL = """
        UPDATE participations SET hasWon = false
        WHERE actionId IN (
            SELECT actionId FROM actions WHERE eventId = ? AND action != ?
        )
    """;
        String payWinnersSQL = """
        UPDATE users SET balance = balance + p.potentialWin
        FROM participations p
        JOIN actions a ON p.actionId = a.actionId
        WHERE users.username = p.username AND a.eventId = ? AND a.action = ?
    """;
        String chargeLosersSQL = """
        UPDATE users SET balance = balance - p.stake
        FROM participations p
        JOIN actions a ON p.actionId = a.actionId
        WHERE users.username = p.username AND a.eventId = ? AND a.action != ?
    """;
        String getBudgetAndCreatorSQL = "SELECT budget, creator FROM events WHERE eventId = ?";
        String getTotalPayoutSQL = """
        SELECT SUM(p.potentialWin) AS payout
        FROM participations p
        JOIN actions a ON p.actionId = a.actionId
        WHERE a.eventId = ? AND a.action = ?
    """;
        String updateBudgetSQL = "UPDATE events SET budget = budget - ? WHERE eventId = ?";
        String moneyReturnSQL = "UPDATE users SET balance = balance + ? WHERE username = ?";
        try (Connection con = DBConnect.getConnection()) {
            con.setAutoCommit(false);
            try (
                    PreparedStatement markEventFinished = con.prepareStatement(markEventFinishedSQL);
                    PreparedStatement markWinners = con.prepareStatement(markWinnersSQL);
                    PreparedStatement markLosers = con.prepareStatement(markLosersSQL);
                    PreparedStatement payWinners = con.prepareStatement(payWinnersSQL);
                    PreparedStatement chargeLosers = con.prepareStatement(chargeLosersSQL);
                    PreparedStatement getBudgetAndCreator = con.prepareStatement(getBudgetAndCreatorSQL);
                    PreparedStatement moneyReturn = con.prepareStatement(moneyReturnSQL);
                    PreparedStatement updateBudget = con.prepareStatement(updateBudgetSQL);
                    PreparedStatement getTotalPayout = con.prepareStatement(getTotalPayoutSQL)
            ) {
                markEventFinished.setInt(1, eventId);
                markEventFinished.executeUpdate();
                markWinners.setInt(1, eventId);
                markWinners.setString(2, winnersAction);
                markWinners.executeUpdate();
                markLosers.setInt(1, eventId);
                markLosers.setString(2, winnersAction);
                markLosers.executeUpdate();
                payWinners.setInt(1, eventId);
                payWinners.setString(2, winnersAction);
                payWinners.executeUpdate();
                chargeLosers.setInt(1, eventId);
                chargeLosers.setString(2, winnersAction);
                chargeLosers.executeUpdate();
                getBudgetAndCreator.setInt(1, eventId);
                ResultSet rs = getBudgetAndCreator.executeQuery();
                double budget = 0;
                String creator = null;
                if (rs.next()) {
                    budget = rs.getDouble("budget");
                    creator = rs.getString("creator");
                }
                getTotalPayout.setInt(1, eventId);
                getTotalPayout.setString(2, winnersAction);
                ResultSet payoutRS = getTotalPayout.executeQuery();
                double payout = 0;
                if (payoutRS.next()) {
                    payout = payoutRS.getDouble("payout");
                }

                double refund = budget - payout;
                if (refund > 0 && creator != null) {
                    moneyReturn.setDouble(1, refund);
                    moneyReturn.setString(2, creator);
                    moneyReturn.executeUpdate();
                    updateBudget.setDouble(1, payout);
                    updateBudget.setInt(2, eventId);
                    updateBudget.executeUpdate();
                }
                con.commit();
            } catch (SQLException e) {
                e.printStackTrace();
                con.rollback();
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new PersistenceException("Failed to set finished");
        }
    }
    public void setOpen(int eventId) throws PersistenceException {
        String sql = "UPDATE events SET isOpen=? WHERE eventId=?";
        try(Connection con = DBConnect.getConnection()){
            con.setAutoCommit(false);
            try(PreparedStatement pstm = con.prepareStatement(sql)){
                pstm.setBoolean(1,true);
                pstm.setInt(2,eventId);
                pstm.executeUpdate();
                con.commit();
            } catch (SQLException e) {
                e.printStackTrace();
                con.rollback();
            }
        } catch (SQLException s){
            s.printStackTrace();
            throw new PersistenceException("Failed to set open");
        }
    }
    public void setClosed(int eventId) throws PersistenceException {
        String sql = "UPDATE events SET isOpen=? WHERE eventId=?";
        try(Connection con = DBConnect.getConnection()){
            con.setAutoCommit(false);
            try(PreparedStatement pstm = con.prepareStatement(sql)){
                pstm.setBoolean(1,false);
                pstm.setInt(2,eventId);
                pstm.executeUpdate();
                con.commit();
            } catch (SQLException e) {
                e.printStackTrace();
                con.rollback();
            }
        } catch (SQLException s){
            s.printStackTrace();
            throw new PersistenceException("Failed to set closed");
        }
    }
    public Event getEventById(int eventId) throws PersistenceException {
        return getAll().stream().filter(e -> e.eventId() == eventId).findFirst().orElse(null);
    }

    public List<Event> getAll() throws PersistenceException {
        String eventSQL = "SELECT * FROM events";
        String actionSQL = "SELECT * FROM actions WHERE eventId = ?";
        List<Event> events = new ArrayList<>();

        try (Connection con = DBConnect.getConnection();
             PreparedStatement eventStmt = con.prepareStatement(eventSQL);
             PreparedStatement actionStmt = con.prepareStatement(actionSQL)) {

            ResultSet eventRS = eventStmt.executeQuery();
            while (eventRS.next()) {
                int eventId = eventRS.getInt("eventId");
                List<Action> actions = new ArrayList<>();
                actionStmt.setInt(1, eventId);
                try (ResultSet actionRS = actionStmt.executeQuery()) {
                    while (actionRS.next()) {
                        actions.add(new Action(
                                actionRS.getInt("actionId"),
                                actionRS.getString("action"),
                                actionRS.getDouble("coefficient"),
                                null
                        ));
                    }
                }

                Timestamp finishedTS = eventRS.getTimestamp("timeFinished");

                Event event = new Event(
                        eventRS.getString("event"),
                        eventId,
                        eventRS.getDouble("budget"),
                        eventRS.getDouble("stakeLimit"),
                        eventRS.getInt("playerLimit"),
                        eventRS.getBoolean("isOpen"),
                        eventRS.getBoolean("isFinished"),
                        eventRS.getBoolean("isPublic"),
                        eventRS.getString("creator"),
                        eventRS.getString("password"),
                        eventRS.getDouble("initialbudget"),
                        eventRS.getTimestamp("timeCreated").toLocalDateTime(),
                        finishedTS != null ? finishedTS.toLocalDateTime() : null,
                        actions
                );

                events.add(event);
            }
        } catch (SQLException e) {
            throw new PersistenceException("Error fetching events");
        }

        return events;
    }
    public void updateCoefficient(int actionId,double coefficient) throws PersistenceException {
        String sql = "UPDATE actions SET coefficient=? WHERE actionid=?";
        try(Connection con = DBConnect.getConnection()){
            con.setAutoCommit(false);
            try(PreparedStatement pstm = con.prepareStatement(sql)){
                pstm.setDouble(1, coefficient);
                pstm.setInt(2, actionId);
                pstm.executeUpdate();
                con.commit();
            }
        } catch (SQLException e) {
            throw new PersistenceException("Coefficient is not updated "+e.getMessage());
        }
    }


}
