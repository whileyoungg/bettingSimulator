package io.businessLogic;

import io.persistence.Repository;
import org.springframework.stereotype.Service;

@Service
public class Logic {
    protected Repository repo;
    public Logic(Repository repo) {
        this.repo = repo;
    }
    public EventLogic getEventLogic() {
        return new EventLogic(repo.getEventRepository());
    }
    public UserLogic getUserLogic() {
        return new UserLogic(repo.getUserRepository());
    }
    public ParticipationLogic getParticipationLogic() {
        return new ParticipationLogic(repo.getParticipationRepository());
    }
    public static Repository getRepository() {
        return new Repository();
    }
    public DepositLogic getDepositLogic() {
        return new DepositLogic(repo.getDepositRepository());
    }
}
