package io.persistence;

import io.datarecords.Event;

@org.springframework.stereotype.Repository
public class Repository {

    public static EventRepository getEventRepository() {
        return new EventRepository();
    }
    public static UserRepository getUserRepository() {
        return new UserRepository();
    }
    public static ParticipationRepository getParticipationRepository() {
        return new ParticipationRepository();
    }
    public static DepositRepository getDepositRepository() {
        return new DepositRepository();
    }
}
