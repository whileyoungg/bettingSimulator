package io.datarecords;

import java.time.LocalDateTime;
import java.util.List;

public record Event(String event, int eventId, double budget, double stakeLimit, int playerLimit, boolean isOpen, boolean isFinished, boolean isPublic, String creator, String password, double initialBudget,
                    LocalDateTime timeCreated,
                    LocalDateTime timeFinished,
                    List<Action> actions) {

}

