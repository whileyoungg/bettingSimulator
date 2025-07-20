package io.controller;

import com.sun.jdi.request.EventRequest;
import io.businessLogic.BusinessLogicException;
import io.businessLogic.Logic;
import io.businessLogic.UserLogic;
import io.datarecords.*;
import io.persistence.PersistenceException;
import jakarta.servlet.http.HttpSession;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class Controller {

    private Logic logic;


    public Controller(Logic logic) {
        this.logic = logic;
    }
    @PostMapping("/login")
    public UserSession login(@RequestBody LoginRequest loginRequest, HttpSession session) throws BusinessLogicException {
        String username = loginRequest.username();
        String password = loginRequest.password();

        if (logic.getUserLogic().login(username, password)) {
            User user = logic.getUserLogic().findByUsername(username);
            UserSession userSession = new UserSession(user.username(),user.email(),user.balance(),user.isVerified());
            session.setAttribute("user", userSession);
            return userSession;

        } else {
            throw new LoginRegistrationException("Login failed");
        }
    }
    @PostMapping("/registration")
    public User register(@RequestBody RegistrationRequest userRequest) throws BusinessLogicException {
        if(userRequest.username().length()<3 || userRequest.password().length()<8 || !userRequest.email().matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$") || !logic.getUserLogic().uniqueUsername(userRequest.username())) {
            Map<String, String> error = new HashMap<>();
            throw new LoginRegistrationException("Bad input");
        } else {
            User user = new User(userRequest.username(),userRequest.email(),false,0.0, userRequest.password());
            logic.getUserLogic().register(user);
            return logic.getUserLogic().findByUsername(user.username());
        }
    }
    @GetMapping("/users")
    public List<User> getUsers() throws BusinessLogicException {
        return logic.getUserLogic().getAll();
    }
    @PostMapping("/createEvent")
    public ResponseEntity<?> createEvent(@RequestBody Event event) {
        try {
            logic.getEventLogic().createEvent(event);
        } catch (BusinessLogicException e) {
            throw new RuntimeException(e);
        }
        return ResponseEntity.ok(event);
    }
    @GetMapping("/events")
    public List<Event> getAllEvents() {
        return logic.getEventLogic().getAllEvents();
    }
    @GetMapping("/events/{id}")
    public Event getEvent(@PathVariable int id) {
        return logic.getEventLogic().getAllEvents().stream().filter(event -> event.eventId() == id).findFirst().orElse(null);
    }
    @PatchMapping("/events/{id}/setClosed")
    public void setClosed(@PathVariable int id) throws BusinessLogicException {
        logic.getEventLogic().setClosed(id);
    }
    @PatchMapping("/events/{id}/setOpen")
    public void setOpen(@PathVariable int id) throws BusinessLogicException {
        logic.getEventLogic().setOpen(id);
    }
    @PatchMapping("/events/{id}/setPublic")
    public void setPublic(@PathVariable int id) throws BusinessLogicException {
        logic.getEventLogic().setPublic(id);
    }
    @PatchMapping("/events/{id}/setPrivate")
    public void setPrivate(@PathVariable int id,String password) throws BusinessLogicException {
        logic.getEventLogic().setPrivate(id,password);
    }
    @PatchMapping("/events/{id}/setFinished")
    public void setFinished(@PathVariable int id,String winnersAction) throws BusinessLogicException {
        logic.getEventLogic().setFinished(id,winnersAction);
    }
    @PostMapping("/addParticipation")
    public void addParticipation
            (@RequestBody Participation participation) throws BusinessLogicException {
        logic.getParticipationLogic().addParticipation(participation);
    }
    @GetMapping("/users/{username}")
    public Object[] userStats(@PathVariable String username) throws BusinessLogicException {
        return logic.getUserLogic().userStats(username);
    }
    @PatchMapping("/events/actions/{actionId}/updateCoefficient")
    public void updateCoefficient(@PathVariable int actionId, @RequestParam double coefficient) throws BusinessLogicException {
        logic.getEventLogic().updateCoefficient(actionId, coefficient);
    }
    @GetMapping("/events/{id}/analysis")
    public Object[] eventStats(@PathVariable int id) throws BusinessLogicException {
        logic.getParticipationLogic().getEventParticipations(id);
        logic.getEventLogic().suggestedCoefficients(id);
        return new Object[]{logic.getParticipationLogic().getEventParticipations(id)};
    }
    @GetMapping("/events/{id}/suggested")
    public List<Action> getSuggestedCoefficients(@PathVariable int id) throws BusinessLogicException {
        return logic.getEventLogic().suggestedCoefficients(id);
    }
    @PostMapping("verification")
    public void verificationRequest(@RequestBody VerificationRequest verification) throws BusinessLogicException {
        User user = logic.getUserLogic().findByUsername(verification.username());
        logic.getUserLogic().verificationRequest(new Verification(user,verification.firstName(), verification.lastName(), verification.bsn(), verification.iban(), verification.address(), verification.postalCode(), verification.phoneNumber()));
    }
    @PatchMapping("deposit")
    public void deposit() throws BusinessLogicException {
            logic.getUserLogic().deposit();
    }
    @PatchMapping("withdraw")
    public void withdraw() throws BusinessLogicException {
        logic.getUserLogic().withdraw();
    }
    @GetMapping("sessionUpdate")
    public User sessionUpdate(@RequestParam String username) throws BusinessLogicException {
        return logic.getUserLogic().findByUsername(username);
    }
}
