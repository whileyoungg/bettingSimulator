package io.businessLogic;

import io.datarecords.*;
import io.persistence.*;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


public class UserLogic {
    private UserRepository userRepository;

    public UserLogic(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public boolean login(String username, String password) throws BusinessLogicException {
        User user = null;
        try {
            user = this.userRepository.getAll().stream().filter((User u) ->u.username().equals(username)).findFirst().orElse(null);
        } catch (PersistenceException e) {
            throw new BusinessLogicException("Failed to login"+e.getMessage());
        }
        if(user == null) {
            return false;
        } else {
            if(BCrypt.checkpw(password, user.password())) {
                return true;
            } else {
                return false;
            }
        }
    }
    public void register(User user) throws BusinessLogicException {
        try {
            userRepository.addUser(new User(user.username(),user.email(),user.isVerified(),user.balance(),BCrypt.hashpw(user.password(),BCrypt.gensalt())));
        } catch (PersistenceException e){
            throw new BusinessLogicException("Failed to register");
        }
    }
    public User findByUsername(String username) throws BusinessLogicException {
        try {
            return userRepository.getAll().stream().filter((User u) ->u.username().equalsIgnoreCase(username)).findFirst().orElse(null);
        } catch (PersistenceException e) {
            throw new BusinessLogicException("Failed to find by username"+e.getMessage());
        }
    }
    public boolean uniqueUsername(String username) throws BusinessLogicException {
        try {
            if(findByUsername(username) != null) {
                return false;
            } else {
                return true;
            }
        } catch (BusinessLogicException e) {
            throw new BusinessLogicException("Failed to get unique username"+e.getMessage());
        }
    }
    public List<User> getAll() throws BusinessLogicException {
        try {
            return userRepository.getAll();
        } catch (PersistenceException e) {
            throw new BusinessLogicException("Failed to get all users"+e.getMessage());
        }
    }
    public Object[] userStats(String username) throws BusinessLogicException {
        User user = findByUsername(username);
        ParticipationRepository participationRepository = new ParticipationRepository();
        EventRepository eventRepository = new EventRepository();
        List<Participation> participations = new ArrayList<>();
        try {
            participations = participationRepository.getAll().stream()
                    .filter(p -> p.user().username().equals(username))
                    .collect(Collectors.toList());
        } catch (PersistenceException e) {
            throw new BusinessLogicException("Failed to gather user statistics"+e.getMessage());
        }
        List<Event> events = new ArrayList<>();
        try {
            events = eventRepository.getAll().stream().filter(event -> event.creator().equals(username)).collect(Collectors.toList());
        } catch (PersistenceException e) {
            throw new RuntimeException(e);
        }
        List<EventDTO> dtos = new ArrayList<>();
        Logic logic = new Logic(Logic.getRepository());
        for(Event event : events) {
            double initial = logic.getEventLogic().initialBudget(event.eventId());
            dtos.add(new EventDTO(event, initial));
        }
        return new Object[]{user,participations,dtos};
    }
    public void verificationRequest(Verification verification) throws BusinessLogicException {
        try{
            if(VerificationCenter.validateVerificationData(verification)){
                Verification encryptedVerification = VerificationCenter.encryptVerificationData(verification);
                userRepository.verificationRequest(encryptedVerification);
            }
        } catch (PersistenceException e) {
            throw new BusinessLogicException("Failed to verification request"+e.getMessage());
        }
    }
    public void deposit() throws BusinessLogicException {
        try{
            DepositRepository depositRepository = new DepositRepository();

            List<MonoBankDeposit> deposits = depositRepository.getLatestTransactions();
            if(deposits ==null || deposits.isEmpty()){
                return;
            }
            for(MonoBankDeposit mbd : deposits){
                userRepository.monoDeposit(mbd);
            }
        } catch (PersistenceException e) {
            throw new BusinessLogicException("Failed to deposit "+e.getMessage());
        }


    }
    public void withdraw() throws BusinessLogicException {
        try{
            DepositRepository depositRepository = new DepositRepository();

            List<MonoBankDeposit> withdrawals = depositRepository.getLatestWithdrawal();
            if(withdrawals ==null || withdrawals.isEmpty()){
                return;
            }
            for(MonoBankDeposit mbd : withdrawals){
                userRepository.monoDeposit(mbd);
            }
        } catch (PersistenceException e) {
            throw new BusinessLogicException("Failed to withdraw "+e.getMessage());
        }
    }

}
