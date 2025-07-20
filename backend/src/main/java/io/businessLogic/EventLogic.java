package io.businessLogic;

import io.datarecords.Action;
import io.datarecords.Event;
import io.datarecords.Participation;
import io.datarecords.User;
import io.persistence.EventRepository;
import io.persistence.PersistenceException;
import io.persistence.UserRepository;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

public class EventLogic {

    private EventRepository eventRepository;
    public EventLogic(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }
    public Event createEvent(Event event) throws BusinessLogicException {
        UserLogic ul = new UserLogic(new UserRepository());
        User user = ul.findByUsername(event.creator());
        if(event.budget()<=0 || event.playerLimit()<=0){
            throw new BusinessLogicException("Invalid budget or playerLimit");
        }
        if (user.balance() < event.budget()) {
                throw new BusinessLogicException("Insufficient balance to create the event");
        }

        try {
            return eventRepository.createEvent(event);
        } catch (PersistenceException e) {
             e.printStackTrace();
        }
        return null;
    }
    public List<Event> getAllEvents() {
        try {
            return eventRepository.getAll();
        } catch (PersistenceException e) {
            throw new RuntimeException(e);
        }
    }
    public void setPrivate(int eventId, String password) throws BusinessLogicException {
        try {
            eventRepository.setPrivate(eventId, password);
        } catch (PersistenceException e) {
            throw new BusinessLogicException("Failed to set private "+e.getMessage());
        }
    }
    public void setPublic(int eventId) throws BusinessLogicException {
        try {
            eventRepository.setPublic(eventId);
        } catch (PersistenceException e) {
            throw new BusinessLogicException("Failed to set public "+e.getMessage());

        }
    }
    public void setOpen(int eventId) throws BusinessLogicException {
        try {
            eventRepository.setOpen(eventId);
        } catch (PersistenceException e) {
            throw new BusinessLogicException("Failed to set open "+e.getMessage());
        }
    }
    public void setClosed(int eventId) throws BusinessLogicException {
        try {
            eventRepository.setClosed(eventId);
        } catch (PersistenceException e) {
            throw new BusinessLogicException("Failed to set closed "+e.getMessage());
        }
    }
    public void setFinished(int eventId, String winnersAction) throws BusinessLogicException {
        try {
            eventRepository.setFinished(eventId, winnersAction);
        } catch (PersistenceException e) {
            throw new BusinessLogicException("Failed to set finished "+e.getMessage());
        }
    }
    public double initialBudget(int eventId){
        return getAllEvents().stream().filter(p -> p.eventId()==eventId).mapToDouble(Event::initialBudget).sum();
    }
    public ArrayList<Action> suggestedCoefficients(int eventId) throws BusinessLogicException {
        List<Event> events;
        try {
            events = eventRepository.getAll();
        } catch (PersistenceException e) {
            throw new BusinessLogicException("Failed to get events "+e.getMessage());
        }
        Event targetEvent = events.stream()
                .filter(event -> event.eventId() == eventId)
                .findFirst()
                .orElseThrow(() -> new BusinessLogicException("Event not found."));
        List<Action> currentActions = targetEvent.actions();
        if (currentActions == null || currentActions.isEmpty()) {
            throw new BusinessLogicException("No stakes are made");
        }
        Logic logic = new Logic(Logic.getRepository());
        ArrayList<Participation> participations = logic.getParticipationLogic().getEventParticipations(eventId);
        HashMap<Action,Double> moneyPutOnAction = new HashMap<>();
        double generalSum = 0;
        for(Action action : currentActions){
            Double sum = participations.stream().filter(p -> p.action().actionId() == action.actionId()).mapToDouble(Participation::stake).sum();
            generalSum += sum;
            moneyPutOnAction.put(action, sum);
        }
        ArrayList<Action> updatedActions = new ArrayList<>();
        for (Action action : currentActions) {
            double actionStake = moneyPutOnAction.getOrDefault(action, 0.0);
            double suggestedCoefficient;

            if (actionStake == 0 || generalSum == 0) {
                suggestedCoefficient = 5.0;
            } else {
                double probability = actionStake / generalSum;
                suggestedCoefficient = Math.max(1.01, Math.min(5.0, 1 / probability));
            }
            updatedActions.add(new Action(
                    action.actionId(),
                    action.action(),
                    suggestedCoefficient,
                    action.event()
            ));
        }
        return updatedActions;
    }
    public void updateCoefficient(int actionId,double coefficient) throws BusinessLogicException {
        try {
            eventRepository.updateCoefficient(actionId,coefficient);
        } catch (PersistenceException e) {
            throw new BusinessLogicException("Coefficient is not updated "+e.getMessage());
        }
    }
}
